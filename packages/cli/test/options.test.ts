import { describe, expect, it } from "vitest";
import { parseCrawler, parseHttpUrl, parsePositiveInteger } from "../src/options.js";

describe("CLI option parsers", () => {
  it("rejects non-absolute URLs with an actionable message", () => {
    expect(() => parseHttpUrl("example.com")).toThrow(
      'Invalid URL "example.com". Use an absolute http(s) URL',
    );
  });

  it("rejects non-http URLs with the unsupported protocol", () => {
    expect(() => parseHttpUrl("file:///tmp/site.html")).toThrow(
      'Unsupported URL protocol "file:". Use an absolute http(s) URL.',
    );
  });

  it("strips URL fragments without changing command behavior", () => {
    expect(parseHttpUrl("https://example.com/docs#pricing")).toBe(
      "https://example.com/docs",
    );
  });

  it("rejects invalid positive integer values with the provided value", () => {
    expect(() => parsePositiveInteger("0")).toThrow(
      'Invalid number "0". Use a whole number greater than 0.',
    );
  });

  it("parses supported crawler backends", () => {
    expect(parseCrawler("local")).toBe("local");
    expect(parseCrawler("firecrawl")).toBe("firecrawl");
  });

  it("rejects unsupported crawler backends", () => {
    expect(() => parseCrawler("remote")).toThrow(
      'Invalid crawler "remote". Use "local" or "firecrawl".',
    );
  });
});
