import { PageHero } from "@/components/page-hero";
import { integrations } from "@/lib/site";

export const metadata = {
  title: "Integrations",
  description: "AcmeFlow integrations for CRM, chat, warehouse, automation, and analytics tools."
};

export default function IntegrationsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Integrations"
        title="Connect AcmeFlow to the tools your revenue team already uses."
        description="AcmeFlow supports CRM, collaboration, analytics, automation, and warehouse integrations for B2B SaaS workflows."
      />
      <section className="site-shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {integrations.map((integration) => (
          <article className="card p-5" key={integration}>
            <h2 className="text-lg font-semibold">{integration}</h2>
            <p className="mt-2 text-sm leading-6 text-[#5e6b66]">
              Sync customer handoff signals between AcmeFlow and {integration}.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

