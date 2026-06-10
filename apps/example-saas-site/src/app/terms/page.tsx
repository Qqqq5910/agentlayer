import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Terms",
  description: "AcmeFlow terms, cancellation, and refund information for the fictional demo site."
};

export default function TermsPage() {
  return (
    <main>
      <PageHero
        eyebrow="Terms"
        title="Terms, cancellation, and refund information."
        description="This page gives agents a specific source for legal and cancellation questions."
      />
      <section className="site-shell card p-6 leading-8 text-[#42504a]">
        <h2 className="text-2xl font-semibold text-[#17201d]">Service terms</h2>
        <p className="mt-3">
          AcmeFlow is a fictional product fixture. Paid subscriptions would be governed by an order
          form and service agreement reviewed by the customer.
        </p>
        <h2 className="mt-6 text-2xl font-semibold text-[#17201d]">Cancellation and refunds</h2>
        <p className="mt-3">
          Starter and Growth plans may be cancelled before the next billing period. Enterprise
          cancellations and refunds follow the signed order form. Contact support@acmeflow.example
          for cancellation requests.
        </p>
      </section>
    </main>
  );
}
