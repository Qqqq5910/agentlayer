import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { CoreApi } from "../src/coreApi.js";
import { loadTasks, validateTasks } from "../src/tasks.js";

describe("task suite loading", () => {
  it("reports missing task JSON with the resolved path", async () => {
    const cwd = await mkdtemp(path.join(os.tmpdir(), "agentlayer-cli-"));
    const taskPath = path.join(cwd, "missing.json");

    await expect(loadTasks({} satisfies CoreApi, taskPath, cwd)).rejects.toThrow(
      `Could not read task suite JSON: ${taskPath}`
    );
  });

  it("reports malformed task JSON with the resolved path", async () => {
    const cwd = await mkdtemp(path.join(os.tmpdir(), "agentlayer-cli-"));
    const taskPath = path.join(cwd, "tasks.json");
    await writeFile(taskPath, "{", "utf8");

    await expect(loadTasks({} satisfies CoreApi, taskPath, cwd)).rejects.toThrow(
      `Could not parse task suite JSON: ${taskPath}`
    );
  });

  it("reports task schema failures as invalid task suites", () => {
    expect(() => validateTasks([{ id: "signup" }], "tasks.json")).toThrow(
      'Invalid task suite tasks.json: task "signup" is missing a non-empty string title.'
    );
  });
});
