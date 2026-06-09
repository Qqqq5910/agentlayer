import type { AgentOperabilityReport, PageSnapshot } from "../schemas.js";
import { truncateText } from "../utils/text.js";

export function generateLlmsFullTxt(report: AgentOperabilityReport): string {
  const lines: string[] = [];

  lines.push(`# ${report.site.name} - Full Agent Context`);
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Root URL: ${report.site.rootUrl}`);
  lines.push("");
  lines.push("This file contains source-linked Markdown snapshots of important public pages discovered by AgentLayer.");
  lines.push("");

  for (const page of orderedPages(report.scan.pages)) {
    lines.push(`## ${page.title ?? page.headings.h1[0] ?? page.pageType}`);
    lines.push("");
    lines.push(`Source: ${page.finalUrl}`);
    lines.push(`Page type: ${page.pageType}`);
    lines.push("");
    lines.push(truncateText(page.markdown || page.visibleText, 6000));
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function orderedPages(pages: readonly PageSnapshot[]): PageSnapshot[] {
  const priority = ["home", "pricing", "docs", "api_docs", "security", "integrations", "privacy", "terms", "contact", "demo"];
  return [...pages]
    .filter((page) => page.markdown.trim().length > 0 || page.visibleText.trim().length > 0)
    .sort((left, right) => {
      const leftIndex = priority.indexOf(left.pageType);
      const rightIndex = priority.indexOf(right.pageType);
      const normalizedLeft = leftIndex === -1 ? priority.length : leftIndex;
      const normalizedRight = rightIndex === -1 ? priority.length : rightIndex;
      return normalizedLeft - normalizedRight || left.finalUrl.localeCompare(right.finalUrl);
    });
}
