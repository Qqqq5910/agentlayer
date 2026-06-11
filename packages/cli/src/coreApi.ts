import type {
  AgentLayerBaseline,
  AgentLayerComparison,
  AgentOperabilityReport,
  AgentTask,
  AgentTaskResult,
  BlockingPolicy,
  GeneratedArtifact,
  SiteScan
} from "./coreTypes.js";
import { CliError, formatErrorMessage } from "./errors.js";

type CoreFunctionName =
  | "scanSite"
  | "buildAgentLayerReport"
  | "generateArtifacts"
  | "evaluateTasks"
  | "createAgentLayerBaseline"
  | "compareAgentLayerBaseline";
type CoreFunctionApi = Record<CoreFunctionName, (...args: unknown[]) => unknown>;
type CoreApiWithRequired<T extends CoreFunctionName> = CoreApi & Required<Pick<CoreFunctionApi, T>>;

type UnknownCoreModule = Record<string, unknown>;
const CORE_PACKAGE_NAME = "@agentlayer/core";
const CORE_SOURCE_URL = new URL("../../core/src/index.ts", import.meta.url).href;

export type CoreApi = Partial<CoreFunctionApi> & {
  defaultTasks?: unknown;
};

export type ScanSiteOptions = {
  rootUrl: string;
  maxPages: number;
  timeoutMs: number;
  respectRobotsTxt: boolean;
  allowLocal: boolean;
  crawler: "local" | "firecrawl";
};

export async function loadCoreApi<const T extends readonly CoreFunctionName[]>(
  requiredFunctions: T
): Promise<CoreApiWithRequired<T[number]>> {
  const core = await importCoreModule();

  for (const functionName of requiredFunctions) {
    if (typeof core[functionName] !== "function") {
      throw new CliError(
        `Installed @agentlayer/core is incompatible: missing export "${functionName}". Rebuild or reinstall @agentlayer/core, then retry.`
      );
    }
  }

  return core as CoreApiWithRequired<T[number]>;
}

async function importCoreModule(): Promise<UnknownCoreModule> {
  try {
    return (await import(CORE_SOURCE_URL)) as UnknownCoreModule;
  } catch (sourceError) {
    try {
      return (await import(CORE_PACKAGE_NAME)) as UnknownCoreModule;
    } catch (packageError) {
      throw new CliError(
        [
          "Could not load @agentlayer/core.",
          "Run pnpm install from the repo root or rebuild @agentlayer/core, then retry.",
          `Source import failed: ${formatCoreError(sourceError)}.`,
          `Package import failed: ${formatCoreError(packageError)}.`
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
  const attempts: unknown[][] = [[scan, tasks], [scan, { tasks }], [{ scan, tasks }]];

  return invokePureWithAttempts(buildAgentLayerReport, attempts, "buildAgentLayerReport");
}

export async function callGenerateArtifacts(
  generateArtifacts: NonNullable<CoreApi["generateArtifacts"]>,
  report: AgentOperabilityReport
): Promise<GeneratedArtifact[]> {
  return invokePureWithAttempts(generateArtifacts, [[report], [{ report }]], "generateArtifacts");
}

export async function callCreateAgentLayerBaseline(
  createAgentLayerBaseline: NonNullable<CoreApi["createAgentLayerBaseline"]>,
  input: {
    agentLayerVersion: string;
    targetUrl: string;
    scanOptions: ScanSiteOptions;
    report: AgentOperabilityReport;
    artifacts: GeneratedArtifact[];
  }
): Promise<AgentLayerBaseline> {
  return invokePureWithAttempts(
    createAgentLayerBaseline,
    [
      [input],
      [input.agentLayerVersion, input.targetUrl, input.scanOptions, input.report, input.artifacts]
    ],
    "createAgentLayerBaseline"
  );
}

export async function callCompareAgentLayerBaseline(
  compareAgentLayerBaseline: NonNullable<CoreApi["compareAgentLayerBaseline"]>,
  input: {
    agentLayerVersion: string;
    targetUrl: string;
    scanOptions: ScanSiteOptions;
    baseline: unknown;
    currentReport: AgentOperabilityReport;
    currentArtifacts: GeneratedArtifact[];
    policy: Partial<BlockingPolicy>;
  }
): Promise<AgentLayerComparison> {
  return invokePureWithAttempts(
    compareAgentLayerBaseline,
    [[input], [input.baseline, input.currentReport, input.currentArtifacts, input.policy]],
    "compareAgentLayerBaseline"
  );
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
      : [[scan, tasks], [scan, { tasks }], [{ scan, tasks }]];

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
    `Could not call @agentlayer/core ${label}. This CLI may be paired with an incompatible core build. Last error: ${formatCoreError(lastError)}`
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
  return formatErrorMessage(error);
}
