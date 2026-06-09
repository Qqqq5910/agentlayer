import type { SiteScan, ScanOptions } from "../schemas.js";

export async function fetchRobotsTxt(options: ScanOptions): Promise<SiteScan["robotsTxt"]> {
  const robotsUrl = new URL("/robots.txt", options.rootUrl).toString();

  try {
    const response = await fetchWithTimeout(robotsUrl, options);
    if (!response.ok) {
      return {
        url: robotsUrl,
        found: false
      };
    }

    return {
      url: robotsUrl,
      found: true,
      text: await response.text()
    };
  } catch {
    return {
      url: robotsUrl,
      found: false
    };
  }
}

export async function fetchWithTimeout(url: string, options: Pick<ScanOptions, "timeoutMs" | "userAgent">): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.7",
        "user-agent": options.userAgent
      },
      redirect: "follow",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}
