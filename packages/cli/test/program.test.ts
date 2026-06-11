import { describe, expect, it } from "vitest";
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
});

async function parseCommand(
  commandName: "generate" | "doctor",
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
    `${commandName} command should parse without invoking its scan action`
  ).toBeDefined();
  return captured!;
}
