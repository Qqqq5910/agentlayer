import { describe, expect, it } from "vitest";
import { CliError } from "../src/errors.js";
import { createProgram } from "../src/program.js";

const silentIo = {
  cwd: () => process.cwd(),
  stdout: () => undefined,
  stderr: () => undefined
};

describe("CLI command syntax", () => {
  it("accepts the documented generate positional URL command without scanning", async () => {
    const captured = await parseCommand("generate", [
      "https://example.com",
      "--out",
      "./agentlayer-output",
      "--max-pages",
      "20"
    ]);

    expect(captured).toEqual({
      url: "https://example.com/",
      options: expect.objectContaining({
        out: "./agentlayer-output",
        maxPages: 20,
        timeoutMs: 10000,
        crawler: "local"
      })
    });
  });

  it("accepts the documented doctor positional URL command without scanning", async () => {
    const captured = await parseCommand("doctor", ["https://example.com", "--max-pages", "20"]);

    expect(captured).toEqual({
      url: "https://example.com/",
      options: expect.objectContaining({
        maxPages: 20,
        timeoutMs: 10000,
        crawler: "local"
      })
    });
  });

  it("accepts the baseline positional URL command with CI output options without scanning", async () => {
    const captured = await parseCommand("baseline", [
      "http://localhost:3000",
      "--out",
      "./agentlayer-baseline.json",
      "--allow-local"
    ]);

    expect(captured).toEqual({
      url: "http://localhost:3000/",
      options: expect.objectContaining({
        out: "./agentlayer-baseline.json",
        allowLocal: true
      })
    });
  });

  it("accepts the compare positional URL command with CI gating options without scanning", async () => {
    const captured = await parseCommand("compare", [
      "http://localhost:3000",
      "--baseline",
      "./agentlayer-baseline.json",
      "--out",
      "./agentlayer-compare.json",
      "--fail-on",
      "task-regression",
      "--fail-on",
      "score-drop",
      "--min-score-delta",
      "5",
      "--allow-local"
    ]);

    expect(captured).toEqual({
      url: "http://localhost:3000/",
      options: expect.objectContaining({
        baseline: "./agentlayer-baseline.json",
        out: "./agentlayer-compare.json",
        failOn: ["task-regression", "score-drop"],
        minScoreDelta: 5,
        allowLocal: true
      })
    });
  });

  it("surfaces compare CliError failures with exit code metadata", async () => {
    const program = createProgram(silentIo);
    const command = program.commands.find((candidate) => candidate.name() === "compare");

    expect(command, "compare command should be registered").toBeDefined();

    command?.action(() => {
      throw new CliError("Comparison failed: score dropped below threshold", 2);
    });

    await expect(
      program.parseAsync(
        [
          "compare",
          "https://example.com",
          "--baseline",
          "./agentlayer-baseline.json",
          "--out",
          "./agentlayer-compare.json",
          "--fail-on",
          "task-regression",
          "--min-score-delta",
          "5",
          "--allow-local"
        ],
        { from: "user" }
      )
    ).rejects.toMatchObject({
      name: "CliError",
      message: "Comparison failed: score dropped below threshold",
      exitCode: 2
    });
  });
});

type CliCommandName = "generate" | "doctor" | "baseline" | "compare";

async function parseCommand(
  commandName: CliCommandName,
  args: string[]
): Promise<{ url: string; options: Record<string, unknown> }> {
  const program = createProgram(silentIo);
  const command = program.commands.find((candidate) => candidate.name() === commandName);
  let captured: { url: string; options: Record<string, unknown> } | undefined;

  expect(command, `${commandName} command should be registered`).toBeDefined();

  command?.action((url: string, options: Record<string, unknown>) => {
    captured = { url, options };
  });

  await program.parseAsync([commandName, ...args], { from: "user" });

  expect(
    captured,
    `${commandName} command should parse without invoking its registered action`
  ).toBeDefined();
  return captured!;
}
