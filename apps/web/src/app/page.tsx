import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  FileCode,
  FileText,
  Gauge,
  ListChecks,
  Route,
  ShieldCheck,
  Sparkles,
  SquareTerminal
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { demoArtifacts, demoReport } from "@/lib/demo-report";
import {
  artifactLanguage,
  clampScore,
  progressFillClasses,
  scoreToneLabel,
  summarizeArtifacts,
  summarizeRecommendations,
  summarizeTasks
} from "@/lib/report-utils";

const cards = [
  {
    title: "Readable",
    text: "Generate llms.txt, llms-full.txt, markdown snapshots, and structured profile data.",
    icon: FileCode
  },
  {
    title: "Verifiable",
    text: "Extract facts with source URLs, evidence snippets, and confidence scores.",
    icon: ShieldCheck
  },
  {
    title: "Operable",
    text: "Detect actions, forms, confirmation rules, and task success gaps.",
    icon: SquareTerminal
  }
] satisfies Array<{ title: string; text: string; icon: LucideIcon }>;

const taskSummary = summarizeTasks(demoReport.tasks);
const artifactSummary = summarizeArtifacts(demoArtifacts);
const recommendationSummary = summarizeRecommendations(demoReport.recommendations);
const previewFiles = [
  ...demoArtifacts.slice(0, 3),
  ...demoArtifacts.filter((artifact) => artifact.path === ".well-known/agents.json").slice(0, 1)
];

const previewScores = [
  ["Readable", demoReport.scores.readability],
  ["Evidence", demoReport.scores.trustability],
  ["Actions", demoReport.scores.actionability],
  ["Tasks", demoReport.scores.taskSuccess]
] satisfies Array<[string, number]>;

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <section className="hero-scene border-b border-slate-200">
          <div className="container-shell grid gap-8 py-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div className="max-w-2xl text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
                Lighthouse for the agentic web
              </p>
              <h1 className="mt-4 text-4xl font-semibold md:text-6xl">
                AgentLayer for agent-ready websites.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-100">
                Scan a public site, generate agent-readable draft files, and see whether common
                AI-agent journeys have enough evidence and confirmation detail to succeed.
              </p>
              <p className="mt-3 text-sm font-medium leading-6 text-cyan-100">
                Hosted demo uses the AcmeFlow fixture. Run the CLI locally for real sites.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className={[
                    "inline-flex h-11 items-center gap-2 rounded-md bg-white px-4",
                    "font-medium text-slate-950 hover:bg-cyan-50"
                  ].join(" ")}
                  href="/scan"
                >
                  Scan a site
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  className={[
                    "inline-flex h-11 items-center gap-2 rounded-md border border-white/30 px-4",
                    "font-medium text-white hover:bg-white/10"
                  ].join(" ")}
                  href="/demo"
                >
                  View demo report
                </Link>
              </div>
              <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
                <HeroStat label="Score" value={`${demoReport.scores.overall}/100`} />
                <HeroStat
                  label="Task checks"
                  value={`${taskSummary.pass}/${taskSummary.total} pass`}
                />
                <HeroStat label="Generated files" value={String(artifactSummary.total)} />
              </div>
            </div>

            <aside className="panel-dark overflow-hidden text-white">
              <div className="border-b border-white/10 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                      Demo report preview
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">{demoReport.site.name}</h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                      Fictional fixture showing score, task results, generated files, and
                      recommendations.
                    </p>
                  </div>
                  <div className="shrink-0 rounded-md bg-cyan-300 px-3 py-2 text-right text-slate-950">
                    <p className="text-2xl font-semibold">
                      {clampScore(demoReport.scores.overall)}
                    </p>
                    <p className="text-[11px] font-semibold uppercase">/100</p>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Agent Operability Score</span>
                    <span className="text-cyan-100">
                      {scoreToneLabel(demoReport.scores.overall)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div
                      className={`h-2 rounded-full ${progressFillClasses(demoReport.scores.overall)}`}
                      style={{
                        width: `${clampScore(demoReport.scores.overall)}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid border-b border-white/10 sm:grid-cols-4">
                {previewScores.map(([label, score]) => (
                  <div className="border-white/10 p-4 sm:border-r sm:last:border-r-0" key={label}>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="mt-1 text-xl font-semibold">{score}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ListChecks className="text-cyan-200" size={17} aria-hidden="true" />
                      <h3 className="text-sm font-semibold">Task success results</h3>
                    </div>
                    <span className="text-xs text-slate-300">
                      {taskSummary.pass} pass / {taskSummary.partial} partial / {taskSummary.fail}{" "}
                      fail
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {demoReport.tasks.slice(0, 3).map((task) => (
                      <PreviewTaskRow
                        key={task.taskId}
                        score={task.score}
                        status={task.status}
                        title={task.title}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 p-4 lg:border-l lg:border-t-0">
                  <div className="flex items-center gap-2">
                    <FileText className="text-cyan-200" size={17} aria-hidden="true" />
                    <h3 className="text-sm font-semibold">Generated files</h3>
                  </div>
                  <div className="mt-4 space-y-2">
                    {previewFiles.map((artifact) => (
                      <PreviewFileRow
                        key={artifact.path}
                        mediaType={artifact.mediaType}
                        path={artifact.path}
                      />
                    ))}
                  </div>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-cyan-200" size={17} aria-hidden="true" />
                      <h3 className="text-sm font-semibold">Recommendations</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {recommendationSummary.high} critical and {recommendationSummary.medium}{" "}
                      warning fixes in the fixture report.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="container-shell py-10">
          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <article className="panel p-5" key={card.title}>
                  <div className="grid size-10 place-items-center rounded-md bg-slate-950 text-white">
                    <Icon size={19} aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-950">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p>
                </article>
              );
            })}
          </div>
          <div className="mt-8 panel flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Gauge className="mt-1 text-cyan-700" size={22} aria-hidden="true" />
              <div>
                <h2 className="font-semibold text-slate-950">Not an AI SEO dashboard.</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  AgentLayer checks whether agents can complete useful tasks on the site, not just
                  whether standards exist.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={17} aria-hidden="true" />
              Fixture demo included
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/10 p-3">
      <p className="text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-300">{label}</p>
    </div>
  );
}

function PreviewTaskRow({
  score,
  status,
  title
}: {
  score: number;
  status: "pass" | "partial" | "fail";
  title: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate text-slate-200">{title}</span>
        <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-xs font-semibold capitalize text-slate-100">
          {status}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/10">
        <div
          className={`h-1.5 rounded-full ${progressFillClasses(score)}`}
          style={{ width: `${clampScore(score)}%` }}
        />
      </div>
    </div>
  );
}

function PreviewFileRow({ mediaType, path }: { mediaType: string; path: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex min-w-0 items-center gap-2">
        <Route className="shrink-0 text-slate-400" size={14} aria-hidden="true" />
        <span className="truncate text-slate-200">{path}</span>
      </div>
      <span className="shrink-0 text-xs text-slate-400">{artifactLanguage(mediaType, path)}</span>
    </div>
  );
}
