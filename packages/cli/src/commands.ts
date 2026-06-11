import type { AgentLayerComparison, AgentLayerRegression, AgentTaskResult } from "./coreTypes.js";
import { withRequiredJsonArtifacts } from "./artifacts.js";
import {
  callBuildAgentLayerReport,
  callCompareAgentLayerBaseline,
  callCreateAgentLayerBaseline,
  callEvaluateTasks,
  callGenerateArtifacts,
  callScanSite,
  type CoreApi,
  loadCoreApi
} from "./coreApi.js";
import { getEmbeddedDefaultTasks } from "./defaultTasks.js";
import { buildDoctorDiagnosis, formatDoctorDiagnosis } from "./doctor.js";
import { CliError, formatErrorMessage } from "./errors.js";
import type { CliIo } from "./io.js";
import {
  fileExists,
  readJsonFile,
  resolveJsonOutputPath,
  resolveOutputDirectory,
  resolvePath,
  resolveTaskSuiteOutputPath,
  writeArtifacts,
  writeJsonFile
} from "./io.js";
import type { CompareCommandOptions, CrawlCommandOptions, InitFixtureOptions } from "./options.js";
import { loadTasks } from "./tasks.js";
import { packageVersion } from "./version.js";

type ReportCoreApi = CoreApi &
  Required<Pick<CoreApi, "scanSite" | "buildAgentLayerReport" | "generateArtifacts">>;

export async function runScanCommand(
  rootUrl: string,
  options: CrawlCommandOptions,
  io: CliIo
): Promise<void> {
  const core = await loadCoreApi(["scanSite"]);
  const scan = await runCliStep(`Scan failed for ${rootUrl}`, () =>
    callScanSite(core.scanSite, buildScanOptions(rootUrl, options))
  );
  const outputPath = resolveJsonOutputPath(io.cwd(), options.out, "agentlayer-output", "scan.json");

  await writeJsonFile(outputPath, scan);

  if (options.json) {
    io.stdout(JSON.stringify({ outputPath, scan }, null, 2));
    return;
  }

  io.stdout(
    [
      `Scan complete for ${scan.rootUrl}`,
      `Pages scanned: ${scan.pages.length}`,
      `Errors: ${scan.errors.length}`,
      `Wrote: ${outputPath}`
    ].join("\n")
  );
}

export async function runGenerateCommand(
  rootUrl: string,
  options: CrawlCommandOptions,
  io: CliIo
): Promise<void> {
  const core = await loadCoreApi(["scanSite", "buildAgentLayerReport", "generateArtifacts"]);
  const tasks = await loadTasks(core, options.tasks, io.cwd());
  const scan = await runCliStep(`Generate failed while scanning ${rootUrl}`, () =>
    callScanSite(core.scanSite, buildScanOptions(rootUrl, options))
  );
  const report = await runCliStep("Generate failed while building the AgentLayer report", () =>
    callBuildAgentLayerReport(core.buildAgentLayerReport, scan, tasks)
  );
  const coreArtifacts = await runCliStep("Generate failed while creating artifact contents", () =>
    callGenerateArtifacts(core.generateArtifacts, report)
  );
  const artifacts = withRequiredJsonArtifacts(coreArtifacts, report);
  const outDir = resolveOutputDirectory(io.cwd(), options.out, "agentlayer-output");
  const written = await writeArtifacts(outDir, artifacts);

  if (options.json) {
    io.stdout(
      JSON.stringify(
        {
          outDir,
          artifactCount: written.length,
          artifacts: written,
          scores: report.scores
        },
        null,
        2
      )
    );
    return;
  }

  io.stdout(
    [
      `Generated ${written.length} AgentLayer artifacts in ${outDir}`,
      `Overall score: ${Math.round(report.scores.overall)}/100`,
      `Tasks evaluated: ${report.tasks.length}`
    ].join("\n")
  );
}

export async function runTestCommand(
  rootUrl: string,
  options: CrawlCommandOptions,
  io: CliIo
): Promise<void> {
  const core = await loadCoreApi(["scanSite", "buildAgentLayerReport", "evaluateTasks"]);
  const tasks = await loadTasks(core, options.tasks, io.cwd());
  const scan = await runCliStep(`Test failed while scanning ${rootUrl}`, () =>
    callScanSite(core.scanSite, buildScanOptions(rootUrl, options))
  );
  const fullReport = await runCliStep("Test failed while building the AgentLayer report", () =>
    callBuildAgentLayerReport(core.buildAgentLayerReport, scan, tasks)
  );
  const results = await runCliStep("Test failed while evaluating tasks", () =>
    callEvaluateTasks(core.evaluateTasks, scan, tasks, fullReport.facts, fullReport.actions)
  );
  const report = {
    rootUrl: scan.rootUrl,
    generatedAt: new Date().toISOString(),
    taskSuccessScore: averageTaskScore(results),
    tasks: results
  };
  const outputPath = resolveJsonOutputPath(io.cwd(), options.out, ".", "agentlayer-report.json");

  await writeJsonFile(outputPath, report);

  if (options.json) {
    io.stdout(JSON.stringify({ outputPath, ...report }, null, 2));
    return;
  }

  io.stdout(
    [
      `Task checks complete for ${scan.rootUrl}`,
      `Task success score: ${Math.round(report.taskSuccessScore)}/100`,
      `Tasks evaluated: ${results.length}`,
      `Wrote: ${outputPath}`
    ].join("\n")
  );
}

export async function runDoctorCommand(
  rootUrl: string,
  options: CrawlCommandOptions,
  io: CliIo
): Promise<void> {
  const core = await loadCoreApi(["scanSite", "buildAgentLayerReport"]);
  const tasks = await loadTasks(core, options.tasks, io.cwd());
  const scan = await runCliStep(`Doctor failed while scanning ${rootUrl}`, () =>
    callScanSite(core.scanSite, buildScanOptions(rootUrl, options))
  );
  const report = await runCliStep("Doctor failed while building the AgentLayer report", () =>
    callBuildAgentLayerReport(core.buildAgentLayerReport, scan, tasks)
  );
  const diagnosis = buildDoctorDiagnosis(report);

  if (options.out) {
    const outputPath = resolveJsonOutputPath(io.cwd(), options.out, ".", "doctor-report.json");
    await writeJsonFile(outputPath, diagnosis);
  }

  if (options.json) {
    io.stdout(JSON.stringify(diagnosis, null, 2));
    return;
  }

  io.stdout(formatDoctorDiagnosis(diagnosis));
}

export async function runBaselineCommand(
  rootUrl: string,
  options: CrawlCommandOptions,
  io: CliIo
): Promise<void> {
  const core = await loadCoreApi([
    "scanSite",
    "buildAgentLayerReport",
    "generateArtifacts",
    "createAgentLayerBaseline"
  ]);
  const { report, artifacts, scanOptions } = await buildReportAndArtifacts(
    core,
    rootUrl,
    options,
    io,
    "Baseline"
  );
  const baseline = await runCliStep("Baseline failed while creating the compact snapshot", () =>
    callCreateAgentLayerBaseline(core.createAgentLayerBaseline, {
      agentLayerVersion: packageVersion,
      targetUrl: report.scan.rootUrl,
      scanOptions,
      report,
      artifacts
    })
  );
  const outputPath = resolveJsonOutputPath(io.cwd(), options.out, ".", "agentlayer-baseline.json");

  await writeJsonFile(outputPath, baseline);

  if (options.json) {
    io.stdout(JSON.stringify({ outputPath, baseline }, null, 2));
    return;
  }

  io.stdout(
    [
      `AgentLayer baseline saved for ${baseline.targetUrl}`,
      `Overall score: ${Math.round(baseline.scores.overall)}/100`,
      `Tasks captured: ${baseline.tasks.length}`,
      `Artifacts inventoried: ${baseline.artifacts.length}`,
      `Wrote: ${outputPath}`
    ].join("\n")
  );
}

export async function runCompareCommand(
  rootUrl: string,
  options: CompareCommandOptions,
  io: CliIo
): Promise<void> {
  const core = await loadCoreApi([
    "scanSite",
    "buildAgentLayerReport",
    "generateArtifacts",
    "compareAgentLayerBaseline"
  ]);
  const baselinePath = resolvePath(io.cwd(), options.baseline);
  const baseline = await readJsonFile<unknown>(baselinePath, "AgentLayer baseline");
  const { report, artifacts, scanOptions } = await buildReportAndArtifacts(
    core,
    rootUrl,
    options,
    io,
    "Compare"
  );
  const comparison = await runCliStep("Compare failed while evaluating the baseline", () =>
    callCompareAgentLayerBaseline(core.compareAgentLayerBaseline, {
      agentLayerVersion: packageVersion,
      targetUrl: report.scan.rootUrl,
      scanOptions,
      baseline,
      currentReport: report,
      currentArtifacts: artifacts,
      policy: {
        failOn: options.failOn ?? [],
        minScoreDelta: options.minScoreDelta
      }
    })
  );
  const outputPath = resolveJsonOutputPath(io.cwd(), options.out, ".", "agentlayer-compare.json");

  await writeJsonFile(outputPath, comparison);

  if (options.json) {
    io.stdout(JSON.stringify({ outputPath, comparison }, null, 2));
  } else {
    io.stdout(`${formatComparisonSummary(comparison)}\n\nWrote: ${outputPath}`);
  }

  if (comparison.exitCode !== 0) {
    io.setExitCode?.(comparison.exitCode);
  }
}

export async function runInitFixtureCommand(options: InitFixtureOptions, io: CliIo): Promise<void> {
  const outputPath = resolveTaskSuiteOutputPath(io.cwd(), options.out);

  if (!options.force && (await fileExists(outputPath))) {
    throw new CliError(
      `Refusing to overwrite existing task suite: ${outputPath}. Use --force to replace it.`
    );
  }

  const tasks = getEmbeddedDefaultTasks();
  await writeJsonFile(outputPath, tasks);

  if (options.json) {
    io.stdout(JSON.stringify({ outputPath, tasks }, null, 2));
    return;
  }

  io.stdout(`Initialized B2B SaaS task suite: ${outputPath}`);
}

function averageTaskScore(results: AgentTaskResult[]): number {
  if (results.length === 0) {
    return 0;
  }

  return results.reduce((sum, result) => sum + result.score, 0) / results.length;
}

async function buildReportAndArtifacts(
  core: ReportCoreApi,
  rootUrl: string,
  options: CrawlCommandOptions,
  io: CliIo,
  commandName: string
) {
  const tasks = await loadTasks(core, options.tasks, io.cwd());
  const scanOptions = buildScanOptions(rootUrl, options);
  const scan = await runCliStep(`${commandName} failed while scanning ${rootUrl}`, () =>
    callScanSite(core.scanSite, scanOptions)
  );
  const report = await runCliStep(
    `${commandName} failed while building the AgentLayer report`,
    () => callBuildAgentLayerReport(core.buildAgentLayerReport, scan, tasks)
  );
  const coreArtifacts = await runCliStep(
    `${commandName} failed while creating artifact contents`,
    () => callGenerateArtifacts(core.generateArtifacts, report)
  );
  const artifacts = withRequiredJsonArtifacts(coreArtifacts, report);

  return { scan, report, artifacts, scanOptions };
}

function buildScanOptions(rootUrl: string, options: CrawlCommandOptions) {
  return {
    rootUrl,
    maxPages: options.maxPages,
    timeoutMs: options.timeoutMs,
    respectRobotsTxt: true,
    allowLocal: Boolean(options.allowLocal),
    crawler: options.crawler
  };
}

function formatComparisonSummary(comparison: AgentLayerComparison): string {
  const lines = [
    "AgentLayer CI",
    `Target: ${comparison.targetUrl}`,
    "",
    `Overall score: ${formatScore(comparison.scores.overall)}`,
    `Readability: ${formatScore(comparison.scores.readability)}`,
    `Trustability: ${formatScore(comparison.scores.trustability)}`,
    `Actionability: ${formatScore(comparison.scores.actionability)}`,
    `Task success: ${formatScore(comparison.scores.taskSuccess)}`,
    "",
    "Regressions:",
    ...formatRegressionList(comparison.regressions),
    "",
    "Blocking failures:",
    ...formatRegressionList(comparison.blockingFailures),
    "",
    "Recommendations:",
    ...formatRecommendations(comparison.recommendations),
    "",
    `Exit code: ${comparison.exitCode}`
  ];

  return lines.join("\n");
}

function formatScore(score: AgentLayerComparison["scores"]["overall"]): string {
  const baselineToCurrent = `${Math.round(score.baseline)} -> ${Math.round(score.current)}`;
  return score.delta === 0
    ? baselineToCurrent
    : `${baselineToCurrent} (${formatDelta(score.delta)})`;
}

function formatDelta(delta: number): string {
  return delta > 0 ? `+${Math.round(delta)}` : `${Math.round(delta)}`;
}

function formatRegressionList(regressions: readonly AgentLayerRegression[]): string[] {
  if (regressions.length === 0) {
    return ["- none"];
  }

  return regressions.map((regression) =>
    regression.type === "task-regression"
      ? `- ${regression.id}: ${regression.baseline} -> ${regression.current}`
      : `- ${regression.message}`
  );
}

function formatRecommendations(recommendations: readonly string[]): string[] {
  if (recommendations.length === 0) {
    return ["1. No new recommendations."];
  }

  return recommendations.map((recommendation, index) => `${index + 1}. ${recommendation}`);
}

async function runCliStep<T>(failurePrefix: string, action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof CliError) {
      throw error;
    }

    throw new CliError(`${failurePrefix}: ${formatErrorMessage(error)}`);
  }
}
