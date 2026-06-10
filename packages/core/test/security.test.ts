import * as dns from "node:dns/promises";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { scanSite } from "../src/index.js";
import { fetchWithTimeout } from "../src/scanner/fetchRobots.js";
import { assertPublicHttpUrlResolved, isPublicHttpUrl } from "../src/utils/safety.js";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn()
}));

const lookupMock = vi.mocked(dns.lookup);

describe("public URL safety", () => {
  beforeEach(() => {
    lookupMock.mockImplementation(async (hostname) => [
      {
        address: hostname === "example.com" ? "93.184.216.34" : "203.0.114.10",
        family: 4
      }
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    lookupMock.mockReset();
  });

  it.each([
    "http://localhost/",
    "http://localhost:3000/",
    "http://127.0.0.1/",
    "http://10.0.0.1/",
    "http://172.16.0.1/",
    "http://172.31.255.255/",
    "http://192.168.1.1/",
    "http://169.254.1.1/",
    "http://169.254.169.254/latest/meta-data/",
    "http://[::1]/",
    "http://[::ffff:127.0.0.1]/",
    "http://[::ffff:a9fe:a9fe]/",
    "http://[fc00::1]/",
    "http://[fd00::1]/",
    "http://[fe80::1]/",
    "http://internal/",
    "http://service.internal/"
  ])("rejects unsafe URL %s", (url) => {
    expect(isPublicHttpUrl(url)).toBe(false);
  });

  it("keeps localhost fixture scans behind allowLocal", async () => {
    await expect(scanSite({ rootUrl: "http://localhost:3000/" })).rejects.toThrow(
      "Blocked unsafe URL"
    );

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", {
        status: 404
      })
    );

    const scan = await scanSite({
      rootUrl: "http://localhost:3000/",
      allowLocal: true,
      maxPages: 1
    });

    expect(scan.rootUrl).toBe("http://localhost:3000/");
  });

  it.each([
    ["127.0.0.1", 4],
    ["10.0.0.7", 4],
    ["192.168.1.7", 4],
    ["172.16.0.7", 4],
    ["169.254.169.254", 4],
    ["::1", 6],
    ["fc00::1", 6],
    ["fe80::1", 6]
  ])("rejects public-looking hostnames that resolve to %s", async (address, family) => {
    lookupMock.mockResolvedValueOnce([{ address, family }]);

    await expect(assertPublicHttpUrlResolved("https://agentlayer-public.example/")).rejects.toThrow(
      "hostname resolves to a local, private, link-local, metadata, multicast, reserved, or internal address"
    );

    expect(lookupMock).toHaveBeenCalledWith("agentlayer-public.example", { all: true });
  });

  it("allows public hostnames when every DNS result is public", async () => {
    lookupMock.mockResolvedValueOnce([
      { address: "93.184.216.34", family: 4 },
      { address: "2606:2800:220:1:248:1893:25c8:1946", family: 6 }
    ]);

    await expect(assertPublicHttpUrlResolved("https://example.com/")).resolves.toBeUndefined();
  });

  it("rejects redirects to private network targets before following them", async () => {
    lookupMock.mockImplementation(async (hostname) => [
      {
        address: hostname === "metadata.example" ? "169.254.169.254" : "93.184.216.34",
        family: 4
      }
    ]);

    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response("", {
          status: 302,
          headers: {
            location: "http://metadata.example/latest/meta-data/"
          }
        })
      )
      .mockResolvedValueOnce(new Response("secret metadata"));

    await expect(
      fetchWithTimeout("https://example.com/", {
        timeoutMs: 1000,
        userAgent: "AgentLayerTest",
        allowLocal: false
      })
    ).rejects.toThrow("Blocked unsafe URL");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
