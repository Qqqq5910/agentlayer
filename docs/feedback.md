# Share AgentLayer Scan Results

AgentLayer benefits most from real scans of real public sites. If you try it, please share what it
got right, what it got wrong, and which generated artifacts you would actually publish after review.

The hosted read-only demo is available at:

```text
https://agentlayer-readonly-demo.vercel.app
```

That hosted demo uses the fictional AcmeFlow fixture so people can inspect the report UI without
running anything. For your own site, run the AgentLayer CLI locally and share the results from that
real scan.

## Where To Share

Use the GitHub issue template that best matches the scan:

- [Share a real scan](../.github/ISSUE_TEMPLATE/share-scan.yml) for general scan feedback.
- [False positive](../.github/ISSUE_TEMPLATE/false-positive.yml) when a fact, action, task result,
  recommendation, or CI regression looks wrong.
- [Confusing recommendation](../.github/ISSUE_TEMPLATE/confusing-recommendation.yml) when the report
  does not make the next fix clear.

## What To Share

Please include these fields:

- URL:
- command:
- overall score:
- wrong facts/actions:
- confusing recommendations:
- artifacts you would publish:

## Notes

- Share public-site scans only.
- Do not include private tokens, credentials, internal URLs, unpublished pricing, customer data,
  confidential screenshots, unpublished launch plans, or other sensitive information.
- Generated artifacts are review drafts. Please say which ones you would publish as-is, edit first,
  or avoid publishing.
- If a recommendation is confusing, include the source page or output file that made it unclear.

## Example

```text
URL: https://example.com
command: pnpm dlx @agentlayer/cli generate https://example.com --out ./agentlayer-output --max-pages 20
overall score: 78
wrong facts/actions: The scanner treated the newsletter form as a contact-sales action.
confusing recommendations: The pricing recommendation mentioned plan limits, but our pricing page
  intentionally links to sales instead of listing limits.
artifacts you would publish: llms.txt after edits; markdown snapshots; not the draft MCP card yet.
```
