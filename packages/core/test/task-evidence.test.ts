import { describe, expect, it } from "vitest";

import {
  buildAgentLayerReport,
  evaluateFormOperability,
  evaluateTasks,
  extractActions,
  generateArtifacts,
  SiteScanSchema,
  type SiteScan
} from "../src/index.js";
import { extractPageSnapshot } from "../src/extractor/extractMetadata.js";

const ROOT_URL = "https://nav-only.test/";

describe("task evidence wording", () => {
  it("explains navigation-only demo/contact journeys as missing form evidence", () => {
    const scan = navigationOnlyContactScan();
    const actions = extractActions(scan);

    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "contact_sales",
          actionType: "navigation",
          url: "https://nav-only.test/contact"
        })
      ])
    );
    expect(actions.some((action) => action.actionType === "form")).toBe(false);

    const tasks = evaluateTasks(scan, [], actions);
    const demoTask = tasks.find((task) => task.taskId === "book_demo");

    expect(demoTask).toMatchObject({
      status: "partial",
      score: 60
    });
    expect(demoTask?.evidenceUrls).toContain("https://nav-only.test/contact");
    expect(demoTask?.explanation).toMatch(/journey path was discovered/i);
    expect(demoTask?.explanation).toMatch(/no operable form or required-field evidence/i);
    expect(demoTask?.recommendations.join(" ")).toMatch(
      /operable form with labeled required fields/i
    );
  });

  it("falls back to the page URL for fragment-only form actions", async () => {
    const scan = fragmentActionFormScan();
    const actions = extractActions(scan);
    const forms = evaluateFormOperability(scan);
    const report = await buildAgentLayerReport(scan);
    const artifacts = generateArtifacts(report);

    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "book_demo",
          actionType: "form",
          url: "https://nav-only.test/demo"
        })
      ])
    );
    expect(forms[0]).toMatchObject({
      sourceUrl: "https://nav-only.test/demo",
      actionUrl: "https://nav-only.test/demo"
    });
    expect(report.actions[0]?.url).toBe("https://nav-only.test/demo");
    expect(artifacts.some((artifact) => artifact.path === ".well-known/agents.json")).toBe(true);
  });
});

function navigationOnlyContactScan(): SiteScan {
  return SiteScanSchema.parse({
    rootUrl: ROOT_URL,
    scannedAt: "2026-06-13T00:00:00.000Z",
    pages: [
      page(
        "/",
        `<main>
          <h1>NavOnly CRM</h1>
          <p>Revenue operations software for modern sales teams.</p>
          <a href="/contact">Contact sales</a>
        </main>`
      ),
      page(
        "/contact",
        `<main>
          <h1>Contact sales</h1>
          <p>Talk to sales about a guided demo and pricing options.</p>
          <a href="mailto:sales@nav-only.test">sales@nav-only.test</a>
        </main>`
      )
    ],
    errors: []
  });
}

function fragmentActionFormScan(): SiteScan {
  return SiteScanSchema.parse({
    rootUrl: ROOT_URL,
    scannedAt: "2026-06-14T00:00:00.000Z",
    pages: [
      page(
        "/demo",
        `<main>
          <h1>Book a demo</h1>
          <form method="post" action="#">
            <label for="email">Work email</label>
            <input id="email" name="email" type="email" required />
            <button>Book demo</button>
          </form>
        </main>`
      )
    ],
    errors: []
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
