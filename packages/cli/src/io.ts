import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GeneratedArtifact } from "./coreTypes.js";
import { CliError, formatErrorMessage } from "./errors.js";

export type CliIo = {
  stdout(message: string): void;
  stderr(message: string): void;
  cwd(): string;
  setExitCode?(code: number): void;
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
  },
  setExitCode(code) {
    process.exitCode = code;
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

export async function readJsonFile<T>(filePath: string, description = "JSON file"): Promise<T> {
  let raw: string;

  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    throw new CliError(
      `Could not read ${description}: ${filePath}. Check that the file exists and is readable. ${formatErrorMessage(error)}`
    );
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new CliError(
      `Could not parse ${description}: ${filePath}. Fix the JSON syntax and try again. ${formatErrorMessage(error)}`
    );
  }
}

export async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  let json: string;

  try {
    json = `${JSON.stringify(value, null, 2)}\n`;
  } catch (error) {
    throw new CliError(
      `Could not serialize JSON output for ${filePath}: ${formatErrorMessage(error)}`
    );
  }

  try {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, json, "utf8");
  } catch (error) {
    throw new CliError(
      `Could not write JSON output to ${filePath}. Check that the path is writable and not a directory. ${formatErrorMessage(error)}`
    );
  }
}

export function resolvePath(cwd: string, inputPath: string): string {
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(cwd, inputPath);
}

export function resolveOutputDirectory(
  cwd: string,
  out: string | undefined,
  defaultDir: string
): string {
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
    throw new CliError(
      `Refusing unsafe artifact path "${artifactPath}". Artifact paths must be relative files inside the output directory.`
    );
  }

  return normalized;
}

export function getSafeArtifactTarget(outDir: string, artifactPath: string): string {
  const normalized = normalizeArtifactPath(artifactPath);
  const target = path.resolve(outDir, ...normalized.split("/"));
  const relative = path.relative(outDir, target);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new CliError(
      `Refusing to write artifact "${artifactPath}" outside output directory: ${outDir}`
    );
  }

  return target;
}

export async function writeArtifacts(
  outDir: string,
  artifacts: GeneratedArtifact[]
): Promise<Array<{ artifactPath: string; filePath: string }>> {
  const written: Array<{ artifactPath: string; filePath: string }> = [];

  for (const artifact of artifacts) {
    let artifactPath: string;
    let filePath: string | undefined;

    try {
      artifactPath = normalizeArtifactPath(artifact.path);
      filePath = getSafeArtifactTarget(outDir, artifactPath);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, artifact.content, "utf8");
    } catch (error) {
      if (error instanceof CliError) {
        throw error;
      }

      const target = filePath ? ` to ${filePath}` : "";
      throw new CliError(
        `Could not write artifact "${artifact.path}"${target}. Check output directory permissions. ${formatErrorMessage(error)}`
      );
    }

    written.push({ artifactPath, filePath });
  }

  return written;
}
