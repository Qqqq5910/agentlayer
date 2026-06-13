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

pnpm dlx @junyi5910/agentlayer-cli generate https://your-site.com --out ./agentlayer-output --max-pages 20
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
