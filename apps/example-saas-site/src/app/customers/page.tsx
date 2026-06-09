import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Customers",
  description: "AcmeFlow customer stories and B2B SaaS use cases."
};

export default function CustomersPage() {
  const stories = [
    ["Northstar Analytics", "Reduced implementation handoff delays by standardizing launch tasks."],
    ["OrbitDesk", "Connected support escalations to product feedback workflows."],
    ["HelioStack", "Used AcmeFlow playbooks to coordinate Enterprise security reviews."]
  ];

  return (
    <main>
      <PageHero
        eyebrow="Customers"
        title="Customer stories for B2B SaaS revenue and success teams."
        description="AcmeFlow is designed for customer success, sales engineering, support operations, and implementation teams."
      />
      <section className="site-shell grid gap-4 md:grid-cols-3">
        {stories.map(([name, text]) => (
          <article className="card p-5" key={name}>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="mt-3 leading-7 text-[#5e6b66]">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

