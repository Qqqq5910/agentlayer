# Real-World Scan Samples

This directory contains small, anonymized summaries from bounded scans of public B2B SaaS and
developer-tool websites. The purpose is to collect heuristic feedback for AgentLayer readiness
without publishing raw crawl output.

Each sample directory contains:

- `summary.md`: Human-readable notes from the bounded scan.
- `scan-metadata.json`: Safe scan provenance, command options, page inventory, and crawl issue
  counts.
- `findings.json`: Safe task, score, recommendation, and heuristic-observation notes.

## Safety Rules

Do not include secrets, private URLs, customer data, credentials, internal paths, confidential
screenshots, unpublished launch plans, raw page text, raw markdown snapshots, cookies, tokens,
session IDs, or form submission data. Use public root URLs only, keep scans bounded, respect
robots.txt, do not use `--allow-local` for public URLs, and do not submit forms.

Summaries should describe public-page behavior at a high level: site type, pages scanned, score if
available, pass/partial/fail task names, likely wrong facts or actions, confusing recommendations,
and safe artifacts worth publishing. Keep the real public root URL in local working notes if needed,
but commit anonymized samples with the host redacted. If a scan fails or times out, record that
honestly instead of inventing results.

## Current Sample Set

The current set includes 20 anonymized samples. `anonymized-001` through `anonymized-010` are early
bounded exploration samples. `anonymized-011` through `anonymized-020` are `v0.2.0-alpha.2` public
site scans capped at 20 pages, covering high-scoring, mid-scoring, and crawl-coverage failure cases.

- `anonymized-001`: API platform / developer tool; completed; 5 page(s); overall score 57.
- `anonymized-002`: Observability and security SaaS;
  partial_json_after_timed_out_or_interrupted_cli; 3 page(s); overall score unavailable.
- `anonymized-003`: Developer monitoring SaaS; partial_json_after_timed_out_or_interrupted_cli; 0
  page(s); overall score unavailable.
- `anonymized-004`: Communications API platform; completed; 5 page(s); overall score 59.
- `anonymized-005`: Network, security, and developer platform; failed_or_blocked_before_scan_json; 0
  page(s); overall score unavailable.
- `anonymized-006`: Frontend cloud and developer platform; completed; 5 page(s); overall score 71.
- `anonymized-007`: Frontend cloud and developer platform; failed_or_blocked_before_scan_json; 0
  page(s); overall score unavailable.
- `anonymized-008`: Database and backend developer platform; completed; 5 page(s); overall score 72.
- `anonymized-009`: Search, observability, and security platform; completed; 5 page(s); overall
  score 71.
- `anonymized-010`: Database developer platform; failed_or_blocked_before_scan_json; 0 page(s);
  overall score unavailable.
- `anonymized-011`: Productivity and issue-tracking SaaS; completed; 20 page(s); overall score 77.
- `anonymized-012`: Database and backend developer platform; completed; 20 page(s); overall
  score 87.
- `anonymized-013`: Payments and financial infrastructure platform; completed; 20 page(s); overall
  score 74.
- `anonymized-014`: Frontend cloud and developer platform; completed; 20 page(s); overall score 72.
- `anonymized-015`: Frontend cloud deployment platform; completed_limited_page_coverage; 2 page(s);
  overall score 53.
- `anonymized-016`: Observability and developer monitoring SaaS; completed_with_no_page_snapshots; 0
  page(s); overall score 18.
- `anonymized-017`: Identity and authentication developer platform; completed; 20 page(s); overall
  score 78.
- `anonymized-018`: Product analytics developer platform; completed; 20 page(s); overall score 85.
- `anonymized-019`: Email API and messaging platform; completed; 20 page(s); overall score 74.
- `anonymized-020`: Serverless database developer platform; completed_with_no_page_snapshots; 0
  page(s); overall score 21.
