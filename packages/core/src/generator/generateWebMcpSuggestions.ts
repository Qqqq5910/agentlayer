import type { AgentAction, AgentOperabilityReport, FormOperabilityResult, GeneratedArtifact } from "../schemas.js";

export function generateWebMcpSuggestions(report: AgentOperabilityReport): GeneratedArtifact[] {
  return [
    {
      path: "webmcp/suggested-webmcp-tools.json",
      mediaType: "application/json",
      content: `${JSON.stringify({ experimental: true, tools: report.actions.map((action) => toolForAction(action, report.forms)) }, null, 2)}\n`
    },
    {
      path: "webmcp/suggested-form-annotations.md",
      mediaType: "text/markdown",
      content: generateFormAnnotations(report)
    }
  ];
}

function toolForAction(action: AgentAction, forms: readonly FormOperabilityResult[]): Record<string, unknown> {
  const matchingForm = forms.find(
    (form) => action.actionType === "form" && form.sourceUrl === action.sourceUrl && form.actionUrl === action.url
  );
  const fields = matchingForm?.fields ?? action.requiredFields ?? [];

  return {
    name: toCamelCase(action.name),
    description: action.description,
    sourceUrl: action.sourceUrl,
    actionUrl: action.url,
    method: action.method,
    inputSchema: {
      type: "object",
      properties: Object.fromEntries(
        fields.map((field) => [
          field.name,
          {
            type: field.type === "email" ? "string" : "string",
            description: field.label ?? field.name
          }
        ])
      ),
      required: fields.filter((field) => field.required).map((field) => field.name)
    },
    requiresHumanConfirmation: action.requiresHumanConfirmation,
    sensitivity: action.sensitivity,
    formOperability: matchingForm
      ? {
          score: matchingForm.score,
          purpose: matchingForm.purpose,
          findings: matchingForm.findings.map((finding) => ({
            id: finding.id,
            status: finding.status
          })),
          recommendations: matchingForm.recommendations
        }
      : undefined
  };
}

function generateFormAnnotations(report: AgentOperabilityReport): string {
  const formActions = report.actions.filter((action) => action.actionType === "form");
  const lines: string[] = [
    "# Suggested Form Annotations",
    "",
    "These are conservative AgentLayer suggestions. They do not grant agents permission to submit forms.",
    ""
  ];

  if (formActions.length === 0) {
    lines.push("No public forms were detected in the scan.");
    lines.push("");
    return lines.join("\n");
  }

  for (const action of formActions) {
    lines.push(`## ${action.name}`);
    lines.push("");
    lines.push(`Source: ${action.sourceUrl}`);
    lines.push(`Suggested purpose: ${action.description}`);
    lines.push(`Requires human confirmation: ${String(action.requiresHumanConfirmation)}`);
    const matchingForm = report.forms.find((form) => form.sourceUrl === action.sourceUrl && form.actionUrl === action.url);
    if (matchingForm) {
      lines.push(`Form operability score: ${matchingForm.score}`);
      lines.push(`Sensitivity: ${matchingForm.sensitivity}`);
    }
    lines.push("");
    lines.push("Suggested fields:");
    for (const field of matchingForm?.fields ?? action.requiredFields ?? []) {
      lines.push(`- ${field.name} (${field.type})${field.required ? " - required" : ""}`);
    }
    if (matchingForm?.recommendations.length) {
      lines.push("");
      lines.push("Recommended form fixes:");
      for (const recommendation of matchingForm.recommendations) {
        lines.push(`- ${recommendation}`);
      }
    }
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
