import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3001"),
  title: {
    default: "AcmeFlow | Customer workflow automation",
    template: "%s | AcmeFlow"
  },
  description:
    "AcmeFlow is a fictional B2B SaaS fixture for customer workflow automation, docs, pricing, security, and support.",
  openGraph: {
    siteName: "AcmeFlow",
    title: "AcmeFlow",
    description: "Customer workflow automation for B2B SaaS teams."
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AcmeFlow",
    url: "http://localhost:3001",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "sales@acmeflow.example"
    },
    sameAs: ["https://www.linkedin.com/company/acmeflow-example"]
  };

  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
