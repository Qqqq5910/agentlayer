import type { AgentOperabilityReport, GeneratedArtifact } from "../schemas.js";
import { GeneratedArtifactSchema } from "../schemas.js";
import { truncatePreservingWhitespace, truncateText } from "../utils/text.js";
import { pageMarkdownPath } from "../utils/urls.js";
import { describeGeneratedArtifacts } from "./artifactCatalog.js";
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
      path: "form-operability.json",
      mediaType: "application/json",
      content: `${JSON.stringify(report.forms, null, 2)}\n`
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
      path: "report.json",
      mediaType: "application/json",
      content: `${JSON.stringify(reportArtifactValue(report), null, 2)}\n`
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
  artifacts.push(generateArtifactIndex(report, artifacts));

  return artifacts.map((artifact) => GeneratedArtifactSchema.parse(artifact));
}

function reportArtifactValue(report: AgentOperabilityReport): AgentOperabilityReport {
  return {
    ...report,
    scan: {
      ...report.scan,
      pages: report.scan.pages.map((page) => ({
        ...page,
        visibleText: truncateText(page.visibleText, 320),
        markdown: truncatePreservingWhitespace(page.markdown, 320)
      }))
    },
    facts: report.facts.map((fact) => ({
      ...fact,
      sourceText: fact.sourceText ? truncateText(fact.sourceText, 220) : fact.sourceText
    })),
    tasks: report.tasks.map((task) => ({
      ...task,
      evidenceSnippets: task.evidenceSnippets.map((snippet) => truncateText(snippet, 220)),
      journeySteps: task.journeySteps.map((step) => ({
        ...step,
        evidenceSnippets: step.evidenceSnippets.map((snippet) => truncateText(snippet, 220))
      }))
    }))
  };
}

function generateArtifactIndex(
  report: AgentOperabilityReport,
  artifacts: GeneratedArtifact[]
): GeneratedArtifact {
  const actualEntries = artifacts.map((artifact) => ({
    path: artifact.path,
    mediaType: artifact.mediaType
  }));
  const catalogEntries = describeGeneratedArtifacts(report).map(({ path, mediaType }) => ({
    path,
    mediaType
  }));
  const indexEntries =
    JSON.stringify(actualEntries) === JSON.stringify(catalogEntries.slice(0, actualEntries.length))
      ? catalogEntries
      : [
          ...actualEntries,
          {
            path: "artifacts.json",
            mediaType: "application/json"
          }
        ];

  return {
    path: "artifacts.json",
    mediaType: "application/json",
    content: `${JSON.stringify(
      {
        generatedBy: "AgentLayer",
        generatedAt: report.generatedAt,
        rootUrl: report.site.rootUrl,
        count: indexEntries.length,
        artifacts: indexEntries
      },
      null,
      2
    )}\n`
  };
}
