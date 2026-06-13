import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, FileJson, FileText, FolderTree } from "lucide-react";
import { Navigation } from "@/components/navigation";

export const metadata = {
  title: "Docs"
};

const files: Array<[string, string, LucideIcon]> = [
  ["llms.txt", "Short agent-readable summary of the site and important routes.", FileText],
  ["llms-full.txt", "Longer context file with page summaries and operational notes.", FileText],
  ["site-profile.json", "Structured site profile, key pages, and generated timestamp.", FileJson],
  ["facts.json", "Evidence-backed facts with source URLs and confidence scores.", FileJson],
  ["actions.json", "Agent actions, form fields, confirmation rules, and sensitivity.", FileJson],
  ["tasks-report.json", "Pass, partial, or fail results for common AI-agent journeys.", FileJson],
  [
    ".well-known/agents.json",
    "Public machine-readable action manifest for browser agents.",
    FolderTree
  ]
];

const resources: Array<[string, string, string, LucideIcon]> = [
  [
    "Scoring guide",
    "How the public alpha score, task checks, severities, and limitations work.",
    "https://github.com/Qqqq5910/agentlayer/blob/main/docs/scoring.md",
    FileText
  ],
  [
    "Release checklist",
    "Publish order, smoke tests, and GitHub sync steps for the npm alpha.",
    "https://github.com/Qqqq5910/agentlayer/blob/main/docs/release-checklist.md",
    FileText
  ]
];

export default function DocsPage() {
  return (
    <>
      <Navigation />
      <main className="container-shell py-10">
        <section className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Generated files
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950">
            Publish artifacts agents can read and trust.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            AgentLayer turns a website scan into files that describe content, facts, actions, and
            task readiness. The MVP works without auth, payments, teams, or an LLM API key.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 font-medium text-white"
              href="/scan"
            >
              Scan a site
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              className="inline-flex rounded-md border border-slate-200 bg-white px-4 py-2 font-medium"
              href="/demo"
            >
              View demo
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {files.map(([name, description, Icon]) => (
            <article className="panel p-5" key={name as string}>
              <div className="flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-slate-950 text-white">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">{name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-950">Reference</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {resources.map(([name, description, href, Icon]) => (
              <Link className="panel block p-5" href={href} key={name as string}>
                <div className="flex items-start gap-3">
                  <div className="grid size-10 place-items-center rounded-md bg-slate-950 text-white">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">{name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
