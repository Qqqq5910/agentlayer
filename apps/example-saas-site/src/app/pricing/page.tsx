import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { plans } from "@/lib/site";

export const metadata = {
  title: "Pricing",
  description: "AcmeFlow pricing plans for Starter, Growth, and Enterprise teams."
};

export default function PricingPage() {
  return (
    <main>
      <PageHero
        eyebrow="Pricing"
        title="Plans for B2B SaaS teams from first playbook to enterprise governance."
        description="AcmeFlow offers transparent monthly pricing for Starter and Growth teams. Enterprise plans are quoted through sales after a security and workflow review."
      />
      <section className="site-shell grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article className="card flex flex-col p-5" key={plan.name}>
            <h2 className="text-2xl font-semibold">{plan.name}</h2>
            <p className="mt-4 text-4xl font-semibold">{plan.price}</p>
            <p className="mt-1 text-sm text-[#5e6b66]">{plan.cadence}</p>
            <p className="mt-4 leading-7 text-[#5e6b66]">{plan.description}</p>
            <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.08em] text-[#176b53]">
              Included features and limits
            </h3>
            <ul className="mt-5 grid gap-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
            </ul>
            <Link className="mt-6 rounded-md bg-[#176b53] px-4 py-3 text-center font-semibold text-white" href="/demo">
              {plan.name === "Enterprise" ? "Contact sales" : "Start with demo"}
            </Link>
          </article>
        ))}
      </section>
      <section className="site-shell py-10">
        <div className="card p-6">
          <h2 className="text-2xl font-semibold">Plan differences</h2>
          <p className="mt-3 leading-7 text-[#5e6b66]">
            Starter focuses on shared playbooks, Growth adds Slack alerts and approvals, and Enterprise adds SSO/SAML,
            audit exports, and a security review packet for larger organizations.
          </p>
        </div>
      </section>
    </main>
  );
}
