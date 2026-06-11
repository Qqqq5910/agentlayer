import { InvalidArgumentError } from "commander";

export function parsePositiveInteger(value: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new InvalidArgumentError(`Invalid number "${value}". Use a whole number greater than 0.`);
  }

  return parsed;
}

export function parseHttpUrl(value: string): string {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new InvalidArgumentError(
      `Invalid URL "${value}". Use an absolute http(s) URL, for example https://example.com.`
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new InvalidArgumentError(
      `Unsupported URL protocol "${parsed.protocol}". Use an absolute http(s) URL.`
    );
  }

  parsed.hash = "";
  return parsed.toString();
}

export function parseCrawler(value: string): "local" | "firecrawl" {
  if (value === "local" || value === "firecrawl") {
    return value;
  }

  throw new InvalidArgumentError(`Invalid crawler "${value}". Use "local" or "firecrawl".`);
}

export type BlockingRule = "task-regression" | "missing-artifact" | "score-drop";

export function collectBlockingRules(value: string, previous: BlockingRule[] = []): BlockingRule[] {
  const rules = value.split(",").map((rule) => rule.trim());
  const parsed: BlockingRule[] = [];

  for (const rule of rules) {
    if (rule !== "task-regression" && rule !== "missing-artifact" && rule !== "score-drop") {
      throw new InvalidArgumentError(
        `Invalid blocking rule "${rule}". Use task-regression, missing-artifact, or score-drop.`
      );
    }

    parsed.push(rule);
  }

  return [...previous, ...parsed];
}

export type CrawlCommandOptions = {
  out?: string;
  maxPages: number;
  timeoutMs: number;
  allowLocal?: boolean;
  crawler: "local" | "firecrawl";
  tasks?: string;
  json?: boolean;
};

export type CompareCommandOptions = CrawlCommandOptions & {
  baseline: string;
  failOn?: BlockingRule[];
  minScoreDelta: number;
};

export type InitFixtureOptions = {
  out?: string;
  force?: boolean;
  json?: boolean;
};
