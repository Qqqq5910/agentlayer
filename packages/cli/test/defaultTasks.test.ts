import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { getEmbeddedDefaultTasks } from "../src/defaultTasks.js";

describe("default B2B SaaS tasks", () => {
  it("matches the repository fixture exactly", async () => {
    const fixtureUrl = new URL("../../../examples/tasks/b2b-saas.default.json", import.meta.url);
    const fixture = JSON.parse(await readFile(fixtureUrl, "utf8"));

    expect(getEmbeddedDefaultTasks()).toEqual(fixture);
  });
});
