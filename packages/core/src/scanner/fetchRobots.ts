import type { SiteScan, ScanOptions } from "../schemas.js";
import { assertPublicHttpUrlResolved } from "../utils/safety.js";
import { normalizeUrl } from "../utils/urls.js";

const MAX_REDIRECTS = 5;

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

export async function fetchWithTimeout(
  url: string,
  options: Pick<ScanOptions, "timeoutMs" | "userAgent" | "allowLocal">
): Promise<Response> {
  await assertPublicHttpUrlResolved(url, { allowLocal: options.allowLocal });

  let currentUrl = url;
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetchOnceWithTimeout(currentUrl, options);
    if (!isRedirectResponse(response)) {
      return response;
    }

    const location = response.headers.get("location");
    if (!location) {
      return response;
    }

    const nextUrl = normalizeUrl(location, currentUrl);
    if (!nextUrl) {
      throw new Error(`Blocked invalid redirect target from ${currentUrl}.`);
    }

    await assertPublicHttpUrlResolved(nextUrl, { allowLocal: options.allowLocal });
    currentUrl = nextUrl;
  }

  throw new Error(`Too many redirects while fetching ${url}.`);
}

async function fetchOnceWithTimeout(
  url: string,
  options: Pick<ScanOptions, "timeoutMs" | "userAgent">
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.7",
        "user-agent": options.userAgent
      },
      redirect: "manual",
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

function isRedirectResponse(response: Response): boolean {
  return response.status >= 300 && response.status < 400;
}
