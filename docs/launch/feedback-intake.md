# Alpha Feedback Intake

Use this guide when an external alpha tester sends feedback from a public-site AgentLayer scan. The
job is to turn raw messages into useful month-one evidence, redacted tracker notes, and focused
GitHub issues without leaking private information.

This document is for external-user feedback. Maintainer-run scans, example fixtures, and local smoke
tests are useful project evidence, but they do not by themselves prove the month-one external
feedback goal. Count completion only after real testers submit real results.

Current tester command:

```bash
pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-public-site.com --out ./agentlayer-output --max-pages 20
```

## Intake Flow

1. Receive the feedback in GitHub, email, DM, chat, or a shared doc.
2. Confirm it came from an external tester and was run against a public site they own or are allowed
   to evaluate.
3. Run the privacy triage before copying any details into GitHub or the tracker.
4. Convert the raw feedback into a short redacted summary.
5. Decide whether the item is actionable and classify it into one or more buckets.
6. Record the scan or feedback item in `docs/launch/outreach-tracker.md`.
7. Open a GitHub issue, comment on an existing issue, or add the note to the pinned feedback thread.
8. Follow up with the tester only for missing reproduction details or permission to share a public
   URL.

Keep the flow lightweight. The tracker should show month-one progress. GitHub issues should hold the
specific work, investigation, or product decision.

## Privacy Triage

Do this before storing or reposting tester material.

- Remove credentials, API keys, tokens, session IDs, cookies, auth headers, private npm tokens, and
  deployment secrets.
- Remove customer data, private analytics, private support tickets, user emails, billing details,
  proprietary policy text, and non-public metrics.
- Remove internal URLs, staging URLs, admin paths, private dashboards, feature-flag URLs, and any
  URL that requires login.
- Remove confidential screenshots, unreleased product images, private roadmap references, and
  unpublished launch plans.
- Do not paste a raw `report.html`, generated artifact, terminal log, or screenshot into GitHub
  until it has been reviewed and redacted.
- Prefer redacted summaries over raw artifacts when privacy is uncertain.
- If a tester accidentally sends sensitive data, delete the sensitive local copy when possible and
  ask for a redacted summary.

Safe summaries are usually enough:

```text
External tester ran 0.2.0-alpha.3 against a public docs site with --max-pages 20. The report marked
the pricing page as missing contact paths even though the footer has a visible contact link.
```

## What To Record In The Tracker

Update `docs/launch/outreach-tracker.md` after privacy triage.

- Date: when the feedback was received.
- Contact: name, handle, or anonymized label.
- Channel: GitHub, email, DM, Discord, Slack, X, LinkedIn, or other.
- Public URL scanned: include only if the tester agreed it can be tracked there; otherwise use a
  redacted description such as `redacted public SaaS docs site`.
- Command/max pages: include the package version and page limit, for example
  `@junyi5910/agentlayer-cli@0.2.0-alpha.3, --max-pages 20`.
- Overall score: record if shared.
- Useful feedback: one short redacted sentence with the classification bucket.
- Follow-up needed: missing command, missing expected behavior, needs URL permission, needs artifact
  redaction, or no follow-up.
- GitHub issue: link the issue or comment where the item is tracked.

A tracker row is month-one evidence only when it reflects a real external tester result. A vague
conversation, maintainer guess, or planned test does not count.

## Actionable Feedback Checklist

Use this checklist before opening a dedicated issue.

- [ ] The source is an external tester, not only the maintainer.
- [ ] The scan target was a public page the tester owns or is allowed to evaluate.
- [ ] The feedback passed privacy triage or has been rewritten as a redacted summary.
- [ ] The command, package version, and max pages are known, or the missing detail is called out.
- [ ] The observed result is concrete.
- [ ] The expected result or tester expectation is stated.
- [ ] The report section, artifact, CLI step, or CI/baseline step is identified.
- [ ] The item fits a classification bucket.
- [ ] It explains why the issue matters to a real user.
- [ ] It can drive a code change, docs change, heuristic investigation, test fixture, issue comment,
      or product decision.

Not every message needs its own issue. Praise, general impressions, and incomplete reports can stay
in the tracker or pinned feedback thread until they become specific enough to act on.

## Classification Buckets

Use the most specific bucket that fits. Add a second bucket only when it helps triage.

- False positive: AgentLayer reports a problem that the tester can show is not actually present.
- Missing evidence: the result might be right, but the report does not show enough public evidence
  to trust or reproduce it.
- Confusing recommendation: the recommendation is unclear, too generic, too risky, or does not map
  to an obvious site change.
- Install/CLI friction: the tester hit problems installing, running `pnpm dlx`, understanding the
  command, choosing `--max-pages`, or opening `report.html`.
- Report readability: the HTML report is hard to scan, labels are unclear, severity feels wrong, or
  important context is buried.
- Artifact quality: generated artifacts are inaccurate, unsafe to publish, poorly formatted, too
  generic, or not useful after review.
- CI/baseline compare confusion: the tester cannot understand baseline files, compare output,
  thresholds, workflow examples, or expected CI behavior.
- Safety/privacy concern: the scan, docs, report, or sharing flow could encourage exposure of
  private URLs, customer data, confidential screenshots, secrets, or unpublished plans.

## Issue Or Comment

Open a new issue when the feedback describes a distinct problem, decision, or reproducible pattern
that is not already tracked.

Comment on an existing issue when the feedback is another example of the same problem, adds a better
reproduction case, confirms user impact, or helps prioritize an existing item.

Use the pinned feedback issue for early, mixed, or lightly structured feedback. Use the month-one
outreach tracking issue for progress notes against the external tester goal.

Before opening anything, search existing issues for the bucket and a few keywords from the redacted
summary. Avoid duplicate issues unless a separate issue would make the work easier to own.

## Suggested New Issue Template

````markdown
## Source

- External tester:
- Channel:
- Public URL or redacted site description:
- Tester approved public URL sharing: yes/no/unknown

## Command

```bash
pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate <public-url> --out ./agentlayer-output --max-pages <n>
```

## Max pages

-

## Classification

-

## Observed

-

## Expected

-

## Why it matters

-

## Privacy check

- [ ] No credentials, tokens, customer data, internal URLs, confidential screenshots, or unpublished
      launch plans included.
- [ ] Raw artifacts were reviewed before sharing, or the issue uses a redacted summary.
- [ ] Public URL is included only if the tester agreed it can be shared.
````

## Suggested Existing-Issue Comment

```markdown
Additional external alpha feedback:

## Source

- External tester:
- Channel:
- Public URL or redacted site description:

## Command

- `pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate <public-url> --out ./agentlayer-output --max-pages <n>`

## Max pages

-

## Observed

-

## Expected

-

## Why it matters

-

## Privacy check

- [ ] Redacted summary only, or tester-approved public details.
- [ ] No credentials, tokens, customer data, internal URLs, confidential screenshots, or unpublished
      launch plans included.
```

## Follow-Up Questions

Ask only for the smallest missing detail needed to act.

- Which command did you run, including package version and `--max-pages`?
- Which report section, recommendation, task, or artifact looked wrong?
- What did you expect AgentLayer to say instead?
- Can the public URL be included in a GitHub issue, or should it stay redacted?
- Is there a safe excerpt from the report that shows the issue without private data?

If the tester cannot share more, keep the tracker row as a redacted note and avoid overstating it as
resolved evidence.
