import type { PageSnapshot, ScanOptions, SiteScan } from "../schemas.js";
import { SiteScanSchema } from "../schemas.js";
import { extractPageSnapshot } from "../extractor/extractMetadata.js";
import { isAllowedByRobots, isSafeCrawlUrl } from "../utils/safety.js";
import {
  importantSeedUrls,
  isHighSignalTaskUrl,
  normalizeUrl,
  sortUrlsByPriority
} from "../utils/urls.js";
import { fetchRobotsTxt, fetchWithTimeout } from "../scanner/fetchRobots.js";
import { fetchSitemap } from "../scanner/fetchSitemap.js";
import type { Crawler } from "./types.js";

export const localCrawler: Crawler = {
  name: "local",
  scan: scanWithLocalCrawler
};

type QueueSource = "root" | "sitemap" | "seed" | "discovered";

export async function scanWithLocalCrawler(options: ScanOptions): Promise<SiteScan> {
  const errors: SiteScan["errors"] = [];
  const robotsTxt = await fetchRobotsTxt(options);
  const sitemap = await fetchSitemap(options);
  const pages: PageSnapshot[] = [];
  const visited = new Set<string>();
  const queued = new Set<string>();
  const queueSources = new Map<string, QueueSource>();
  const queue: string[] = [];

  const enqueue = (url: string | null, source: QueueSource) => {
    if (
      !url ||
      visited.has(url) ||
      !isSafeCrawlUrl(url, options.rootUrl, { allowLocal: options.allowLocal })
    ) {
      return;
    }

    if (queued.has(url)) {
      queueSources.set(url, moreSpecificSource(queueSources.get(url), source));
      return;
    }

    queued.add(url);
    queueSources.set(url, source);
    queue.push(url);
  };

  enqueue(options.rootUrl, "root");

  for (const url of sortUrlsByPriority(sitemap?.urls ?? [], options.rootUrl)) {
    enqueue(url, "sitemap");
  }

  for (const url of sortUrlsByPriority(importantSeedUrls(options.rootUrl), options.rootUrl)) {
    enqueue(url, "seed");
  }

  prioritizeQueue(queue, options.rootUrl);

  while (queue.length > 0 && pages.length < options.maxPages) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    const source = queueSources.get(current) ?? "discovered";

    if (
      options.respectRobotsTxt &&
      !isAllowedByRobots(current, robotsTxt?.text, options.userAgent)
    ) {
      errors.push({
        url: current,
        message: "Skipped because robots.txt disallows crawling this URL."
      });
      continue;
    }

    try {
      const response = await fetchWithTimeout(current, options);
      const finalUrl = normalizeUrl(response.url || current);
      if (
        !finalUrl ||
        !isSafeCrawlUrl(finalUrl, options.rootUrl, { allowLocal: options.allowLocal })
      ) {
        errors.push({
          url: current,
          message: `Skipped redirect outside allowed crawl scope: ${response.url || current}`
        });
        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok) {
        if (!(source === "seed" && response.status === 404)) {
          errors.push({
            url: current,
            message: `Fetch failed with HTTP ${response.status}.`
          });
        }
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
        enqueue(url, "discovered");
      }
      prioritizeQueue(queue, options.rootUrl);
    } catch (error) {
      errors.push({
        url: current,
        message: error instanceof Error ? error.message : "Unknown fetch error."
      });
    }
  }

  if (pages.length >= options.maxPages) {
    noteBoundedHighSignalCandidates(queue, visited, errors, options.rootUrl);
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

function prioritizeQueue(queue: string[], rootUrl: string): void {
  queue.splice(0, queue.length, ...sortUrlsByPriority(queue, rootUrl));
}

function noteBoundedHighSignalCandidates(
  queue: readonly string[],
  visited: ReadonlySet<string>,
  errors: SiteScan["errors"],
  rootUrl: string
): void {
  const candidates = queue
    .filter((url) => !visited.has(url) && isHighSignalTaskUrl(url, rootUrl))
    .slice(0, 5);

  for (const url of candidates) {
    errors.push({
      url,
      message: "Not fetched because maxPages bound was reached before this high-signal candidate."
    });
  }
}

function moreSpecificSource(existing: QueueSource | undefined, next: QueueSource): QueueSource {
  if (!existing || sourcePriority(next) > sourcePriority(existing)) {
    return next;
  }

  return existing;
}

function sourcePriority(source: QueueSource): number {
  switch (source) {
    case "root":
      return 4;
    case "discovered":
      return 3;
    case "sitemap":
      return 2;
    case "seed":
      return 1;
  }
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
