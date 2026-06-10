import { LeadForm } from "@/components/lead-form";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Contact Sales",
  description: "Contact AcmeFlow sales for pricing, security, and workflow questions."
};

export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Contact sales"
        title="Talk with AcmeFlow about your customer workflow needs."
        description="Use this form for pricing questions, Enterprise quotes, security review requests, and implementation planning."
      />
      <section className="site-shell grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
        <div className="card p-5">
          <h2 className="text-2xl font-semibold">Sales contact</h2>
          <p className="mt-3 leading-7 text-[#5e6b66]">Email: sales@acmeflow.example</p>
          <p className="mt-2 leading-7 text-[#5e6b66]">Typical response time: one business day.</p>
        </div>
        <LeadForm purpose="contact" />
      </section>
    </main>
  );
}
