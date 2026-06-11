import { describe, expect, it } from "vitest";

import {
  AgentLayerBaselineSchema,
  AgentLayerComparisonSchema,
  AgentOperabilityReportSchema,
  compareAgentLayerBaseline,
  createAgentLayerBaseline
} from "../src/index.js";
import type { AgentOperabilityReport, GeneratedArtifact, ScanOptions } from "../src/index.js";

const scanOptions: ScanOptions = {
  rootUrl: "https://acme.test/",
  maxPages: 20,
  timeoutMs: 10000,
  respectRobotsTxt: true,
  allowLocal: false,
  crawler: "local",
  userAgent: "AgentLayerBot/0.1 (+https://github.com/Qqqq5910/agentlayer)"
};

const artifacts: GeneratedArtifact[] = [
  { path: "llms.txt", mediaType: "text/plain", content: "AcmeFlow" },
  { path: "facts.json", mediaType: "application/json", content: "[]" },
  { path: ".well-known/agents.json", mediaType: "application/json", content: "{}" }
];

describe("AgentLayer CI baselines and comparisons", () => {
  it("creates a compact baseline that validates against the schema", () => {
    const baseline = createBaseline();

    expect(AgentLayerBaselineSchema.parse(baseline)).toMatchObject({
      schemaVersion: "agentlayer-baseline/v1",
      agentLayerVersion: "0.2.0-test",
      targetUrl: "https://acme.test/",
      acceptedFailures: [],
      counts: {
        facts: 2,
        actions: 1,
        forms: 1
      }
    });
    expect(JSON.stringify(baseline)).not.toContain("This raw page text must not enter baselines");
    expect(baseline.artifacts.map((artifact) => artifact.path)).toEqual([
      ".well-known/agents.json",
      "facts.json",
      "llms.txt"
    ]);
  });

  it("passes comparison when the current scan matches the baseline", () => {
    const baseline = createBaseline();
    const comparison = compareAgentLayerBaseline({
      agentLayerVersion: "0.2.0-test",
      targetUrl: "https://acme.test/",
      scanOptions,
      baseline,
      currentReport: reportFixture(),
      currentArtifacts: artifacts,
      policy: { failOn: ["task-regression", "missing-artifact"], minScoreDelta: 5 }
    });

    expect(AgentLayerComparisonSchema.parse(comparison).exitCode).toBe(0);
    expect(comparison.regressions).toEqual([]);
    expect(comparison.scores.overall).toEqual({ baseline: 94, current: 94, delta: 0 });
  });

  it("detects a task pass to fail regression", () => {
    const comparison = compareAgentLayerBaseline({
      agentLayerVersion: "0.2.0-test",
      targetUrl: "https://acme.test/",
      scanOptions,
      baseline: createBaseline(),
      currentReport: reportFixture({
        tasks: [
          taskFixture({
            status: "fail",
            score: 20,
            recommendations: ["Restore pricing link in navigation."]
          })
        ],
        scores: { overall: 82, taskSuccess: 20 }
      }),
      currentArtifacts: artifacts,
      policy: { failOn: ["task-regression"], minScoreDelta: 5 }
    });

    expect(comparison.regressions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "task-regression",
          id: "find_pricing",
          baseline: "pass",
          current: "fail"
        })
      ])
    );
    expect(comparison.blockingFailures).toHaveLength(1);
    expect(comparison.exitCode).toBe(1);
  });

  it("detects a missing generated artifact", () => {
    const comparison = compareAgentLayerBaseline({
      agentLayerVersion: "0.2.0-test",
      targetUrl: "https://acme.test/",
      scanOptions,
      baseline: createBaseline(),
      currentReport: reportFixture(),
      currentArtifacts: artifacts.filter((artifact) => artifact.path !== ".well-known/agents.json"),
      policy: { failOn: ["missing-artifact"], minScoreDelta: 5 }
    });

    expect(comparison.artifacts.missing).toEqual([
      { path: ".well-known/agents.json", mediaType: "application/json" }
    ]);
    expect(comparison.blockingFailures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "missing-artifact",
          id: ".well-known/agents.json"
        })
      ])
    );
    expect(comparison.exitCode).toBe(1);
  });

  it("fails only when the fail-on policy matches the regression type", () => {
    const comparison = compareAgentLayerBaseline({
      agentLayerVersion: "0.2.0-test",
      targetUrl: "https://acme.test/",
      scanOptions,
      baseline: createBaseline(),
      currentReport: reportFixture(),
      currentArtifacts: artifacts.filter((artifact) => artifact.path !== ".well-known/agents.json"),
      policy: { failOn: ["task-regression"], minScoreDelta: 5 }
    });

    expect(
      comparison.regressions.some((regression) => regression.type === "missing-artifact")
    ).toBe(true);
    expect(comparison.blockingFailures).toEqual([]);
    expect(comparison.exitCode).toBe(0);
  });

  it("does not fail on a small score drop by default", () => {
    const comparison = compareAgentLayerBaseline({
      agentLayerVersion: "0.2.0-test",
      targetUrl: "https://acme.test/",
      scanOptions,
      baseline: createBaseline(),
      currentReport: reportFixture({
        scores: { overall: 91 }
      }),
      currentArtifacts: artifacts
    });

    expect(comparison.regressions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "score-drop",
          id: "overall"
        })
      ])
    );
    expect(comparison.blockingFailures).toEqual([]);
    expect(comparison.exitCode).toBe(0);
  });

  it("blocks score drops only when the configured threshold is exceeded", () => {
    const comparison = compareAgentLayerBaseline({
      agentLayerVersion: "0.2.0-test",
      targetUrl: "https://acme.test/",
      scanOptions,
      baseline: createBaseline(),
      currentReport: reportFixture({
        scores: { overall: 88 }
      }),
      currentArtifacts: artifacts,
      policy: { failOn: ["score-drop"], minScoreDelta: 5 }
    });

    expect(comparison.blockingFailures).toEqual([
      expect.objectContaining({
        type: "score-drop",
        id: "overall",
        delta: -6
      })
    ]);
    expect(comparison.exitCode).toBe(1);
  });
});

function createBaseline() {
  return createAgentLayerBaseline({
    agentLayerVersion: "0.2.0-test",
    targetUrl: "https://acme.test/",
    scanOptions,
    report: reportFixture(),
    artifacts
  });
}

function reportFixture(
  overrides: {
    tasks?: AgentOperabilityReport["tasks"];
    scores?: Partial<AgentOperabilityReport["scores"]>;
  } = {}
): AgentOperabilityReport {
  return AgentOperabilityReportSchema.parse({
    site: {
      name: "AcmeFlow",
      summary: "Agent-operable SaaS site.",
      rootUrl: "https://acme.test/",
      keyPages: {
        home: "https://acme.test/"
      },
      generatedAt: "2026-06-11T00:00:00.000Z"
    },
    scan: {
      rootUrl: "https://acme.test/",
      scannedAt: "2026-06-11T00:00:00.000Z",
      pages: [
        {
          url: "https://acme.test/",
          finalUrl: "https://acme.test/",
          title: "AcmeFlow",
          description: "Agent-operable SaaS site.",
          status: 200,
          pageType: "home",
          headings: {
            h1: ["AcmeFlow"],
            h2: ["Pricing"],
            h3: []
          },
          links: [],
          forms: [],
          jsonLd: [],
          openGraph: {},
          visibleText: "This raw page text must not enter baselines.",
          markdown: "# AcmeFlow\n\nThis raw page text must not enter baselines.",
          emails: [],
          socialLinks: [],
          fetchedAt: "2026-06-11T00:00:00.000Z"
        }
      ],
      errors: []
    },
    facts: [
      {
        id: "company:acmeflow",
        type: "company",
        label: "Company",
        value: "AcmeFlow",
        sourceUrl: "https://acme.test/",
        sourceText: "AcmeFlow",
        confidence: 1
      },
      {
        id: "pricing:starter",
        type: "pricing",
        label: "Pricing",
        value: "Starter plan",
        sourceUrl: "https://acme.test/",
        sourceText: "Starter plan",
        confidence: 0.9
      }
    ],
    actions: [
      {
        id: "action:view_pricing",
        name: "view_pricing",
        description: "View pricing",
        userIntent: "Find pricing",
        actionType: "navigation",
        url: "https://acme.test/pricing",
        requiresHumanConfirmation: false,
        sensitivity: "low",
        sourceUrl: "https://acme.test/",
        confidence: 1
      }
    ],
    forms: [
      {
        formId: "contact",
        sourceUrl: "https://acme.test/contact",
        actionUrl: "https://acme.test/contact",
        method: "POST",
        purpose: "contact sales",
        score: 95,
        sensitivity: "medium",
        requiresHumanConfirmation: true,
        fields: [{ name: "email", type: "email", label: "Email", required: true }],
        findings: [],
        recommendations: []
      }
    ],
    tasks: overrides.tasks ?? [taskFixture()],
    scores: {
      readability: 95,
      trustability: 92,
      actionability: 96,
      taskSuccess: 100,
      overall: 94,
      ...overrides.scores
    },
    recommendations: [
      {
        title: "Publish agent manifest",
        severity: "medium",
        whyItMatters: "Agents need stable action metadata.",
        howToFix: "Review and publish .well-known/agents.json.",
        affectedTasks: ["find_pricing"],
        suggestedArtifact: ".well-known/agents.json"
      }
    ],
    generatedAt: "2026-06-11T00:00:00.000Z"
  });
}

function taskFixture(
  overrides: Partial<AgentOperabilityReport["tasks"][number]> = {}
): AgentOperabilityReport["tasks"][number] {
  return {
    taskId: "find_pricing",
    title: "Find pricing",
    status: "pass",
    score: 100,
    explanation: "Pricing is visible.",
    evidenceUrls: ["https://acme.test/"],
    evidenceSnippets: ["Pricing"],
    missingInformation: [],
    recommendations: [],
    journeySteps: [],
    ...overrides
  };
}
