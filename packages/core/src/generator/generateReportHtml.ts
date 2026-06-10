import type { AgentOperabilityReport } from "../schemas.js";

export function generateReportHtml(report: AgentOperabilityReport): string {
  const taskSummary = summarizeTasks(report);
  const artifactRows = generatedFiles(report)
    .map(
      (artifact) => `
        <li>
          <code>${escapeHtml(artifact.path)}</code>
          <span>${escapeHtml(artifact.description)}</span>
        </li>`
    )
    .join("");

  const taskRows = report.tasks
    .map((task) => {
      const journeyMarkup = journeyStepsList(task.journeySteps);

      return `
        <tr>
          <td>${escapeHtml(task.title)}</td>
          <td><span class="badge ${task.status}">${task.status}</span></td>
          <td>${task.score}</td>
          <td>
            ${escapeHtml(task.explanation)}${journeyMarkup ? `\n            ${journeyMarkup}` : ""}
          </td>
        </tr>`
    })
    .join("");

  const formRows = report.forms
    .slice(0, 20)
    .map(
      (form) => `
        <tr>
          <td>
            <strong>${escapeHtml(form.purpose)}</strong>
            <small><a href="${escapeAttribute(form.sourceUrl)}">${escapeHtml(sourceLabel(form.sourceUrl))}</a></small>
          </td>
          <td>${form.score}</td>
          <td>${escapeHtml(form.method ?? "unknown")}</td>
          <td>${form.fields.length}</td>
          <td>${form.requiresHumanConfirmation ? "Required" : "No"}</td>
          <td><span class="badge sensitivity-${escapeAttribute(form.sensitivity)}">${escapeHtml(form.sensitivity)}</span></td>
          <td>${escapeHtml(form.recommendations[0] ?? "No immediate fixes.")}</td>
        </tr>`
    )
    .join("");

  const actionRows = report.actions
    .slice(0, 20)
    .map(
      (action) => `
        <tr>
          <td>
            <strong>${escapeHtml(action.name)}</strong>
            <small>${escapeHtml(action.userIntent)}</small>
          </td>
          <td>${escapeHtml(action.actionType)}</td>
          <td>${action.requiredFields?.length ?? 0}</td>
          <td>${action.requiresHumanConfirmation ? "Required" : "No"}</td>
          <td><span class="badge sensitivity-${escapeAttribute(action.sensitivity)}">${escapeHtml(action.sensitivity)}</span></td>
        </tr>`
    )
    .join("");

  const factRows = report.facts
    .slice(0, 30)
    .map(
      (fact) => `
        <tr>
          <td>${escapeHtml(fact.type)}</td>
          <td>${escapeHtml(fact.label)}</td>
          <td>${escapeHtml(fact.value)}</td>
          <td><a href="${escapeAttribute(fact.sourceUrl)}">${escapeHtml(sourceLabel(fact.sourceUrl))}</a></td>
        </tr>`
    )
    .join("");

  const recommendationCards =
    report.recommendations.length > 0
      ? report.recommendations
          .slice(0, 6)
          .map(
            (recommendation) => `
              <article class="recommendation">
                <div>
                  <span class="badge severity-${escapeAttribute(recommendation.severity)}">${escapeHtml(recommendation.severity)}</span>
                  ${
                    recommendation.suggestedArtifact
                      ? `<code>${escapeHtml(recommendation.suggestedArtifact)}</code>`
                      : ""
                  }
                </div>
                <h3>${escapeHtml(recommendation.title)}</h3>
                <p>${escapeHtml(recommendation.howToFix)}</p>
              </article>`
          )
          .join("")
      : `<div class="empty-state">No high-priority recommendations were generated for this scan.</div>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AgentLayer Report - ${escapeHtml(report.site.name)}</title>
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #172026; background: #f6f8fb; }
      main { max-width: 1120px; margin: 0 auto; padding: 40px 20px 64px; }
      h1, h2 { margin: 0 0 12px; }
      h1 { max-width: 780px; font-size: clamp(32px, 5vw, 56px); line-height: 1.02; letter-spacing: 0; }
      h2 { font-size: 22px; }
      h3 { margin: 12px 0 8px; font-size: 16px; }
      p { color: #53606b; line-height: 1.65; }
      section { margin-top: 28px; }
      .eyebrow { color: #0e7490; font-size: 13px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
      .hero { display: grid; gap: 24px; grid-template-columns: minmax(0, 1fr) 280px; align-items: end; }
      .hero-card { border: 1px solid #bae6fd; border-radius: 8px; background: #ecfeff; padding: 20px; }
      .hero-card span { color: #155e75; font-size: 13px; font-weight: 700; }
      .hero-card strong { display: block; margin-top: 8px; font-size: 56px; line-height: 1; }
      .panel { background: white; border: 1px solid #dfe3e8; border-radius: 8px; padding: 20px; box-shadow: 0 14px 42px rgba(17, 24, 39, .06); }
      .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
      .score { border-radius: 8px; border: 1px solid #dfe3e8; background: white; padding: 16px; }
      .score span { color: #53606b; font-size: 13px; font-weight: 700; }
      .score strong { display: block; margin-top: 10px; font-size: 34px; }
      .score.strong { border-color: #bbf7d0; background: #f0fdf4; color: #166534; }
      .score.mixed { border-color: #fde68a; background: #fffbeb; color: #92400e; }
      .score.weak { border-color: #fecdd3; background: #fff1f2; color: #9f1239; }
      .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
      .metric { border: 1px solid #e5e8ec; border-radius: 8px; padding: 14px; background: #fbfcfd; }
      .metric span { display: block; color: #667085; font-size: 12px; text-transform: uppercase; }
      .metric strong { display: block; margin-top: 6px; font-size: 24px; color: #172026; }
      .file-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin: 0; padding: 0; list-style: none; }
      .file-list li { border: 1px solid #e5e8ec; border-radius: 8px; padding: 12px; background: #fbfcfd; }
      code { border-radius: 6px; background: #eef2f7; padding: 2px 6px; color: #0f172a; font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; font-size: 12px; }
      .file-list span, small { display: block; margin-top: 6px; color: #667085; line-height: 1.45; }
      .journey-list { display: grid; gap: 6px; margin: 10px 0 0; padding: 0; list-style: none; }
      .journey-list li { display: grid; gap: 4px; border-left: 3px solid #dfe3e8; padding-left: 8px; }
      .journey-list span { color: #172026; font-size: 12px; font-weight: 700; }
      .journey-list small { margin: 0; }
      .recommendations-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
      .recommendation { border: 1px solid #e5e8ec; border-radius: 8px; padding: 14px; background: #fbfcfd; }
      .recommendation p { margin: 0; font-size: 14px; }
      .empty-state { border: 1px dashed #cbd5e1; border-radius: 8px; padding: 18px; color: #53606b; background: #fbfcfd; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th, td { border-bottom: 1px solid #e5e8ec; padding: 10px; text-align: left; vertical-align: top; }
      th { color: #53606b; font-weight: 600; }
      a { color: #0b66c3; }
      .badge { display: inline-block; border-radius: 999px; padding: 3px 9px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
      .pass { background: #d8f5e5; color: #17633a; }
      .partial { background: #fff0c2; color: #7a5300; }
      .fail { background: #ffe0de; color: #9a271f; }
      .severity-high, .sensitivity-high { background: #ffe0de; color: #9a271f; }
      .severity-medium, .sensitivity-medium { background: #fff0c2; color: #7a5300; }
      .severity-low, .sensitivity-low { background: #dff8ff; color: #075c6e; }
      @media (max-width: 760px) {
        main { padding-top: 28px; }
        .hero { grid-template-columns: 1fr; }
        .hero-card strong { font-size: 48px; }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="hero">
        <header>
          <p class="eyebrow">AgentLayer operability report</p>
          <h1>${escapeHtml(report.site.name)} can be read, trusted, and operated by agents.</h1>
          <p>${escapeHtml(report.site.summary)}</p>
          <p><a href="${escapeAttribute(report.site.rootUrl)}">${escapeHtml(report.site.rootUrl)}</a></p>
        </header>
        <aside class="hero-card">
          <span>Agent Operability Score</span>
          <strong>${Math.round(report.scores.overall)}</strong>
          <p>${taskSummary.pass} pass, ${taskSummary.partial} partial, ${taskSummary.fail} fail across ${report.tasks.length} task checks.</p>
        </aside>
      </div>

      <section class="score-grid">
        ${scoreCard("Readability", report.scores.readability)}
        ${scoreCard("Trustability", report.scores.trustability)}
        ${scoreCard("Actionability", report.scores.actionability)}
        ${scoreCard("Task success", report.scores.taskSuccess)}
      </section>

      <section class="panel">
        <h2>Scan summary</h2>
        <div class="summary-grid">
          ${metric("Pages scanned", report.scan.pages.length)}
          ${metric("Facts extracted", report.facts.length)}
          ${metric("Detected actions", report.actions.length)}
          ${metric("Forms evaluated", report.forms.length)}
          ${metric("Generated files", generatedFiles(report).length)}
          ${metric("Crawl issues", report.scan.errors.length)}
        </div>
      </section>

      <section class="panel">
        <h2>Generated files</h2>
        <p>These files are generated by <code>agentlayer generate</code> and can be reviewed before publishing.</p>
        <ul class="file-list">${artifactRows}</ul>
      </section>

      <section class="panel">
        <h2>Task Results</h2>
        <table>
          <thead><tr><th>Task</th><th>Status</th><th>Score</th><th>Explanation</th></tr></thead>
          <tbody>${taskRows}</tbody>
        </table>
      </section>

      <section class="panel">
        <h2>Top recommendations</h2>
        <div class="recommendations-grid">${recommendationCards}</div>
      </section>

      <section class="panel">
        <h2>Form operability</h2>
        <table>
          <thead><tr><th>Form</th><th>Score</th><th>Method</th><th>Fields</th><th>Confirmation</th><th>Sensitivity</th><th>Next fix</th></tr></thead>
          <tbody>${formRows}</tbody>
        </table>
      </section>

      <section class="panel">
        <h2>Detected actions</h2>
        <table>
          <thead><tr><th>Action</th><th>Type</th><th>Fields</th><th>Confirmation</th><th>Sensitivity</th></tr></thead>
          <tbody>${actionRows}</tbody>
        </table>
      </section>

      <section class="panel">
        <h2>Extracted Facts</h2>
        <table>
          <thead><tr><th>Type</th><th>Label</th><th>Value</th><th>Source</th></tr></thead>
          <tbody>${factRows}</tbody>
        </table>
      </section>
    </main>
  </body>
</html>
`;
}

function scoreCard(label: string, score: number): string {
  return `<div class="score ${scoreTone(score)}"><span>${escapeHtml(label)}</span><strong>${Math.round(score)}</strong></div>`;
}

function metric(label: string, value: string | number): string {
  return `<div class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function summarizeTasks(report: AgentOperabilityReport): Record<"pass" | "partial" | "fail", number> {
  return report.tasks.reduce(
    (summary, task) => {
      summary[task.status] += 1;
      return summary;
    },
    { pass: 0, partial: 0, fail: 0 }
  );
}

function generatedFiles(report: AgentOperabilityReport): Array<{ path: string; description: string }> {
  return [
    { path: "llms.txt", description: "Concise site guide for agents." },
    { path: "llms-full.txt", description: "Full page context with source URLs." },
    { path: "site-profile.json", description: "Site identity, summary, and key pages." },
    { path: "facts.json", description: `${report.facts.length} extracted facts with source evidence.` },
    { path: "actions.json", description: `${report.actions.length} detected actions and confirmation rules.` },
    { path: "form-operability.json", description: `${report.forms.length} deterministic form operability checks.` },
    { path: "tasks-report.json", description: `${report.tasks.length} deterministic task checks.` },
    { path: "recommendations.json", description: `${report.recommendations.length} prioritized remediation items.` },
    { path: "artifacts.json", description: "Machine-readable index of generated artifacts." },
    { path: "report.html", description: "Standalone shareable operability report." },
    { path: ".well-known/agents.json", description: "Draft public action manifest." },
    { path: ".well-known/mcp.json", description: "Draft MCP metadata." },
    { path: ".well-known/mcp/server-card.json", description: "Draft MCP server card." },
    { path: ".well-known/api-catalog", description: "Draft API catalog discovered from public pages." },
    { path: ".well-known/agent-skills/index.json", description: "Draft agent skill index." },
    { path: "webmcp/suggested-webmcp-tools.json", description: "Suggested WebMCP tool definitions." },
    { path: "webmcp/suggested-form-annotations.md", description: "Suggested form annotations for agent UX." },
    { path: "markdown/*.md", description: `${report.scan.pages.length} page snapshots when markdown is available.` }
  ];
}

function journeyStepsList(steps: AgentOperabilityReport["tasks"][number]["journeySteps"]): string {
  if (steps.length === 0) {
    return "";
  }

  return `<ul class="journey-list">${steps
    .map(
      (step) => `<li>
        <span><span class="badge ${step.status}">${escapeHtml(step.status)}</span> ${escapeHtml(step.title)}</span>
        <small>${escapeHtml(step.explanation)}</small>
      </li>`
    )
    .join("")}</ul>`;
}

function scoreTone(score: number): "strong" | "mixed" | "weak" {
  if (score >= 80) {
    return "strong";
  }

  if (score >= 60) {
    return "mixed";
  }

  return "weak";
}

function sourceLabel(sourceUrl: string): string {
  const url = new URL(sourceUrl);
  return url.pathname || "/";
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
