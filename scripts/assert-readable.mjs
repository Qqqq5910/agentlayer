#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";

const criticalFiles = [
  "README.md",
  "README.zh-CN.md",
  "CHANGELOG.md",
  "docs/ci.md",
  "release-notes/v0.2.0-alpha.1.md",
  ".github/workflows/ci.yml",
  "package.json",
  "packages/core/package.json",
  "packages/cli/package.json",
  ".prettierrc.json",
  ".prettierignore",
  "packages/core/src/ci.ts",
  "packages/cli/src/program.ts",
  "apps/web/src/app/page.tsx",
  "apps/web/src/app/api/scan/route.ts"
];

const maxLineLength = 240;

function collapsedMessage(filePath) {
  return `File appears collapsed: ${filePath}. Rewrite it as readable multi-line source.`;
}

function splitLines(source) {
  const lines = source.split(/\r\n|\n|\r/);

  if (lines.at(-1) === "") {
    lines.pop();
  }

  return lines;
}

function minimumLineCount(filePath) {
  if (filePath.endsWith(".md")) {
    return 40;
  }

  if (filePath === ".github/workflows/ci.yml") {
    return 20;
  }

  if (filePath === "package.json" || filePath.endsWith("/package.json")) {
    return 10;
  }

  if (filePath === "packages/core/src/ci.ts") {
    return 80;
  }

  if (filePath === "packages/cli/src/program.ts") {
    return 80;
  }

  return undefined;
}

function hasPathSegment(filePath, segment) {
  return filePath.split("/").includes(segment);
}

function isLockfile(filePath) {
  return ["bun.lock", "bun.lockb", "package-lock.json", "pnpm-lock.yaml", "yarn.lock"].includes(
    path.posix.basename(filePath)
  );
}

function isGeneratedCompactJsonExample(filePath) {
  if (!filePath.endsWith(".json")) {
    return false;
  }

  const basename = path.posix.basename(filePath);
  const isExample = hasPathSegment(filePath, "examples") || hasPathSegment(filePath, "fixtures");
  const isGenerated =
    hasPathSegment(filePath, "generated") ||
    basename.includes("generated") ||
    basename.includes("compact");

  return isExample && isGenerated;
}

function isLongLineExemptFile(filePath) {
  return (
    filePath.endsWith(".svg") ||
    filePath.endsWith(".html") ||
    filePath.endsWith(".htm") ||
    hasPathSegment(filePath, "generated") ||
    isLockfile(filePath) ||
    isGeneratedCompactJsonExample(filePath)
  );
}

function summarizeLongLines(lines) {
  const longLines = [];

  lines.forEach((line, index) => {
    if (line.length > maxLineLength) {
      longLines.push(`${index + 1} (${line.length})`);
    }
  });

  return longLines;
}

const failures = [];
const repoRoot = process.cwd();

for (const filePath of criticalFiles) {
  let source;

  try {
    source = await readFile(path.join(repoRoot, filePath), "utf8");
  } catch (error) {
    failures.push(`Critical file missing or unreadable: ${filePath}. ${error.message}`);
    continue;
  }

  const lines = splitLines(source);
  const minLines = minimumLineCount(filePath);

  if (minLines !== undefined && lines.length < minLines) {
    failures.push(
      `${collapsedMessage(filePath)} Found ${lines.length} lines, expected at least ${minLines}.`
    );
  }

  if (!isLongLineExemptFile(filePath)) {
    const longLines = summarizeLongLines(lines);

    if (longLines.length > 0) {
      failures.push(
        `${collapsedMessage(filePath)} Lines over ${maxLineLength} chars: ${longLines.join(", ")}.`
      );
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Readability guard passed.");
