import * as cheerio from "cheerio";

import type { ScanOptions, SiteScan } from "../schemas.js";
import { isSafeCrawlUrl } from "../utils/safety.js";
import { isSameHostname, normalizeUrl } from "../utils/urls.js";
import { fetchWithTimeout } from "./fetchRobots.js";

export async function fetchSitemap(options: ScanOptions): Promise<SiteScan["sitemap"]> {
  const sitemapUrl = new URL("/sitemap.xml", options.rootUrl).toString();

  try {
    const response = await fetchWithTimeout(sitemapUrl, options);
    if (!response.ok) {
      return {
        url: sitemapUrl,
        found: false,
        urls: []
      };
    }

    const xml = await response.text();
    const urls = extractSitemapUrls(xml, options.rootUrl, { allowLocal: options.allowLocal });

    return {
      url: sitemapUrl,
      found: true,
      urls
    };
  } catch {
    return {
      url: sitemapUrl,
      found: false,
      urls: []
    };
  }
}

export function extractSitemapUrls(xml: string, rootUrl: string, options: Pick<ScanOptions, "allowLocal"> = { allowLocal: false }): string[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const urls = $("loc")
    .map((_, element) => normalizeUrl($(element).text()))
    .get()
    .filter(
      (url): url is string =>
        Boolean(url) &&
        isSameHostname(url, rootUrl) &&
        isSafeCrawlUrl(url, rootUrl, { allowLocal: options.allowLocal })
    );

  return Array.from(new Set(urls));
}
