import { describe, expect, it } from "vitest";
import type { AgentOperabilityReport } from "../src/coreTypes.js";
import { callGenerateArtifacts } from "../src/coreApi.js";

describe("core API adapters", () => {
  it("reports incompatible core function signatures concisely", async () => {
    const incompatibleGenerateArtifacts = (): never => {
      throw new Error("Expected object input");
    };

    await expect(
      callGenerateArtifacts(incompatibleGenerateArtifacts, {} as AgentOperabilityReport)
    ).rejects.toThrow(
      "Could not call @junyi5910/agentlayer-core generateArtifacts. This CLI may be paired with an incompatible core build."
    );
  });
});
