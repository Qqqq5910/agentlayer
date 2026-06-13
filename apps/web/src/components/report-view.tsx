import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Download,
  FileCode,
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
  FormOperabilityResult,
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
  isDraftManifest,
  progressFillClasses,
  scoreToneClasses,
  scoreToneLabel,
  severityClasses,
  severityLabel,
  summarizeArtifacts,
  summarizeRecommendations,
  summarizeTasks,
  taskStatusClasses
} from "@/lib/report-utils";
import type { ArtifactSummary, RecommendationSummary, TaskSummary } from "@/lib/report-utils";

type ReportViewProps = {
  report: AgentOperabilityReport;
  artifacts: GeneratedArtifact[];
  title?: string;
  eyebrow?: string;
  demoNotice?: string;
};

type ScoreBreakdownKey = Exclude<keyof AgentOperabilityReport["scores"], "overall">;

const scoreCards = [
  {
    key: "readability",
    label: "Readable files",
    description: "Can agents find concise site context?",
    icon: FileText
  },
  {
    key: "trustability",
    label: "Evidence quality",
    description: "Do facts cite sources and confidence?",
    icon: ShieldCheck
  },
  {
    key: "actionability",
    label: "Operable actions",
    description: "Are actions and confirmations clear?",
    icon: Route
  },
  {
    key: "taskSuccess",
    label: "Task success",
    description: "Can common agent journeys succeed?",
    icon: ListChecks
  }
] satisfies Array<{
  key: ScoreBreakdownKey;
  label: string;
  description: string;
  icon: LucideIcon;
}>;

export function ReportView({ report, artifacts, title, eyebrow, demoNotice }: ReportViewProps) {
  const taskSummary = summarizeTasks(report.tasks);
  const recommendationSummary = summarizeRecommendations(report.recommendations);
  const artifactSummary = summarizeArtifacts(artifacts);
  const formResults = report.forms ?? [];
  const formCount = report.scan.pages.reduce((sum, page) => sum + page.forms.length, 0);
  const generatedAt = new Date(report.generatedAt).toLocaleString();

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="container-shell py-10">
          {demoNotice ? (
            <div className="mb-6 flex flex-col gap-3 rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 shrink-0 text-cyan-700" size={18} aria-hidden="true" />
                <p className="leading-6">{demoNotice}</p>
              </div>
              <Link
                className="focus-ring inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-slate-950 px-3 font-medium text-white hover:bg-slate-800"
                href="/scan"
              >
                Scan locally
              </Link>
            </div>
          ) : null}
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
                  {generatedAt}
                </span>
              </div>
            </div>
            <div
              className={`w-full rounded-lg border p-5 lg:w-64 ${scoreToneClasses(report.scores.overall)}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Agent Operability Score</span>
                <Gauge size={20} aria-hidden="true" />
              </div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-semibold">{clampScore(report.scores.overall)}</span>
                <span className="pb-2 text-sm">/100</span>
              </div>
              <ProgressBar score={report.scores.overall} />
              <p className="mt-3 text-xs font-medium">
                {scoreToneLabel(report.scores.overall)} across {taskSummary.total} task checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-shell space-y-8 py-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            detail={`${scoreToneLabel(report.scores.overall)} result from ${report.scan.pages.length} scanned pages`}
            icon={<Gauge size={18} aria-hidden="true" />}
            label="Agent Operability Score"
            value={`${clampScore(report.scores.overall)}/100`}
          />
          <OverviewCard
            detail={`${taskSummary.pass} pass, ${taskSummary.partial} partial, ${taskSummary.fail} fail`}
            icon={<ListChecks size={18} aria-hidden="true" />}
            label="Task success results"
            value={`${taskSummary.pass}/${taskSummary.total} pass`}
          />
          <OverviewCard
            detail={`${artifactSummary.json} JSON, ${artifactSummary.text} text, ${artifactSummary.markdown} markdown`}
            icon={<FileCode size={18} aria-hidden="true" />}
            label="Generated files"
            value={`${artifactSummary.total} outputs`}
          />
          <OverviewCard
            detail={`${recommendationSummary.high} critical, ${recommendationSummary.medium} warning, ${recommendationSummary.low} suggestion`}
            icon={<Sparkles size={18} aria-hidden="true" />}
            label="Recommendations"
            value={`${recommendationSummary.total} fixes`}
          />
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {scoreCards.map((card) => (
            <ScoreCard
              description={card.description}
              icon={card.icon}
              key={card.key}
              label={card.label}
              score={report.scores[card.key]}
            />
          ))}
        </section>

        <section className="panel p-5">
          <SectionHeader
            icon={<Gauge size={18} aria-hidden="true" />}
            title="How scoring works"
            description="The overall score is deterministic: readability 25%, trustability 25%, actionability 30%, and task success 20%. Use it as a repair guide for public pages, not a compliance guarantee."
          />
          <Link
            className="focus-ring inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            href="https://github.com/Qqqq5910/agentlayer/blob/main/docs/scoring.md"
            target="_blank"
          >
            Scoring model
            <ArrowUpRight className="ml-1" size={14} aria-hidden="true" />
          </Link>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <TaskResults summary={taskSummary} tasks={report.tasks} />
          <Recommendations
            recommendations={report.recommendations}
            summary={recommendationSummary}
          />
        </section>

        <GeneratedFiles artifacts={artifacts} summary={artifactSummary} />
        <FactsTable facts={report.facts} />
        <ActionsTable actions={report.actions} />
        <FormOperability forms={formResults} />
        <ScannedPages formCount={formCount} report={report} />
      </div>
    </main>
  );
}

function OverviewCard({
  detail,
  icon,
  label,
  value
}: {
  detail: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-950 text-white">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  );
}

function ScoreCard({
  description,
  icon: Icon,
  label,
  score
}: {
  description: string;
  icon: LucideIcon;
  label: string;
  score: number;
}) {
  return (
    <article className="panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="text-cyan-700" size={17} aria-hidden="true" />
          <h2 className="text-sm font-medium text-slate-700">{label}</h2>
        </div>
        <span
          className={`rounded-md border px-2 py-1 text-xs font-semibold ${scoreToneClasses(score)}`}
        >
          {clampScore(score)}
        </span>
      </div>
      <ProgressBar score={score} />
      <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
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
      <div className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-950 text-white">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function GeneratedFiles({
  artifacts,
  summary
}: {
  artifacts: GeneratedArtifact[];
  summary: ArtifactSummary;
}) {
  return (
    <section className="panel p-5">
      <SectionHeader
        icon={<FileText size={18} aria-hidden="true" />}
        title="Generated files"
        description="Agent-readable draft files, structured data, markdown snapshots, and reports from this scan."
      />
      <div className="mb-4 grid gap-3 text-sm sm:grid-cols-4">
        <Metric label="Total outputs" value={String(summary.total)} />
        <Metric label="JSON" value={String(summary.json)} />
        <Metric label="Text files" value={String(summary.text)} />
        <Metric label="Draft manifests" value={String(summary.draftManifests)} />
      </div>
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
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-950">{artifact.path}</p>
                  {isDraftManifest(artifact.path) ? (
                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      Draft
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {artifactLanguage(artifact.mediaType, artifact.path)} /{" "}
                  {formatArtifactSize(artifact)}
                </p>
              </div>
              <Download
                className="text-slate-400 group-hover:text-cyan-700"
                size={17}
                aria-hidden="true"
              />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function Recommendations({
  recommendations,
  summary
}: {
  recommendations: Recommendation[];
  summary: RecommendationSummary;
}) {
  return (
    <section className="panel p-5">
      <SectionHeader
        icon={<Sparkles size={18} aria-hidden="true" />}
        title="Top recommendations"
        description="Fixes that make the site easier for agents to understand, verify, and operate."
      />
      <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-rose-800">
          {summary.high} critical
        </span>
        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">
          {summary.medium} warning
        </span>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700">
          {summary.low} suggestion
        </span>
      </div>
      <div className="space-y-3">
        {recommendations.slice(0, 4).map((item) => (
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={item.title}>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md border px-2 py-1 text-xs font-semibold ${severityClasses(item.severity)}`}
              >
                {severityLabel(item.severity)}
              </span>
              {item.suggestedArtifact ? (
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
                  {item.suggestedArtifact}
                </span>
              ) : null}
            </div>
            <h3 className="mt-3 font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.whyItMatters}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              <span className="font-medium text-slate-950">Fix:</span> {item.howToFix}
            </p>
            {item.affectedTasks.length > 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                Affects: {item.affectedTasks.join(", ")}
              </p>
            ) : null}
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
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Label</th>
              <th className="px-5 py-3">Value</th>
              <th className="px-5 py-3">Confidence</th>
              <th className="px-5 py-3">Evidence</th>
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
                <td className="truncate-cell px-5 py-4 text-slate-600">
                  {fact.sourceText ?? "Source text unavailable"}
                </td>
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
                <td className="px-5 py-4 text-slate-600">
                  {action.requiresHumanConfirmation ? "Required" : "No"}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${actionSensitivityClasses(action.sensitivity)}`}
                  >
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

function TaskResults({ summary, tasks }: { summary: TaskSummary; tasks: AgentTaskResult[] }) {
  return (
    <section className="panel p-5">
      <SectionHeader
        icon={<ListChecks size={18} aria-hidden="true" />}
        title="Agent task checks"
        description="Readiness is scored by whether common buyer and operator journeys can actually succeed."
      />
      <div className="mb-4 grid gap-3 text-sm sm:grid-cols-4">
        <Metric label="Average" value={`${summary.averageScore}/100`} />
        <Metric label="Pass" value={String(summary.pass)} />
        <Metric label="Partial" value={String(summary.partial)} />
        <Metric label="Fail" value={String(summary.fail)} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {tasks.map((task) => (
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={task.taskId}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-slate-950">{task.title}</h3>
              <span
                className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${taskStatusClasses(task.status)}`}
              >
                {task.status}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">{task.score}/100</span>
              <div className="h-2 flex-1 rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full ${progressFillClasses(task.score)}`}
                  style={{ width: `${task.score}%` }}
                />
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{task.explanation}</p>
            <TaskEvidence task={task} />
            {task.missingInformation.length > 0 ? (
              <p className="mt-3 text-xs text-slate-500">
                Missing: {task.missingInformation.join(", ")}
              </p>
            ) : null}
            {task.recommendations.length > 0 ? (
              <p className="mt-2 text-xs text-slate-500">Next: {task.recommendations[0]}</p>
            ) : null}
            {task.journeySteps && task.journeySteps.length > 0 ? (
              <div className="mt-4 space-y-2">
                {task.journeySteps.map((step) => (
                  <div
                    className="rounded-md border border-slate-200 bg-white p-3"
                    key={`${task.taskId}-${step.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">{step.title}</p>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${taskStatusClasses(step.status)}`}
                      >
                        {step.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{step.explanation}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function TaskEvidence({ task }: { task: AgentTaskResult }) {
  const evidenceUrls = task.evidenceUrls ?? [];
  const evidenceSnippets = task.evidenceSnippets ?? [];

  if (evidenceUrls.length === 0 && evidenceSnippets.length === 0) {
    return (
      <p className="mt-3 text-xs text-slate-500">Evidence: no task-specific evidence recorded.</p>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">Evidence</p>
      <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600">
        {evidenceUrls.slice(0, 3).map((url) => (
          <li className="truncate text-cyan-700" key={url}>
            <a href={url} rel="noreferrer" target="_blank">
              {url}
            </a>
          </li>
        ))}
        {evidenceSnippets.slice(0, 3).map((snippet) => (
          <li key={snippet}>{snippet}</li>
        ))}
      </ul>
    </div>
  );
}

function FormOperability({ forms }: { forms: FormOperabilityResult[] }) {
  if (forms.length === 0) {
    return null;
  }

  const average = Math.round(forms.reduce((sum, form) => sum + form.score, 0) / forms.length);

  return (
    <section className="panel p-5">
      <SectionHeader
        icon={<Route size={18} aria-hidden="true" />}
        title="Form operability"
        description="Deterministic checks for whether agents can understand form purpose, fields, sensitivity, and confirmation requirements."
      />
      <div className="mb-4 grid gap-3 text-sm sm:grid-cols-3">
        <Metric label="Forms checked" value={String(forms.length)} />
        <Metric label="Average score" value={`${average}/100`} />
        <Metric
          label="Human confirmation"
          value={String(forms.filter((form) => form.requiresHumanConfirmation).length)}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {forms.map((form) => (
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={form.formId}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-950">{form.purpose}</h3>
                <p className="mt-1 truncate text-xs text-cyan-700">
                  {form.actionUrl ?? form.sourceUrl}
                </p>
              </div>
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                {form.score}/100
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">
                {form.method ?? "method unknown"}
              </span>
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">
                {form.fields.length} fields
              </span>
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1">
                {form.sensitivity} sensitivity
              </span>
            </div>
            {form.recommendations.length > 0 ? (
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Next: {form.recommendations[0]}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function ScannedPages({
  formCount,
  report
}: {
  formCount: number;
  report: AgentOperabilityReport;
}) {
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
          <Metric label="Forms" value={String(formCount)} />
          <Metric label="Robots" value={report.scan.robotsTxt?.found ? "Found" : "Missing"} />
          <Metric label="Sitemap" value={report.scan.sitemap?.found ? "Found" : "Missing"} />
        </dl>
        {report.scan.errors.length > 0 ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle size={16} aria-hidden="true" />
              {report.scan.errors.length} crawl issue
              {report.scan.errors.length === 1 ? "" : "s"}
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
          <Link
            className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white"
            href="/scan"
          >
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
