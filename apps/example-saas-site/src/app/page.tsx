import Link from "next/link";
import Image from "next/image";
import { integrations, plans } from "@/lib/site";

export default function HomePage() {
  return (
    <main>
      <section className="border-b border-[#d9ddd5] bg-[#eef4ed]">
        <div className="site-shell grid min-h-[520px] gap-8 py-12 md:grid-cols-[1fr_0.9fr] md:items-center">
          <div>
            <p className="eyebrow">Customer workflow automation</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl">
              Turn customer handoffs into reliable workflows.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#42504a]">
              AcmeFlow helps B2B SaaS teams coordinate onboarding, renewals, implementation tasks,
              and customer escalations across sales, success, support, and product teams.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-md bg-[#176b53] px-5 py-3 font-semibold text-white"
                href="/demo"
              >
                Book a demo
              </Link>
              <Link
                className="rounded-md border border-[#bcc5bb] px-5 py-3 font-semibold"
                href="/pricing"
              >
                View pricing
              </Link>
            </div>
          </div>
          <div className="card overflow-hidden">
            <Image
              src="/images/acmeflow-dashboard.png"
              width={1672}
              height={941}
              alt="AcmeFlow dashboard showing revenue workflow automation"
              className="h-auto w-full border-b border-[#d9ddd5]"
              priority
            />
            <div className="p-5">
              <p className="text-sm font-semibold text-[#176b53]">Live workflow snapshot</p>
              <div className="mt-5 grid gap-3">
                {["New enterprise kickoff", "Security review", "API handoff", "Renewal risk"].map(
                  (item, index) => (
                    <div className="rounded-md border border-[#d9ddd5] bg-[#fbfbf8] p-4" key={item}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item}</span>
                        <span className="text-sm text-[#5e6b66]">
                          {index === 0 ? "On track" : "Queued"}
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-[#e1e7df]">
                        <div
                          className="h-2 rounded-full bg-[#176b53]"
                          style={{ width: `${72 - index * 12}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-shell grid gap-4 py-12 md:grid-cols-3">
        {[
          ["For customer success", "Automate onboarding plans and renewal handoffs."],
          [
            "For sales engineers",
            "Track security reviews, API questions, and implementation blockers."
          ],
          ["For operations teams", "Standardize playbooks, approvals, and reporting."]
        ].map(([title, text]) => (
          <article className="card p-5" key={title}>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 leading-7 text-[#5e6b66]">{text}</p>
          </article>
        ))}
      </section>

      <section className="site-shell grid gap-6 py-4 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Integrations</p>
          <h2 className="mt-3 text-3xl font-semibold">
            Connect the tools your revenue team already uses.
          </h2>
          <p className="mt-4 leading-7 text-[#5e6b66]">
            Agents and operators can find our CRM, chat, analytics, and warehouse integrations from
            a dedicated integrations page.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {integrations.slice(0, 6).map((integration) => (
            <Link
              className="card p-4 font-medium hover:border-[#176b53]"
              href="/integrations"
              key={integration}
            >
              {integration}
            </Link>
          ))}
        </div>
      </section>

      <section className="site-shell py-12">
        <div className="card grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="eyebrow">Pricing starts at {plans[0]?.price}</p>
            <h2 className="mt-2 text-3xl font-semibold">
              Compare Starter, Growth, and Enterprise plans.
            </h2>
          </div>
          <Link
            className="rounded-md bg-[#17201d] px-5 py-3 font-semibold text-white"
            href="/pricing"
          >
            See plan details
          </Link>
        </div>
      </section>
    </main>
  );
}
