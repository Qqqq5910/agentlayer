import type { PageSnapshot, ScanOptions, SiteScan } from "../schemas.js";
import { SiteScanSchema } from "../schemas.js";
import { extractPageSnapshot } from "../extractor/extractMetadata.js";
import { isAllowedByRobots, isSafeCrawlUrl } from "../utils/safety.js";
import { importantSeedUrls, normalizeUrl, sortUrlsByPriority } from "../utils/urls.js";
import { fetchRobotsTxt, fetchWithTimeout } from "../scanner/fetchRobots.js";
import { fetchSitemap } from "../scanner/fetchSitemap.js";
import type { Crawler } from "./types.js";

export const localCrawler: Crawler = {
  name: "local",
  scan: scanWithLocalCrawler
};

export async function scanWithLocalCrawler(options: ScanOptions): Promise<SiteScan> {
  const errors: SiteScan["errors"] = [];
  const robotsTxt = await fetchRobotsTxt(options);
  const sitemap = await fetchSitemap(options);
  const pages: PageSnapshot[] = [];
  const visited = new Set<string>();
  const queued = new Set<string>();
  const queue: string[] = [];

  const enqueue = (url: string | null) => {
    if (
      !url ||
      queued.has(url) ||
      visited.has(url) ||
      !isSafeCrawlUrl(url, options.rootUrl, { allowLocal: options.allowLocal })
    ) {
      return;
    }

    queued.add(url);
    queue.push(url);
  };

  for (const url of sortUrlsByPriority(
    [options.rootUrl, ...importantSeedUrls(options.rootUrl), ...(sitemap?.urls ?? [])],
    options.rootUrl
  )) {
    enqueue(url);
  }

  while (queue.length > 0 && pages.length < options.maxPages) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    if (options.respectRobotsTxt && !isAllowedByRobots(current, robotsTxt?.text, options.userAgent)) {
      errors.push({
        url: current,
        message: "Skipped because robots.txt disallows crawling this URL."
      });
      continue;
    }

    try {
      const response = await fetchWithTimeout(current, options);
      const finalUrl = normalizeUrl(response.url || current);
      if (!finalUrl || !isSafeCrawlUrl(finalUrl, options.rootUrl, { allowLocal: options.allowLocal })) {
        errors.push({
          url: current,
          message: `Skipped redirect outside allowed crawl scope: ${response.url || current}`
        });
        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok) {
        errors.push({
          url: current,
          message: `Fetch failed with HTTP ${response.status}.`
        });
        continue;
      }

      if (!isSupportedContent(contentType, finalUrl)) {
        continue;
      }

      const body = await response.text();
      const snapshot = SiteScanSchema.shape.pages.element.parse(
        extractPageSnapshot({
          html: body,
          requestedUrl: current,
          finalUrl,
          status: response.status,
          contentType
        })
      );
      pages.push(snapshot);

      const discovered = snapshot.links
        .filter((link) => !link.isExternal)
        .map((link) => normalizeUrl(link.href, finalUrl))
        .filter((url): url is string => Boolean(url));

      for (const url of sortUrlsByPriority(discovered, options.rootUrl)) {
        enqueue(url);
      }
    } catch (error) {
      errors.push({
        url: current,
        message: error instanceof Error ? error.message : "Unknown fetch error."
      });
    }
  }

  return SiteScanSchema.parse({
    rootUrl: options.rootUrl,
    scannedAt: new Date().toISOString(),
    pages,
    robotsTxt,
    sitemap,
    errors
  });
}

function isSupportedContent(contentType: string, url: string): boolean {
  const path = new URL(url).pathname.toLowerCase();
  return (
    contentType.includes("text/html") ||
    contentType.includes("application/xhtml+xml") ||
    contentType.includes("text/plain") ||
    path.endsWith(".txt")
  );
}
