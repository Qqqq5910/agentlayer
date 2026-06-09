import type {
  AgentOperabilityReport,
  AgentTask,
  AgentTaskResult,
  GeneratedArtifact,
  SiteScan
} from "./coreTypes.js";
import { CliError } from "./errors.js";

type CoreFunctionName = "scanSite" | "buildAgentLayerReport" | "generateArtifacts" | "evaluateTasks";

type UnknownCoreModule = Record<string, unknown>;
const CORE_PACKAGE_NAME = "@agentlayer/core";
const CORE_SOURCE_URL = new URL("../../core/src/index.ts", import.meta.url).href;

export type CoreApi = {
  scanSite?: (...args: unknown[]) => unknown;
  buildAgentLayerReport?: (...args: unknown[]) => unknown;
  generateArtifacts?: (...args: unknown[]) => unknown;
  evaluateTasks?: (...args: unknown[]) => unknown;
  defaultTasks?: unknown;
};

export type ScanSiteOptions = {
  rootUrl: string;
  maxPages: number;
  timeoutMs: number;
  respectRobotsTxt: boolean;
};

export async function loadCoreApi(requiredFunctions: CoreFunctionName[]): Promise<CoreApi> {
  const core = await importCoreModule();

  for (const functionName of requiredFunctions) {
    if (typeof core[functionName] !== "function") {
      throw new CliError(
        `@agentlayer/core does not export ${functionName} yet. The CLI expects the core public API: scanSite, buildAgentLayerReport, generateArtifacts, evaluateTasks, and defaultTasks.`
      );
    }
  }

  return core as CoreApi;
}

async function importCoreModule(): Promise<UnknownCoreModule> {
  try {
    return (await import(CORE_PACKAGE_NAME)) as UnknownCoreModule;
  } catch (packageError) {
    try {
      return (await import(CORE_SOURCE_URL)) as UnknownCoreModule;
    } catch (sourceError) {
      throw new CliError(
        [
          "Could not load @agentlayer/core.",
          `Package import error: ${formatCoreError(packageError)}`,
          `Source fallback error: ${formatCoreError(sourceError)}`
        ].join(" ")
      );
    }
  }
}

export async function getCoreDefaultTasks(core: CoreApi): Promise<AgentTask[] | undefined> {
  if (Array.isArray(core.defaultTasks)) {
    return cloneTasks(core.defaultTasks as AgentTask[]);
  }

  if (typeof core.defaultTasks === "function") {
    const tasks = await (core.defaultTasks as () => AgentTask[] | Promise<AgentTask[]>)();
    return cloneTasks(tasks);
  }

  return undefined;
}

export async function callScanSite(
  scanSite: NonNullable<CoreApi["scanSite"]>,
  options: ScanSiteOptions
): Promise<SiteScan> {
  try {
    return (await scanSite(options)) as SiteScan;
  } catch (error) {
    if (!looksLikeSignatureMismatch(error)) {
      throw error;
    }

    return (await scanSite(options.rootUrl, options)) as SiteScan;
  }
}

export async function callBuildAgentLayerReport(
  buildAgentLayerReport: NonNullable<CoreApi["buildAgentLayerReport"]>,
  scan: SiteScan,
  tasks: AgentTask[]
): Promise<AgentOperabilityReport> {
  const attempts: unknown[][] = [
    [scan, tasks],
    [scan, { tasks }],
    [{ scan, tasks }]
  ];

  return invokePureWithAttempts(buildAgentLayerReport, attempts, "buildAgentLayerReport");
}

export async function callGenerateArtifacts(
  generateArtifacts: NonNullable<CoreApi["generateArtifacts"]>,
  report: AgentOperabilityReport
): Promise<GeneratedArtifact[]> {
  return invokePureWithAttempts(generateArtifacts, [[report], [{ report }]], "generateArtifacts");
}

export async function callEvaluateTasks(
  evaluateTasks: NonNullable<CoreApi["evaluateTasks"]>,
  scan: SiteScan,
  tasks: AgentTask[],
  facts?: AgentOperabilityReport["facts"],
  actions?: AgentOperabilityReport["actions"]
): Promise<AgentTaskResult[]> {
  const attempts: unknown[][] =
    facts && actions
      ? [
          [scan, facts, actions, tasks],
          [scan, facts, actions],
          [scan, tasks],
          [scan, { tasks }],
          [{ scan, tasks }]
        ]
      : [
          [scan, tasks],
          [scan, { tasks }],
          [{ scan, tasks }]
        ];

  return invokePureWithAttempts(evaluateTasks, attempts, "evaluateTasks");
}

function cloneTasks(tasks: AgentTask[]): AgentTask[] {
  return tasks.map((task) => ({
    ...task,
    requiredEvidence: [...task.requiredEvidence]
  }));
}

async function invokePureWithAttempts<T>(
  fn: (...args: unknown[]) => unknown,
  attempts: unknown[][],
  label: string
): Promise<T> {
  let lastError: unknown;

  for (const args of attempts) {
    try {
      return (await fn(...args)) as T;
    } catch (error) {
      lastError = error;
      if (!looksLikeSignatureMismatch(error)) {
        throw error;
      }
    }
  }

  throw new CliError(
    `Could not call @agentlayer/core ${label}. Last error: ${formatCoreError(lastError)}`
  );
}

function looksLikeSignatureMismatch(error: unknown): boolean {
  const message = formatCoreError(error).toLowerCase();

  return (
    message.includes("invalid url") ||
    message.includes("expected string") ||
    message.includes("expected object") ||
    message.includes("rooturl") ||
    message.includes("cannot read properties") ||
    message.includes("is not a function") ||
    message.includes("validation")
  );
}

function formatCoreError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
