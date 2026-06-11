import { createServer } from "node:http";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { runBaselineCommand, runCompareCommand } from "../src/commands.js";
import type { AgentLayerBaseline } from "../src/coreTypes.js";
import type { CliIo } from "../src/io.js";

const cleanup: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((action) => action()));
});

describe("AgentLayer CI command exit behavior", () => {
  it("writes a compact baseline file for a local target", async () => {
    const server = await startServer();
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "agentlayer-ci-"));
    const outputPath = path.join(tempDir, "agentlayer-baseline.json");
    const stdout: string[] = [];

    cleanup.push(() => rm(tempDir, { recursive: true, force: true }));
    cleanup.push(server.close);

    await runBaselineCommand(
      server.url,
      {
        out: outputPath,
        maxPages: 1,
        timeoutMs: 10000,
        allowLocal: true,
        crawler: "local"
      },
      {
        cwd: () => tempDir,
        stdout: (message) => stdout.push(message),
        stderr: () => undefined
      }
    );

    const baseline = JSON.parse(await readFile(outputPath, "utf8")) as AgentLayerBaseline;

    expect(stdout.join("\n")).toContain("AgentLayer baseline saved");
    expect(baseline.schemaVersion).toBe("agentlayer-baseline/v1");
    expect(baseline.targetUrl).toBe(server.url);
    expect(baseline.tasks.length).toBeGreaterThan(0);
    expect(JSON.stringify(baseline)).not.toContain("Revenue workspace for teams.");
  }, 15000);

  it("sets exit code 1 when compare blocking rules match", async () => {
    const server = await startServer();
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "agentlayer-ci-"));
    const baselinePath = path.join(tempDir, "agentlayer-baseline.json");
    const outputPath = path.join(tempDir, "agentlayer-compare.json");
    const stdout: string[] = [];
    let exitCode = 0;

    cleanup.push(() => rm(tempDir, { recursive: true, force: true }));
    cleanup.push(server.close);

    await writeFile(baselinePath, `${JSON.stringify(baselineFixture(server.url), null, 2)}\n`);

    const io: CliIo = {
      cwd: () => tempDir,
      stdout: (message) => stdout.push(message),
      stderr: () => undefined,
      setExitCode: (code) => {
        exitCode = code;
      }
    };

    await runCompareCommand(
      server.url,
      {
        baseline: baselinePath,
        out: outputPath,
        failOn: ["task-regression"],
        minScoreDelta: 5,
        maxPages: 1,
        timeoutMs: 10000,
        allowLocal: true,
        crawler: "local"
      },
      io
    );

    const comparison = JSON.parse(await readFile(outputPath, "utf8")) as {
      exitCode: number;
      blockingFailures: Array<{ id: string; type: string }>;
    };

    expect(exitCode).toBe(1);
    expect(stdout.join("\n")).toContain("Exit code: 1");
    expect(comparison.exitCode).toBe(1);
    expect(comparison.blockingFailures).toEqual([
      expect.objectContaining({
        id: "find_pricing",
        type: "task-regression"
      })
    ]);
  });
});

async function startServer(): Promise<{ url: string; close: () => Promise<void> }> {
  const server = createServer((_, response) => {
    response.setHeader("content-type", "text/html; charset=utf-8");
    response.end(`
      <!doctype html>
      <html>
        <head><title>AcmeFlow</title></head>
        <body>
          <main>
            <h1>AcmeFlow</h1>
            <p>Revenue workspace for teams.</p>
            <a href="/contact">Contact sales</a>
          </main>
        </body>
      </html>
    `);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not start local HTTP server for CLI test.");
  }

  return {
    url: `http://127.0.0.1:${address.port}/`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      })
  };
}

function baselineFixture(rootUrl: string): AgentLayerBaseline {
  return {
    schemaVersion: "agentlayer-baseline/v1",
    agentLayerVersion: "0.2.0-test",
    targetUrl: rootUrl,
    generatedAt: "2026-06-11T00:00:00.000Z",
    scanOptions: {
      rootUrl,
      maxPages: 1,
      timeoutMs: 10000,
      respectRobotsTxt: true,
      allowLocal: true,
      crawler: "local"
    },
    scores: {
      readability: 90,
      trustability: 90,
      actionability: 90,
      taskSuccess: 100,
      overall: 94
    },
    tasks: [
      {
        taskId: "find_pricing",
        title: "Find pricing",
        status: "pass",
        score: 100,
        missingInformation: [],
        recommendations: []
      }
    ],
    artifacts: [],
    counts: {
      facts: 1,
      actions: 1,
      forms: 0
    },
    acceptedFailures: []
  };
}
