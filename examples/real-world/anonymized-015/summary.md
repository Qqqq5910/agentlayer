# anonymized-015 Real-World Scan Summary

This is an anonymized, bounded public-site scan summary. It intentionally excludes raw page text,
private URLs, credentials, customer data, internal paths, screenshots, full facts, full actions,
full forms, and unpublished plans.

- Sample ID: anonymized-015
- Public root URL scanned: redacted in committed sample
- Source label: frontend-deployment-platform
- Site type: Frontend cloud deployment platform
- Scan status: completed_limited_page_coverage
- Pages scanned: 2
- Overall score: 53/100
- Task success score: 22/100
- Scope note: Public pages only. No forms were submitted. No authenticated, private, local, or
  internal URLs were scanned.

## Page Inventory Summary

- home: 1 page(s)
- llms: 1 page(s)

## Task Results

- pass: Identify target customer
- partial: Book demo or contact sales; Find support
- fail: Find pricing; Compare plans; Find documentation; Find security and trust information; Find
  policies; Find integrations
- unavailable: none

## Crawl Issues

- too_many_redirects: 43
- outside_allowed_crawl_scope: 4

## Heuristic Observations

- Only 2 public page snapshot(s) were captured; failed journeys may reflect bounded crawler
  coverage.
- Failed journey tasks: Find pricing; Compare plans; Find documentation; Find security and trust
  information; Find policies; Find integrations.
- Partial journey tasks: Book demo or contact sales; Find support.
- Crawl issues observed: too_many_redirects (43), outside_allowed_crawl_scope (4).
- Recommendation title suggests sitemap discovery was absent or not usable for this bounded run.
- Recommendation title suggests robots.txt was not confirmed during this bounded run.
- Candidate actions were emitted; this sample keeps only counts and review-oriented artifact notes.
- Forms were detected but not submitted; this sample excludes field payloads and submission data.

## Recommendation Titles

- Improve task: Find pricing
- Improve task: Compare plans
- Improve task: Book demo or contact sales
- Improve task: Find documentation
- Improve task: Find security and trust information
- Improve task: Find policies
- Improve task: Find integrations
- Improve task: Find support
- Expose sitemap.xml
- Publish robots.txt
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
