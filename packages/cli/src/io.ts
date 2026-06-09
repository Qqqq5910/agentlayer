import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GeneratedArtifact } from "./coreTypes.js";
import { CliError } from "./errors.js";

export type CliIo = {
  stdout(message: string): void;
  stderr(message: string): void;
  cwd(): string;
};

export const defaultIo: CliIo = {
  stdout(message) {
    console.log(message);
  },
  stderr(message) {
    console.error(message);
  },
  cwd() {
    return process.cwd();
  }
};

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function resolvePath(cwd: string, inputPath: string): string {
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(cwd, inputPath);
}

export function resolveOutputDirectory(cwd: string, out: string | undefined, defaultDir: string): string {
  return resolvePath(cwd, out ?? defaultDir);
}

export function resolveJsonOutputPath(
  cwd: string,
  out: string | undefined,
  defaultDir: string,
  defaultFilename: string
): string {
  if (!out) {
    return path.resolve(cwd, defaultDir, defaultFilename);
  }

  const resolved = resolvePath(cwd, out);
  return path.extname(resolved).toLowerCase() === ".json"
    ? resolved
    : path.join(resolved, defaultFilename);
}

export function resolveTaskSuiteOutputPath(cwd: string, out: string | undefined): string {
  if (!out) {
    return path.resolve(cwd, "examples", "tasks", "b2b-saas.default.json");
  }

  const resolved = resolvePath(cwd, out);
  return path.extname(resolved).toLowerCase() === ".json"
    ? resolved
    : path.join(resolved, "b2b-saas.default.json");
}

export function normalizeArtifactPath(artifactPath: string): string {
  const unixPath = artifactPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const normalized = path.posix.normalize(unixPath);

  if (
    normalized === "." ||
    normalized === "" ||
    normalized.startsWith("../") ||
    normalized === ".."
  ) {
    throw new CliError(`Refusing to write unsafe artifact path: ${artifactPath}`);
  }

  return normalized;
}

export function getSafeArtifactTarget(outDir: string, artifactPath: string): string {
  const normalized = normalizeArtifactPath(artifactPath);
  const target = path.resolve(outDir, ...normalized.split("/"));
  const relative = path.relative(outDir, target);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new CliError(`Refusing to write artifact outside output directory: ${artifactPath}`);
  }

  return target;
}

export async function writeArtifacts(
  outDir: string,
  artifacts: GeneratedArtifact[]
): Promise<Array<{ artifactPath: string; filePath: string }>> {
  const written: Array<{ artifactPath: string; filePath: string }> = [];

  for (const artifact of artifacts) {
    const artifactPath = normalizeArtifactPath(artifact.path);
    const filePath = getSafeArtifactTarget(outDir, artifactPath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, artifact.content, "utf8");
    written.push({ artifactPath, filePath });
  }

  return written;
}
