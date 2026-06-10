import type { AgentOperabilityReport, PageSnapshot } from "../schemas.js";
import { truncateText, uniqueStrings } from "../utils/text.js";

export function generateLlmsTxt(report: AgentOperabilityReport): string {
  const lines: string[] = [];
  const keyPages = importantPages(report.scan.pages);

  lines.push(`# ${report.site.name}`);
  lines.push("");
  lines.push(`> ${truncateText(report.site.summary, 320)}`);
  lines.push("");
  lines.push(`Root URL: ${report.site.rootUrl}`);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");

  lines.push("## Key Links");
  for (const page of keyPages) {
    lines.push(`- [${pageLabel(page)}](${page.finalUrl}): ${pageDescription(page)}`);
  }
  lines.push("");

  appendSection(
    lines,
    "Product",
    report.facts.filter((fact) => ["company", "product"].includes(fact.type))
  );
  appendSection(
    lines,
    "Pricing",
    report.facts.filter((fact) => ["pricing", "plan"].includes(fact.type))
  );
  appendSection(
    lines,
    "Documentation",
    report.facts.filter((fact) => fact.type === "docs")
  );
  appendSection(
    lines,
    "Security",
    report.facts.filter((fact) => fact.type === "security")
  );
  appendSection(
    lines,
    "Policies",
    report.facts.filter((fact) => fact.type === "policy")
  );
  appendSection(
    lines,
    "Contact",
    report.facts.filter((fact) => ["contact", "support"].includes(fact.type))
  );

  if (report.actions.length > 0) {
    lines.push("## Agent Actions");
    for (const action of report.actions) {
      const confirmation = action.requiresHumanConfirmation
        ? "Requires human confirmation."
        : "No human confirmation flag.";
      lines.push(
        `- ${action.name}: ${action.description} (${action.actionType}, ${action.sensitivity} sensitivity). ${confirmation} Source: ${action.sourceUrl}`
      );
    }
    lines.push("");
  }

  lines.push("## Notes for AI Agents");
  lines.push(
    "- Treat generated action manifests as suggestions, not authorization to submit forms."
  );
  lines.push(
    "- Do not submit forms or perform sensitive actions without explicit user confirmation."
  );
  lines.push("- Verify factual claims against the listed source URLs.");
  lines.push("- If information is missing, say it was not found instead of guessing.");
  lines.push("");

  return `${lines.join("\n").trim()}\n`;
}

function appendSection(
  lines: string[],
  title: string,
  facts: AgentOperabilityReport["facts"]
): void {
  if (facts.length === 0) {
    return;
  }

  lines.push(`## ${title}`);
  for (const fact of facts.slice(0, 12)) {
    lines.push(
      `- ${fact.label}: ${fact.value} (source: ${fact.sourceUrl}, confidence: ${fact.confidence.toFixed(2)})`
    );
  }
  lines.push("");
}

function importantPages(pages: readonly PageSnapshot[]): PageSnapshot[] {
  const wanted = [
    "home",
    "pricing",
    "docs",
    "api_docs",
    "security",
    "privacy",
    "terms",
    "contact",
    "demo",
    "support"
  ];
  const selected = wanted
    .map((type) => pages.find((page) => page.pageType === type))
    .filter((page): page is PageSnapshot => Boolean(page));

  return uniqueStrings(selected.map((page) => page.finalUrl))
    .map((url) => selected.find((page) => page.finalUrl === url))
    .filter((page): page is PageSnapshot => Boolean(page));
}

function pageLabel(page: PageSnapshot): string {
  return page.title ?? page.headings.h1[0] ?? page.pageType;
}

function pageDescription(page: PageSnapshot): string {
  return truncateText(page.description ?? page.headings.h1[0] ?? page.pageType, 160);
}
