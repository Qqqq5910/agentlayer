# anonymized-006 Real-World Scan Summary

This is an anonymized, bounded public-site scan summary. It intentionally excludes raw page text,
private URLs, credentials, customer data, internal paths, screenshots, and unpublished plans.

- Sample ID: anonymized-006
- Public root URL scanned: redacted in committed sample
- Site type: Frontend cloud and developer platform
- Scan status: completed
- Pages scanned: 5
- Overall score: 71/100
- Task success score: 70.56/100
- Scope note: Public pages only. No forms were submitted. No authenticated, private, local, or
  internal URLs were scanned.

## Pages Scanned

- home /: HTTP 200
- support /changelog/checks-api-support-added-for-marketplace-integration-providers: HTTP 200
- integrations /changelog/enhanced-security-with-new-api-scopes-for-integrations: HTTP 200
- demo /contact/sales/demo: HTTP 200
- pricing /contact/sales/pricing: HTTP 200

## Task Results

- pass: Find pricing; Compare plans; Book demo or contact sales; Find integrations; Identify target
  customer; Find support
- partial: Find documentation; Find security and trust information
- fail: Find policies
- unavailable: none

## Crawl Issues

- none recorded

## Wrong Facts Or Actions Observed

- Policy task failed in a bounded 5-page scan even though many public SaaS sites expose policy links
  outside the first pages selected.

## Confusing Recommendations

- Add /llms.txt
- Improve task: Find documentation
- Improve task: Find security and trust information
- Improve task: Find policies
- Review and publish the agent action manifest
- Find documentation: Add clearer page titles, headings, and stable links for this journey.
- Find security and trust information: Add clearer page titles, headings, and stable links for this
  journey.
- Find policies: Add visible policy links and machine-readable summaries.

## Artifacts I Would Publish

- scan summary
- task-status summary
- heuristic issue notes
- doctor score snapshot
- page inventory without raw text
- pass/partial/fail task table

## Notes

- Public pages only.
- Keep raw CLI output in temporary local storage only.
- Treat this summary as heuristic feedback, not as a review of the scanned company or product.
