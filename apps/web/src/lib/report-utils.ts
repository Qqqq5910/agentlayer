import type { AgentTaskResult, GeneratedArtifact, Recommendation } from "@/lib/report-types";

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreTone(score: number) {
  if (score >= 80) {
    return "strong";
  }

  if (score >= 60) {
    return "mixed";
  }

  return "weak";
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

  return mediaType;
}

export function reportStorageKey(reportId: string) {
  return `agentlayer:report:${reportId}`;
}
