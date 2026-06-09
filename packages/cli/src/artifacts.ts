import type { AgentOperabilityReport, GeneratedArtifact } from "./coreTypes.js";
import { normalizeArtifactPath } from "./io.js";

export function withRequiredJsonArtifacts(
  artifacts: GeneratedArtifact[],
  report: AgentOperabilityReport
): GeneratedArtifact[] {
  const output = [...artifacts];
  const existingPaths = new Set(output.map((artifact) => normalizeArtifactPath(artifact.path)));

  addJsonArtifact(output, existingPaths, "site-profile.json", report.site);
  addJsonArtifact(output, existingPaths, "facts.json", report.facts);
  addJsonArtifact(output, existingPaths, "actions.json", report.actions);
  addJsonArtifact(output, existingPaths, "tasks-report.json", report.tasks);
  addJsonArtifact(output, existingPaths, "recommendations.json", report.recommendations);
  addJsonArtifact(output, existingPaths, "report.json", report);

  return output;
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
