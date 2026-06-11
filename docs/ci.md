# AgentLayer CI Preview

AgentLayer CI v0.2 is a local-first preview for making agent-operability changes reviewable in pull
requests. It compares a known-good baseline report against a fresh scan of the same target, then
marks only configured regressions as blocking.

This is not a hosted CI service, not a production compliance claim, and not an automatic publishing
flow. The hosted demo remains read-only and uses the AcmeFlow fixture. Use local scans or owned
public URLs for CI.

## Local Usage

Install dependencies and build the workspace:

```bash
pnpm install
pnpm build
```

For the local fixture, start AcmeFlow in another terminal:

```bash
pnpm dev:example
```

Create a baseline for a known target:

```bash
pnpm agentlayer baseline http://localhost:3001 --out ./agentlayer-baseline.json --max-pages 20 --allow-local
```

Compare a later scan of the same target against that baseline:

```bash
pnpm agentlayer compare http://localhost:3001 --baseline ./agentlayer-baseline.json --out ./agentlayer-compare.json --fail-on task-regression --fail-on missing-artifact --max-pages 20 --allow-local
```

For a public site you own, omit `--allow-local`:

```bash
pnpm agentlayer baseline https://example.com --out ./agentlayer-baseline.json --max-pages 20
pnpm agentlayer compare https://example.com --baseline ./agentlayer-baseline.json --out ./agentlayer-compare.json --fail-on task-regression --max-pages 20
```

Keep committed baselines small, reviewable, and safe to share. Do not commit reports that contain
secrets, credentials, private URLs, personal data, unpublished customer details, or private fixture
content.

## Baseline Reports

`baseline` writes an `agentlayer-baseline/v1` JSON report. It records the target, AgentLayer
version, scan options, generated artifact inventory, score set, task results, and small inventory
counts.

Baseline reports are the reference point for review. Update the baseline only after the current site
behavior is intentionally accepted.

## Compare Reports

`compare` scans the target again, reads the baseline, and writes an `agentlayer-comparison/v1` JSON
report. The comparison includes:

- baseline and current scores for readability, trustability, actionability, task success, and
  overall score
- per-task baseline/current status and score deltas
- missing artifacts from the baseline inventory
- fact, action, and form count changes
- regressions, blocking failures, recommendations, and an `exitCode`

Use `--json` when a machine-readable stdout payload is needed in scripts.

## Blocking Rules

Blocking is opt-in through repeated `--fail-on` flags:

- `task-regression` blocks when a task that passed in the baseline is now partial, failed, or
  missing.
- `missing-artifact` blocks when an artifact present in the baseline is absent from the current
  generated artifact inventory.
- `score-drop` blocks only when the overall score drop is greater than `--min-score-delta`.

Example score-drop policy:

```bash
pnpm agentlayer compare https://example.com --baseline ./agentlayer-baseline.json --out ./agentlayer-compare.json --fail-on task-regression --fail-on score-drop --min-score-delta 5 --max-pages 20
```

Task score drops and count drops are reported as informational unless a future policy promotes them
to blocking. Accepted baseline failures should remain visible in the baseline rather than hidden in
CI logs.

## Output And Exit Behavior

`baseline` exits `0` when the scan and write succeed. Scan, parse, safety, or file-write failures
exit nonzero.

`compare` exits `0` when no configured blocking failures are found, even if the report includes
warnings or informational regressions. It exits `1` when configured blocking failures are found and
also writes `exitCode: 1` in the comparison report. Scan, parse, safety, or file-write failures exit
nonzero before a valid comparison report is available.

In GitHub Actions, upload the compare report with `if: always()` so maintainers can inspect the
reason for a failed check.

## GitHub Actions Workflow

```yaml
name: AgentLayer CI

on:
  pull_request:

jobs:
  agentlayer:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v6
        with:
          version: 11.4.0
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: >
          pnpm agentlayer compare http://localhost:3001 --baseline ./agentlayer-baseline.json
          --fail-on task-regression --allow-local
```

Replace `./agentlayer-baseline.json` with the committed baseline path for your project. Make sure
the target is reachable before the compare step runs. For real public targets, replace
`http://localhost:3001` with the owned URL and remove `--allow-local`.
