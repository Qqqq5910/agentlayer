import type { PageSnapshot, ScanOptions, SiteScan } from "../schemas.js";
import { SiteScanSchema } from "../schemas.js";
import { extractPageSnapshot } from "../extractor/extractMetadata.js";
import { assertPublicHttpUrlResolved, isSafeCrawlUrlResolved } from "../utils/safety.js";
import { normalizeUrl } from "../utils/urls.js";
import { fetchRobotsTxt } from "../scanner/fetchRobots.js";
import { fetchSitemap } from "../scanner/fetchSitemap.js";
import type { Crawler } from "./types.js";

const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/crawl";
const POLL_INTERVAL_MS = 1000;
const MAX_POLLS = 20;

type FirecrawlDocument = {
  url?: string;
  sourceURL?: string;
  html?: string;
  markdown?: string;
  metadata?: {
    sourceURL?: string;
    url?: string;
    statusCode?: number;
  };
};

type FirecrawlResponse = {
  success?: boolean;
  id?: string;
  data?: FirecrawlDocument[] | { data?: FirecrawlDocument[] };
  error?: string;
};

export const firecrawlCrawler: Crawler = {
  name: "firecrawl",
  scan: scanWithFirecrawlCrawler
};

export async function scanWithFirecrawlCrawler(options: ScanOptions): Promise<SiteScan> {
  const apiKey = readFirecrawlApiKey();
  if (!apiKey) {
    throw new Error("Firecrawl crawler requires FIRECRAWL_API_KEY.");
  }

  await assertPublicHttpUrlResolved(options.rootUrl, { allowLocal: options.allowLocal });

  const [robotsTxt, sitemap, crawlResponse] = await Promise.all([
    fetchRobotsTxt(options),
    fetchSitemap(options),
    startFirecrawlCrawl(options, apiKey)
  ]);
  const documents = await resolveFirecrawlDocuments(crawlResponse, apiKey);
  const errors: SiteScan["errors"] = [];
  const pages: PageSnapshot[] = [];

  for (const document of documents.slice(0, options.maxPages)) {
    const requestedUrl = normalizeUrl(
      document.metadata?.sourceURL ?? document.sourceURL ?? document.url ?? options.rootUrl,
      options.rootUrl
    );
    const finalUrl = normalizeUrl(
      document.url ?? document.metadata?.url ?? requestedUrl ?? options.rootUrl,
      options.rootUrl
    );

    if (
      !requestedUrl ||
      !finalUrl ||
      !(await isSafeCrawlUrlResolved(requestedUrl, options.rootUrl, {
        allowLocal: options.allowLocal
      })) ||
      !(await isSafeCrawlUrlResolved(finalUrl, options.rootUrl, { allowLocal: options.allowLocal }))
    ) {
      errors.push({
        url: requestedUrl ?? finalUrl ?? options.rootUrl,
        message: "Skipped Firecrawl result outside allowed crawl scope."
      });
      continue;
    }

    const html = document.html ?? markdownToHtml(document.markdown ?? "");
    if (!html.trim()) {
      continue;
    }

    pages.push(
      SiteScanSchema.shape.pages.element.parse(
        extractPageSnapshot({
          html,
          requestedUrl,
          finalUrl,
          status: document.metadata?.statusCode ?? 200,
          contentType: document.html ? "text/html" : "text/plain"
        })
      )
    );
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

async function startFirecrawlCrawl(
  options: ScanOptions,
  apiKey: string
): Promise<FirecrawlResponse> {
  const response = await fetch(FIRECRAWL_API_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      url: options.rootUrl,
      limit: options.maxPages,
      scrapeOptions: {
        formats: ["html", "markdown"],
        onlyMainContent: false
      }
    })
  });

  return parseFirecrawlResponse(response);
}

async function resolveFirecrawlDocuments(
  response: FirecrawlResponse,
  apiKey: string
): Promise<FirecrawlDocument[]> {
  const immediate = getFirecrawlDocuments(response);
  if (immediate.length > 0) {
    return immediate;
  }

  if (!response.id) {
    throw new Error(response.error ?? "Firecrawl did not return crawl results.");
  }

  for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
    await sleep(POLL_INTERVAL_MS);
    const pollResponse = await fetch(`${FIRECRAWL_API_URL}/${encodeURIComponent(response.id)}`, {
      headers: {
        authorization: `Bearer ${apiKey}`
      }
    });
    const pollBody = await parseFirecrawlResponse(pollResponse);
    const documents = getFirecrawlDocuments(pollBody);
    if (documents.length > 0) {
      return documents;
    }
  }

  throw new Error("Firecrawl crawl did not finish before the local timeout.");
}

async function parseFirecrawlResponse(response: Response): Promise<FirecrawlResponse> {
  const body = (await response.json().catch(() => ({}))) as FirecrawlResponse;
  if (!response.ok || body.success === false) {
    throw new Error(body.error ?? `Firecrawl request failed with HTTP ${response.status}.`);
  }

  return body;
}

function getFirecrawlDocuments(response: FirecrawlResponse): FirecrawlDocument[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && !Array.isArray(response.data) && Array.isArray(response.data.data)) {
    return response.data.data;
  }

  return [];
}

function readFirecrawlApiKey(): string | undefined {
  const processLike = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return processLike.process?.env?.FIRECRAWL_API_KEY;
}

function markdownToHtml(markdown: string): string {
  return `<main>${escapeHtml(markdown)
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("")}</main>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
