# AgentLayer Alpha Tester Kit

This kit is for invited alpha testers who can run a quick public-site scan and share concrete
feedback in about 5 minutes.

## Who This Is For

Good fit:

- You own, maintain, or understand a public website well enough to judge whether the report is
  accurate.
- You can run a one-line CLI command with `pnpm dlx`.
- You can open a generated `report.html` file and skim the results.
- You are willing to report confusing recommendations, wrong facts, and artifacts you would or would
  not publish.

Not a good fit:

- You only have access to private, internal, or customer-sensitive pages.
- You need production monitoring, a compliance audit, or guaranteed SEO advice.
- You cannot share even a sanitized summary of what the scan got right or wrong.
- You are testing pages that require logins, tokens, private cookies, or unreleased screenshots.

## 5-Minute Scan Command

Pick one public page you are allowed to test, then run:

```bash
pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-public-site.com --out ./agentlayer-output --max-pages 20
```

Use a real public URL in place of `https://your-public-site.com`.

## Open the Report

After the scan finishes, open the generated report:

```bash
open ./agentlayer-output/report.html
```

On Linux, use `xdg-open ./agentlayer-output/report.html`. On Windows, use
`start ./agentlayer-output/report.html`.

## What To Read First

Scan the report in this order:

1. Overall score: does the score match your gut feeling about the site?
2. Critical and warning findings: are any issues clearly wrong, overstated, or missing context?
3. Task results: did the agent-style tasks pass, partially pass, or fail in ways that make sense?
4. Recommendations: are the suggested changes useful, confusing, too generic, or risky?
5. Generated artifacts: would you publish any generated files or snippets as-is, after edits, or not
   at all?

## Privacy And Safety Boundary

Public pages only.

Do not share:

- Tokens, API keys, credentials, or session details.
- Internal URLs, staging URLs, admin pages, or private customer pages.
- Customer data, confidential metrics, unpublished launch plans, or private screenshots.
- Any report excerpt that contains sensitive information.

If a result is sensitive, summarize the issue without pasting the private data.

## Feedback Fields

Please include:

- URL
- command
- overall score
- failed/partial tasks
- wrong facts/actions
- confusing recommendations
- artifacts you would publish

## Copy/Paste Feedback Template

```markdown
## AgentLayer alpha scan feedback

URL:

command:

overall score:

failed/partial tasks:

wrong facts/actions:

confusing recommendations:

artifacts you would publish:

Anything else:
```

## Where To Send Feedback

- Main feedback thread: [GitHub issue #1](https://github.com/Qqqq5910/agentlayer/issues/1)
- Structured reports:
  [GitHub issue templates](https://github.com/Qqqq5910/agentlayer/issues/new/choose)
