# Changelog

All notable changes to AgentLayer will be documented in this file.

The format follows the spirit of Keep a Changelog, and published packages use semantic-versioned
releases.

## [0.2.0-alpha.3] - 2026-06-14

### Added

- Added 10 more anonymized real-world public-site scan summaries under `examples/real-world/`,
  bringing the committed feedback sample set to 20.
- Documented two real-scan heuristic patterns: canonical-domain redirects that produce no-page
  reports, and fragment-only form actions.

### Fixed

- Form actions such as `action="#"` now fall back to the source page URL before becoming generated
  AgentLayer actions. Reports and `.well-known/agents.json` can now be generated for client-side
  demo/contact forms that use fragment-only action attributes.
- Added regression coverage for fragment-only form actions in report and artifact generation.

## [0.2.0-alpha.2] - 2026-06-13

### Fixed

- Generated `report.html` now keeps wide task, evidence, facts, forms, and action tables inside the
  report viewport. Long URLs, evidence snippets, artifact paths, and recommendation text wrap
  instead of forcing the page wider than the screen.
- Added regression coverage for the report table wrapping CSS.

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
- Manual published CLI smoke workflow for post-publish `pnpm dlx @junyi5910/agentlayer-cli`
  verification.
- Release checklist documenting npm publish order, post-publish smoke tests, and GitHub sync timing.
- v0.2.0-alpha.1 launch drafts and pinned scan-feedback issue copy.
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
- This alpha publishes `@junyi5910/agentlayer-core` and `@junyi5910/agentlayer-cli`; the
  `@agentlayer` npm org scope remains the future migration target because npm rejected creating the
  org for this alpha.
- Use the scoped npm alpha CLI for quickstarts:
  `pnpm dlx @junyi5910/agentlayer-cli generate https://your-site.com --out ./agentlayer-output --max-pages 20`.
  Repo-local `pnpm agentlayer` commands are for repository checkouts and fixture development.
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
