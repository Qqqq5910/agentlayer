export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function cleanText(value: string | undefined | null): string {
  return normalizeWhitespace(value ?? "");
}

export function truncateText(value: string, maxLength: number): string {
  const clean = normalizeWhitespace(value);
  if (clean.length <= maxLength) {
    return clean;
  }

  return `${clean.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

export function uniqueStrings(values: Iterable<string>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const clean = normalizeWhitespace(value);
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(clean);
  }

  return result;
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "item";
}

export function includesAny(value: string, keywords: readonly string[]): boolean {
  const haystack = value.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

export function countKeywordHits(value: string, keywords: readonly string[]): number {
  const haystack = value.toLowerCase();
  return keywords.reduce(
    (count, keyword) => count + (haystack.includes(keyword.toLowerCase()) ? 1 : 0),
    0
  );
}

export function extractEmails(value: string): string[] {
  const matches = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  return uniqueStrings(matches.map((email) => email.toLowerCase()));
}

export function snippetAround(value: string, keywords: readonly string[], maxLength = 220): string {
  const clean = normalizeWhitespace(value);
  const lower = clean.toLowerCase();
  const keyword = keywords.find((candidate) => lower.includes(candidate.toLowerCase()));

  if (!keyword) {
    return truncateText(clean, maxLength);
  }

  const index = lower.indexOf(keyword.toLowerCase());
  const start = Math.max(0, index - Math.floor(maxLength / 3));
  const end = Math.min(clean.length, start + maxLength);
  return truncateText(clean.slice(start, end), maxLength);
}

export function dedupeBy<T>(values: readonly T[], keyFor: (value: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const value of values) {
    const key = keyFor(value).toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(value);
  }

  return result;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
