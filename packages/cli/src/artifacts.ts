import type { AgentOperabilityReport, GeneratedArtifact } from "./coreTypes.js";
import { normalizeArtifactPath } from "./io.js";

export function withRequiredJsonArtifacts(
  artifacts: GeneratedArtifact[],
  report: AgentOperabilityReport
): GeneratedArtifact[] {
  const output = artifacts.filter(
    (artifact) => normalizeArtifactPath(artifact.path) !== "artifacts.json"
  );
  const existingPaths = new Set(output.map((artifact) => normalizeArtifactPath(artifact.path)));

  addJsonArtifact(output, existingPaths, "site-profile.json", report.site);
  addJsonArtifact(output, existingPaths, "facts.json", report.facts);
  addJsonArtifact(output, existingPaths, "actions.json", report.actions);
  addJsonArtifact(output, existingPaths, "tasks-report.json", report.tasks);
  addJsonArtifact(output, existingPaths, "recommendations.json", report.recommendations);
  addJsonArtifact(output, existingPaths, "report.json", report);
  addJsonArtifact(output, existingPaths, "artifacts.json", buildArtifactIndex(output, report));

  return output;
}

function buildArtifactIndex(
  artifacts: GeneratedArtifact[],
  report: AgentOperabilityReport
): Record<string, unknown> {
  const indexEntries = [
    ...artifacts.map((artifact) => ({
      path: normalizeArtifactPath(artifact.path),
      mediaType: artifact.mediaType
    })),
    {
      path: "artifacts.json",
      mediaType: "application/json"
    }
  ];

  return {
    generatedBy: "AgentLayer",
    generatedAt: report.generatedAt,
    rootUrl: report.site.rootUrl,
    count: indexEntries.length,
    artifacts: indexEntries
  };
}

function addJsonArtifact(
  artifacts: GeneratedArtifact[],
  existingPaths: Set<string>,
  artifactPath: string,
  value: unknown
): void {
  const normalizedPath = normalizeArtifactPath(artifactPath);

  if (existingPaths.has(normalizedPath)) {
    return;
  }

  artifacts.push({
    path: normalizedPath,
    content: `${JSON.stringify(value, null, 2)}\n`,
    mediaType: "application/json"
  });
  existingPaths.add(normalizedPath);
}
