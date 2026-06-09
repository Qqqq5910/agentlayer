export class CliError extends Error {
  readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = "CliError";
    this.exitCode = exitCode;
  }
}

export function formatError(error: unknown): string {
  if (error instanceof CliError) {
    return `Error: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.stack ?? `Error: ${error.message}`;
  }

  return `Error: ${String(error)}`;
}
