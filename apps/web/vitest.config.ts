import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"]
  },
  resolve: {
    alias: {
      "@junyi5910/agentlayer-core": fileURLToPath(
        new URL("../../packages/core/src/index.ts", import.meta.url)
      )
    }
  }
});
