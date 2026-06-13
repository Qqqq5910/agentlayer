import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version?: string };

export const packageVersion = packageJson.version ?? "0.2.0-alpha.2";
