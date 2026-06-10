import type { ExtractedFact, PageSnapshot, SiteProfile, SiteScan } from "../schemas.js";
import {
  dedupeBy,
  includesAny,
  normalizeWhitespace,
  slugify,
  snippetAround,
  truncateText
} from "../utils/text.js";

const FACT_UPDATED_NOW = () => new Date().toISOString();

export function buildSiteProfile(scan: SiteScan): SiteProfile {
  const homepage = scan.pages.find((page) => page.pageType === "home") ?? scan.pages[0];
  const companyName = findCompanyName(scan) ?? new URL(scan.rootUrl).hostname;
  const summary =
    homepage?.description ??
    snippetAround(
      homepage?.visibleText ?? "",
      ["platform", "software", "product", "service"],
      240
    ) ??
    `AgentLayer profile for ${companyName}.`;

  return {
    name: companyName,
    summary: truncateText(summary, 280),
    rootUrl: scan.rootUrl,
    keyPages: buildKeyPages(scan.pages),
    generatedAt: FACT_UPDATED_NOW()
  };
}

export function extractFacts(scan: SiteScan): ExtractedFact[] {
  const facts: ExtractedFact[] = [];
  const add = (fact: Omit<ExtractedFact, "id" | "updatedAt"> & { id?: string }) => {
    const id = fact.id ?? `${fact.type}-${slugify(fact.label)}-${slugify(fact.value).slice(0, 40)}`;
    facts.push({
      ...fact,
      id,
      updatedAt: FACT_UPDATED_NOW()
    });
  };

  const companyName = findCompanyName(scan);
  const homepage = scan.pages.find((page) => page.pageType === "home") ?? scan.pages[0];
  if (companyName && homepage) {
    add({
      type: "company",
      label: "Company name",
      value: companyName,
      sourceUrl: homepage.finalUrl,
      sourceText: homepage.openGraph["og:site_name"] ?? homepage.title ?? homepage.headings.h1[0],
      confidence: homepage.openGraph["og:site_name"] ? 0.9 : 0.7
    });
  }

  for (const page of scan.pages) {
    extractPageFacts(page, add);
  }

  return dedupeBy(facts, (fact) => `${fact.type}:${fact.label}:${fact.value}:${fact.sourceUrl}`);
}

function extractPageFacts(
  page: PageSnapshot,
  add: (fact: Omit<ExtractedFact, "id" | "updatedAt"> & { id?: string }) => void
): void {
  const pageText = page.visibleText;
  const sourceText = (keywords: readonly string[]) => snippetAround(pageText, keywords);

  const hasHomePricingTeaser =
    page.pageType === "home" && /(?:pricing starts|starts at|\$\d+)/i.test(pageText.slice(0, 1800));

  if (page.pageType === "pricing" || hasHomePricingTeaser) {
    add({
      type: "pricing",
      label: "Pricing information",
      value: pricingValue(page),
      sourceUrl: page.finalUrl,
      sourceText: sourceText(["pricing", "price", "plan", "$", "contact sales"]),
      confidence: page.pageType === "pricing" ? 0.85 : 0.55
    });

    if (page.pageType === "pricing") {
      for (const planName of extractPlanNames(page)) {
        add({
          type: "plan",
          label: "Plan name",
          value: planName,
          sourceUrl: page.finalUrl,
          sourceText: sourceText([planName]),
          confidence: 0.8
        });
      }
    }
  }

  if (page.pageType === "docs" || page.pageType === "api_docs") {
    add({
      type: "docs",
      label: page.pageType === "api_docs" ? "API documentation" : "Documentation",
      value: page.title ?? page.headings.h1[0] ?? page.finalUrl,
      sourceUrl: page.finalUrl,
      sourceText: page.headings.h1[0] ?? sourceText(["docs", "documentation", "api", "developer"]),
      confidence: 0.85
    });
  }

  if (page.pageType === "security") {
    add({
      type: "security",
      label: "Security or trust information",
      value: page.title ?? page.headings.h1[0] ?? "Security page",
      sourceUrl: page.finalUrl,
      sourceText: sourceText(["security", "trust", "soc", "gdpr", "compliance"]),
      confidence: 0.85
    });
  }

  if (
    page.pageType === "privacy" ||
    page.pageType === "terms" ||
    includesAny(page.finalUrl, ["privacy", "terms"])
  ) {
    add({
      type: "policy",
      label: page.pageType === "privacy" ? "Privacy policy" : "Terms or legal policy",
      value: page.title ?? page.headings.h1[0] ?? page.finalUrl,
      sourceUrl: page.finalUrl,
      sourceText: page.headings.h1[0] ?? sourceText(["privacy", "terms", "refund", "cancellation"]),
      confidence: page.pageType === "privacy" || page.pageType === "terms" ? 0.85 : 0.65
    });
  }

  if (page.pageType === "contact" || page.pageType === "demo" || page.forms.length > 0) {
    for (const form of page.forms) {
      add({
        type: form.purpose.includes("support") ? "support" : "contact",
        label: form.purpose,
        value: form.fields.map((field) => field.name).join(", ") || form.submitText || form.purpose,
        sourceUrl: page.finalUrl,
        sourceText:
          form.submitText ??
          page.headings.h1[0] ??
          sourceText(["contact", "demo", "sales", "support"]),
        confidence: 0.8
      });
    }
  }

  if (page.pageType === "support") {
    add({
      type: "support",
      label: "Support page",
      value: page.title ?? page.headings.h1[0] ?? page.finalUrl,
      sourceUrl: page.finalUrl,
      sourceText: sourceText(["support", "help", "contact"]),
      confidence: 0.8
    });
  }

  if (page.pageType === "integrations") {
    const integrations = extractIntegrationNames(page);
    for (const integration of integrations.length > 0
      ? integrations
      : [page.title ?? "Integrations"]) {
      add({
        type: "integration",
        label: "Integration",
        value: integration,
        sourceUrl: page.finalUrl,
        sourceText: sourceText([integration, "integration"]),
        confidence: page.pageType === "integrations" ? 0.75 : 0.5
      });
    }
  }

  if (page.pageType === "home" || page.pageType === "customers") {
    const target = extractTargetCustomer(page);
    if (target) {
      add({
        type: "product",
        label: "Target users",
        value: target,
        sourceUrl: page.finalUrl,
        sourceText: sourceText([
          "for teams",
          "for developers",
          "for enterprises",
          "use cases",
          "built for"
        ]),
        confidence: 0.6
      });
    }
  }
}

function findCompanyName(scan: SiteScan): string | null {
  for (const page of scan.pages) {
    const structured = findOrganizationName(page.jsonLd);
    if (structured) {
      return structured;
    }

    const siteName = page.openGraph["og:site_name"];
    if (siteName) {
      return siteName;
    }
  }

  const homepage = scan.pages.find((page) => page.pageType === "home") ?? scan.pages[0];
  const title = homepage?.title?.split(/[|\-:]/)[0]?.trim();
  if (title) {
    return title;
  }

  return null;
}

function findOrganizationName(jsonLd: readonly unknown[]): string | null {
  const queue = [...jsonLd];
  while (queue.length > 0) {
    const value = queue.shift();
    if (!value || typeof value !== "object") {
      continue;
    }

    const record = value as Record<string, unknown>;
    const type = record["@type"];
    const types = Array.isArray(type) ? type.map(String) : [String(type ?? "")];
    const name = typeof record.name === "string" ? normalizeWhitespace(record.name) : "";
    if (
      name &&
      types.some((item) => /Organization|LocalBusiness|Corporation|SoftwareApplication/i.test(item))
    ) {
      return name;
    }

    for (const nested of Object.values(record)) {
      if (Array.isArray(nested)) {
        queue.push(...nested);
      } else if (nested && typeof nested === "object") {
        queue.push(nested);
      }
    }
  }

  return null;
}

function buildKeyPages(pages: readonly PageSnapshot[]): Record<string, string> {
  const keyPages: Record<string, string> = {};
  for (const page of pages) {
    if (!keyPages[page.pageType]) {
      keyPages[page.pageType] = page.finalUrl;
    }
  }
  return keyPages;
}

function pricingValue(page: PageSnapshot): string {
  const priceMatches = page.visibleText.match(
    /(?:\$|USD\s*)\d+(?:[,.]\d+)?(?:\s*\/\s*(?:mo|month|user|seat|year))?/gi
  );
  if (priceMatches && priceMatches.length > 0) {
    return priceMatches.slice(0, 5).join(", ");
  }

  if (includesAny(page.visibleText, ["contact sales", "request a quote", "custom pricing"])) {
    return "Contact sales or request a quote";
  }

  return page.title ?? page.headings.h1[0] ?? "Pricing page found";
}

function extractPlanNames(page: PageSnapshot): string[] {
  const candidates = [...page.headings.h2, ...page.headings.h3].filter((heading) => {
    const clean = heading.toLowerCase();
    if (clean.length > 48) {
      return false;
    }
    return !includesAny(clean, [
      "pricing",
      "frequently",
      "faq",
      "compare",
      "feature",
      "differences",
      "included"
    ]);
  });

  return dedupeBy(candidates.slice(0, 8), (value) => value);
}

function extractIntegrationNames(page: PageSnapshot): string[] {
  const known = [
    "Slack",
    "Google",
    "Salesforce",
    "HubSpot",
    "Zapier",
    "GitHub",
    "Notion",
    "Jira",
    "Stripe"
  ];
  const fromKnown = known.filter((name) =>
    page.visibleText.toLowerCase().includes(name.toLowerCase())
  );
  const fromHeadings = [...page.headings.h2, ...page.headings.h3].filter(
    (heading) => heading.length <= 40
  );
  return dedupeBy([...fromKnown, ...fromHeadings].slice(0, 10), (value) => value);
}

function extractTargetCustomer(page: PageSnapshot): string | null {
  const headingTargets = page.headings.h2
    .filter((heading) => /^for\s+/i.test(heading))
    .map((heading) => heading.replace(/^for\s+/i, "").trim())
    .filter(Boolean);

  if (headingTargets.length > 0) {
    return truncateText(headingTargets.join(", "), 120);
  }

  const match = page.visibleText.match(
    /\b(?:built for|made for|designed for|for)\s+([A-Za-z0-9 ,/&-]{8,90})(?:\.|,|;|\n|$)/i
  );
  if (!match?.[1]) {
    return null;
  }

  return truncateText(match[1], 100);
}
