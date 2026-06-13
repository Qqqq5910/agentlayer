# AgentLayer Alpha Outreach Message Pack

Use these during the first public-alpha month when inviting people to run a small, bounded
AgentLayer scan and send useful feedback.

The best asks are narrow: one public site, about 5 minutes, and specific notes on what looked right
or wrong.

## Pinned Command

Use this exact command in invite messages that ask someone to run the tool:

```bash
pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20
open ./agentlayer-output/report.html
```

Replace `https://your-site.com` with a public URL they are allowed to test.

## Safety Boundary

Keep this boundary clear in every invite:

- Public sites only.
- No credentials, tokens, private cookies, or login-only pages.
- No private, internal, staging, admin, or customer-data URLs.
- No confidential screenshots, unpublished launch plans, private metrics, or sensitive report
  excerpts.
- If something sensitive appears in a report, summarize the issue without pasting the sensitive
  content.

## Feedback To Ask For

Ask testers for concrete notes, not general impressions:

- Overall score: does it feel fair?
- Failed or partial tasks: which ones looked useful, noisy, or wrong?
- Wrong facts or actions: did AgentLayer infer anything incorrectly?
- Confusing recommendations: what would they ignore, rewrite, or need explained?
- Artifacts they would publish, edit before publishing, or never publish.

## How To Choose Testers

Choose testers who can judge whether the scan is accurate.

Good first-month testers:

- Own, maintain, or deeply understand a public website.
- Can run `pnpm dlx` and open a local HTML report.
- Are willing to say what is wrong, confusing, or not useful.
- Have sites with real docs, pricing, product pages, support pages, policies, or conversion paths.
- Represent a mix of SaaS, devtool, open-source, docs-heavy, agency, and personal-product sites.

Avoid testers when:

- Their only relevant sites are private, internal, customer-specific, or login-only.
- They cannot share even a sanitized summary of the result.
- They are likely to give only encouragement and no concrete correction.
- They expect a production audit, compliance review, or guaranteed SEO advice.

## Template 1: Warm DM

```text
Hey [name] - I am doing the first public-alpha month for AgentLayer and would love one honest scan
from someone who knows their own site well.

The ask: run it on one public site/page you are allowed to test, then send me what looked right or
wrong. Please do not use private/internal/customer pages, credentials, login-only pages, or
confidential screenshots.

Command:

pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20
open ./agentlayer-output/report.html

What would help most:
- overall score
- failed/partial tasks
- wrong facts/actions
- confusing recommendations
- artifacts you would publish, edit first, or not publish

No pressure if now is a bad time. If you can try it, even 5 minutes of sharp feedback would help.
```

## Template 2: Founder Or Devtool Peer

```text
Hey [name] - I am collecting early AgentLayer alpha feedback from founders/devtool people who care
about whether public websites are understandable and operable by AI agents.

Could you run one bounded scan on a public product/docs/marketing site you are allowed to test?
Please keep it to public pages only: no credentials, no private URLs, no customer data, no
confidential screenshots.

Command:

pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20
open ./agentlayer-output/report.html

The feedback I need is not "nice launch." I am looking for:
- does the overall score feel fair?
- which tasks failed or partially passed?
- what facts/actions were wrong?
- what recommendations were confusing or too generic?
- which artifacts would you actually publish after review?

If you only have time for one paragraph, send the most wrong or confusing thing.
```

## Template 3: Docs Owner Or Maintainer

```text
Hi [name] - I am testing AgentLayer with people who maintain real public docs. It checks whether a
public site exposes the facts, policies, action paths, and reviewable artifacts that AI agents need.

Would you be open to running it against one public docs site or docs section you maintain?

Safety boundary: public docs only. Please do not scan private docs, internal pages, customer data,
credentialed pages, staging URLs, or confidential screenshots.

Command:

pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20
open ./agentlayer-output/report.html

The most useful feedback from a docs owner would be:
- overall score: fair or unfair?
- failed/partial tasks: did they reveal real docs gaps?
- wrong facts/actions: what did it misunderstand?
- confusing recommendations: what would not help a maintainer?
- artifacts: which generated items would you publish, edit, or reject?

Sanitized notes are totally fine. Please do not send anything sensitive.
```

## Template 4: Public Community Post

```text
I am looking for first-month public-alpha testers for AgentLayer.

AgentLayer scans a bounded public website and produces a local report about whether the site exposes
the facts, policies, action paths, and reviewable artifacts that AI agents need.

Try it on a public site you own or are allowed to test:

pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20
open ./agentlayer-output/report.html

Safety boundary: public sites only. Do not use private/internal/customer pages, credentials,
login-only pages, staging URLs, confidential screenshots, or sensitive report excerpts.

Useful feedback:
- overall score
- failed/partial tasks
- wrong facts/actions
- confusing recommendations
- artifacts you would publish, edit first, or never publish

If you try it, please share a sanitized summary or open an issue with what looked wrong, confusing,
or surprisingly useful.
```

## Template 5: Follow-Up After No Response

```text
Hey [name] - quick follow-up on the AgentLayer alpha ask.

No worries if this is not a fit. I am only looking for a small public-site scan, and only where the
safety boundary is clean: public pages only, no credentials, no private/internal/customer data, and
no confidential screenshots.

Command, if you want to try it:

pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20
open ./agentlayer-output/report.html

The highest-value reply would be the most wrong or confusing result you saw: score, failed/partial
tasks, wrong facts/actions, confusing recommendations, or artifacts you would not publish.
```

## Template 6: Follow-Up After Scan

```text
Thanks for running the scan. Could you send the sharpest notes from the report?

The useful bits are:
- overall score: did it match your judgment?
- failed/partial tasks: which were real problems vs noise?
- wrong facts/actions: anything AgentLayer asserted or suggested incorrectly?
- confusing recommendations: anything vague, risky, or not actionable?
- artifacts: what would you publish, edit before publishing, or never publish?

Please keep the summary sanitized. No credentials, private/internal/customer data, or confidential
screenshots.
```

## Template 7: Thank-You And Closing Loop

```text
Thank you for trying AgentLayer and sending notes. This is exactly the kind of alpha feedback I need:
what was accurate, what failed, what was confusing, and what you would or would not publish.

I will fold this into the first-month feedback pass. I will keep any sensitive details out of public
notes, and I will only reference sanitized themes unless you explicitly say something can be quoted.

Really appreciate you taking the time.
```
