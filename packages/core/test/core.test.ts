import { describe, expect, it } from "vitest";

import {
  buildAgentLayerReport,
  buildSiteProfile,
  evaluateFormOperability,
  evaluateTasks,
  extractActions,
  extractFacts,
  generateArtifacts,
  generateLlmsFullTxt,
  generateLlmsTxt,
  scoreSite
} from "../src/index.js";
import { describeGeneratedArtifacts } from "../src/generator/artifactCatalog.js";
import { extractPageSnapshot } from "../src/extractor/extractMetadata.js";
import { classifyPage } from "../src/scanner/pageClassifier.js";
import { SiteScanSchema, type SiteScan } from "../src/schemas.js";
import { normalizeUrl } from "../src/utils/urls.js";

const ROOT_URL = "https://acme.test/";

describe("urls", () => {
  it("normalizes URLs deterministically", () => {
    expect(normalizeUrl("HTTPS://Example.com:443/a/?utm_source=x&b=2&a=1#frag")).toBe(
      "https://example.com/a?a=1&b=2"
    );
    expect(normalizeUrl("/Pricing/#plans", ROOT_URL)).toBe("https://acme.test/Pricing");
    expect(normalizeUrl("mailto:sales@example.com", ROOT_URL)).toBeNull();
  });
});

describe("page classification", () => {
  it("classifies key B2B SaaS pages", () => {
    expect(classifyPage({ url: "https://acme.test/pricing", title: "Pricing" })).toBe("pricing");
    expect(classifyPage({ url: "https://acme.test/docs/api", title: "API Reference" })).toBe(
      "api_docs"
    );
    expect(
      classifyPage({ url: "https://acme.test/security", text: "SOC 2 and GDPR compliance" })
    ).toBe("security");
  });
});

describe("forms, facts, actions, tasks, scoring, and generation", () => {
  it("extracts forms, facts, actions, evaluates tasks, and generates artifacts", async () => {
    const scan = sampleScan();
    const contactPage = scan.pages.find((page) => page.pageType === "contact");

    expect(scan.pages[0]?.markdown.split("\n").length).toBeGreaterThanOrEqual(5);
    expect(scan.pages[0]?.markdown).toContain("\n\n");
    expect(contactPage?.forms[0]).toMatchObject({
      method: "POST",
      purpose: "contact sales"
    });
    expect(contactPage?.forms[0]?.fields.map((field) => field.name)).toEqual([
      "name",
      "email",
      "company",
      "message"
    ]);

    const profile = buildSiteProfile(scan);
    const facts = extractFacts(scan);
    const actions = extractActions(scan);
    const forms = evaluateFormOperability(scan);
    const tasks = evaluateTasks(scan, facts, actions);
    const scores = scoreSite(scan, facts, actions, tasks, forms);
    const report = await buildAgentLayerReport(scan);

    expect(profile.name).toBe("AcmeFlow");
    expect(facts.some((fact) => fact.type === "company" && fact.value === "AcmeFlow")).toBe(true);
    expect(facts.filter((fact) => fact.type === "plan").map((fact) => fact.value)).toEqual(
      expect.arrayContaining(["Starter", "Pro", "Enterprise"])
    );
    expect(facts.some((fact) => fact.type === "security")).toBe(true);
    expect(facts.some((fact) => fact.type === "integration" && fact.value === "Slack")).toBe(true);

    expect(
      actions.some((action) => action.name === "contact_sales" && action.actionType === "form")
    ).toBe(true);
    expect(actions.some((action) => action.name === "view_pricing")).toBe(true);
    expect(
      actions.find((action) => action.name === "contact_sales")?.requiresHumanConfirmation
    ).toBe(true);

    expect(forms[0]).toMatchObject({
      purpose: "contact sales",
      method: "POST",
      actionUrl: "https://acme.test/contact",
      sensitivity: "medium",
      requiresHumanConfirmation: true
    });
    expect(forms[0]?.score).toBeGreaterThanOrEqual(90);
    expect(forms[0]?.findings.map((finding) => finding.id)).toEqual(
      expect.arrayContaining([
        "stable_action_url",
        "method",
        "field_names",
        "labels_or_placeholders",
        "required_fields",
        "submit_text",
        "inferred_purpose",
        "sensitivity",
        "human_confirmation"
      ])
    );

    expect(tasks.find((task) => task.taskId === "find_pricing")?.status).toBe("pass");
    expect(tasks.find((task) => task.taskId === "book_demo")?.status).toBe("pass");
    expect(
      tasks.find((task) => task.taskId === "book_demo")?.journeySteps.map((step) => step.id)
    ).toEqual([
      "discover_action",
      "understand_required_fields",
      "confirm_sensitive_action",
      "submit_safely_not_performed"
    ]);
    expect(
      tasks
        .find((task) => task.taskId === "book_demo")
        ?.journeySteps.find((step) => step.id === "submit_safely_not_performed")?.status
    ).toBe("pass");
    expect(tasks.find((task) => task.taskId === "find_security")?.score).toBeGreaterThanOrEqual(80);
    expect(scores.overall).toBeGreaterThan(70);
    expect(report.forms).toHaveLength(1);
    expect(report.recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          suggestedArtifact: ".well-known/agents.json"
        })
      ])
    );

    const llmsTxt = generateLlmsTxt(report);
    const llmsFullTxt = generateLlmsFullTxt(report);
    const artifacts = generateArtifacts(report);
    const reportHtml = artifacts.find((artifact) => artifact.path === "report.html")?.content ?? "";
    const artifactManifest = JSON.parse(
      artifacts.find((artifact) => artifact.path === "artifacts.json")?.content ?? "{}"
    ) as {
      count: number;
      artifacts: Array<{ path: string; mediaType: string }>;
    };
    const artifactCatalog = describeGeneratedArtifacts(report).map(({ path, mediaType }) => ({
      path,
      mediaType
    }));

    expect(llmsTxt).toContain("# AcmeFlow");
    expect(llmsTxt).toContain("## Agent Actions");
    expect(llmsFullTxt).toContain("Source: https://acme.test/pricing");
    expect(artifacts.map((artifact) => artifact.path)).toEqual(
      expect.arrayContaining([
        "llms.txt",
        "llms-full.txt",
        "facts.json",
        "actions.json",
        "form-operability.json",
        "report.json",
        "artifacts.json",
        ".well-known/agents.json",
        ".well-known/mcp.json",
        ".well-known/mcp/server-card.json",
        ".well-known/api-catalog",
        "webmcp/suggested-webmcp-tools.json",
        "report.html",
        "markdown/index.md"
      ])
    );
    expect(reportHtml).toContain("Agent Operability Score");
    expect(reportHtml).toContain("Agent operability report for AcmeFlow");
    expect(reportHtml).toContain("How to read this report");
    expect(reportHtml).toContain("readability 25%, trustability 25%, actionability 30%");
    expect(reportHtml).toContain("Generated artifacts");
    expect(reportHtml).toContain(
      `<span>Generated artifacts</span><strong>${artifactManifest.count}</strong>`
    );
    expect(reportHtml).toContain(`${artifactManifest.count} total`);
    expect(reportHtml).toContain(
      "The count matches the <code>artifacts.json</code> manifest count"
    );
    expect(reportHtml).toContain(`href="markdown/pricing.md"`);
    expect(reportHtml).toContain("Markdown snapshot from /pricing.");
    expect(reportHtml).toContain("Crawl Issues");
    expect(reportHtml).toContain("Non-blocking warning");
    expect(reportHtml).toContain("HTTP 404");
    expect(reportHtml).toContain("Redirect skipped");
    expect(reportHtml).toContain("affect the score only when they hide evidence");
    expect(reportHtml).toContain("Critical and warning recommendations");
    expect(reportHtml).toContain("scoring guide");
    expect(reportHtml).toContain(".table-wrap { width: 100%; overflow-x: auto; }");
    expect(reportHtml).toContain("overflow-wrap: anywhere");
    expect(reportHtml).toContain('<table class="task-table">');
    expect(reportHtml).toContain("<strong>Why:</strong>");
    expect(reportHtml).toContain("<strong>Fix:</strong>");
    expect(reportHtml).toContain("Detected actions");
    expect(reportHtml).toContain("Form operability");
    expect(artifactManifest.artifacts).toHaveLength(artifactManifest.count);
    expect(artifactManifest.artifacts).toEqual(artifactCatalog);
    expect(artifacts.map(({ path, mediaType }) => ({ path, mediaType }))).toEqual(artifactCatalog);
    expect(artifacts.find((artifact) => artifact.path === "tasks-report.json")?.content).toEqual(
      expect.stringContaining("submit_safely_not_performed")
    );
    expect(
      artifacts.find((artifact) => artifact.path === "form-operability.json")?.content
    ).toEqual(expect.stringContaining("stable_action_url"));
    expect(artifacts.find((artifact) => artifact.path === "artifacts.json")?.content).toEqual(
      expect.stringContaining(".well-known/mcp/server-card.json")
    );
    expect(
      artifacts.find((artifact) => artifact.path === "webmcp/suggested-webmcp-tools.json")?.content
    ).toEqual(expect.stringContaining("formOperability"));
  });
});

describe("crawl coverage diagnostics", () => {
  it("surfaces canonical-domain redirect clusters instead of ordinary missing-content fixes", async () => {
    const report = await buildAgentLayerReport(canonicalRedirectLimitedScan());
    const titles = report.recommendations.map((recommendation) => recommendation.title);
    const diagnostic = report.recommendations[0];

    expect(diagnostic).toMatchObject({
      title: "Review canonical-domain crawl coverage",
      severity: "high",
      affectedTasks: expect.arrayContaining(["find_pricing", "book_demo"])
    });
    expect(diagnostic?.whyItMatters).toContain("0 page snapshots were captured");
    expect(diagnostic?.whyItMatters).toContain("4 skipped redirects pointed to www.acme.test");
    expect(diagnostic?.whyItMatters).toContain("bounded crawl coverage");
    expect(diagnostic?.howToFix).toContain("rerun the scan with https://www.acme.test");
    expect(diagnostic?.howToFix).toContain("will not crawl www.acme.test automatically");
    expect(titles.some((title) => title.startsWith("Improve task:"))).toBe(false);
    expect(titles).not.toContain("Add source-backed facts");
    expect(titles).not.toContain("Expose agent action paths");
  });
});

function sampleScan(): SiteScan {
  return SiteScanSchema.parse({
    rootUrl: ROOT_URL,
    scannedAt: "2026-06-10T00:00:00.000Z",
    robotsTxt: {
      url: "https://acme.test/robots.txt",
      found: true,
      text: "User-agent: *\nAllow: /\n"
    },
    sitemap: {
      url: "https://acme.test/sitemap.xml",
      found: true,
      urls: [
        "https://acme.test/pricing",
        "https://acme.test/docs",
        "https://acme.test/security",
        "https://acme.test/contact"
      ]
    },
    pages: [
      page("/", homeHtml()),
      page("/pricing", pricingHtml()),
      page("/docs", docsHtml()),
      page("/security", securityHtml()),
      page("/integrations", integrationsHtml()),
      page("/contact", contactHtml()),
      page("/privacy", policyHtml("Privacy Policy")),
      page("/terms", policyHtml("Terms of Service")),
      page("/support", supportHtml())
    ],
    errors: [
      {
        url: "https://acme.test/private",
        message: "Skipped because robots.txt disallows crawling this URL."
      },
      {
        url: "https://acme.test/missing",
        message: "Fetch failed with HTTP 404."
      },
      {
        url: "https://acme.test/away",
        message: "Skipped redirect outside allowed crawl scope: https://external.test/away"
      }
    ]
  });
}

function canonicalRedirectLimitedScan(): SiteScan {
  return SiteScanSchema.parse({
    rootUrl: ROOT_URL,
    scannedAt: "2026-06-14T00:00:00.000Z",
    pages: [],
    errors: [
      {
        url: "https://acme.test/",
        message: "Skipped redirect outside allowed crawl scope: https://www.acme.test/"
      },
      {
        url: "https://acme.test/pricing",
        message: "Skipped redirect outside allowed crawl scope: https://www.acme.test/pricing"
      },
      {
        url: "https://acme.test/docs",
        message: "Skipped redirect outside allowed crawl scope: https://www.acme.test/docs"
      },
      {
        url: "https://acme.test/contact",
        message: "Skipped redirect outside allowed crawl scope: https://www.acme.test/contact"
      },
      {
        url: "https://acme.test/missing",
        message: "Fetch failed with HTTP 404."
      }
    ]
  });
}

function page(path: string, html: string) {
  const finalUrl = new URL(path, ROOT_URL).toString();
  return extractPageSnapshot({
    html,
    requestedUrl: finalUrl,
    finalUrl,
    status: 200,
    contentType: "text/html"
  });
}

function homeHtml(): string {
  return `<!doctype html>
    <html>
      <head>
        <title>AcmeFlow | Workflow automation</title>
        <meta name="description" content="AcmeFlow automates revenue workflows for modern B2B teams." />
        <meta property="og:site_name" content="AcmeFlow" />
        <script type="application/ld+json">{"@type":"Organization","name":"AcmeFlow"}</script>
      </head>
      <body>
        <main>
          <h1>AcmeFlow workflow automation for teams</h1>
          <p>Built for developers and revenue operations teams that need reliable automation.</p>
          <a href="/pricing">Pricing</a>
          <a href="/docs">Docs</a>
          <a href="/security">Security</a>
          <a href="/integrations">Integrations</a>
          <a href="/contact">Contact sales</a>
          <a href="/support">Support</a>
        </main>
      </body>
    </html>`;
}

function pricingHtml(): string {
  return `<main>
    <h1>Pricing</h1>
    <p>Compare plans, features, limits, seats, and support.</p>
    <section><h2>Starter</h2><p>$29/user/month with core workflows.</p></section>
    <section><h2>Pro</h2><p>$79/user/month with advanced features and higher limits.</p></section>
    <section><h2>Enterprise</h2><p>Contact sales for custom pricing, SSO, and compliance reviews.</p></section>
  </main>`;
}

function docsHtml(): string {
  return `<main><h1>Documentation</h1><p>Developer docs and API reference for automations.</p><a href="/docs/api">API Reference</a></main>`;
}

function securityHtml(): string {
  return `<main><h1>Security and Trust Center</h1><p>AcmeFlow documents SOC 2 controls, GDPR readiness, encryption, and compliance practices.</p></main>`;
}

function integrationsHtml(): string {
  return `<main><h1>Integrations</h1><p>Connect AcmeFlow with Slack, Google, Salesforce, and Zapier.</p></main>`;
}

function contactHtml(): string {
  return `<main>
    <h1>Contact sales</h1>
    <form method="post" action="/contact">
      <label for="name">Name</label><input id="name" name="name" required />
      <label for="email">Email</label><input id="email" name="email" type="email" required />
      <label for="company">Company</label><input id="company" name="company" />
      <label for="message">Message</label><textarea id="message" name="message"></textarea>
      <button>Contact sales</button>
    </form>
  </main>`;
}

function policyHtml(title: string): string {
  return `<main><h1>${title}</h1><p>${title} for AcmeFlow customers, including cancellation and refund details.</p></main>`;
}

function supportHtml(): string {
  return `<main><h1>Support</h1><p>Get help from AcmeFlow support at support@acme.test.</p></main>`;
}
