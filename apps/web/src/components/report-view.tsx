import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Download,
  FileText,
  Gauge,
  ListChecks,
  Route,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import type {
  AgentAction,
  AgentOperabilityReport,
  AgentTaskResult,
  ExtractedFact,
  GeneratedArtifact,
  Recommendation
} from "@/lib/report-types";
import {
  actionSensitivityClasses,
  artifactLanguage,
  clampScore,
  fileLabel,
  formatArtifactSize,
  formatConfidence,
  progressFillClasses,
  scoreToneClasses,
  severityClasses,
  taskStatusClasses
} from "@/lib/report-utils";

type ReportViewProps = {
  report: AgentOperabilityReport;
  artifacts: GeneratedArtifact[];
  title?: string;
  eyebrow?: string;
};

const scoreLabels: Array<[keyof AgentOperabilityReport["scores"], string]> = [
  ["readability", "Readable"],
  ["trustability", "Trust"],
  ["actionability", "Action"],
  ["taskSuccess", "Task success"]
];

export function ReportView({ report, artifacts, title, eyebrow }: ReportViewProps) {
  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="container-shell py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                {eyebrow ?? "Agent operability report"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950 md:text-5xl">
                {title ?? report.site.name}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">{report.site.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <a
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-white"
                  href={report.site.rootUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {report.site.rootUrl}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  {report.scan.pages.length} pages scanned
                </span>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  {new Date(report.generatedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className={`w-full rounded-lg border p-5 lg:w-64 ${scoreToneClasses(report.scores.overall)}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall score</span>
                <Gauge size={20} aria-hidden="true" />
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-semibold">{clampScore(report.scores.overall)}</span>
                <span className="pb-2 text-sm">/100</span>
              </div>
              <ProgressBar score={report.scores.overall} />
            </div>
          </div>
        </div>
      </section>

      <div className="container-shell space-y-8 py-8">
        <section className="grid gap-4 md:grid-cols-4">
          {scoreLabels.map(([key, label]) => (
            <ScoreCard key={key} label={label} score={report.scores[key]} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <GeneratedFiles artifacts={artifacts} />
          <Recommendations recommendations={report.recommendations} />
        </section>

        <FactsTable facts={report.facts} />
        <ActionsTable actions={report.actions} />
        <TaskResults tasks={report.tasks} />
        <ScannedPages report={report} />
      </div>
    </main>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <article className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-slate-600">{label}</h2>
        <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${scoreToneClasses(score)}`}>
          {clampScore(score)}
        </span>
      </div>
      <ProgressBar score={score} />
    </article>
  );
}

function ProgressBar({ score }: { score: number }) {
  return (
    <div className="mt-4 h-2 rounded-full bg-slate-200">
      <div
        className={`h-2 rounded-full ${progressFillClasses(score)}`}
        style={{ width: `${clampScore(score)}%` }}
      />
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-950 text-white">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function GeneratedFiles({ artifacts }: { artifacts: GeneratedArtifact[] }) {
  return (
    <section className="panel p-5">
      <SectionHeader
        icon={<FileText size={18} aria-hidden="true" />}
        title="Generated files"
        description="Agent-readable files, manifests, markdown snapshots, and reports ready to publish."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {artifacts.map((artifact) => (
          <a
            className="group rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-cyan-300 hover:bg-white"
            download={fileLabel(artifact.path)}
            href={`data:${artifact.mediaType};charset=utf-8,${encodeURIComponent(artifact.content)}`}
            key={artifact.path}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-950">{artifact.path}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {artifactLanguage(artifact.mediaType, artifact.path)} · {formatArtifactSize(artifact)}
                </p>
              </div>
              <Download className="text-slate-400 group-hover:text-cyan-700" size={17} aria-hidden="true" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function Recommendations({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <section className="panel p-5">
      <SectionHeader
        icon={<Sparkles size={18} aria-hidden="true" />}
        title="Top recommendations"
        description="Fixes that make the site easier for agents to understand, verify, and operate."
      />
      <div className="space-y-3">
        {recommendations.slice(0, 4).map((item) => (
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={item.title}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${severityClasses(item.severity)}`}>
                {item.severity}
              </span>
              {item.suggestedArtifact ? (
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
                  {item.suggestedArtifact}
                </span>
              ) : null}
            </div>
            <h3 className="mt-3 font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.howToFix}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FactsTable({ facts }: { facts: ExtractedFact[] }) {
  return (
    <section className="panel overflow-hidden">
      <div className="p-5">
        <SectionHeader
          icon={<ShieldCheck size={18} aria-hidden="true" />}
          title="Extracted facts"
          description="Every fact includes source evidence and confidence. Uncertain extraction should stay uncertain."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Label</th>
              <th className="px-5 py-3">Value</th>
              <th className="px-5 py-3">Confidence</th>
              <th className="px-5 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {facts.map((fact) => (
              <tr key={fact.id}>
                <td className="px-5 py-4">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium">
                    {fact.type}
                  </span>
                </td>
                <td className="px-5 py-4 font-medium text-slate-950">{fact.label}</td>
                <td className="truncate-cell px-5 py-4 text-slate-600">{fact.value}</td>
                <td className="px-5 py-4 text-slate-600">{formatConfidence(fact.confidence)}</td>
                <td className="truncate-cell px-5 py-4 text-cyan-700">
                  <a href={fact.sourceUrl} rel="noreferrer" target="_blank">
                    {fact.sourceUrl}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ActionsTable({ actions }: { actions: AgentAction[] }) {
  return (
    <section className="panel overflow-hidden">
      <div className="p-5">
        <SectionHeader
          icon={<Route size={18} aria-hidden="true" />}
          title="Detected actions"
          description="Candidate operations agents can offer to users, with confirmation and sensitivity metadata."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Fields</th>
              <th className="px-5 py-3">Confirmation</th>
              <th className="px-5 py-3">Sensitivity</th>
              <th className="px-5 py-3">URL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {actions.map((action) => (
              <tr key={action.id}>
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-950">{action.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{action.userIntent}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{action.actionType}</td>
                <td className="px-5 py-4 text-slate-600">{action.requiredFields?.length ?? 0}</td>
                <td className="px-5 py-4 text-slate-600">{action.requiresHumanConfirmation ? "Required" : "No"}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${actionSensitivityClasses(action.sensitivity)}`}>
                    {action.sensitivity}
                  </span>
                </td>
                <td className="truncate-cell px-5 py-4 text-cyan-700">
                  <a href={action.url} rel="noreferrer" target="_blank">
                    {action.url}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TaskResults({ tasks }: { tasks: AgentTaskResult[] }) {
  return (
    <section className="panel p-5">
      <SectionHeader
        icon={<ListChecks size={18} aria-hidden="true" />}
        title="Agent task checks"
        description="Readiness is scored by whether common buyer and operator journeys can actually succeed."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {tasks.map((task) => (
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={task.taskId}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-slate-950">{task.title}</h3>
              <span className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${taskStatusClasses(task.status)}`}>
                {task.status}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">{task.score}/100</span>
              <div className="h-2 flex-1 rounded-full bg-slate-200">
                <div className={`h-2 rounded-full ${progressFillClasses(task.score)}`} style={{ width: `${task.score}%` }} />
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{task.explanation}</p>
            {task.missingInformation.length > 0 ? (
              <p className="mt-3 text-xs text-slate-500">Missing: {task.missingInformation.join(", ")}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function ScannedPages({ report }: { report: AgentOperabilityReport }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="panel p-5">
        <SectionHeader
          icon={<CheckCircle2 size={18} aria-hidden="true" />}
          title="Scan coverage"
          description="Pages, sitemap, robots, forms, and crawl errors found during the scan."
        />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Pages" value={String(report.scan.pages.length)} />
          <Metric label="Forms" value={String(report.scan.pages.reduce((sum, page) => sum + page.forms.length, 0))} />
          <Metric label="Robots" value={report.scan.robotsTxt?.found ? "Found" : "Missing"} />
          <Metric label="Sitemap" value={report.scan.sitemap?.found ? "Found" : "Missing"} />
        </dl>
        {report.scan.errors.length > 0 ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle size={16} aria-hidden="true" />
              {report.scan.errors.length} crawl issue{report.scan.errors.length === 1 ? "" : "s"}
            </div>
          </div>
        ) : null}
      </div>
      <div className="panel p-5">
        <h2 className="font-semibold text-slate-950">Key pages</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {Object.entries(report.site.keyPages).map(([label, url]) => (
            <a
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-white"
              href={url}
              key={label}
              rel="noreferrer"
              target="_blank"
            >
              <span className="font-medium text-slate-950">{label}</span>
              <span className="mt-1 block truncate text-xs text-cyan-700">{url}</span>
            </a>
          ))}
        </div>
        <div className="mt-5">
          <Link className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white" href="/scan">
            Scan another site
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
