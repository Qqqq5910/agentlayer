# anonymized-004 Real-World Scan Summary

This is an anonymized, bounded public-site scan summary. It intentionally excludes raw page text,
private URLs, credentials, customer data, internal paths, screenshots, and unpublished plans.

- Sample ID: anonymized-004
- Public root URL scanned: redacted in committed sample
- Site type: Communications API platform
- Scan status: completed
- Pages scanned: 5
- Overall score: 59/100
- Task success score: 30.56/100
- Scope note: Public pages only. No forms were submitted. No authenticated, private, local, or
  internal URLs were scanned.

## Pages Scanned

- unknown /en-us: HTTP 200
- support /en-us/products: HTTP 200
- api_docs /en-us/developers: HTTP 200
- docs /docs: HTTP 200
- llms /llms.txt: HTTP 200

## Task Results

- pass: Find documentation; Identify target customer
- partial: Book demo or contact sales; Find support
- fail: Find pricing; Compare plans; Find security and trust information; Find policies; Find
  integrations
- unavailable: none

## Crawl Issues

- outside_allowed_scope_redirect: 2

## Wrong Facts Or Actions Observed

- Some first-party-looking journeys redirected to another host and were skipped by same-host scope
  rules.
- Policy task failed in a bounded 5-page scan even though many public SaaS sites expose policy links
  outside the first pages selected.
- Demo/contact-sales was often partial because the scanner found navigation but did not detect an
  actionable form in the bounded public crawl.

## Confusing Recommendations

- Improve task: Find pricing
- Improve task: Compare plans
- Improve task: Book demo or contact sales
- Improve task: Find security and trust information
- Improve task: Find policies
- Find pricing: Create a pricing page or add a clear pricing/contact-sales link.
- Compare plans: Add pricing plan names and comparison details.
- Book demo or contact sales: Expose field labels and purpose for the relevant form.
- Find security and trust information: Create a stable, discoverable page for this journey.
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
