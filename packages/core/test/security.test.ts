import { afterEach, describe, expect, it, vi } from "vitest";

import { scanSite } from "../src/index.js";
import { fetchWithTimeout } from "../src/scanner/fetchRobots.js";
import { isPublicHttpUrl } from "../src/utils/safety.js";

describe("public URL safety", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
    await expect(scanSite({ rootUrl: "http://localhost:3000/" })).rejects.toThrow("Blocked unsafe URL");

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

  it("rejects redirects to private network targets before following them", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response("", {
          status: 302,
          headers: {
            location: "http://169.254.169.254/latest/meta-data/"
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
