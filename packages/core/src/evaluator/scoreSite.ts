import type {
  AgentAction,
  AgentOperabilityReport,
  AgentTaskResult,
  ExtractedFact,
  Recommendation,
  SiteScan
} from "../schemas.js";
import { clamp, includesAny } from "../utils/text.js";

export type SiteScores = AgentOperabilityReport["scores"];

export function scoreSite(
  scan: SiteScan,
  facts: readonly ExtractedFact[],
  actions: readonly AgentAction[],
  taskResults: readonly AgentTaskResult[]
): SiteScores {
  const readability = scoreReadability(scan);
  const trustability = scoreTrustability(scan, facts);
  const actionability = scoreActionability(actions);
  const taskSuccess =
    taskResults.length > 0
      ? Math.round(taskResults.reduce((total, task) => total + task.score, 0) / taskResults.length)
      : 0;
  const overall = Math.round(readability * 0.25 + trustability * 0.25 + actionability * 0.3 + taskSuccess * 0.2);

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
  taskResults: readonly AgentTaskResult[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const add = (recommendation: Recommendation) => recommendations.push(recommendation);

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
      howToFix: task.recommendations[0] ?? "Add clearer page structure, headings, and source-backed content.",
      affectedTasks: [task.taskId],
      suggestedArtifact: task.taskId.includes("docs") ? "llms-full.txt" : undefined
    });
  }

  if (!scan.sitemap?.found) {
    add({
      title: "Expose sitemap.xml",
      severity: "medium",
      whyItMatters: "Sitemaps help deterministic crawlers discover important pages quickly.",
      howToFix: "Publish a sitemap.xml that includes key product, pricing, docs, trust, and policy pages.",
      affectedTasks: [],
      suggestedArtifact: "sitemap.xml"
    });
  }

  if (!scan.robotsTxt?.found) {
    add({
      title: "Publish robots.txt",
      severity: "low",
      whyItMatters: "robots.txt communicates crawl boundaries for agents and other automated clients.",
      howToFix: "Add a robots.txt file that permits safe public pages and references your sitemap.",
      affectedTasks: [],
      suggestedArtifact: "robots.txt"
    });
  }

  if (facts.length === 0) {
    add({
      title: "Add source-backed facts",
      severity: "high",
      whyItMatters: "Agents need verifiable claims with source URLs instead of inferred marketing copy.",
      howToFix: "Publish facts.json and ensure important claims are visible on stable public pages.",
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

  return recommendations.slice(0, 12);
}

function scoreReadability(scan: SiteScan): number {
  const pageTypes = new Set(scan.pages.map((page) => page.pageType));
  const importantTypes = ["home", "pricing", "docs", "api_docs", "security", "privacy", "terms", "contact", "support"];
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
  const hasPolicies = factTypes.has("policy") || scan.pages.some((page) => ["privacy", "terms"].includes(page.pageType));
  const hasSecurity = factTypes.has("security") || scan.pages.some((page) => page.pageType === "security");
  const hasPricing = factTypes.has("pricing") || scan.pages.some((page) => page.pageType === "pricing");

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

function scoreActionability(actions: readonly AgentAction[]): number {
  const names = new Set(actions.map((action) => action.name));
  const forms = actions.filter((action) => action.actionType === "form");
  const fieldsExtractable = forms.length === 0 || forms.every((action) => (action.requiredFields?.length ?? 0) > 0);
  const sensitivityLabeled = actions.every((action) => Boolean(action.sensitivity));
  const humanConfirmation = actions
    .filter((action) => action.sensitivity !== "low" || action.actionType === "form")
    .every((action) => action.requiresHumanConfirmation);

  return clamp(
    Math.round(
      (names.has("contact_sales") || names.has("book_demo") ? 22 : 0) +
        (names.has("search_docs") || names.has("open_api_docs") ? 18 : 0) +
        (forms.length > 0 && fieldsExtractable ? 20 : forms.length > 0 ? 10 : 0) +
        (sensitivityLabeled ? 15 : 0) +
        (humanConfirmation ? 15 : 0) +
        (actions.length > 0 ? 10 : 0)
    ),
    0,
    100
  );
}

function hasLlmsTxt(scan: SiteScan): boolean {
  return scan.pages.some((page) => page.pageType === "llms" || includesAny(page.finalUrl, ["/llms.txt"]));
}
