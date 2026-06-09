import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCode,
  Gauge,
  ShieldCheck,
  SquareTerminal
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { demoReport } from "@/lib/demo-report";

const cards = [
  {
    title: "Agent-readable",
    text: "Generate llms.txt, llms-full.txt, markdown snapshots, and profile data.",
    icon: FileCode
  },
  {
    title: "Agent-trustable",
    text: "Extract facts with source URLs, evidence snippets, and confidence scores.",
    icon: ShieldCheck
  },
  {
    title: "Agent-operable",
    text: "Detect actions, forms, confirmation rules, and task success gaps.",
    icon: SquareTerminal
  }
];

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <section className="hero-scene hero-grid border-b border-slate-200">
          <div className="container-shell grid min-h-[calc(100vh-64px)] gap-8 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="max-w-2xl text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
                Lighthouse for the agentic web
              </p>
              <h1 className="mt-4 text-4xl font-semibold md:text-6xl">Make your website operable by AI agents.</h1>
              <p className="mt-5 text-lg leading-8 text-slate-100">
                AgentLayer scans your site, generates agent-readable files, and tests whether AI agents can complete
                real user journeys.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 font-medium text-slate-950 hover:bg-cyan-50"
                  href="/scan"
                >
                  Scan a site
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-white/30 px-4 font-medium text-white hover:bg-white/10"
                  href="/demo"
                >
                  View demo report
                </Link>
              </div>
              <p className="mt-8 max-w-xl text-sm leading-6 text-slate-200">
                SEO helped search engines discover websites. AgentLayer helps AI agents understand, trust, and operate
                websites.
              </p>
            </div>

            <div className="panel bg-white p-4">
              <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Demo report</p>
                    <h2 className="mt-1 text-xl font-semibold">{demoReport.site.name}</h2>
                  </div>
                  <div className="rounded-md bg-cyan-300 px-3 py-2 text-2xl font-semibold text-slate-950">
                    {demoReport.scores.overall}
                  </div>
                </div>
                <div className="grid gap-3 py-4 sm:grid-cols-2">
                  {[
                    ["Readable", demoReport.scores.readability],
                    ["Trust", demoReport.scores.trustability],
                    ["Action", demoReport.scores.actionability],
                    ["Tasks", demoReport.scores.taskSuccess]
                  ].map(([label, score]) => (
                    <div className="rounded-md border border-white/10 bg-white/5 p-3" key={label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">{label}</span>
                        <span>{score}</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 border-t border-white/10 pt-4 md:grid-cols-3">
                  <HeroMetric label="Generated files" value="9" />
                  <HeroMetric label="Facts" value={String(demoReport.facts.length)} />
                  <HeroMetric label="Actions" value={String(demoReport.actions.length)} />
                </div>
              </div>
            </div>
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
                  AgentLayer checks whether agents can complete useful tasks on the site, not just whether standards
                  exist.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={17} aria-hidden="true" />
              Open-source MVP ready
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{label}</p>
    </div>
  );
}
