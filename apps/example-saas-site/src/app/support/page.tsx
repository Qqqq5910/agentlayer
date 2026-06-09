import { LeadForm } from "@/components/lead-form";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Support",
  description: "AcmeFlow customer support and help resources."
};

export default function SupportPage() {
  return (
    <main>
      <PageHero
        eyebrow="Support"
        title="Get help with AcmeFlow workflows, integrations, and billing."
        description="Find support contact information, help resources, and a support request form."
      />
      <section className="site-shell grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
        <div className="card p-5">
          <h2 className="text-2xl font-semibold">Support contact</h2>
          <p className="mt-3 leading-7 text-[#5e6b66]">Email: support@acmeflow.example</p>
          <p className="mt-2 leading-7 text-[#5e6b66]">Help center topics: billing, integrations, API, SSO, webhooks.</p>
        </div>
        <LeadForm purpose="support" />
      </section>
    </main>
  );
}

