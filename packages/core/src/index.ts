export * from "./schemas.js";

export { scanSite } from "./scanner/crawl.js";
export { buildSiteProfile, extractFacts } from "./extractor/extractFacts.js";
export { extractActions } from "./extractor/extractActions.js";
export { defaultTasks } from "./evaluator/defaultTasks.js";
export { evaluateTasks } from "./evaluator/evaluateTasks.js";
export { scoreSite } from "./evaluator/scoreSite.js";
export { generateArtifacts } from "./generator/generateArtifacts.js";
export { generateLlmsTxt } from "./generator/generateLlmsTxt.js";
export { generateLlmsFullTxt } from "./generator/generateLlmsFullTxt.js";
export { generateReportHtml } from "./generator/generateReportHtml.js";

import type { AgentOperabilityReport, AgentTask, ScanOptions, SiteScan } from "./schemas.js";
import { AgentOperabilityReportSchema, SiteScanSchema } from "./schemas.js";
import { evaluateTasks } from "./evaluator/evaluateTasks.js";
import { extractActions } from "./extractor/extractActions.js";
import { buildSiteProfile, extractFacts } from "./extractor/extractFacts.js";
import { generateRecommendations, scoreSite } from "./evaluator/scoreSite.js";
import { scanSite } from "./scanner/crawl.js";

type ReportInput = SiteScan | ScanOptions | string;

export async function buildAgentLayerReport(
  scanOrOptions: ReportInput,
  tasks?: readonly AgentTask[]
): Promise<AgentOperabilityReport> {
  const scan = isSiteScan(scanOrOptions) ? scanOrOptions : await scanSite(scanOrOptions);
  const site = buildSiteProfile(scan);
  const facts = extractFacts(scan);
  const actions = extractActions(scan);
  const taskResults = evaluateTasks(scan, facts, actions, tasks);
  const scores = scoreSite(scan, facts, actions, taskResults);
  const recommendations = generateRecommendations(scan, facts, actions, taskResults);

  return AgentOperabilityReportSchema.parse({
    site,
    scan,
    facts,
    actions,
    tasks: taskResults,
    scores,
    recommendations,
    generatedAt: new Date().toISOString()
  });
}

function isSiteScan(value: ReportInput): value is SiteScan {
  if (!value || typeof value === "string") {
    return false;
  }

  return SiteScanSchema.safeParse(value).success;
}
