import type { ScanOptions, SiteScan } from "../schemas.js";
import { ScanOptionsSchema } from "../schemas.js";
import { firecrawlCrawler } from "../crawlers/firecrawlCrawler.js";
import { localCrawler } from "../crawlers/localCrawler.js";
import type { Crawler } from "../crawlers/types.js";
import { assertPublicHttpUrl } from "../utils/safety.js";
import { normalizeRootUrl } from "../utils/urls.js";

export async function scanSite(inputOptions: unknown): Promise<SiteScan> {
  const rawOptions =
    typeof inputOptions === "string" ? { rootUrl: inputOptions } : isRecord(inputOptions) ? inputOptions : {};
  const parsed = ScanOptionsSchema.parse({
    ...rawOptions,
    rootUrl: normalizeRootUrl(String(rawOptions.rootUrl ?? ""))
  });

  const options = {
    ...parsed,
    rootUrl: normalizeRootUrl(parsed.rootUrl)
  };

  assertPublicHttpUrl(options.rootUrl, { allowLocal: options.allowLocal });
  return selectCrawler(options).scan(options);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function selectCrawler(options: ScanOptions): Crawler {
  if (options.crawler === "firecrawl") {
    return firecrawlCrawler;
  }

  return localCrawler;
}
