import { LeadForm } from "@/components/lead-form";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Book Demo",
  description: "Book an AcmeFlow demo for onboarding, renewal, or implementation workflows."
};

export default function DemoPage() {
  return (
    <main>
      <PageHero
        eyebrow="Book demo"
        title="See AcmeFlow with your customer handoff workflow."
        description="Request a product demo for a qualified lead. A human should confirm all meeting details before scheduling."
      />
      <section className="site-shell grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
        <div className="card p-5">
          <h2 className="text-2xl font-semibold">What the demo covers</h2>
          <ul className="mt-4 grid gap-3 leading-7 text-[#5e6b66]">
            <li>- Pricing fit for Starter, Growth, or Enterprise</li>
            <li>- CRM and Slack integration setup</li>
            <li>- Security review and SSO requirements</li>
            <li>- Customer onboarding workflow templates</li>
          </ul>
        </div>
        <LeadForm purpose="demo" />
      </section>
    </main>
  );
}

