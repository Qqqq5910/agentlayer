import Link from "next/link";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Documentation",
  description: "AcmeFlow documentation for workflows, roles, API access, and webhooks."
};

export default function DocsPage() {
  const docs = [
    ["Getting started", "Create your first onboarding workflow and invite teammates."],
    ["Workflow templates", "Use repeatable playbooks for implementation, renewals, and escalations."],
    ["Roles and permissions", "Configure admin, operator, viewer, and auditor roles."],
    ["API documentation", "Use REST APIs and webhooks to sync workflow events."]
  ];

  return (
    <main>
      <PageHero
        eyebrow="Docs"
        title="Documentation for building reliable customer workflows."
        description="Find setup guides, API docs, webhook references, role configuration, and integration walkthroughs."
      />
      <section className="site-shell grid gap-4 md:grid-cols-2">
        {docs.map(([title, text]) => (
          <article className="card p-5" key={title}>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 leading-7 text-[#5e6b66]">{text}</p>
            <Link className="mt-4 inline-block font-semibold text-[#176b53]" href={title === "API documentation" ? "/docs/api" : "/docs"}>
              Read more
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}

