import { Command } from "commander";
import {
  runBaselineCommand,
  runCompareCommand,
  runDoctorCommand,
  runGenerateCommand,
  runInitFixtureCommand,
  runScanCommand,
  runTestCommand
} from "./commands.js";
import type { CliIo } from "./io.js";
import { defaultIo } from "./io.js";
import type { CompareCommandOptions, CrawlCommandOptions, InitFixtureOptions } from "./options.js";
import {
  collectBlockingRules,
  parseCrawler,
  parseHttpUrl,
  parsePositiveInteger
} from "./options.js";
import { packageVersion } from "./version.js";

export function createProgram(io: CliIo = defaultIo): Command {
  const program = new Command();

  program
    .name("agentlayer")
    .description(
      "Deterministic CLI for scanning and generating AgentLayer artifacts for agent-operable websites."
    )
    .version(packageVersion)
    .showHelpAfterError()
    .addHelpText(
      "after",
      `

Examples:
  $ agentlayer scan https://example.com --out ./agentlayer-output --max-pages 20
  $ agentlayer generate https://example.com --out ./agentlayer-output
  $ agentlayer baseline https://example.com --out ./agentlayer-baseline.json
  $ agentlayer compare https://example.com --baseline ./agentlayer-baseline.json --fail-on task-regression
  $ agentlayer test https://example.com --tasks ./examples/tasks/b2b-saas.default.json --out ./agentlayer-report.json
  $ agentlayer doctor https://example.com
  $ agentlayer init-fixture --out ./examples/tasks
`
    );

  program
    .command("scan")
    .description("Scan a website and write the raw JSON scan result.")
    .argument("<url>", "Root http(s) URL to scan.", parseHttpUrl)
    .option("--out <path>", "Output directory or .json file path.", "agentlayer-output")
    .option("--max-pages <number>", "Maximum same-host pages to scan.", parsePositiveInteger, 20)
    .option(
      "--timeout-ms <number>",
      "Per-request timeout in milliseconds.",
      parsePositiveInteger,
      10000
    )
    .option("--allow-local", "Allow localhost and private-network URLs.")
    .option(
      "--crawler <name>",
      "Crawler backend to use: local or firecrawl.",
      parseCrawler,
      "local"
    )
    .option("--json", "Print machine-readable JSON to stdout.")
    .action((url: string, options: CrawlCommandOptions) => runScanCommand(url, options, io));

  program
    .command("generate")
    .description(
      "Scan a website, build a report, and write generated AgentLayer artifacts recursively."
    )
    .argument("<url>", "Root http(s) URL to scan.", parseHttpUrl)
    .option("--out <dir>", "Output directory for generated artifacts.", "agentlayer-output")
    .option("--max-pages <number>", "Maximum same-host pages to scan.", parsePositiveInteger, 20)
    .option(
      "--timeout-ms <number>",
      "Per-request timeout in milliseconds.",
      parsePositiveInteger,
      10000
    )
    .option("--allow-local", "Allow localhost and private-network URLs.")
    .option(
      "--crawler <name>",
      "Crawler backend to use: local or firecrawl.",
      parseCrawler,
      "local"
    )
    .option("--tasks <path>", "JSON task suite to use instead of the default B2B SaaS suite.")
    .option("--json", "Print machine-readable JSON to stdout.")
    .action((url: string, options: CrawlCommandOptions) => runGenerateCommand(url, options, io));

  program
    .command("baseline")
    .description("Scan a website and save a compact AgentLayer CI baseline.")
    .argument("<url>", "Root http(s) URL to scan.", parseHttpUrl)
    .option("--out <path>", "Output .json file path.", "agentlayer-baseline.json")
    .option("--max-pages <number>", "Maximum same-host pages to scan.", parsePositiveInteger, 20)
    .option(
      "--timeout-ms <number>",
      "Per-request timeout in milliseconds.",
      parsePositiveInteger,
      10000
    )
    .option("--allow-local", "Allow localhost and private-network URLs.")
    .option(
      "--crawler <name>",
      "Crawler backend to use: local or firecrawl.",
      parseCrawler,
      "local"
    )
    .option("--tasks <path>", "JSON task suite to use instead of the default B2B SaaS suite.")
    .option("--json", "Print machine-readable JSON to stdout.")
    .action((url: string, options: CrawlCommandOptions) => runBaselineCommand(url, options, io));

  program
    .command("compare")
    .description("Compare the current scan against an AgentLayer CI baseline.")
    .argument("<url>", "Root http(s) URL to scan.", parseHttpUrl)
    .requiredOption("--baseline <path>", "AgentLayer baseline JSON file to compare against.")
    .option("--out <path>", "Output .json file path.", "agentlayer-compare.json")
    .option("--max-pages <number>", "Maximum same-host pages to scan.", parsePositiveInteger, 20)
    .option(
      "--timeout-ms <number>",
      "Per-request timeout in milliseconds.",
      parsePositiveInteger,
      10000
    )
    .option("--allow-local", "Allow localhost and private-network URLs.")
    .option(
      "--crawler <name>",
      "Crawler backend to use: local or firecrawl.",
      parseCrawler,
      "local"
    )
    .option("--tasks <path>", "JSON task suite to use instead of the default B2B SaaS suite.")
    .option(
      "--fail-on <rule>",
      "Blocking rule: task-regression, missing-artifact, or score-drop. Repeat or comma-separate.",
      collectBlockingRules,
      []
    )
    .option(
      "--min-score-delta <number>",
      "Minimum overall score drop for --fail-on score-drop.",
      parsePositiveInteger,
      5
    )
    .option("--json", "Print machine-readable JSON to stdout.")
    .action((url: string, options: CompareCommandOptions) => runCompareCommand(url, options, io));

  program
    .command("test")
    .description("Run deterministic agent task success checks against a website.")
    .argument("<url>", "Root http(s) URL to scan.", parseHttpUrl)
    .option("--out <path>", "Output directory or .json file path.", "agentlayer-report.json")
    .option("--max-pages <number>", "Maximum same-host pages to scan.", parsePositiveInteger, 20)
    .option(
      "--timeout-ms <number>",
      "Per-request timeout in milliseconds.",
      parsePositiveInteger,
      10000
    )
    .option("--allow-local", "Allow localhost and private-network URLs.")
    .option(
      "--crawler <name>",
      "Crawler backend to use: local or firecrawl.",
      parseCrawler,
      "local"
    )
    .option("--tasks <path>", "JSON task suite to use instead of the default B2B SaaS suite.")
    .option("--json", "Print machine-readable JSON to stdout.")
    .action((url: string, options: CrawlCommandOptions) => runTestCommand(url, options, io));

  program
    .command("doctor")
    .description("Print a quick AgentLayer readiness diagnosis for a website.")
    .argument("<url>", "Root http(s) URL to scan.", parseHttpUrl)
    .option(
      "--out <path>",
      "Optional output directory or .json file path for the doctor diagnosis."
    )
    .option("--max-pages <number>", "Maximum same-host pages to scan.", parsePositiveInteger, 20)
    .option(
      "--timeout-ms <number>",
      "Per-request timeout in milliseconds.",
      parsePositiveInteger,
      10000
    )
    .option("--allow-local", "Allow localhost and private-network URLs.")
    .option(
      "--crawler <name>",
      "Crawler backend to use: local or firecrawl.",
      parseCrawler,
      "local"
    )
    .option("--tasks <path>", "JSON task suite to use instead of the default B2B SaaS suite.")
    .option("--json", "Print machine-readable JSON to stdout.")
    .action((url: string, options: CrawlCommandOptions) => runDoctorCommand(url, options, io));

  program
    .command("init-fixture")
    .description("Create the default B2B SaaS task-suite fixture JSON.")
    .option("--out <path>", "Output directory or .json file path.", "examples/tasks")
    .option("--force", "Overwrite an existing task suite file.")
    .option("--json", "Print machine-readable JSON to stdout.")
    .action((options: InitFixtureOptions) => runInitFixtureCommand(options, io));

  return program;
}

export async function run(argv: string[] = process.argv, io: CliIo = defaultIo): Promise<void> {
  await createProgram(io).parseAsync(argv);
}
