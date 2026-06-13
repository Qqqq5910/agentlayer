# Launch Outreach Tracker

Use this lightweight tracker for the first public-alpha month. The goal is to invite real users to
try bounded public-site scans, collect useful feedback, and turn repeatable problems into GitHub
issues.

## Month-One Goal

- Invite real users to scan public websites they control or are allowed to evaluate.
- Collect at least 10 public-site scan records.
- Collect at least 5 pieces of actionable feedback.
- Keep all outreach and feedback scoped to public pages, reviewed scan summaries, and non-sensitive
  artifacts.

Use the [alpha tester kit](./tester-kit.md) when inviting testers, the
[outreach message pack](./outreach-message-pack.md) for copyable asks, and the
[feedback intake guide](./feedback-intake.md) when turning replies into issues. Use the
[month-one completion audit](./month-one-audit.md) to separate completed repository work from
external feedback still waiting on real users.

## Invite Channels

- Personal DMs to SaaS founders, indie hackers, docs owners, developer-tool builders, and agency
  operators.
- Existing GitHub, Discord, Slack, X, LinkedIn, or newsletter relationships where direct product
  feedback is normal.
- Open-source maintainers who publish public docs and care about AI-agent readability.
- Friendly customers or peers who can safely share a public marketing/docs URL.

Avoid cold requests that pressure people to expose private systems, customer data, internal URLs, or
unreviewed generated artifacts.

## Copyable DM Templates

### Short Ask

```text
Hey, I am collecting real public-site scans for AgentLayer's alpha.

Could you run it on one public SaaS/docs site you control and send me the report summary?
I am looking for wrong facts/actions, confusing recommendations, and whether report.html points to
2-3 useful website fixes.

No private URLs, credentials, customer data, or internal pages.
```

### With Command

```text
Could you try a bounded AgentLayer scan on one public site you control?

pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20
open ./agentlayer-output/report.html

The most useful feedback is:
- overall score
- failed/partial tasks
- wrong facts or actions
- confusing recommendations
- artifacts you would actually publish after review

Please do not share private tokens, internal URLs, customer data, or confidential screenshots.
```

### Follow-Up

```text
Thanks for trying AgentLayer. If you have 2 minutes, could you send:

1. The public URL scanned
2. The overall score
3. One thing that looked wrong or confusing
4. One recommendation or artifact you would actually use

Even one clear false positive or confusing result is useful.
```

## Feedback Record

| Date | Contact | Channel | Public URL scanned | Command/max pages | Overall score | Useful feedback | Follow-up needed | GitHub issue |
| ---- | ------- | ------- | ------------------ | ----------------- | ------------- | --------------- | ---------------- | ------------ |
|      |         |         |                    |                   |               |                 |                  |              |
|      |         |         |                    |                   |               |                 |                  |              |
|      |         |         |                    |                   |               |                 |                  |              |
|      |         |         |                    |                   |               |                 |                  |              |
|      |         |         |                    |                   |               |                 |                  |              |
|      |         |         |                    |                   |               |                 |                  |              |
|      |         |         |                    |                   |               |                 |                  |              |
|      |         |         |                    |                   |               |                 |                  |              |
|      |         |         |                    |                   |               |                 |                  |              |
|      |         |         |                    |                   |               |                 |                  |              |

Count a scan when the tester shares a public URL plus either the score, a report summary, or at
least one concrete observation from the scan.

Count feedback as actionable when it can change docs, scoring expectations, issue triage, or a
future product decision. Examples: false positives, missing public evidence, confusing labels,
incorrect recommendations, unclear CLI instructions, or artifacts the tester would not publish.

## Maintainer Simulation Examples

These rows are seeded examples that show how to fill the tracker after reading real reports. They
are based on maintainer-run public-site scans and do not count toward the external-user target.

Do not copy these rows into the completion count. Move real tester submissions into the main
feedback table above.

| Date       | Contact                                | Channel               | Public URL scanned    | Command/max pages                                                           | Overall score | Useful feedback                                                                                                                                 | Follow-up needed                                 | GitHub issue                                                     |
| ---------- | -------------------------------------- | --------------------- | --------------------- | --------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| 2026-06-14 | Simulated product engineer             | Maintainer simulation | `https://posthog.com` | `@junyi5910/agentlayer-cli@0.2.0-alpha.3`, `--max-pages 20`                 | 85            | Report looks broadly fair; security/trust and support are partial even though most pricing, docs, demo, integrations, and policy paths resolve. | Replace with external tester confirmation.       | Not opened - seed only.                                          |
| 2026-06-14 | Simulated docs owner                   | Maintainer simulation | `https://clerk.com`   | `@junyi5910/agentlayer-cli@0.2.0-alpha.3`, `--max-pages 20`                 | 78            | Useful medium-high score, but compare-plans and integrations failures would need a docs owner to say whether this is a false negative.          | Ask real tester whether integrations are hidden. | [#4](https://github.com/Qqqq5910/agentlayer/issues/4) candidate. |
| 2026-06-14 | Simulated developer-platform marketer  | Maintainer simulation | `https://resend.com`  | `@junyi5910/agentlayer-cli@0.2.0-alpha.3`, `--max-pages 20`                 | 74            | Contact/demo and docs are partial, policies fail, and `/llms.txt` is missing; this is a good example of actionable but review-needed feedback.  | Replace with real policy expectation.            | [#4](https://github.com/Qqqq5910/agentlayer/issues/4) candidate. |
| 2026-06-14 | Simulated frontend platform maintainer | Maintainer simulation | `https://vercel.com`  | `@junyi5910/agentlayer-cli@0.2.0-alpha.3`, `--max-pages 20`                 | 72            | Pricing and security are partial while compare-plans and policies fail; feedback should ask whether the report buried available public context. | Ask real tester which sections felt unfair.      | [#4](https://github.com/Qqqq5910/agentlayer/issues/4) candidate. |
| 2026-06-14 | Simulated database-platform maintainer | Maintainer simulation | `https://neon.tech`   | Earlier public-site scan with `@junyi5910/agentlayer-cli`, `--max-pages 20` | 21            | Canonical redirect from `.tech` to another domain appears to collapse evidence and fail all tasks; this should be triaged as scanner scope UX.  | Convert only if repeated by external tester.     | [#3](https://github.com/Qqqq5910/agentlayer/issues/3) candidate. |

## Turning Feedback Into GitHub Issues

1. Remove private details before copying anything into GitHub.
2. Check whether the feedback belongs in the pinned feedback thread or needs its own issue.
3. Link repeat feedback to the same issue instead of opening duplicates.
4. Use one issue per concrete problem or decision.
5. Include the public URL only when the tester agrees it can be shared.
6. Add enough context for reproduction: command, max pages, report section, expected result, and
   observed result.

Suggested issue shape:

```markdown
## Feedback source

- Public URL:
- Command:
- Max pages:
- Report section:

## Observed

## Expected

## Why it matters

## Privacy check

- [ ] No credentials, tokens, customer data, internal URLs, or confidential screenshots included.
- [ ] Tester approved sharing the public URL, if included.
```

## Tracking Links

- Pinned feedback issue: [#1](https://github.com/Qqqq5910/agentlayer/issues/1)
- Month-one outreach tracking issue: [#2](https://github.com/Qqqq5910/agentlayer/issues/2)

Use #1 for public feedback collection and #2 for progress against the month-one goal.

## Privacy And Safety Notes

- Only ask people to scan public sites they control or are explicitly allowed to evaluate.
- Do not request or store credentials, private tokens, internal URLs, customer data, analytics
  exports, private screenshots, unpublished launch plans, or proprietary policy text.
- Ask testers to review generated files before sharing them.
- Prefer summarized observations over raw artifacts when privacy is uncertain.
- Do not publish a scanned URL, screenshot, or artifact unless the tester has agreed it can be
  public.
- If feedback includes sensitive data, delete the sensitive copy and ask for a redacted summary.
