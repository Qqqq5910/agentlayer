import type { AgentTask } from "./coreTypes.js";
import type { CoreApi } from "./coreApi.js";
import { getCoreDefaultTasks } from "./coreApi.js";
import { getEmbeddedDefaultTasks } from "./defaultTasks.js";
import { CliError } from "./errors.js";
import { readJsonFile, resolvePath } from "./io.js";

export async function loadTasks(
  core: CoreApi,
  tasksPath: string | undefined,
  cwd: string
): Promise<AgentTask[]> {
  if (tasksPath) {
    const resolvedPath = resolvePath(cwd, tasksPath);
    const tasks = await readJsonFile<unknown>(resolvedPath);
    return validateTasks(tasks, resolvedPath);
  }

  const coreTasks = await getCoreDefaultTasks(core);
  return coreTasks ?? getEmbeddedDefaultTasks();
}

export function validateTasks(value: unknown, sourceName: string): AgentTask[] {
  if (!Array.isArray(value)) {
    throw new CliError(`Task suite must be a JSON array: ${sourceName}`);
  }

  return value.map((task, index) => validateTask(task, index, sourceName));
}

function validateTask(value: unknown, index: number, sourceName: string): AgentTask {
  if (!isRecord(value)) {
    throw new CliError(`Task at index ${index} must be an object: ${sourceName}`);
  }

  const { id, title, description, requiredEvidence } = value;

  if (typeof id !== "string" || id.trim() === "") {
    throw new CliError(`Task at index ${index} is missing a string id: ${sourceName}`);
  }

  if (typeof title !== "string" || title.trim() === "") {
    throw new CliError(`Task ${id} is missing a string title: ${sourceName}`);
  }

  if (typeof description !== "string" || description.trim() === "") {
    throw new CliError(`Task ${id} is missing a string description: ${sourceName}`);
  }

  if (
    !Array.isArray(requiredEvidence) ||
    requiredEvidence.some((entry) => typeof entry !== "string" || entry.trim() === "")
  ) {
    throw new CliError(`Task ${id} must include requiredEvidence as a string array: ${sourceName}`);
  }

  return {
    id,
    title,
    description,
    requiredEvidence: [...requiredEvidence]
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
