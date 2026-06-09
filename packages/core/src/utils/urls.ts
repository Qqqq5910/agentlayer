import { slugify } from "./text.js";

const DEFAULT_PROTOCOL = "https:";
const TRACKING_PARAMS = new Set([
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "utm_campaign",
  "utm_content",
  "utm_medium",
  "utm_source",
  "utm_term"
]);

const IMPORTANT_PATHS = [
  "/",
  "/pricing",
  "/docs",
  "/documentation",
  "/api",
  "/developers",
  "/security",
  "/trust",
  "/privacy",
  "/terms",
  "/contact",
  "/sales",
  "/demo",
  "/support",
  "/help",
  "/integrations",
  "/customers",
  "/case-studies",
  "/faq",
  "/llms.txt"
];

const IMPORTANT_PATH_KEYWORDS = [
  "pricing",
  "docs",
  "documentation",
  "api",
  "developer",
  "security",
  "trust",
  "privacy",
  "terms",
  "contact",
  "sales",
  "demo",
  "support",
  "help",
  "integration",
  "customer",
  "case-stud",
  "faq",
  "llms"
];

export function normalizeUrl(input: string, baseUrl?: string): string | null {
  const raw = input.trim();
  if (!raw || raw.startsWith("#")) {
    return null;
  }

  if (/^(mailto|tel|javascript|data):/i.test(raw)) {
    return null;
  }

  let url: URL;
  try {
    if (/^\/\//.test(raw)) {
      const protocol = baseUrl ? new URL(baseUrl).protocol : DEFAULT_PROTOCOL;
      url = new URL(`${protocol}${raw}`);
    } else if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
      url = new URL(raw);
    } else if (baseUrl) {
      url = new URL(raw, baseUrl);
    } else {
      url = new URL(`https://${raw}`);
    }
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return null;
  }

  url.hash = "";
  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();

  if ((url.protocol === "https:" && url.port === "443") || (url.protocol === "http:" && url.port === "80")) {
    url.port = "";
  }

  const sortedParams = new URLSearchParams();
  Array.from(url.searchParams.entries())
    .filter(([key]) => !TRACKING_PARAMS.has(key.toLowerCase()))
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, value]) => sortedParams.append(key, value));
  url.search = sortedParams.toString();

  url.pathname = normalizePathname(url.pathname);
  return url.toString();
}

export function normalizeRootUrl(input: string): string {
  const normalized = normalizeUrl(input);
  if (!normalized) {
    throw new Error(`Invalid URL: ${input}`);
  }

  return normalized;
}

export function normalizePathname(pathname: string): string {
  const decoded = pathname || "/";
  const collapsed = decoded.replace(/\/{2,}/g, "/");
  if (collapsed === "/") {
    return "/";
  }

  return collapsed.replace(/\/+$/g, "");
}

export function isSameHostname(candidate: string, rootUrl: string): boolean {
  try {
    return new URL(candidate).hostname.toLowerCase() === new URL(rootUrl).hostname.toLowerCase();
  } catch {
    return false;
  }
}

export function importantSeedUrls(rootUrl: string): string[] {
  const root = new URL(rootUrl);
  return IMPORTANT_PATHS.map((path) => normalizeUrl(path, root.toString())).filter(
    (url): url is string => Boolean(url)
  );
}

export function sortUrlsByPriority(urls: Iterable<string>, rootUrl: string): string[] {
  const root = new URL(rootUrl);
  const unique = Array.from(new Set(Array.from(urls).map((url) => normalizeUrl(url)).filter(Boolean) as string[]));

  return unique.sort((left, right) => {
    const leftScore = urlPriority(left, root);
    const rightScore = urlPriority(right, root);
    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    return left.localeCompare(right);
  });
}

export function urlPriority(value: string, root: URL): number {
  const url = new URL(value);
  const path = url.pathname.toLowerCase();

  if (url.toString() === root.toString() || path === "/") {
    return 100;
  }

  const keywordScore = IMPORTANT_PATH_KEYWORDS.reduce(
    (score, keyword) => score + (path.includes(keyword) ? 8 : 0),
    0
  );
  const depthPenalty = path.split("/").filter(Boolean).length * 2;

  return Math.max(0, 40 + keywordScore - depthPenalty);
}

export function pageMarkdownPath(pageUrl: string, rootUrl: string): string {
  const url = new URL(pageUrl);
  const root = new URL(rootUrl);
  const path = normalizePathname(url.pathname);

  if (url.hostname !== root.hostname) {
    return `markdown/${slugify(url.hostname + path)}.md`;
  }

  if (path === "/") {
    return "markdown/index.md";
  }

  return `markdown/${slugify(path)}.md`;
}

export function displayUrlPath(value: string): string {
  const url = new URL(value);
  return `${url.pathname}${url.search}` || "/";
}
