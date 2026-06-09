import type { AgentTaskResult } from "./coreTypes.js";
import { withRequiredJsonArtifacts } from "./artifacts.js";
import {
  callBuildAgentLayerReport,
  callEvaluateTasks,
  callGenerateArtifacts,
  callScanSite,
  loadCoreApi
} from "./coreApi.js";
import { getEmbeddedDefaultTasks } from "./defaultTasks.js";
import { buildDoctorDiagnosis, formatDoctorDiagnosis } from "./doctor.js";
import { CliError } from "./errors.js";
import type { CliIo } from "./io.js";
import {
  fileExists,
  resolveJsonOutputPath,
  resolveOutputDirectory,
  resolveTaskSuiteOutputPath,
  writeArtifacts,
  writeJsonFile
} from "./io.js";
import type { CrawlCommandOptions, InitFixtureOptions } from "./options.js";
import { loadTasks } from "./tasks.js";

export async function runScanCommand(
  rootUrl: string,
  options: CrawlCommandOptions,
  io: CliIo
): Promise<void> {
  const core = await loadCoreApi(["scanSite"]);
  const scan = await callScanSite(core.scanSite!, {
    rootUrl,
    maxPages: options.maxPages,
    timeoutMs: options.timeoutMs,
    respectRobotsTxt: true
  });
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
  const scan = await callScanSite(core.scanSite!, {
    rootUrl,
    maxPages: options.maxPages,
    timeoutMs: options.timeoutMs,
    respectRobotsTxt: true
  });
  const report = await callBuildAgentLayerReport(core.buildAgentLayerReport!, scan, tasks);
  const coreArtifacts = await callGenerateArtifacts(core.generateArtifacts!, report);
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
  const scan = await callScanSite(core.scanSite!, {
    rootUrl,
    maxPages: options.maxPages,
    timeoutMs: options.timeoutMs,
    respectRobotsTxt: true
  });
  const fullReport = await callBuildAgentLayerReport(core.buildAgentLayerReport!, scan, tasks);
  const results = await callEvaluateTasks(
    core.evaluateTasks!,
    scan,
    tasks,
    fullReport.facts,
    fullReport.actions
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
  const scan = await callScanSite(core.scanSite!, {
    rootUrl,
    maxPages: options.maxPages,
    timeoutMs: options.timeoutMs,
    respectRobotsTxt: true
  });
  const report = await callBuildAgentLayerReport(core.buildAgentLayerReport!, scan, tasks);
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

export async function runInitFixtureCommand(
  options: InitFixtureOptions,
  io: CliIo
): Promise<void> {
  const outputPath = resolveTaskSuiteOutputPath(io.cwd(), options.out);

  if (!options.force && (await fileExists(outputPath))) {
    throw new CliError(`Refusing to overwrite existing task suite: ${outputPath}. Use --force to replace it.`);
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
