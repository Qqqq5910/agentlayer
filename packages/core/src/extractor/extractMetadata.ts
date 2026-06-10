import * as cheerio from "cheerio";

import type { PageSnapshot } from "../schemas.js";
import { classifyPage } from "../scanner/pageClassifier.js";
import { cleanText, extractEmails, normalizeWhitespace, uniqueStrings } from "../utils/text.js";
import { isSameHostname, normalizeUrl } from "../utils/urls.js";
import { extractForms } from "./extractForms.js";
import { htmlToMarkdown, textToMarkdown } from "./htmlToMarkdown.js";

type SnapshotInput = {
  html: string;
  requestedUrl: string;
  finalUrl: string;
  status?: number;
  contentType?: string;
};

export function extractPageSnapshot(input: SnapshotInput): PageSnapshot {
  const fetchedAt = new Date().toISOString();

  if (!input.contentType?.includes("html") && looksLikePlainText(input.html, input.finalUrl)) {
    const text = normalizeWhitespace(input.html);
    const markdown = textToMarkdown(input.html);
    return {
      url: input.requestedUrl,
      finalUrl: input.finalUrl,
      title: titleFromTextUrl(input.finalUrl),
      description: undefined,
      canonicalUrl: undefined,
      status: input.status,
      pageType: classifyPage({ url: input.finalUrl, title: titleFromTextUrl(input.finalUrl), text }),
      headings: { h1: [], h2: [], h3: [] },
      links: [],
      forms: [],
      jsonLd: [],
      openGraph: {},
      visibleText: text,
      markdown,
      emails: extractEmails(text),
      socialLinks: [],
      fetchedAt
    };
  }

  const $ = cheerio.load(input.html);
  const title = cleanText($("title").first().text()) || undefined;
  const description =
    cleanText($('meta[name="description"]').attr("content") ?? $('meta[property="og:description"]').attr("content")) ||
    undefined;
  const canonical = normalizeUrl($('link[rel="canonical"]').attr("href") ?? "", input.finalUrl) ?? undefined;
  const headings = {
    h1: extractHeadings($, "h1"),
    h2: extractHeadings($, "h2"),
    h3: extractHeadings($, "h3")
  };
  const openGraph = extractOpenGraph($);
  const visibleText = extractVisibleText($);
  const links = extractLinks($, input.finalUrl);
  const forms = extractForms($, input.finalUrl);
  const jsonLd = extractJsonLd($);
  const socialLinks = links
    .map((link) => link.href)
    .filter((href) => /(?:linkedin|twitter|x\.com|github|youtube|facebook|instagram)\.com/i.test(href));

  return {
    url: input.requestedUrl,
    finalUrl: input.finalUrl,
    title,
    description,
    canonicalUrl: canonical,
    status: input.status,
    pageType: classifyPage({
      url: input.finalUrl,
      title,
      description,
      headings,
      text: visibleText
    }),
    headings,
    links,
    forms,
    jsonLd,
    openGraph,
    visibleText,
    markdown: htmlToMarkdown(input.html, input.finalUrl),
    emails: extractEmails(visibleText),
    socialLinks: uniqueStrings(socialLinks),
    fetchedAt
  };
}

function extractHeadings($: cheerio.CheerioAPI, selector: "h1" | "h2" | "h3"): string[] {
  return uniqueStrings(
    $(selector)
      .map((_, element) => cleanText($(element).text()))
      .get()
  );
}

function extractLinks($: cheerio.CheerioAPI, sourceUrl: string): PageSnapshot["links"] {
  return $("a[href]")
    .map((_, element) => {
      const href = normalizeUrl($(element).attr("href") ?? "", sourceUrl);
      if (!href) {
        return null;
      }

      return {
        href,
        text: cleanText($(element).text() || $(element).attr("aria-label")),
        isExternal: !isSameHostname(href, sourceUrl)
      };
    })
    .get()
    .filter((link): link is PageSnapshot["links"][number] => Boolean(link));
}

function extractOpenGraph($: cheerio.CheerioAPI): Record<string, string> {
  const metadata: Record<string, string> = {};

  $('meta[property^="og:"], meta[name^="twitter:"]').each((_, element) => {
    const key = cleanText($(element).attr("property") ?? $(element).attr("name"));
    const value = cleanText($(element).attr("content"));
    if (key && value) {
      metadata[key] = value;
    }
  });

  return metadata;
}

function extractJsonLd($: cheerio.CheerioAPI): unknown[] {
  return $('script[type="application/ld+json"]')
    .map((_, element) => {
      const raw = $(element).contents().text();
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        return null;
      }
    })
    .get()
    .filter((value): value is unknown => value !== null);
}

function extractVisibleText($: cheerio.CheerioAPI): string {
  const clone = $.root().clone();
  clone.find("script, style, noscript, svg, canvas, iframe").remove();
  return normalizeWhitespace(clone.text());
}

function looksLikePlainText(content: string, url: string): boolean {
  return !/<html|<!doctype|<body|<main|<div/i.test(content) || new URL(url).pathname.endsWith(".txt");
}

function titleFromTextUrl(url: string): string {
  const pathname = new URL(url).pathname;
  return pathname.split("/").filter(Boolean).pop() || "index";
}
