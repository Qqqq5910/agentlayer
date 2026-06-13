import type {
  AgentAction,
  AgentOperabilityReport,
  AgentTaskResult,
  ExtractedFact,
  FormOperabilityResult,
  Recommendation,
  SiteScan
} from "../schemas.js";
import { clamp, includesAny } from "../utils/text.js";

export type SiteScores = AgentOperabilityReport["scores"];

const LOW_COVERAGE_PAGE_LIMIT = 2;
const COMMON_EXTERNAL_REDIRECT_MIN_COUNT = 3;
const COMMON_EXTERNAL_REDIRECT_MIN_SHARE = 0.6;
const COMMON_EXTERNAL_REDIRECT_MIN_ERROR_SHARE = 0.5;
const OUT_OF_SCOPE_REDIRECT_RE = /skipped redirect outside allowed crawl scope:\s*(\S+)/i;

type RedirectHostCluster = {
  hostname: string;
  count: number;
  exampleUrl: string;
};

export function scoreSite(
  scan: SiteScan,
  facts: readonly ExtractedFact[],
  actions: readonly AgentAction[],
  taskResults: readonly AgentTaskResult[],
  forms: readonly FormOperabilityResult[] = []
): SiteScores {
  const readability = scoreReadability(scan);
  const trustability = scoreTrustability(scan, facts);
  const actionability = scoreActionability(actions, forms);
  const taskSuccess =
    taskResults.length > 0
      ? Math.round(taskResults.reduce((total, task) => total + task.score, 0) / taskResults.length)
      : 0;
  const overall = Math.round(
    readability * 0.25 + trustability * 0.25 + actionability * 0.3 + taskSuccess * 0.2
  );

  return {
    readability,
    trustability,
    actionability,
    taskSuccess,
    overall
  };
}

export function generateRecommendations(
  scan: SiteScan,
  facts: readonly ExtractedFact[],
  actions: readonly AgentAction[],
  taskResults: readonly AgentTaskResult[],
  forms: readonly FormOperabilityResult[] = []
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const add = (recommendation: Recommendation) => recommendations.push(recommendation);
  const redirectCoverageRecommendation = canonicalRedirectCoverageRecommendation(scan, taskResults);

  if (redirectCoverageRecommendation) {
    return [redirectCoverageRecommendation];
  }

  if (!hasLlmsTxt(scan)) {
    add({
      title: "Add /llms.txt",
      severity: "high",
      whyItMatters: "Agents need a concise entry point that describes important site resources.",
      howToFix: "Publish the generated llms.txt file at the site root.",
      affectedTasks: taskResults.map((task) => task.taskId),
      suggestedArtifact: "llms.txt"
    });
  }

  for (const task of taskResults.filter((result) => result.status !== "pass")) {
    add({
      title: `Improve task: ${task.title}`,
      severity: task.status === "fail" ? "high" : "medium",
      whyItMatters: task.explanation,
      howToFix:
        task.recommendations[0] ??
        "Add clearer page structure, headings, and source-backed content.",
      affectedTasks: [task.taskId],
      suggestedArtifact: task.taskId.includes("docs") ? "llms-full.txt" : undefined
    });
  }

  if (!scan.sitemap?.found) {
    add({
      title: "Expose sitemap.xml",
      severity: "medium",
      whyItMatters: "Sitemaps help deterministic crawlers discover important pages quickly.",
      howToFix:
        "Publish a sitemap.xml that includes key product, pricing, docs, trust, and policy pages.",
      affectedTasks: [],
      suggestedArtifact: "sitemap.xml"
    });
  }

  if (!scan.robotsTxt?.found) {
    add({
      title: "Publish robots.txt",
      severity: "low",
      whyItMatters:
        "robots.txt communicates crawl boundaries for agents and other automated clients.",
      howToFix: "Add a robots.txt file that permits safe public pages and references your sitemap.",
      affectedTasks: [],
      suggestedArtifact: "robots.txt"
    });
  }

  if (facts.length === 0) {
    add({
      title: "Add source-backed facts",
      severity: "high",
      whyItMatters:
        "Agents need verifiable claims with source URLs instead of inferred marketing copy.",
      howToFix:
        "Publish facts.json and ensure important claims are visible on stable public pages.",
      affectedTasks: [],
      suggestedArtifact: "facts.json"
    });
  }

  if (actions.length === 0) {
    add({
      title: "Expose agent action paths",
      severity: "high",
      whyItMatters: "Agents cannot operate the site if key actions are hidden or ambiguous.",
      howToFix: "Add clear contact, demo, support, docs, and pricing links or forms with labels.",
      affectedTasks: [],
      suggestedArtifact: "actions.json"
    });
  }

  if (actions.length > 0 && !hasPublicPath(scan, "/.well-known/agents.json")) {
    add({
      title: "Review and publish the agent action manifest",
      severity: "medium",
      whyItMatters:
        "The scan found operable actions, but agents still need a stable public manifest instead of re-inferring forms from HTML.",
      howToFix:
        "Review the generated .well-known/agents.json, keep human confirmation on sensitive actions, and publish the approved manifest.",
      affectedTasks: taskResults
        .filter((task) => task.status === "pass" && task.taskId.includes("demo"))
        .map((task) => task.taskId),
      suggestedArtifact: ".well-known/agents.json"
    });
  }

  const weakForms = forms.filter((form) => form.score < 75);
  if (weakForms.length > 0) {
    add({
      title: "Improve form operability",
      severity: weakForms.some((form) => form.score < 50) ? "high" : "medium",
      whyItMatters:
        "Agents need stable form actions, labeled fields, required-field markers, and confirmation rules before they can safely prepare submissions.",
      howToFix:
        weakForms[0]?.recommendations[0] ??
        "Review form-operability.json and add missing labels, names, required markers, and submit text.",
      affectedTasks: taskResults
        .filter((task) =>
          task.journeySteps.some(
            (step) => step.id === "understand_required_fields" && step.status !== "pass"
          )
        )
        .map((task) => task.taskId),
      suggestedArtifact: "form-operability.json"
    });
  }

  return recommendations.slice(0, 12);
}

function canonicalRedirectCoverageRecommendation(
  scan: SiteScan,
  taskResults: readonly AgentTaskResult[]
): Recommendation | null {
  if (scan.pages.length > LOW_COVERAGE_PAGE_LIMIT) {
    return null;
  }

  const redirectCluster = commonExternalRedirectCluster(scan);
  if (!redirectCluster) {
    return null;
  }

  const pageCount = scan.pages.length;
  const pageLabel =
    pageCount === 1 ? "1 page snapshot was captured" : `${pageCount} page snapshots were captured`;
  const rootHost = hostnameFor(scan.rootUrl) ?? "the requested host";
  const canonicalRoot = originFor(redirectCluster.exampleUrl) ?? redirectCluster.hostname;

  return {
    title: "Review canonical-domain crawl coverage",
    severity: "high",
    whyItMatters: `${pageLabel} while ${redirectCluster.count} skipped redirects pointed to ${redirectCluster.hostname}. Missing facts, actions, or task evidence may reflect bounded crawl coverage rather than missing site content.`,
    howToFix: `If ${redirectCluster.hostname} is the intended public host for ${rootHost}, rerun the scan with ${canonicalRoot}. The scanner keeps the original host boundary and will not crawl ${redirectCluster.hostname} automatically.`,
    affectedTasks: taskResults.filter((task) => task.status !== "pass").map((task) => task.taskId)
  };
}

function commonExternalRedirectCluster(scan: SiteScan): RedirectHostCluster | null {
  const rootHost = hostnameFor(scan.rootUrl);
  const clusters = new Map<string, RedirectHostCluster>();
  let redirectCount = 0;

  for (const error of scan.errors) {
    const targetUrl = outOfScopeRedirectTarget(error.message);
    if (!targetUrl) {
      continue;
    }

    const hostname = hostnameFor(targetUrl);
    if (!hostname || hostname === rootHost) {
      continue;
    }

    redirectCount += 1;
    const cluster = clusters.get(hostname) ?? { hostname, count: 0, exampleUrl: targetUrl };
    cluster.count += 1;
    clusters.set(hostname, cluster);
  }

  if (redirectCount < COMMON_EXTERNAL_REDIRECT_MIN_COUNT) {
    return null;
  }

  const topCluster = Array.from(clusters.values()).sort(
    (left, right) => right.count - left.count
  )[0];
  if (
    !topCluster ||
    topCluster.count < COMMON_EXTERNAL_REDIRECT_MIN_COUNT ||
    topCluster.count / redirectCount < COMMON_EXTERNAL_REDIRECT_MIN_SHARE ||
    topCluster.count / scan.errors.length < COMMON_EXTERNAL_REDIRECT_MIN_ERROR_SHARE
  ) {
    return null;
  }

  return topCluster;
}

function outOfScopeRedirectTarget(message: string): string | null {
  return message.match(OUT_OF_SCOPE_REDIRECT_RE)?.[1] ?? null;
}

function hostnameFor(value: string): string | null {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function originFor(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function scoreReadability(scan: SiteScan): number {
  const pageTypes = new Set(scan.pages.map((page) => page.pageType));
  const importantTypes = [
    "home",
    "pricing",
    "docs",
    "api_docs",
    "security",
    "privacy",
    "terms",
    "contact",
    "support"
  ];
  const importantFound = importantTypes.filter((type) => pageTypes.has(type)).length;
  const pagesWithMarkdown = scan.pages.filter((page) => page.markdown.trim().length > 0).length;
  const pagesWithTitles = scan.pages.filter(
    (page) => Boolean(page.title) || page.headings.h1.length > 0 || page.headings.h2.length > 0
  ).length;
  const markdownRatio = scan.pages.length > 0 ? pagesWithMarkdown / scan.pages.length : 0;
  const titleRatio = scan.pages.length > 0 ? pagesWithTitles / scan.pages.length : 0;

  return clamp(
    Math.round(
      (scan.robotsTxt?.found ? 12 : 0) +
        (scan.sitemap?.found ? 12 : 0) +
        (importantFound / importantTypes.length) * 26 +
        (hasLlmsTxt(scan) ? 15 : 0) +
        markdownRatio * 18 +
        titleRatio * 17
    ),
    0,
    100
  );
}

function scoreTrustability(scan: SiteScan, facts: readonly ExtractedFact[]): number {
  const factTypes = new Set(facts.map((fact) => fact.type));
  const sourcedFacts = facts.filter((fact) => fact.sourceUrl && fact.confidence > 0).length;
  const averageConfidence =
    facts.length > 0 ? facts.reduce((total, fact) => total + fact.confidence, 0) / facts.length : 0;
  const hasPolicies =
    factTypes.has("policy") ||
    scan.pages.some((page) => ["privacy", "terms"].includes(page.pageType));
  const hasSecurity =
    factTypes.has("security") || scan.pages.some((page) => page.pageType === "security");
  const hasPricing =
    factTypes.has("pricing") || scan.pages.some((page) => page.pageType === "pricing");

  return clamp(
    Math.round(
      (factTypes.has("company") ? 18 : 0) +
        (sourcedFacts > 0 ? 18 : 0) +
        averageConfidence * 18 +
        (hasPricing ? 14 : 4) +
        (hasPolicies ? 14 : 0) +
        (hasSecurity ? 10 : 0) +
        (scan.scannedAt ? 8 : 0)
    ),
    0,
    100
  );
}

function scoreActionability(
  actions: readonly AgentAction[],
  forms: readonly FormOperabilityResult[]
): number {
  const names = new Set(actions.map((action) => action.name));
  const formActions = actions.filter((action) => action.actionType === "form");
  const fieldsExtractable =
    formActions.length === 0 ||
    formActions.every((action) => (action.requiredFields?.length ?? 0) > 0);
  const sensitivityLabeled = actions.every((action) => Boolean(action.sensitivity));
  const humanConfirmation = actions
    .filter((action) => action.sensitivity !== "low" || action.actionType === "form")
    .every((action) => action.requiresHumanConfirmation);
  const averageFormScore =
    forms.length > 0 ? forms.reduce((total, form) => total + form.score, 0) / forms.length : 100;

  return clamp(
    Math.round(
      (names.has("contact_sales") || names.has("book_demo") ? 22 : 0) +
        (names.has("search_docs") || names.has("open_api_docs") ? 18 : 0) +
        (formActions.length > 0 && fieldsExtractable ? 16 : formActions.length > 0 ? 8 : 0) +
        (forms.length > 0 ? averageFormScore * 0.1 : 10) +
        (sensitivityLabeled ? 15 : 0) +
        (humanConfirmation ? 15 : 0) +
        (actions.length > 0 ? 10 : 0)
    ),
    0,
    100
  );
}

function hasLlmsTxt(scan: SiteScan): boolean {
  return scan.pages.some(
    (page) => page.pageType === "llms" || includesAny(page.finalUrl, ["/llms.txt"])
  );
}

function hasPublicPath(scan: SiteScan, pathname: string): boolean {
  return scan.pages.some((page) => {
    try {
      return new URL(page.finalUrl).pathname === pathname;
    } catch {
      return false;
    }
  });
}
