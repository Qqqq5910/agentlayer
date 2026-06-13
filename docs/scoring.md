# AgentLayer Scoring

AgentLayer's public alpha score is a deterministic, heuristic measure of whether a public website is
ready for AI agents to read, trust, and operate. It is designed to make website fixes concrete and
repeatable, not to certify compliance or predict ranking in any AI product.

## Overall Score

The `Agent Operability Score` is a 0-100 weighted average of four score areas:

| Area          | Weight | Why it matters                                                                                 |
| ------------- | ------ | ---------------------------------------------------------------------------------------------- |
| Readability   | 25%    | Agents need discoverable pages, headings, and machine-readable content before they can reason. |
| Trustability  | 25%    | Agents need sourced facts and policy context before they can quote or recommend a site safely. |
| Actionability | 30%    | Agents need clear action paths, form boundaries, sensitivity labels, and confirmation rules.   |
| Task success  | 20%    | Agents need to complete common website journeys, not only find standalone files.               |

The current formula is:

```text
overall = round(
  readability * 0.25 +
  trustability * 0.25 +
  actionability * 0.30 +
  taskSuccess * 0.20
)
```

Each area is also scored from 0-100. Higher scores mean AgentLayer found more public evidence for
that area during the bounded scan.

## Evidence By Area

Readability checks whether public pages can be found and converted into useful agent-facing text.
Evidence includes:

- `robots.txt` and `sitemap.xml` discovery.
- Important page types such as home, pricing, docs, API docs, security, privacy, terms, contact, and
  support.
- Presence of `/llms.txt`.
- Pages with extracted Markdown.
- Pages with titles or headings.

Trustability checks whether important claims are backed by public source evidence. Evidence
includes:

- Extracted company, product, pricing, plan, integration, policy, security, contact, docs, support,
  or other facts.
- Source URLs and source snippets for those facts.
- Fact confidence scores.
- Pricing, policy, and security pages or facts.
- The scan timestamp used to show when evidence was collected.

Actionability checks whether agents can identify safe, bounded ways to operate the site. Evidence
includes:

- Contact sales, book demo, quote, support, docs, API docs, pricing, policy, and navigation actions.
- Form actions and whether their fields expose durable names.
- Form operability scores.
- Sensitivity labels: `low`, `medium`, or `high`.
- Human-confirmation requirements for forms and non-low-sensitivity actions.

Task success checks whether common public B2B SaaS journeys can be completed from the collected
evidence. It is the average score across task checks in `tasks-report.json`.

## Task Checks

The default public alpha task suite is tuned for B2B SaaS-style public websites. It checks whether
an agent can:

- Find pricing.
- Compare plans.
- Book a demo or contact sales.
- Find documentation or API documentation.
- Find security and trust information.
- Find policies such as privacy, terms, cancellation, or refund information.
- Find integrations.
- Identify the target customer.
- Find support.

Each task is evaluated deterministically from scanned pages, extracted facts, detected actions, and
text snippets. AgentLayer does not ask an LLM to judge task quality by default.

Task results are reported as:

- `pass`: enough matching evidence was found for the journey.
- `partial`: some evidence was found, but an agent would still have missing or ambiguous context.
- `fail`: no useful evidence was found for the journey.

Each task also has a 0-100 score, evidence URLs, evidence snippets, missing information, and
recommendations. For form-based journeys, AgentLayer also records journey steps such as discovering
the action, understanding required fields, and confirming sensitive actions.

## Recommendation Severity

Generated `recommendations.json` currently stores internal severity values as `high`, `medium`, and
`low`. Public alpha reports should be interpreted as:

| Public label | Internal value | Meaning                                                                                  |
| ------------ | -------------- | ---------------------------------------------------------------------------------------- |
| Critical     | `high`         | Fix first. This can block an important task or leave agents without core evidence.       |
| Warning      | `medium`       | Important follow-up. This can make tasks partial, fragile, or harder to verify.          |
| Suggestion   | `low`          | Useful hygiene. This usually improves discoverability or clarity without blocking tasks. |

Examples:

- Missing `/llms.txt`, missing source-backed facts, missing action paths, failed tasks, or very weak
  forms are usually Critical.
- Missing `sitemap.xml`, partial tasks, or unpublished agent action manifests are usually Warnings.
- Missing `robots.txt` is usually a Suggestion unless it hides evidence needed elsewhere.

## Limitations

AgentLayer scoring is intentionally conservative in the public alpha:

- It is heuristic and deterministic. It can miss information that is visually obvious to a human but
  not extractable from the scanned public pages.
- It scans bounded public pages only, within same-host, `maxPages`, timeout, and robots.txt limits.
- It does not crawl authenticated, private, paywalled, or account-specific areas.
- It does not submit forms, click through workflows, make purchases, change accounts, or perform
  destructive actions.
- It does not guarantee compliance with MCP, WebMCP, `llms.txt`, API Catalog, Agent Skills, or any
  future standard.
- It does not use an LLM judge by default.
- Task checks are currently tuned for B2B SaaS-style public websites.

Use the score as a review aid. Review generated facts, actions, manifests, standards-related files,
and recommendations before publishing anything on a production site.

## Rerun After Fixes

After changing navigation, pricing, docs, support, policies, security pages, API docs, or generated
agent-facing artifacts, run the same command again with the same scan bounds so the results are
comparable:

```bash
pnpm dlx @junyi5910/agentlayer-cli generate https://your-site.com --out ./agentlayer-output --max-pages 20
```

Then open `./agentlayer-output/report.html` and review:

- The overall `Agent Operability Score`.
- The four area scores.
- `tasks-report.json`.
- `recommendations.json`.
- Any generated artifacts you plan to publish.

For local baseline/compare workflows, see [docs/ci.md](./ci.md).
