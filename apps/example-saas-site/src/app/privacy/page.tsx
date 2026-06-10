import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Privacy Policy",
  description: "AcmeFlow privacy policy for the fictional demo site."
};

export default function PrivacyPage() {
  return (
    <main>
      <PageHero
        eyebrow="Privacy policy"
        title="How the fictional AcmeFlow demo describes privacy."
        description="This policy page exists so AgentLayer can find a clear privacy source during scans."
      />
      <section className="site-shell card p-6 leading-8 text-[#42504a]">
        <h2 className="text-2xl font-semibold text-[#17201d]">Privacy summary</h2>
        <p className="mt-3">
          AcmeFlow collects account contact information, workspace configuration, and workflow event
          data for providing the fictional service. The demo does not collect real personal
          information.
        </p>
        <h2 className="mt-6 text-2xl font-semibold text-[#17201d]">Retention and deletion</h2>
        <p className="mt-3">
          Customers may request account export or deletion by contacting privacy@acmeflow.example.
          Support confirms identity before processing account deletion requests.
        </p>
      </section>
    </main>
  );
}
