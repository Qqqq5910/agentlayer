import type { AgentOperabilityReport, GeneratedArtifact } from "../schemas.js";
import { GeneratedArtifactSchema } from "../schemas.js";
import { pageMarkdownPath } from "../utils/urls.js";
import { generateLlmsFullTxt } from "./generateLlmsFullTxt.js";
import { generateLlmsTxt } from "./generateLlmsTxt.js";
import { generateReportHtml } from "./generateReportHtml.js";
import { generateWebMcpSuggestions } from "./generateWebMcpSuggestions.js";
import { generateWellKnownArtifacts } from "./generateWellKnown.js";

export function generateArtifacts(report: AgentOperabilityReport): GeneratedArtifact[] {
  const artifacts: GeneratedArtifact[] = [
    {
      path: "llms.txt",
      mediaType: "text/plain",
      content: generateLlmsTxt(report)
    },
    {
      path: "llms-full.txt",
      mediaType: "text/plain",
      content: generateLlmsFullTxt(report)
    },
    {
      path: "site-profile.json",
      mediaType: "application/json",
      content: `${JSON.stringify(report.site, null, 2)}\n`
    },
    {
      path: "facts.json",
      mediaType: "application/json",
      content: `${JSON.stringify(report.facts, null, 2)}\n`
    },
    {
      path: "actions.json",
      mediaType: "application/json",
      content: `${JSON.stringify(report.actions, null, 2)}\n`
    },
    {
      path: "tasks-report.json",
      mediaType: "application/json",
      content: `${JSON.stringify(report.tasks, null, 2)}\n`
    },
    {
      path: "recommendations.json",
      mediaType: "application/json",
      content: `${JSON.stringify(report.recommendations, null, 2)}\n`
    },
    {
      path: "report.html",
      mediaType: "text/html",
      content: generateReportHtml(report)
    },
    ...generateWellKnownArtifacts(report),
    ...generateWebMcpSuggestions(report),
    ...report.scan.pages
      .filter((page) => page.markdown.trim().length > 0)
      .map((page) => ({
        path: pageMarkdownPath(page.finalUrl, report.site.rootUrl),
        mediaType: "text/markdown",
        content: `# ${page.title ?? page.headings.h1[0] ?? page.pageType}\n\nSource: ${page.finalUrl}\n\n${page.markdown}\n`
      }))
  ];

  return artifacts.map((artifact) => GeneratedArtifactSchema.parse(artifact));
}
