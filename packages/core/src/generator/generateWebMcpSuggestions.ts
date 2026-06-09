import type { AgentAction, AgentOperabilityReport, GeneratedArtifact } from "../schemas.js";

export function generateWebMcpSuggestions(report: AgentOperabilityReport): GeneratedArtifact[] {
  return [
    {
      path: "webmcp/suggested-webmcp-tools.json",
      mediaType: "application/json",
      content: `${JSON.stringify({ experimental: true, tools: report.actions.map(toolForAction) }, null, 2)}\n`
    },
    {
      path: "webmcp/suggested-form-annotations.md",
      mediaType: "text/markdown",
      content: generateFormAnnotations(report)
    }
  ];
}

function toolForAction(action: AgentAction): Record<string, unknown> {
  return {
    name: toCamelCase(action.name),
    description: action.description,
    sourceUrl: action.sourceUrl,
    inputSchema: {
      type: "object",
      properties: Object.fromEntries(
        (action.requiredFields ?? []).map((field) => [
          field.name,
          {
            type: field.type === "email" ? "string" : "string",
            description: field.label ?? field.name
          }
        ])
      ),
      required: (action.requiredFields ?? []).filter((field) => field.required).map((field) => field.name)
    },
    requiresHumanConfirmation: action.requiresHumanConfirmation,
    sensitivity: action.sensitivity
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
    lines.push("");
    lines.push("Suggested fields:");
    for (const field of action.requiredFields ?? []) {
      lines.push(`- ${field.name} (${field.type})${field.required ? " - required" : ""}`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
