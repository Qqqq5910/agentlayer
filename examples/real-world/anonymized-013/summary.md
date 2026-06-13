# anonymized-013 Real-World Scan Summary

This is an anonymized, bounded public-site scan summary. It intentionally excludes raw page text,
private URLs, credentials, customer data, internal paths, screenshots, full facts, full actions,
full forms, and unpublished plans.

- Sample ID: anonymized-013
- Public root URL scanned: redacted in committed sample
- Source label: payments-infrastructure-platform
- Site type: Payments and financial infrastructure platform
- Scan status: completed
- Pages scanned: 20
- Overall score: 74/100
- Task success score: 58/100
- Scope note: Public pages only. No forms were submitted. No authenticated, private, local, or
  internal URLs were scanned.

## Page Inventory Summary

- contact: 2 page(s)
- home: 1 page(s)
- llms: 1 page(s)
- pricing: 1 page(s)
- privacy: 2 page(s)
- support: 13 page(s)

## Task Results

- pass: Find pricing; Compare plans; Identify target customer; Find support
- partial: Book demo or contact sales; Find documentation; Find policies
- fail: Find security and trust information; Find integrations
- unavailable: none

## Crawl Issues

- outside_allowed_crawl_scope: 6

## Heuristic Observations

- Bounded scan captured 20 public page snapshots across 6 page category/categories.
- Failed journey tasks: Find security and trust information; Find integrations.
- Partial journey tasks: Book demo or contact sales; Find documentation; Find policies.
- Crawl issues observed: outside_allowed_crawl_scope (6).
- Recommendation title suggests sitemap discovery was absent or not usable for this bounded run.
- Candidate actions were emitted; this sample keeps only counts and review-oriented artifact notes.
- Forms were detected but not submitted; this sample excludes field payloads and submission data.

## Recommendation Titles

- Improve task: Book demo or contact sales
- Improve task: Find documentation
- Improve task: Find security and trust information
- Improve task: Find policies
- Improve task: Find integrations
- Expose sitemap.xml
- Review and publish the agent action manifest

## Artifacts I Would Publish

- anonymized scan summary
- score snapshot
- pass/partial/fail task table
- page inventory summary without raw text
- source-backed fact count summary
- reviewed action-manifest summary
- form operability summary without field payloads
- crawl issue count summary

## Notes

- Public pages only.
- Keep raw CLI output in temporary local storage only.
- Treat this summary as heuristic feedback, not as a review of the scanned company or product.
