import type {
  AgentLayerArtifactInventoryItem,
  AgentLayerBaseline,
  AgentLayerComparison,
  AgentLayerCountComparison,
  AgentLayerRegression,
  AgentLayerScoreSet,
  AgentLayerTaskBaseline,
  AgentLayerTaskComparison,
  AgentOperabilityReport,
  BlockingPolicy,
  GeneratedArtifact,
  ScanOptions
} from "./schemas.js";
import {
  AgentLayerBaselineSchema,
  AgentLayerComparisonSchema,
  BlockingPolicySchema
} from "./schemas.js";

type CreateBaselineInput = {
  agentLayerVersion: string;
  targetUrl: string;
  scanOptions: ScanOptions;
  report: AgentOperabilityReport;
  artifacts: readonly GeneratedArtifact[];
  generatedAt?: string;
};

type CompareBaselineInput = {
  agentLayerVersion: string;
  targetUrl: string;
  scanOptions: ScanOptions;
  baseline: unknown;
  currentReport: AgentOperabilityReport;
  currentArtifacts: readonly GeneratedArtifact[];
  policy?: Partial<BlockingPolicy>;
  comparedAt?: string;
};

const scoreKeys = [
  "readability",
  "trustability",
  "actionability",
  "taskSuccess",
  "overall"
] as const;

const statusRank = {
  fail: 0,
  partial: 1,
  pass: 2
} as const;

export function createAgentLayerBaseline(input: CreateBaselineInput): AgentLayerBaseline {
  return AgentLayerBaselineSchema.parse({
    schemaVersion: "agentlayer-baseline/v1",
    agentLayerVersion: input.agentLayerVersion,
    targetUrl: input.targetUrl,
    generatedAt: input.generatedAt ?? input.report.generatedAt,
    scanOptions: input.scanOptions,
    scores: input.report.scores,
    tasks: input.report.tasks.map(compactTask),
    artifacts: inventoryFromArtifacts(input.artifacts),
    counts: countsFromReport(input.report),
    acceptedFailures: []
  });
}

export function parseAgentLayerBaseline(value: unknown): AgentLayerBaseline {
  return AgentLayerBaselineSchema.parse(value);
}

export function compareAgentLayerBaseline(input: CompareBaselineInput): AgentLayerComparison {
  const baseline = parseAgentLayerBaseline(input.baseline);
  const policy = BlockingPolicySchema.parse(input.policy ?? {});
  const currentArtifacts = inventoryFromArtifacts(input.currentArtifacts);
  const taskComparisons = compareTasks(baseline.tasks, input.currentReport.tasks);
  const missingArtifacts = findMissingArtifacts(baseline.artifacts, currentArtifacts);
  const counts = compareCounts(baseline.counts, countsFromReport(input.currentReport));
  const regressions = [
    ...scoreRegressions(baseline.scores, input.currentReport.scores),
    ...taskRegressions(taskComparisons),
    ...taskScoreRegressions(taskComparisons),
    ...missingArtifactRegressions(missingArtifacts),
    ...countRegressions(counts)
  ];
  const blockingFailures = regressions.filter((regression) =>
    shouldBlock(regression, policy, baseline.scores, input.currentReport.scores)
  );

  return AgentLayerComparisonSchema.parse({
    schemaVersion: "agentlayer-comparison/v1",
    agentLayerVersion: input.agentLayerVersion,
    targetUrl: input.targetUrl,
    baselineGeneratedAt: baseline.generatedAt,
    currentGeneratedAt: input.currentReport.generatedAt,
    comparedAt: input.comparedAt ?? new Date().toISOString(),
    scanOptions: input.scanOptions,
    policy,
    scores: compareScores(baseline.scores, input.currentReport.scores),
    tasks: taskComparisons,
    artifacts: {
      baseline: baseline.artifacts,
      current: currentArtifacts,
      missing: missingArtifacts
    },
    counts,
    regressions,
    blockingFailures,
    recommendations: comparisonRecommendations(taskComparisons, input.currentReport),
    exitCode: blockingFailures.length > 0 ? 1 : 0
  });
}

export function evaluateBlockingPolicy(
  comparison: AgentLayerComparison,
  policy: Partial<BlockingPolicy> = comparison.policy
): AgentLayerRegression[] {
  const blockingPolicy = BlockingPolicySchema.parse(policy);
  const scores = scoreSnapshotFromComparison(comparison.scores);

  return comparison.regressions.filter((regression) =>
    shouldBlock(regression, blockingPolicy, scores.baseline, scores.current)
  );
}

function compactTask(task: AgentOperabilityReport["tasks"][number]): AgentLayerTaskBaseline {
  return {
    taskId: task.taskId,
    title: task.title,
    status: task.status,
    score: task.score,
    missingInformation: [...task.missingInformation],
    recommendations: [...task.recommendations]
  };
}

function inventoryFromArtifacts(
  artifacts: readonly GeneratedArtifact[]
): AgentLayerArtifactInventoryItem[] {
  return artifacts
    .map((artifact) => ({ path: artifact.path, mediaType: artifact.mediaType }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function countsFromReport(report: AgentOperabilityReport) {
  return {
    facts: report.facts.length,
    actions: report.actions.length,
    forms: report.forms.length
  };
}

function compareScores(baseline: AgentLayerScoreSet, current: AgentLayerScoreSet) {
  return Object.fromEntries(
    scoreKeys.map((key) => [
      key,
      {
        baseline: baseline[key],
        current: current[key],
        delta: current[key] - baseline[key]
      }
    ])
  );
}

function compareTasks(
  baselineTasks: readonly AgentLayerTaskBaseline[],
  currentTasks: readonly AgentOperabilityReport["tasks"][number][]
): AgentLayerTaskComparison[] {
  const currentById = new Map(currentTasks.map((task) => [task.taskId, task]));

  return baselineTasks.map((baselineTask) => {
    const currentTask = currentById.get(baselineTask.taskId);

    return {
      taskId: baselineTask.taskId,
      title: currentTask?.title ?? baselineTask.title,
      baselineStatus: baselineTask.status,
      currentStatus: currentTask?.status ?? null,
      statusChanged: Boolean(currentTask) && baselineTask.status !== currentTask?.status,
      baselineScore: baselineTask.score,
      currentScore: currentTask?.score ?? null,
      scoreDelta: currentTask ? currentTask.score - baselineTask.score : null
    };
  });
}

function findMissingArtifacts(
  baselineArtifacts: readonly AgentLayerArtifactInventoryItem[],
  currentArtifacts: readonly AgentLayerArtifactInventoryItem[]
): AgentLayerArtifactInventoryItem[] {
  const currentPaths = new Set(currentArtifacts.map((artifact) => artifact.path));
  return baselineArtifacts.filter((artifact) => !currentPaths.has(artifact.path));
}

function compareCounts(
  baseline: AgentLayerBaseline["counts"],
  current: AgentLayerBaseline["counts"]
): AgentLayerCountComparison {
  return {
    baseline,
    current,
    delta: {
      facts: current.facts - baseline.facts,
      actions: current.actions - baseline.actions,
      forms: current.forms - baseline.forms
    }
  };
}

function scoreRegressions(
  baseline: AgentLayerScoreSet,
  current: AgentLayerScoreSet
): AgentLayerRegression[] {
  const overallDrop = baseline.overall - current.overall;

  return overallDrop > 0
    ? [
        {
          type: "score-drop",
          id: "overall",
          message: `Overall score dropped by ${overallDrop} points`,
          severity: "warning",
          baseline: baseline.overall,
          current: current.overall,
          delta: current.overall - baseline.overall
        }
      ]
    : [];
}

function taskRegressions(tasks: readonly AgentLayerTaskComparison[]): AgentLayerRegression[] {
  return tasks.flatMap((task) => {
    const currentRank = task.currentStatus ? statusRank[task.currentStatus] : -1;
    const baselineRank = statusRank[task.baselineStatus];

    if (currentRank >= baselineRank) {
      return [];
    }

    const current = task.currentStatus ?? "missing";
    return [
      {
        type: "task-regression",
        id: task.taskId,
        message: `${task.taskId} regressed from ${task.baselineStatus} to ${current}`,
        severity: "warning",
        baseline: task.baselineStatus,
        current
      }
    ];
  });
}

function taskScoreRegressions(tasks: readonly AgentLayerTaskComparison[]): AgentLayerRegression[] {
  return tasks.flatMap((task) => {
    if (task.scoreDelta === null || task.scoreDelta >= 0) {
      return [];
    }

    return [
      {
        type: "task-score-drop",
        id: task.taskId,
        message: `${task.taskId} score changed by ${task.scoreDelta}`,
        severity: "info",
        baseline: task.baselineScore,
        current: task.currentScore ?? null,
        delta: task.scoreDelta
      }
    ];
  });
}

function missingArtifactRegressions(
  missingArtifacts: readonly AgentLayerArtifactInventoryItem[]
): AgentLayerRegression[] {
  return missingArtifacts.map((artifact) => ({
    type: "missing-artifact",
    id: artifact.path,
    message: `${artifact.path} is missing from the current generated artifacts`,
    severity: "warning",
    baseline: artifact.path,
    current: null
  }));
}

function countRegressions(counts: AgentLayerCountComparison): AgentLayerRegression[] {
  return (["facts", "actions", "forms"] as const).flatMap((key) => {
    const delta = counts.delta[key];

    if (delta >= 0) {
      return [];
    }

    return [
      {
        type: "count-drop",
        id: key,
        message: `${key} count changed by ${delta}`,
        severity: "info",
        baseline: counts.baseline[key],
        current: counts.current[key],
        delta
      }
    ];
  });
}

function shouldBlock(
  regression: AgentLayerRegression,
  policy: BlockingPolicy,
  baselineScores: AgentLayerScoreSet,
  currentScores: AgentLayerScoreSet
): boolean {
  if (regression.type === "task-regression") {
    return (
      policy.failOn.includes("task-regression") &&
      regression.baseline === "pass" &&
      (regression.current === "partial" ||
        regression.current === "fail" ||
        regression.current === "missing")
    );
  }

  if (regression.type === "missing-artifact") {
    return policy.failOn.includes("missing-artifact");
  }

  if (regression.type === "score-drop") {
    return (
      policy.failOn.includes("score-drop") &&
      baselineScores.overall - currentScores.overall > policy.minScoreDelta
    );
  }

  return false;
}

function comparisonRecommendations(
  taskComparisons: readonly AgentLayerTaskComparison[],
  report: AgentOperabilityReport
): string[] {
  const regressedTaskIds = new Set(
    taskComparisons
      .filter((task) => {
        const currentRank = task.currentStatus ? statusRank[task.currentStatus] : -1;
        return currentRank < statusRank[task.baselineStatus];
      })
      .map((task) => task.taskId)
  );
  const recommendations = [
    ...report.tasks
      .filter((task) => regressedTaskIds.has(task.taskId))
      .flatMap((task) => task.recommendations),
    ...report.recommendations.map((recommendation) => recommendation.howToFix)
  ];

  return [...new Set(recommendations)].slice(0, 8);
}

function scoreSnapshotFromComparison(comparison: AgentLayerComparison["scores"]) {
  return {
    baseline: Object.fromEntries(scoreKeys.map((key) => [key, comparison[key].baseline])),
    current: Object.fromEntries(scoreKeys.map((key) => [key, comparison[key].current]))
  } as { baseline: AgentLayerScoreSet; current: AgentLayerScoreSet };
}
