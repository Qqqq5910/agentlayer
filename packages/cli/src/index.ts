#!/usr/bin/env node
import { formatError } from "./errors.js";
import { run } from "./program.js";

run().catch((error: unknown) => {
  console.error(formatError(error));
  process.exitCode = 1;
});
