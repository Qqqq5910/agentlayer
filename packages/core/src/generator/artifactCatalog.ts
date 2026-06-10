import type { AgentOperabilityReport } from "../schemas.js";
import { pageMarkdownPath } from "../utils/urls.js";

export type GeneratedArtifactCatalogItem = {
  path: string;
  mediaType: string;
  description: string;
};

export function describeGeneratedArtifacts(
  report: AgentOperabilityReport
): GeneratedArtifactCatalogItem[] {
  return [
    { path: "llms.txt", mediaType: "text/plain", description: "Concise site guide for agents." },
    {
      path: "llms-full.txt",
      mediaType: "text/plain",
      description: "Full page context with source URLs."
    },
    {
      path: "site-profile.json",
      mediaType: "application/json",
      description: "Site identity, summary, and key pages."
    },
    {
      path: "facts.json",
      mediaType: "application/json",
      description: `${report.facts.length} extracted facts with source evidence.`
    },
    {
      path: "actions.json",
      mediaType: "application/json",
      description: `${report.actions.length} detected actions and confirmation rules.`
    },
    {
      path: "form-operability.json",
      mediaType: "application/json",
      description: `${report.forms.length} deterministic form operability checks.`
    },
    {
      path: "tasks-report.json",
      mediaType: "application/json",
      description: `${report.tasks.length} deterministic task checks.`
    },
    {
      path: "recommendations.json",
      mediaType: "application/json",
      description: `${report.recommendations.length} prioritized remediation items.`
    },
    {
      path: "report.json",
      mediaType: "application/json",
      description: "Machine-readable AgentLayer report with long page text truncated for review."
    },
    {
      path: "report.html",
      mediaType: "text/html",
      description: "Standalone shareable operability report."
    },
    {
      path: ".well-known/agents.json",
      mediaType: "application/json",
      description: "Draft public action manifest."
    },
    {
      path: ".well-known/mcp.json",
      mediaType: "application/json",
      description: "Draft MCP metadata."
    },
    {
      path: ".well-known/mcp/server-card.json",
      mediaType: "application/json",
      description: "Draft MCP server card."
    },
    {
      path: ".well-known/api-catalog",
      mediaType: "application/json",
      description: "Draft API catalog discovered from public pages."
    },
    {
      path: ".well-known/agent-skills/index.json",
      mediaType: "application/json",
      description: "Draft agent skill index."
    },
    {
      path: "webmcp/suggested-webmcp-tools.json",
      mediaType: "application/json",
      description: "Suggested WebMCP tool definitions."
    },
    {
      path: "webmcp/suggested-form-annotations.md",
      mediaType: "text/markdown",
      description: "Suggested form annotations for agent UX."
    },
    ...report.scan.pages
      .filter((page) => page.markdown.trim().length > 0)
      .map((page) => ({
        path: pageMarkdownPath(page.finalUrl, report.site.rootUrl),
        mediaType: "text/markdown",
        description: `Markdown snapshot from ${sourceLabel(page.finalUrl)}.`
      })),
    {
      path: "artifacts.json",
      mediaType: "application/json",
      description: "Machine-readable index of generated artifacts."
    }
  ];
}

function sourceLabel(sourceUrl: string): string {
  try {
    const url = new URL(sourceUrl);
    return url.pathname || "/";
  } catch {
    return sourceUrl;
  }
}
