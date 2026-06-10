import type { AgentTaskResult, GeneratedArtifact, Recommendation } from "@/lib/report-types";

export type ScoreTone = "strong" | "mixed" | "weak";

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreTone(score: number): ScoreTone {
  if (score >= 80) {
    return "strong";
  }

  if (score >= 60) {
    return "mixed";
  }

  return "weak";
}

export function scoreToneLabel(score: number) {
  const tone = scoreTone(score);

  if (tone === "strong") {
    return "Strong";
  }

  if (tone === "mixed") {
    return "Needs review";
  }

  return "Needs attention";
}

export function scoreToneClasses(score: number) {
  const tone = scoreTone(score);

  if (tone === "strong") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (tone === "mixed") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-rose-200 bg-rose-50 text-rose-800";
}

export function progressFillClasses(score: number) {
  const tone = scoreTone(score);

  if (tone === "strong") {
    return "bg-emerald-600";
  }

  if (tone === "mixed") {
    return "bg-amber-500";
  }

  return "bg-rose-600";
}

export function taskStatusClasses(status: AgentTaskResult["status"]) {
  if (status === "pass") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "partial") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-rose-200 bg-rose-50 text-rose-800";
}

export function severityClasses(severity: Recommendation["severity"]) {
  if (severity === "high") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (severity === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function actionSensitivityClasses(sensitivity: "low" | "medium" | "high") {
  if (sensitivity === "high") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (sensitivity === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-cyan-200 bg-cyan-50 text-cyan-800";
}

export function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

export function formatArtifactSize(artifact: GeneratedArtifact) {
  const bytes = new TextEncoder().encode(artifact.content).length;

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function fileLabel(path: string) {
  const parts = path.split("/");
  return parts.at(-1) ?? path;
}

export function artifactLanguage(mediaType: string, path: string) {
  if (mediaType.includes("json") || path.endsWith(".json")) {
    return "JSON";
  }

  if (mediaType.includes("markdown") || path.endsWith(".md")) {
    return "Markdown";
  }

  if (mediaType.includes("html") || path.endsWith(".html")) {
    return "HTML";
  }

  if (mediaType.includes("text/plain") || path.endsWith(".txt")) {
    return "Text";
  }

  return mediaType;
}

export type TaskSummary = {
  total: number;
  pass: number;
  partial: number;
  fail: number;
  averageScore: number;
};

export function summarizeTasks(tasks: AgentTaskResult[]): TaskSummary {
  const summary = tasks.reduce<TaskSummary>(
    (accumulator, task) => {
      accumulator[task.status] += 1;
      accumulator.averageScore += clampScore(task.score);
      return accumulator;
    },
    {
      total: tasks.length,
      pass: 0,
      partial: 0,
      fail: 0,
      averageScore: 0
    }
  );

  return {
    ...summary,
    averageScore: summary.total > 0 ? Math.round(summary.averageScore / summary.total) : 0
  };
}

export type RecommendationSummary = {
  total: number;
  high: number;
  medium: number;
  low: number;
};

export function summarizeRecommendations(recommendations: Recommendation[]): RecommendationSummary {
  return recommendations.reduce<RecommendationSummary>(
    (accumulator, recommendation) => {
      accumulator[recommendation.severity] += 1;
      return accumulator;
    },
    {
      total: recommendations.length,
      high: 0,
      medium: 0,
      low: 0
    }
  );
}

export type ArtifactSummary = {
  total: number;
  text: number;
  json: number;
  markdown: number;
  draftManifests: number;
};

export function isDraftManifest(path: string) {
  return path === ".well-known/agents.json" || path.endsWith("/agents.json");
}

export function summarizeArtifacts(artifacts: GeneratedArtifact[]): ArtifactSummary {
  return artifacts.reduce<ArtifactSummary>(
    (accumulator, artifact) => {
      if (isDraftManifest(artifact.path)) {
        accumulator.draftManifests += 1;
      }

      if (artifact.mediaType.includes("json") || artifact.path.endsWith(".json")) {
        accumulator.json += 1;
        return accumulator;
      }

      if (artifact.mediaType.includes("markdown") || artifact.path.endsWith(".md")) {
        accumulator.markdown += 1;
        return accumulator;
      }

      accumulator.text += 1;
      return accumulator;
    },
    {
      total: artifacts.length,
      text: 0,
      json: 0,
      markdown: 0,
      draftManifests: 0
    }
  );
}

export function reportStorageKey(reportId: string) {
  return `agentlayer:report:${reportId}`;
}
