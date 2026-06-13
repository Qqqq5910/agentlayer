# anonymized-003 Real-World Scan Summary

This is an anonymized, bounded public-site scan summary. It intentionally excludes raw page text,
private URLs, credentials, customer data, internal paths, screenshots, and unpublished plans.

- Sample ID: anonymized-003
- Public root URL scanned: redacted in committed sample
- Site type: Developer monitoring SaaS
- Scan status: partial_json_after_timed_out_or_interrupted_cli
- Pages scanned: 0
- Overall score: Unavailable
- Task success score: Unavailable
- Scope note: Public pages only. No forms were submitted. No authenticated, private, local, or
  internal URLs were scanned.

## Pages Scanned

- No page snapshots were available from this bounded attempt.

## Task Results

- pass: none
- partial: none
- fail: none
- unavailable: Task checks were not run or did not finish.

## Crawl Issues

- too_many_redirects: 18
- robots_disallowed: 1
- outside_allowed_scope_redirect: 1

## Wrong Facts Or Actions Observed

- The scan command returned a non-zero exit but left usable structured scan JSON; follow-up task and
  doctor commands were not run.
- Multiple same-host candidate paths hit too-many-redirects errors, which can hide otherwise public
  pricing, policy, or support evidence.
- Some first-party-looking journeys redirected to another host and were skipped by same-host scope
  rules.
- Robots.txt was fetched, but no page snapshots were collected. Task and scoring output should be
  treated as unavailable, not as a content failure.

## Confusing Recommendations

- none inferred from safe output

## Artifacts I Would Publish

- scan summary
- task-status summary
- heuristic issue notes

## Notes

- Public pages only.
- Keep raw CLI output in temporary local storage only.
- Treat this summary as heuristic feedback, not as a review of the scanned company or product.
