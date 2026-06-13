# AgentLayer Launch Materials

Use this folder to run the first public-alpha feedback loop without adding product features.

The goal is simple: invite real people to scan public sites they control or are allowed to evaluate,
collect useful feedback, and turn repeatable problems into GitHub issues.

## What To Send Testers

Send testers the alpha kit first:

- [Alpha tester kit](./tester-kit.md)

The tester kit includes the pinned command, report-opening instructions, privacy boundary, feedback
fields, and links to the feedback issue.

For quick DMs or public posts, use:

- [Outreach message pack](./outreach-message-pack.md)

## What Testers Should Do

Ask testers to scan one public site:

```bash
pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20
open ./agentlayer-output/report.html
```

They should send:

- The public URL they scanned.
- The exact command or max-pages value.
- The overall score.
- Failed or partial tasks that looked wrong or useful.
- Wrong facts, wrong actions, or confusing recommendations.
- Artifacts they would publish, edit, or reject.

## How To Track Progress

Use:

- [Outreach tracker](./outreach-tracker.md) for invites, scan records, and counts.
- [Feedback intake](./feedback-intake.md) for privacy triage and issue creation.
- [Share-your-scan template](./share-your-scan.md) when someone needs a structured prompt.
- [Month-one completion audit](./month-one-audit.md) to see what is complete and what still depends
  on external users.

Month-one feedback is complete only when real testers have submitted enough evidence. Maintainer-run
samples are useful seed data, but they do not replace external feedback.

## Completion Targets

- 10 public-site scan records from real users.
- 5 actionable feedback reports.
- Repeatable problems converted into GitHub issues.
- No private credentials, customer data, internal URLs, or confidential screenshots stored in the
  repository.
