import path from "node:path";
import { describe, expect, it } from "vitest";
import { getSafeArtifactTarget, normalizeArtifactPath, resolveJsonOutputPath } from "../src/io.js";

describe("CLI filesystem helpers", () => {
  it("resolves JSON output paths as either a file or directory", () => {
    expect(resolveJsonOutputPath("/work", undefined, "agentlayer-output", "scan.json")).toBe(
      path.join("/work", "agentlayer-output", "scan.json")
    );
    expect(resolveJsonOutputPath("/work", "report.json", ".", "agentlayer-report.json")).toBe(
      path.join("/work", "report.json")
    );
    expect(resolveJsonOutputPath("/work", "reports", ".", "agentlayer-report.json")).toBe(
      path.join("/work", "reports", "agentlayer-report.json")
    );
  });

  it("normalizes safe artifact paths", () => {
    expect(normalizeArtifactPath("/markdown\\index.md")).toBe("markdown/index.md");
  });

  it("rejects artifact path traversal", () => {
    expect(() => getSafeArtifactTarget("/tmp/out", "../secrets.txt")).toThrow(
      "Refusing to write unsafe artifact path"
    );
  });
});
