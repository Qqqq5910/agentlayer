# Month-One Completion Audit

Audit date: 2026-06-14

Month-one goal: move AgentLayer from an alpha project that works locally for the author into a
public alpha tool that an unfamiliar developer can install, scan a public site with, understand the
report, and use to send useful feedback.

## Result Checklist

| Result                       | Status             | Evidence                                                                                                                                                                                                                                                             |
| ---------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| npm alpha installable        | Complete           | `@junyi5910/agentlayer-cli@0.2.0-alpha.3` and `@junyi5910/agentlayer-core@0.2.0-alpha.3` are published. `latest` and `alpha` npm dist-tags point to `0.2.0-alpha.3`. Published CLI smoke passed on GitHub Actions.                                                   |
| README first screen converts | Complete           | `README.md` and `README.zh-CN.md` lead with positioning, badges, release status, `pnpm dlx` quickstart, generated artifact caveats, and safety boundaries.                                                                                                           |
| Report is explainable        | Complete           | `report.html` includes score breakdown, scoring guide link, task reasons, evidence, missing evidence, next fixes, recommendations, crawl issues, generated artifacts, actions, forms, and facts. `docs/scoring.md` documents score areas and limitations.            |
| Real website feedback loop   | Partially complete | Maintainer seed set has 20 anonymized public-site scan summaries under `examples/real-world/`. Feedback docs, issue templates, pinned issue, launch materials, and outreach tracker exist. External-user feedback remains pending until testers submit real results. |
| CI alpha reproducible        | Complete           | `docs/ci.md`, `examples/ci/README.md`, `examples/ci/github-actions-public-site.yml`, `examples/ci/github-actions-local-fixture.yml`, baseline JSON, passing comparison JSON, failing comparison JSON, and `.github/workflows/published-cli-smoke.yml` are present.   |

## Task Audit

| Planned task                                    | Status   | Evidence                                                                                                                                                                       |
| ----------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Publish core alpha package                      | Complete | `@junyi5910/agentlayer-core@0.2.0-alpha.3` is published on npm.                                                                                                                |
| Publish CLI alpha package                       | Complete | `@junyi5910/agentlayer-cli@0.2.0-alpha.3` is published on npm and exposes the `agentlayer` binary.                                                                             |
| Add package-manager quickstart                  | Complete | README quickstart uses `pnpm dlx @junyi5910/agentlayer-cli generate ...`.                                                                                                      |
| Update Chinese quickstart                       | Complete | `README.zh-CN.md` mirrors the npm alpha path.                                                                                                                                  |
| Move repo-local commands to development         | Complete | README keeps repo-local usage in development and fixture sections.                                                                                                             |
| Remove stale version references                 | Complete | Current README and release metadata point to `0.2.0-alpha.3`.                                                                                                                  |
| Add scoring docs                                | Complete | `docs/scoring.md` exists and is linked from user-facing docs.                                                                                                                  |
| Add evidence/reason/fix to task output          | Complete | Task report and generated HTML include reason, evidence URLs/snippets, missing information, and next fixes.                                                                    |
| Add recommendation severity                     | Complete | `recommendations.json`, CLI summary, and report sections use high/medium/low mapped to Critical/Warning/Suggestion display.                                                    |
| Improve report critical findings                | Complete | Report top section highlights Critical and Warning recommendations and avoids burying the next fixes in JSON.                                                                  |
| Improve CLI summary                             | Complete | CLI generate summary prints score, task count, recommendation severity counts, and priority fixes.                                                                             |
| Add report regression coverage                  | Complete | Core tests cover report CSS wrapping and fragment-only form actions.                                                                                                           |
| Add real-world scan template                    | Complete | `examples/real-world/README.md` defines safe summaries, metadata, and findings files.                                                                                          |
| Add 10 anonymized real-world summaries          | Complete | `examples/real-world/anonymized-001` through `anonymized-020` exist; 20 total samples are committed.                                                                           |
| Add false-positive template                     | Complete | `.github/ISSUE_TEMPLATE/false-positive.yml` exists and includes privacy boundaries.                                                                                            |
| Add share-scan template                         | Complete | `.github/ISSUE_TEMPLATE/share-scan.yml` exists and includes privacy boundaries.                                                                                                |
| Document known heuristic issues                 | Complete | `docs/heuristics-known-issues.md` includes observed patterns and test fixture ideas.                                                                                           |
| Fix at least two high-frequency false positives | Complete | Blog/news/resource keyword false positives and fragment-only form action failures are fixed with regression coverage. Navigation-only demo/contact wording was also tightened. |
| Polish examples/ci workflows                    | Complete | `examples/ci` includes copyable public-site and local-fixture workflows.                                                                                                       |
| Add published CLI smoke test                    | Complete | `.github/workflows/published-cli-smoke.yml` exists and passed after the latest publish.                                                                                        |
| Publish alpha release                           | Complete | GitHub Release `v0.2.0-alpha.3` is marked Latest.                                                                                                                              |

## Verification Evidence

- `main` includes the `v0.2.0-alpha.3` release work and follow-up documentation cleanup.
- Latest product release: `v0.2.0-alpha.3`.
- Latest npm CLI version: `0.2.0-alpha.3`.
- GitHub CI passed for the latest documentation cleanup commit.
- Published CLI smoke passed after `0.2.0-alpha.3` was published.
- Local quality gates passed before the `0.2.0-alpha.3` release: format, readability guard, lint,
  typecheck, tests, and build.

## External Feedback Gap

The repository can prove that the product is installable, documented, explainable, reproducible in
CI, and seeded with maintainer-run real-world scans. It cannot prove that 10 external testers have
run it or that 5 actionable external feedback reports have been collected until those people submit
results.

`docs/launch/outreach-tracker.md` includes maintainer simulation rows to show the desired tracking
format. Those rows are useful practice records, but they do not count as external-user evidence. Two
maintainer-seed candidate issues were opened from those simulations:
[#3](https://github.com/Qqqq5910/agentlayer/issues/3) for canonical-domain redirect diagnostics and
[#4](https://github.com/Qqqq5910/agentlayer/issues/4) for high-signal bounded crawl prioritization.

Treat this as the remaining non-code month-one work:

1. Invite 10 real testers who own or are allowed to evaluate public SaaS, docs, or developer-tool
   sites.
2. Ask them to run the alpha CLI on public pages only.
3. Collect at least 5 actionable feedback reports.
4. Convert repeatable problems into GitHub issues.
5. Update `docs/launch/outreach-tracker.md` with redacted progress.
