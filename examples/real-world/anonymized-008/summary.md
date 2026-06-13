# anonymized-008 Real-World Scan Summary

This is an anonymized, bounded public-site scan summary. It intentionally excludes raw page text,
private URLs, credentials, customer data, internal paths, screenshots, and unpublished plans.

- Sample ID: anonymized-008
- Public root URL scanned: redacted in committed sample
- Site type: Database and backend developer platform
- Scan status: completed
- Pages scanned: 5
- Overall score: 72/100
- Task success score: 57.78/100
- Scope note: Public pages only. No forms were submitted. No authenticated, private, local, or
  internal URLs were scanned.

## Pages Scanned

- home /: HTTP 200
- customers /customers: HTTP 200
- docs /docs: HTTP 200
- llms /llms.txt: HTTP 200
- pricing /pricing: HTTP 200

## Task Results

- pass: Find pricing; Compare plans; Find documentation; Identify target customer
- partial: Book demo or contact sales; Find security and trust information; Find support
- fail: Find policies; Find integrations
- unavailable: none

## Crawl Issues

- none recorded

## Wrong Facts Or Actions Observed

- Policy task failed in a bounded 5-page scan even though many public SaaS sites expose policy links
  outside the first pages selected.
- Demo/contact-sales was often partial because the scanner found navigation but did not detect an
  actionable form in the bounded public crawl.

## Confusing Recommendations

- Improve task: Book demo or contact sales
- Improve task: Find security and trust information
- Improve task: Find policies
- Improve task: Find integrations
- Improve task: Find support
- Book demo or contact sales: Expose field labels and purpose for the relevant form.
- Find security and trust information: Add clearer page titles, headings, and stable links for this
  journey.
- Find policies: Add visible policy links and machine-readable summaries.
- Find integrations: Add a discoverable page and structured content for this topic.
- Find support: Expose field labels and purpose for the relevant form.

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
