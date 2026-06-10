import * as dns from "node:dns/promises";
import net from "node:net";

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

export type UrlSafetyOptions = {
  allowLocal?: boolean;
};

export function isPublicHttpUrl(candidate: string, options: UrlSafetyOptions = {}): boolean {
  return getUnsafeUrlReason(candidate, options) === null;
}

export function assertPublicHttpUrl(candidate: string, options: UrlSafetyOptions = {}): void {
  const reason = getUnsafeUrlReason(candidate, options);
  if (reason) {
    throw new Error(`Blocked unsafe URL "${candidate}": ${reason}`);
  }
}

export async function isPublicHttpUrlResolved(candidate: string, options: UrlSafetyOptions = {}): Promise<boolean> {
  return (await getUnsafeUrlReasonResolved(candidate, options)) === null;
}

export async function assertPublicHttpUrlResolved(candidate: string, options: UrlSafetyOptions = {}): Promise<void> {
  const reason = await getUnsafeUrlReasonResolved(candidate, options);
  if (reason) {
    throw new Error(`Blocked unsafe URL "${candidate}": ${reason}`);
  }
}

export async function getUnsafeUrlReasonResolved(
  candidate: string,
  options: UrlSafetyOptions = {}
): Promise<string | null> {
  const staticReason = getUnsafeUrlReason(candidate, options);
  if (staticReason) {
    return staticReason;
  }

  if (options.allowLocal) {
    return null;
  }

  const hostname = hostnameFromUrl(candidate);
  if (!hostname || net.isIP(hostname) !== 0) {
    return null;
  }

  let records: Array<{ address: string; family: number }>;
  try {
    records = await dns.lookup(hostname, { all: true });
  } catch (error) {
    return `hostname could not be resolved: ${formatDnsError(error)}`;
  }

  if (records.length === 0) {
    return "hostname did not resolve to any address.";
  }

  const unsafeAddress = records.find((record) => isUnsafeIpAddress(record.address));
  if (unsafeAddress) {
    return `hostname resolves to a local, private, link-local, metadata, multicast, reserved, or internal address (${unsafeAddress.address}).`;
  }

  return null;
}

export function getUnsafeUrlReason(candidate: string, options: UrlSafetyOptions = {}): string | null {
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return "URL must be absolute.";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "only http(s) URLs can be scanned.";
  }

  const hostname = stripHostnameBrackets(url.hostname.toLowerCase());
  if (isMetadataHost(hostname)) {
    return "cloud metadata addresses cannot be scanned.";
  }

  if (options.allowLocal) {
    return null;
  }

  if (isUnsafeHostname(hostname)) {
    return "host resolves to a local, private, link-local, or internal address.";
  }

  return null;
}

export function isSafeCrawlUrl(candidate: string, rootUrl: string, options: UrlSafetyOptions = {}): boolean {
  const normalized = normalizeUrl(candidate);
  if (!normalized || !isPublicHttpUrl(normalized, options) || !isSameHostname(normalized, rootUrl)) {
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

export async function isSafeCrawlUrlResolved(
  candidate: string,
  rootUrl: string,
  options: UrlSafetyOptions = {}
): Promise<boolean> {
  const normalized = normalizeUrl(candidate);
  if (!normalized || !isSameHostname(normalized, rootUrl)) {
    return false;
  }

  if (!(await isPublicHttpUrlResolved(normalized, options))) {
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

function hostnameFromUrl(candidate: string): string | null {
  try {
    return stripHostnameBrackets(new URL(candidate).hostname.toLowerCase());
  } catch {
    return null;
  }
}

function stripHostnameBrackets(hostname: string): string {
  return hostname.startsWith("[") && hostname.endsWith("]") ? hostname.slice(1, -1) : hostname;
}

function isUnsafeHostname(hostname: string): boolean {
  const looksLikeIPv4 = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
  const looksLikeIPv6 = hostname.includes(":");

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan") ||
    (!looksLikeIPv4 && !looksLikeIPv6 && !hostname.includes("."))
  ) {
    return true;
  }

  if (isUnsafeIPv4(hostname) || isUnsafeIPv6(hostname)) {
    return true;
  }

  return false;
}

function isUnsafeIPv4(hostname: string): boolean {
  const match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    return false;
  }

  const octets = match.slice(1).map(Number);
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return true;
  }

  return isUnsafeIPv4Octets(octets);
}

function isUnsafeIPv4Octets(octets: number[]): boolean {
  const [first = 0, second = 0] = octets;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 0 && octets[2] === 2) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && octets[2] === 100) ||
    (first === 203 && second === 0 && octets[2] === 113) ||
    first >= 224
  );
}

function isMetadataHost(hostname: string): boolean {
  const mappedIPv4Octets = parseMappedIPv4Octets(hostname);
  return hostname === "169.254.169.254" || Boolean(mappedIPv4Octets && isMetadataIPv4Octets(mappedIPv4Octets));
}

function isMetadataIPv4Octets(octets: number[]): boolean {
  return octets[0] === 169 && octets[1] === 254 && octets[2] === 169 && octets[3] === 254;
}

function isUnsafeIPv6(hostname: string): boolean {
  if (!hostname.includes(":")) {
    return false;
  }

  const normalized = hostname.toLowerCase();
  const mappedIPv4Octets = parseMappedIPv4Octets(normalized);
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized === "0:0:0:0:0:0:0:1" ||
    (mappedIPv4Octets !== null && isUnsafeIPv4Octets(mappedIPv4Octets)) ||
    normalized.startsWith("100:") ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("ff") ||
    normalized.startsWith("2001:2:") ||
    normalized.startsWith("2001:db8:") ||
    normalized.startsWith("2001:10:")
  );
}

function isUnsafeIpAddress(address: string): boolean {
  const hostname = stripHostnameBrackets(address.toLowerCase());
  return isUnsafeIPv4(hostname) || isUnsafeIPv6(hostname) || isMetadataHost(hostname);
}

function formatDnsError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "unknown DNS error";
}

function parseMappedIPv4Octets(hostname: string): number[] | null {
  const match = hostname.match(/^(?:::ffff:|0:0:0:0:0:ffff:)([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (!match) {
    return null;
  }

  const high = Number.parseInt(match[1] ?? "", 16);
  const low = Number.parseInt(match[2] ?? "", 16);
  if (!Number.isInteger(high) || !Number.isInteger(low)) {
    return null;
  }

  return [(high >> 8) & 255, high & 255, (low >> 8) & 255, low & 255];
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
