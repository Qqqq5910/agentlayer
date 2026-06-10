# AgentLayer CI Roadmap Foundation

This document captures the v0.2 foundation for AgentLayer CI. It is a roadmap note for future work,
not a claim that CI reporting, PR gating, or score-based regression checks are implemented today.

## Goal

AgentLayer CI should make agent-operability changes reviewable in pull requests. The first version
should stay small: generate a baseline report, compare later scans against that report, and fail
only on clear task-level regressions that the project has chosen to block.

## Baseline Report

A baseline report is the reference snapshot for a site or fixture set. It should record the command,
target, AgentLayer version, relevant configuration, task results, artifact paths, and aggregate
scores.

The baseline should be committed or stored as a CI artifact only when it is safe to share. Reports
must not include secrets, credentials, private URLs, personal data, or unpublished customer details.

Suggested baseline fields:

- target URL or fixture name
- AgentLayer version or commit
- scan command and configuration
- generated artifact inventory
- task result summary
- aggregate score and per-task scores
- known accepted failures with owner notes

## PR Regression Check

The PR check should run the same scan configuration used for the baseline and compare the new report
to the reference report. The output should be readable in GitHub Actions logs and, later, suitable
for a PR comment.

The check should identify:

- score changes from baseline to PR
- newly missing standards artifacts
- newly failed tasks
- tasks that changed from passing or accepted to failing
- report metadata drift, such as a different target or incompatible schema

The first implementation should avoid broad product claims. It should answer a small review
question: did this PR make a known scan target worse?

## GitHub Action

The planned GitHub Action should provide a thin wrapper around AgentLayer scan and compare commands.
It should be usable from a workflow without requiring teams to write custom parsing scripts.

Expected inputs for a future action:

- `target`: public URL or fixture target to scan
- `baseline`: path to the baseline report
- `output`: path for the PR report
- `fail-on`: blocking policy, such as `task-failure` or `score-drop`
- `min-score-delta`: optional threshold for score regressions

Expected outputs:

- PR report path
- score diff summary
- blocking failure count
- machine-readable comparison result

## Score Diff

Score diff should be explicit and conservative. A lower score should not block a PR unless the
workflow has opted into blocking on score drops and the drop exceeds the configured threshold.

The diff should show:

- baseline score
- PR score
- absolute delta
- per-task deltas where available
- whether the delta is informational or blocking

## Blocking Task Failures

Blocking should focus on tasks with clear pass/fail meaning. Examples include a required artifact no
longer being generated, a previously passing task failing, or a task marked as required by the
project policy.

The CI foundation should distinguish:

- informational warnings
- accepted baseline failures
- new non-blocking failures
- new blocking failures

Only new blocking failures should fail the PR check by default. Teams can opt into stricter
score-based blocking once the report schema and scoring behavior are stable enough for their
workflow.

## Non-Goals For v0.2 Foundation

- No hosted CI service.
- No production compliance claim.
- No automatic deployment or publishing.
- No secret scanning beyond avoiding sensitive report content.
- No broad benchmark suite unless a small fixture set already exists.

## Roadmap Checklist

- Define the baseline report schema.
- Define the comparison report schema.
- Add a local compare command or script.
- Add a GitHub Action wrapper.
- Document example workflow usage.
- Add fixtures for at least one public, safe scan target.
- Decide default blocking behavior for task failures.
- Keep score-drop blocking opt-in until scoring stability is proven.
