import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Security",
  description: "AcmeFlow security, privacy, and trust information."
};

export default function SecurityPage() {
  const items = [
    ["Data protection", "Customer workflow data is encrypted in transit and at rest in the fictional AcmeFlow demo."],
    ["Access controls", "Enterprise workspaces can configure SSO/SAML, role-based permissions, and audit exports."],
    ["Compliance posture", "A security review packet is available for Enterprise evaluation. This demo does not claim certification."],
    ["Incident contact", "Security questions can be sent to security@acmeflow.example."]
  ];

  return (
    <main>
      <PageHero
        eyebrow="Security and trust"
        title="Security information for teams evaluating AcmeFlow."
        description="This page gives agents a clear source for trust, access control, privacy, and review packet information without inventing compliance claims."
      />
      <section className="site-shell grid gap-4 md:grid-cols-2">
        {items.map(([title, text]) => (
          <article className="card p-5" key={title}>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 leading-7 text-[#5e6b66]">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

