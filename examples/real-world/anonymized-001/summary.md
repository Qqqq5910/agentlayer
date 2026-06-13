# anonymized-001 Real-World Scan Summary

This is an anonymized, bounded public-site scan summary. It intentionally excludes raw page text,
private URLs, credentials, customer data, internal paths, screenshots, and unpublished plans.

- Sample ID: anonymized-001
- Public root URL scanned: redacted in committed sample
- Site type: API platform / developer tool
- Scan status: completed
- Pages scanned: 5
- Overall score: 57/100
- Task success score: 31.67/100
- Scope note: Public pages only. No forms were submitted. No authenticated, private, local, or
  internal URLs were scanned.

## Pages Scanned

- home /: HTTP 200
- demo /demo: HTTP 200
- docs /documentation: HTTP 200
- faq /faq: HTTP 200
- support /help: HTTP 200

## Task Results

- pass: Find documentation; Identify target customer
- partial: Book demo or contact sales; Find support
- fail: Find pricing; Compare plans; Find security and trust information; Find policies; Find
  integrations
- unavailable: none

## Crawl Issues

- too_many_redirects: 7

## Wrong Facts Or Actions Observed

- Multiple same-host candidate paths hit too-many-redirects errors, which can hide otherwise public
  pricing, policy, or support evidence.
- Policy task failed in a bounded 5-page scan even though many public SaaS sites expose policy links
  outside the first pages selected.
- Demo/contact-sales was often partial because the scanner found navigation but did not detect an
  actionable form in the bounded public crawl.

## Confusing Recommendations

- Add /llms.txt
- Improve task: Find pricing
- Improve task: Compare plans
- Improve task: Book demo or contact sales
- Improve task: Find security and trust information
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
