import * as cheerio from "cheerio";
import TurndownService from "turndown";

import { normalizeWhitespace, truncateText } from "../utils/text.js";

const turndown = new TurndownService({
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  headingStyle: "atx"
});

export function htmlToMarkdown(html: string, sourceUrl: string): string {
  const $ = cheerio.load(html);

  $("script, style, noscript, svg, canvas, iframe, form").remove();
  $("nav, footer, header").each((_, element) => {
    const text = normalizeWhitespace($(element).text());
    if (text.length > 0 && text.length < 1200) {
      $(element).remove();
    }
  });

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");
    if (!href) {
      return;
    }

    try {
      $(element).attr("href", new URL(href, sourceUrl).toString());
    } catch {
      $(element).removeAttr("href");
    }
  });

  const main = $("main").first();
  const bodyHtml = main.length > 0 ? main.html() : $("body").html();
  const markdown = turndown.turndown(bodyHtml ?? $.html());

  return cleanupMarkdown(markdown);
}

export function textToMarkdown(text: string): string {
  return cleanupMarkdown(text);
}

function cleanupMarkdown(markdown: string): string {
  const compact = markdown
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return truncateText(compact, 20000);
}
