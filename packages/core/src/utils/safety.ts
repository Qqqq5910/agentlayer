import { isSameHostname, normalizePathname, normalizeUrl } from "./urls.js";

const UNSAFE_PATH_PATTERNS = [
  /\/(?:account|admin|billing|checkout|dashboard|login|logout|portal|settings|signin|signup)(?:\/|$)/i,
  /\/(?:cart|delete|remove|subscribe|unsubscribe)(?:\/|$)/i
];

const SKIPPED_EXTENSIONS = new Set([
  ".7z",
  ".avi",
  ".css",
  ".dmg",
  ".doc",
  ".docx",
  ".exe",
  ".gif",
  ".gz",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".mov",
  ".mp3",
  ".mp4",
  ".pdf",
  ".png",
  ".rar",
  ".svg",
  ".tar",
  ".webp",
  ".zip"
]);

export type RobotsRules = {
  disallow: string[];
  allow: string[];
};

export function isSafeCrawlUrl(candidate: string, rootUrl: string): boolean {
  const normalized = normalizeUrl(candidate);
  if (!normalized || !isSameHostname(normalized, rootUrl)) {
    return false;
  }

  const url = new URL(normalized);
  const path = normalizePathname(url.pathname);
  if (UNSAFE_PATH_PATTERNS.some((pattern) => pattern.test(path))) {
    return false;
  }

  const lastSegment = path.split("/").pop() ?? "";
  const extension = lastSegment.includes(".") ? `.${lastSegment.split(".").pop() ?? ""}`.toLowerCase() : "";
  return !SKIPPED_EXTENSIONS.has(extension);
}

export function parseRobotsTxt(text: string, userAgent = "AgentLayerBot"): RobotsRules {
  const lines = text.split(/\r?\n/);
  const matchingGroups: RobotsRules[] = [];
  let currentAgents: string[] = [];
  let currentRules: RobotsRules = { allow: [], disallow: [] };

  const flush = () => {
    if (currentAgents.length === 0) {
      return;
    }

    const applies = currentAgents.some((agent) => {
      const clean = agent.toLowerCase();
      return clean === "*" || userAgent.toLowerCase().includes(clean);
    });

    if (applies) {
      matchingGroups.push({
        allow: [...currentRules.allow],
        disallow: [...currentRules.disallow]
      });
    }
  };

  for (const line of lines) {
    const withoutComment = line.split("#")[0]?.trim() ?? "";
    if (!withoutComment) {
      continue;
    }

    const separatorIndex = withoutComment.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const field = withoutComment.slice(0, separatorIndex).trim().toLowerCase();
    const value = withoutComment.slice(separatorIndex + 1).trim();

    if (field === "user-agent") {
      if (currentAgents.length > 0 && (currentRules.allow.length > 0 || currentRules.disallow.length > 0)) {
        flush();
        currentAgents = [];
        currentRules = { allow: [], disallow: [] };
      }
      currentAgents.push(value);
      continue;
    }

    if (field === "allow") {
      currentRules.allow.push(value);
    }

    if (field === "disallow") {
      currentRules.disallow.push(value);
    }
  }

  flush();

  return matchingGroups.reduce<RobotsRules>(
    (combined, rules) => ({
      allow: [...combined.allow, ...rules.allow],
      disallow: [...combined.disallow, ...rules.disallow]
    }),
    { allow: [], disallow: [] }
  );
}

export function isAllowedByRobots(candidate: string, robotsText: string | undefined, userAgent?: string): boolean {
  if (!robotsText) {
    return true;
  }

  const path = normalizePathname(new URL(candidate).pathname);
  const rules = parseRobotsTxt(robotsText, userAgent);
  const allowMatch = longestMatchingRule(path, rules.allow);
  const disallowMatch = longestMatchingRule(path, rules.disallow.filter(Boolean));

  if (!disallowMatch) {
    return true;
  }

  if (!allowMatch) {
    return false;
  }

  return allowMatch.length >= disallowMatch.length;
}

function longestMatchingRule(path: string, rules: readonly string[]): string | null {
  let match: string | null = null;

  for (const rule of rules) {
    const cleanRule = normalizePathname(rule || "/");
    const normalizedRule = cleanRule === "/" && rule === "" ? "" : cleanRule;
    if (!normalizedRule) {
      continue;
    }

    if (path.startsWith(normalizedRule) && (!match || normalizedRule.length > match.length)) {
      match = normalizedRule;
    }
  }

  return match;
}
