import { afterEach, describe, expect, it, vi } from "vitest";

import { scanSite } from "../src/index.js";

const ROOT_URL = "http://localhost:4173/";

describe("crawl prioritization", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("selects high-signal task pages before lower-signal sitemap pages when bounded", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) =>
      fixtureResponse(
        typeof input === "string" ? input : input instanceof URL ? input.href : input.url
      )
    );

    const scan = await scanSite({
      rootUrl: ROOT_URL,
      allowLocal: true,
      maxPages: 2,
      timeoutMs: 1000,
      userAgent: "AgentLayerTest"
    });

    expect(scan.pages.map((page) => new URL(page.finalUrl).pathname)).toEqual([
      "/",
      "/product/compare-plans"
    ]);
    expect(scan.pages.map((page) => page.pageType)).toEqual(["home", "pricing"]);
    expect(scan.pages.map((page) => page.finalUrl)).not.toEqual(
      expect.arrayContaining([
        new URL("/blog/pricing-security-integrations", ROOT_URL).toString(),
        new URL("/changelog/security-plans-update", ROOT_URL).toString(),
        new URL("/docs/reference/security/deep-dive", ROOT_URL).toString()
      ])
    );
    expect(scan.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: new URL("/company/contact-sales", ROOT_URL).toString(),
          message:
            "Not fetched because maxPages bound was reached before this high-signal candidate."
        })
      ])
    );
  });
});

function fixtureResponse(rawUrl: string): Response {
  const url = new URL(rawUrl);

  if (url.pathname === "/robots.txt") {
    return textResponse("User-agent: *\nAllow: /\n", "text/plain");
  }

  if (url.pathname === "/sitemap.xml") {
    return textResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>${new URL("/blog/pricing-security-integrations", ROOT_URL)}</loc></url>
        <url><loc>${new URL("/changelog/security-plans-update", ROOT_URL)}</loc></url>
        <url><loc>${new URL("/docs/reference/security/deep-dive", ROOT_URL)}</loc></url>
      </urlset>`,
      "application/xml"
    );
  }

  const html = htmlByPath[url.pathname];
  if (html) {
    return textResponse(html, "text/html; charset=utf-8");
  }

  return textResponse("", "text/html", 404);
}

function textResponse(body: string, contentType: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "content-type": contentType
    }
  });
}

const htmlByPath: Record<string, string> = {
  "/": `<!doctype html>
    <html>
      <head><title>AcmeFlow</title></head>
      <body>
        <main>
          <h1>AcmeFlow</h1>
          <a href="/blog/pricing-security-integrations">Pricing security integrations article</a>
          <a href="/changelog/security-plans-update">Security plans changelog</a>
          <a href="/docs/reference/security/deep-dive">Security reference</a>
          <a href="/product/compare-plans">Compare plans</a>
          <a href="/company/contact-sales">Contact sales</a>
        </main>
      </body>
    </html>`,
  "/product/compare-plans": `<!doctype html>
    <html>
      <head><title>Compare plans</title></head>
      <body>
        <main>
          <h1>Compare plans</h1>
          <h2>Starter</h2>
          <p>$19 per month with core features and limits.</p>
          <h2>Enterprise</h2>
          <p>Contact sales for SSO, compliance, and advanced support.</p>
        </main>
      </body>
    </html>`,
  "/company/contact-sales": `<!doctype html>
    <html>
      <head><title>Contact sales</title></head>
      <body><main><h1>Contact sales</h1><p>Talk to sales about enterprise plans.</p></main></body>
    </html>`,
  "/blog/pricing-security-integrations": `<!doctype html>
    <html>
      <head><title>Pricing security integrations article</title></head>
      <body><main><h1>Pricing security integrations article</h1></main></body>
    </html>`,
  "/changelog/security-plans-update": `<!doctype html>
    <html>
      <head><title>Security plans update</title></head>
      <body><main><h1>Security plans update</h1></main></body>
    </html>`,
  "/docs/reference/security/deep-dive": `<!doctype html>
    <html>
      <head><title>Security reference</title></head>
      <body><main><h1>Security reference</h1></main></body>
    </html>`
};
