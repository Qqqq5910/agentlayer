import type { AgentOperabilityReport } from "../schemas.js";

export function generateReportHtml(report: AgentOperabilityReport): string {
  const taskRows = report.tasks
    .map(
      (task) => `
        <tr>
          <td>${escapeHtml(task.title)}</td>
          <td><span class="badge ${task.status}">${task.status}</span></td>
          <td>${task.score}</td>
          <td>${escapeHtml(task.explanation)}</td>
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
          <td><a href="${escapeAttribute(fact.sourceUrl)}">${escapeHtml(new URL(fact.sourceUrl).pathname || "/")}</a></td>
        </tr>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AgentLayer Report - ${escapeHtml(report.site.name)}</title>
    <style>
      :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      body { margin: 0; color: #172026; background: #f7f8fa; }
      main { max-width: 1120px; margin: 0 auto; padding: 40px 20px 64px; }
      h1, h2 { margin: 0 0 12px; }
      section { margin-top: 28px; }
      .panel { background: white; border: 1px solid #dfe3e8; border-radius: 8px; padding: 20px; }
      .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
      .score { background: #102a43; color: white; border-radius: 8px; padding: 18px; }
      .score strong { display: block; font-size: 30px; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th, td { border-bottom: 1px solid #e5e8ec; padding: 10px; text-align: left; vertical-align: top; }
      th { color: #53606b; font-weight: 600; }
      a { color: #0b66c3; }
      .badge { border-radius: 999px; padding: 3px 9px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
      .pass { background: #d8f5e5; color: #17633a; }
      .partial { background: #fff0c2; color: #7a5300; }
      .fail { background: #ffe0de; color: #9a271f; }
    </style>
  </head>
  <body>
    <main>
      <h1>AgentLayer Report: ${escapeHtml(report.site.name)}</h1>
      <p>${escapeHtml(report.site.summary)}</p>
      <p><a href="${escapeAttribute(report.site.rootUrl)}">${escapeHtml(report.site.rootUrl)}</a></p>

      <section class="score-grid">
        ${scoreCard("Overall", report.scores.overall)}
        ${scoreCard("Readable", report.scores.readability)}
        ${scoreCard("Trustable", report.scores.trustability)}
        ${scoreCard("Actionable", report.scores.actionability)}
        ${scoreCard("Tasks", report.scores.taskSuccess)}
      </section>

      <section class="panel">
        <h2>Task Results</h2>
        <table>
          <thead><tr><th>Task</th><th>Status</th><th>Score</th><th>Explanation</th></tr></thead>
          <tbody>${taskRows}</tbody>
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
  return `<div class="score"><span>${escapeHtml(label)}</span><strong>${score}</strong></div>`;
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
