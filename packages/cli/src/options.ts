import { InvalidArgumentError } from "commander";

export function parsePositiveInteger(value: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new InvalidArgumentError(
      `Invalid number "${value}". Use a whole number greater than 0.`,
    );
  }

  return parsed;
}

export function parseHttpUrl(value: string): string {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new InvalidArgumentError(
      `Invalid URL "${value}". Use an absolute http(s) URL, for example https://example.com.`,
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new InvalidArgumentError(
      `Unsupported URL protocol "${parsed.protocol}". Use an absolute http(s) URL.`,
    );
  }

  parsed.hash = "";
  return parsed.toString();
}

export type CrawlCommandOptions = {
  out?: string;
  maxPages: number;
  timeoutMs: number;
  tasks?: string;
  json?: boolean;
};

export type InitFixtureOptions = {
  out?: string;
  force?: boolean;
  json?: boolean;
};
