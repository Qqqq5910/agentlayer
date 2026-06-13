# Changelog

All notable changes to AgentLayer will be documented in this file.

The format follows the spirit of Keep a Changelog, and this project uses semantic versioning once
packages are published.

## [0.2.0-alpha.1] - 2026-06-11

### Added

- `agentlayer baseline <url>` for saving compact AgentLayer CI baseline JSON reports.
- `agentlayer compare <url>` for comparing a fresh scan against a saved baseline.
- Scoring guide at `docs/scoring.md`, linked from README and the web docs page.
- Report explanations for score weights, task evidence, missing evidence, next fixes, and
  Critical/Warning/Suggestion recommendation labels.
- Real-world anonymized scan sample format under `examples/real-world/`, with 10 bounded public-site
  scan summaries.
- Feedback issue templates for real scans, false positives, and confusing recommendations.
- Copyable CI workflow examples under `examples/ci/`.
- Manual published CLI smoke workflow for post-publish `pnpm dlx @agentlayer/cli` verification.
- Release checklist documenting npm publish order, post-publish smoke tests, and GitHub sync timing.
- Zod schemas and core comparison helpers for baselines, comparisons, regressions, and blocking
  policies.
- Opt-in blocking rules for task regressions, missing artifacts, and score drops.
- Machine-readable comparison JSON and human-readable CLI summaries.
- AgentLayer CI alpha documentation and GitHub Actions usage guidance.
- Example CI baseline, passing comparison, and failing comparison outputs under `examples/ci/`.

### Changed

- CLI `generate` summaries now show Critical/Warning/Suggestion recommendation counts and priority
  fixes.
- CLI `compare` summaries now show the active blocking policy and label blocking failures clearly.
- Navigation-only demo/contact/support task results now distinguish a discovered journey URL from
  missing operable form or required-field evidence.
- CI workflow examples use stable GitHub Action versions.

### Fixed

- Blog/news/resource article URLs with pricing, security, trust, or integration keywords are no
  longer classified as canonical pricing, security, docs, or integrations pages unless their path is
  a canonical landing page.

### Notes

- This is a local-first alpha, not a hosted CI service.
- The workspace packages `@agentlayer/core` and `@agentlayer/cli` are prepared for scoped npm alpha
  publication. If the npm registry still returns 404, use repo-local `pnpm agentlayer` commands
  until the scoped packages are published.
- Do not use the unscoped `agentlayer` package name.

## [0.1.1] - 2026-06-11

### Added

- Live read-only demo link in English and Chinese README files.
- v0.1.1 adoption patch release notes.
- Feedback guide and pinned share-your-scan issue template for real website scan reports.
- Launch post copy and GitHub metadata recommendations.

### Changed

- Real-site quickstart examples now use the CLI's positional URL syntax consistently.

## [0.1.0] - 2026-06-10

### Added

- Deterministic public-site scanning, extraction, scoring, and report generation.
- Repo-local CLI commands for scan, generate, test, doctor, and fixture initialization.
- Next.js web app and AcmeFlow example SaaS fixture.
- Generated `llms.txt`, `llms-full.txt`, Markdown snapshots, JSON facts/actions/tasks, `.well-known`
  draft artifacts, WebMCP suggestions, and HTML reports.
- Standards, security, integration, and deployment documentation.
- v0.1.0 release notes.

### Notes

- npm packages are prepared with public package metadata, but README usage remains repo-local until
  publication.
- MCP, WebMCP, API Catalog, and Agent Skills files are draft artifacts and not compliance claims.
