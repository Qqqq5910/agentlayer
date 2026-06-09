import { PageHero } from "@/components/page-hero";
import { apiExamples } from "@/lib/site";

export const metadata = {
  title: "API Docs",
  description: "AcmeFlow REST API and webhook documentation."
};

export default function ApiDocsPage() {
  return (
    <main>
      <PageHero
        eyebrow="API docs"
        title="REST API and webhooks for AcmeFlow workflows."
        description="Developers can read account, workflow, event, and webhook resources. Production API credentials are managed by admins."
      />
      <section className="site-shell grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <div className="card p-5">
          <h2 className="text-2xl font-semibold">Authentication</h2>
          <p className="mt-3 leading-7 text-[#5e6b66]">
            API requests use bearer tokens created by an account admin. Tokens can be scoped to read-only or workflow
            write access.
          </p>
        </div>
        <div className="card p-5">
          <h2 className="text-2xl font-semibold">Example endpoints</h2>
          <pre className="mt-4 overflow-auto rounded-md bg-[#17201d] p-4 text-sm text-white">
            {apiExamples.join("\n")}
          </pre>
        </div>
      </section>
    </main>
  );
}

