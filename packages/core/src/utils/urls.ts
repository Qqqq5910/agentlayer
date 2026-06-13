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
  "/plans",
  "/compare-plans",
  "/compare/plans",
  "/docs",
  "/documentation",
  "/api",
  "/developers",
  "/security",
  "/trust",
  "/trust-center",
  "/legal",
  "/privacy",
  "/terms",
  "/contact",
  "/sales",
  "/contact-sales",
  "/demo",
  "/book-demo",
  "/request-demo",
  "/support",
  "/help",
  "/integrations",
  "/connectors",
  "/customers",
  "/case-studies",
  "/faq",
  "/llms.txt"
];

const IMPORTANT_PATH_KEYWORDS = [
  "pricing",
  "plans",
  "compare",
  "docs",
  "documentation",
  "api",
  "developer",
  "security",
  "trust",
  "legal",
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

const LOW_SIGNAL_FIRST_SEGMENTS = new Set([
  "article",
  "articles",
  "blog",
  "blogs",
  "changelog",
  "changelogs",
  "guide",
  "guides",
  "learn",
  "news",
  "release",
  "releases",
  "release-notes",
  "resource",
  "resources",
  "updates"
]);

const DEEP_REFERENCE_SEGMENTS = new Set([
  "api-reference",
  "changelog",
  "changelogs",
  "reference",
  "references",
  "release-notes"
]);

const HIGH_SIGNAL_GROUPS = [
  {
    score: 96,
    tokens: ["pricing", "plans", "compare"]
  },
  {
    score: 94,
    tokens: ["security", "trust", "compliance"]
  },
  {
    score: 93,
    tokens: ["legal", "privacy", "terms"]
  },
  {
    score: 92,
    tokens: ["contact", "sales", "demo", "support", "help"]
  },
  {
    score: 91,
    tokens: ["docs", "documentation", "api", "developers", "developer"]
  },
  {
    score: 90,
    tokens: ["integrations", "integration", "connectors", "connector"]
  }
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

  if (
    (url.protocol === "https:" && url.port === "443") ||
    (url.protocol === "http:" && url.port === "80")
  ) {
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
  const unique = Array.from(
    new Set(
      Array.from(urls)
        .map((url) => normalizeUrl(url))
        .filter(Boolean) as string[]
    )
  );

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
  const path = normalizePathname(url.pathname).toLowerCase();
  const pathSegments = path.split("/").filter(Boolean);
  const tokens = pathTokens(pathSegments);

  if (url.toString() === root.toString() || path === "/") {
    return 100;
  }

  if (path.endsWith("/llms.txt")) {
    return 88;
  }

  const highSignalScore = highSignalPathScore(pathSegments, tokens);
  if (highSignalScore !== null) {
    return Math.max(
      0,
      highSignalScore -
        depthPenalty(pathSegments) -
        lowSignalContentPenalty(pathSegments) -
        deepReferencePenalty(pathSegments)
    );
  }

  const keywordScore = IMPORTANT_PATH_KEYWORDS.reduce(
    (score, keyword) => score + (path.includes(keyword) ? 5 : 0),
    0
  );

  return Math.max(
    0,
    35 +
      keywordScore -
      pathSegments.length * 3 -
      lowSignalContentPenalty(pathSegments) -
      deepReferencePenalty(pathSegments)
  );
}

export function isHighSignalTaskUrl(value: string, rootUrl: string): boolean {
  const normalized = normalizeUrl(value);
  if (!normalized) {
    return false;
  }

  const root = new URL(rootUrl);
  return urlPriority(normalized, root) >= 70;
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

function highSignalPathScore(
  pathSegments: readonly string[],
  tokens: readonly string[]
): number | null {
  if (isLowSignalContentPath(pathSegments)) {
    return null;
  }

  const firstSegmentTokens = pathSegments[0] ? tokenizePathSegment(pathSegments[0]) : [];
  for (const group of HIGH_SIGNAL_GROUPS) {
    if (group.tokens.some((token) => firstSegmentTokens.includes(token))) {
      return group.score;
    }
  }

  for (const group of HIGH_SIGNAL_GROUPS) {
    if (group.tokens.some((token) => tokens.includes(token))) {
      return group.score - 12;
    }
  }

  const firstSegment = pathSegments[0] ?? "";
  if (firstSegment === "customers" || firstSegment === "case-studies") {
    return 68;
  }

  if (firstSegment === "faq") {
    return 66;
  }

  return null;
}

function isLowSignalContentPath(pathSegments: readonly string[]): boolean {
  return LOW_SIGNAL_FIRST_SEGMENTS.has(pathSegments[0] ?? "");
}

function lowSignalContentPenalty(pathSegments: readonly string[]): number {
  return isLowSignalContentPath(pathSegments) ? 45 : 0;
}

function deepReferencePenalty(pathSegments: readonly string[]): number {
  if (pathSegments.length <= 2) {
    return 0;
  }

  return pathSegments.some((segment) => DEEP_REFERENCE_SEGMENTS.has(segment)) ? 20 : 0;
}

function depthPenalty(pathSegments: readonly string[]): number {
  return Math.max(0, pathSegments.length - 1) * 4;
}

function pathTokens(pathSegments: readonly string[]): string[] {
  return pathSegments.flatMap(tokenizePathSegment);
}

function tokenizePathSegment(segment: string): string[] {
  return segment.split(/[^a-z0-9]+/).filter(Boolean);
}
