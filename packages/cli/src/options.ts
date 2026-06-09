import { InvalidArgumentError } from "commander";

export function parsePositiveInteger(value: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new InvalidArgumentError("Expected a positive integer.");
  }

  return parsed;
}

export function parseHttpUrl(value: string): string {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new InvalidArgumentError("Expected a valid absolute URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new InvalidArgumentError("Expected an http or https URL.");
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
