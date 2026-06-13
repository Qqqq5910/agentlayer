import { describe, expect, it } from "vitest";

import { classifyPage } from "../src/scanner/pageClassifier.js";

describe("page classifier", () => {
  it("does not classify blog pricing/security articles as canonical pages", () => {
    expect(
      classifyPage({
        url: "https://acme.test/blog/advantages-of-resource-based-pricing-in-security",
        title: "Advantages of Resource-Based Pricing in Security",
        description: "A blog article about resource-based pricing for security teams.",
        headings: {
          h1: ["Advantages of Resource-Based Pricing in Security"],
          h2: ["Resource-based pricing examples"],
          h3: []
        },
        text: "Blog article with examples and commentary, not a pricing or security landing page."
      })
    ).toBe("unknown");
  });

  it("does not classify blog integration examples as integrations or security pages", () => {
    expect(
      classifyPage({
        url: "https://acme.test/blog/security-integration-example",
        title: "Security Integration Example",
        description: "Resource article with an integration example for security workflows.",
        headings: {
          h1: ["Security Integration Example"],
          h2: ["Resource guide"],
          h3: []
        },
        text: "A blog resource explaining one security integration example."
      })
    ).toBe("unknown");
  });

  it("still classifies canonical task paths", () => {
    expect(classifyPage({ url: "https://acme.test/pricing", title: "Pricing" })).toBe("pricing");
    expect(classifyPage({ url: "https://acme.test/security", title: "Security" })).toBe("security");
    expect(classifyPage({ url: "https://acme.test/integrations", title: "Integrations" })).toBe(
      "integrations"
    );
    expect(classifyPage({ url: "https://acme.test/docs", title: "Docs" })).toBe("docs");
    expect(classifyPage({ url: "https://acme.test/docs/api", title: "API Reference" })).toBe(
      "api_docs"
    );
  });
});
