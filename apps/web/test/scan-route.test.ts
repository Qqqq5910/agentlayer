import * as dns from "node:dns/promises";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../src/app/api/scan/route";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn()
}));

const buildAgentLayerReportMock = vi.hoisted(() => vi.fn());
const generateArtifactsMock = vi.hoisted(() => vi.fn());

vi.mock("@junyi5910/agentlayer-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@junyi5910/agentlayer-core")>();
  return {
    ...actual,
    buildAgentLayerReport: buildAgentLayerReportMock,
    generateArtifacts: generateArtifactsMock
  };
});

const lookupMock = vi.mocked(dns.lookup);
const originalEnableRemoteScan = process.env.ENABLE_REMOTE_SCAN;

describe("POST /api/scan", () => {
  beforeEach(() => {
    delete process.env.ENABLE_REMOTE_SCAN;
    lookupMock.mockImplementation(async () => lookupAllResult("93.184.216.34", 4));
    buildAgentLayerReportMock.mockResolvedValue(minimalReport());
    generateArtifactsMock.mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (originalEnableRemoteScan === undefined) {
      delete process.env.ENABLE_REMOTE_SCAN;
    } else {
      process.env.ENABLE_REMOTE_SCAN = originalEnableRemoteScan;
    }
  });

  it("returns 403 when ENABLE_REMOTE_SCAN is unset", async () => {
    const response = await postScan({ url: "https://example.com" });

    await expectErrorResponse(response, 403, hostedDemoDisabledMessage());
    expect(buildAgentLayerReportMock).not.toHaveBeenCalled();
  });

  it("returns 403 when ENABLE_REMOTE_SCAN is false", async () => {
    process.env.ENABLE_REMOTE_SCAN = "false";

    const response = await postScan({ url: "https://example.com" });

    await expectErrorResponse(response, 403, hostedDemoDisabledMessage());
    expect(buildAgentLayerReportMock).not.toHaveBeenCalled();
  });

  it("attempts a scan for a valid public URL when ENABLE_REMOTE_SCAN is true", async () => {
    process.env.ENABLE_REMOTE_SCAN = "true";

    const response = await postScan({ url: "example.com", maxPages: 3 });
    const payload = (await response.json()) as { report: unknown; artifacts: unknown[] };

    expect(response.status).toBe(200);
    expect(payload.artifacts).toEqual([]);
    expect(buildAgentLayerReportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        rootUrl: "https://example.com/",
        maxPages: 3,
        allowLocal: false,
        crawler: "local"
      })
    );
  });

  it.each([
    "http://localhost/",
    "http://127.0.0.1/",
    "http://10.0.0.1/",
    "http://172.16.0.1/",
    "http://172.20.10.5/",
    "http://172.31.255.255/",
    "http://192.168.1.1/",
    "http://169.254.1.1/",
    "http://169.254.169.254/latest/meta-data/",
    "http://0.0.0.0/",
    "http://203.0.113.10/",
    "http://224.0.0.1/",
    "http://[::1]/",
    "http://[fc00::1]/",
    "http://[fd00::1]/",
    "http://[fe80::1]/",
    "http://internal/",
    "http://service.internal/",
    "http://printer.lan/"
  ])("rejects unsafe target URL %s", async (url) => {
    process.env.ENABLE_REMOTE_SCAN = "true";

    const response = await postScan({ url });

    await expectErrorResponse(response, 400, "Blocked unsafe URL");
    expect(buildAgentLayerReportMock).not.toHaveBeenCalled();
  });

  it("rejects hostnames that resolve to private IPs", async () => {
    process.env.ENABLE_REMOTE_SCAN = "true";
    lookupMock.mockImplementationOnce(async () => lookupAllResult("10.0.0.5", 4));

    const response = await postScan({ url: "https://private-target.example" });

    await expectErrorResponse(response, 400, "hostname resolves to a local");
    expect(lookupMock).toHaveBeenCalledWith("private-target.example", { all: true });
    expect(buildAgentLayerReportMock).not.toHaveBeenCalled();
  });
});

function postScan(body: unknown) {
  return POST(
    new Request("https://agentlayer.example/api/scan", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    })
  );
}

async function expectErrorResponse(response: Response, status: number, message: string) {
  const payload = (await response.json()) as { error?: string };
  expect(response.status).toBe(status);
  expect(payload.error).toContain(message);
}

function hostedDemoDisabledMessage() {
  return "Remote scanning is disabled in the hosted demo. Hosted demo uses the AcmeFlow fixture. Run the CLI locally for real sites.";
}

function lookupAllResult(address: string, family: 4 | 6) {
  return [{ address, family }] as unknown as Awaited<ReturnType<typeof dns.lookup>>;
}

function minimalReport() {
  return {
    site: {
      name: "Example",
      description: "Example public site",
      rootUrl: "https://example.com/"
    },
    scan: {
      rootUrl: "https://example.com/",
      scannedAt: "2026-06-10T00:00:00.000Z",
      pages: [],
      errors: []
    },
    facts: [],
    actions: [],
    forms: [],
    tasks: [],
    scores: {
      overall: 0,
      readability: 0,
      trustability: 0,
      actionability: 0,
      taskSuccess: 0
    },
    recommendations: [],
    generatedAt: "2026-06-10T00:00:00.000Z"
  };
}
