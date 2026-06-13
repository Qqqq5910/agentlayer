# anonymized-002 Real-World Scan Summary

This is an anonymized, bounded public-site scan summary. It intentionally excludes raw page text,
private URLs, credentials, customer data, internal paths, screenshots, and unpublished plans.

- Sample ID: anonymized-002
- Public root URL scanned: redacted in committed sample
- Site type: Observability and security SaaS
- Scan status: partial_json_after_timed_out_or_interrupted_cli
- Pages scanned: 3
- Overall score: Unavailable
- Task success score: Unavailable
- Scope note: Public pages only. No forms were submitted. No authenticated, private, local, or
  internal URLs were scanned.

## Pages Scanned

- home /: HTTP 200
- llms /llms.txt: HTTP 200
- home /: HTTP 200

## Task Results

- pass: none
- partial: none
- fail: none
- unavailable: Task checks were not run or did not finish.

## Crawl Issues

- too_many_redirects: 151

## Wrong Facts Or Actions Observed

- The scan command returned a non-zero exit but left usable structured scan JSON; follow-up task and
  doctor commands were not run.
- Multiple same-host candidate paths hit too-many-redirects errors, which can hide otherwise public
  pricing, policy, or support evidence.

## Confusing Recommendations

- none inferred from safe output

## Artifacts I Would Publish

- scan summary
- task-status summary
- heuristic issue notes
- page inventory without raw text

## Notes

- Public pages only.
- Keep raw CLI output in temporary local storage only.
- Treat this summary as heuristic feedback, not as a review of the scanned company or product.
