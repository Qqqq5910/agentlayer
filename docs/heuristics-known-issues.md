# Heuristics Known Issues

These notes come from the anonymized real-world scan samples in `examples/real-world`. They are
heuristic observations only. This document does not claim any evaluator, crawler, extractor, or
generator fix has been made.

## Observed: Bounded Crawl Misses Public Evidence

- Pattern: A 5-page public-root scan can miss pricing, policy, support, or security pages even when
  the public site likely exposes them elsewhere. Seen in samples where task checks failed or
  remained partial despite broad public navigation.
- Expected: Missing evidence should be framed as bounded-scan coverage, not as proof that the public
  site lacks the information.
- Fix idea: Prefer sitemap and high-signal navigation candidates for pricing, privacy, terms,
  security, support, docs, demo, and integrations before lower-signal content pages.
- Test fixture idea: Build a fixture with all required pages linked from footer and sitemap, plus
  many marketing links before them, and assert the bounded crawl selects the required pages first.

## Observed: Blog URL Keywords Can Become Page-Type False Positives

- Pattern: Blog article URLs containing words such as pricing, security, integrations, or trust can
  be classified as canonical task pages. Seen in `anonymized-009`, where multiple blog paths were
  typed as pricing/security/integrations.
- Expected: A blog article that mentions a concept should not outrank an actual pricing, security,
  docs, or integrations landing page.
- Fix idea: Penalize blog/news/resource paths for canonical page types unless the page has strong
  structural evidence, such as title, headings, or nav context matching the target page type.
- Test fixture idea: Include `/blog/pricing-announcement` and `/pricing`; assert `/pricing` is
  chosen as pricing and the blog page remains a content page.

## Observed: Same-Host Scope Skips First-Party-Looking Journeys On Other Hosts

- Pattern: Docs, support, or customer pages sometimes redirect to another host and are skipped by
  same-host crawl policy. Seen in samples with outside-scope redirect errors.
- Expected: The scanner should continue respecting same-host safety, but summaries should
  distinguish skipped cross-host first-party journeys from missing public evidence.
- Fix idea: Add a non-crawled external-first-party candidate note so task output can say that a
  likely journey exists but was outside the configured crawl scope.
- Test fixture idea: Public root links to `https://support.example.net/help`; assert no crawl
  occurs, but the report preserves a safe skipped-journey hint.

## Observed: Redirect Loops Produce Sparse Or Partial Samples

- Pattern: Several public roots or candidate paths returned too-many-redirects, sometimes leaving
  zero page snapshots or scan-only JSON without task/doctor follow-ups. Seen in `anonymized-002` and
  `anonymized-003`.
- Expected: A redirect-loop crawl issue should be treated as a crawl diagnostic and should not
  become a silent task failure.
- Fix idea: Surface redirect-loop counts prominently and suppress definitive content recommendations
  when no page evidence was collected.
- Test fixture idea: Create a fixture route that redirects beyond the crawler limit and assert the
  output reports crawl diagnostics without scoring unavailable content as absent.

## Observed: Demo Or Contact-Sales Often Becomes Partial Without Form Detection

- Pattern: The scanner finds a demo/contact-sales navigation path but reports partial because no
  actionable form is detected in the bounded crawl. Seen across multiple completed samples.
- Expected: Navigation-only evidence should remain partial, but recommendations should avoid
  implying the site has no demo journey when a public path exists.
- Fix idea: Split "journey discovered" from "form operable" in recommendation text and task
  evidence.
- Test fixture idea: Provide a public `/demo` page with a script-rendered form placeholder and
  assert the task is partial with precise missing-form language.

## Observed: CLI Can Leave Usable Scan JSON After Non-Zero Bounded Runs

- Pattern: A command killed by the outer public-scan cap can still leave structured scan JSON on
  disk, while task and doctor follow-ups are unavailable. Seen in scan-only samples with non-zero
  scan exit codes.
- Expected: Real-world sample tooling should preserve the command exit code separately from the
  availability of structured evidence.
- Fix idea: Keep scan status, command exit status, and JSON availability as separate fields in
  feedback templates.
- Test fixture idea: Simulate an interrupted command after writing scan JSON and assert the summary
  classifies it as partial evidence, not a completed scan.

## Candidate: llms.txt Recommendation May Need Cross-Check

- Pattern: Some scans detect an `llms.txt` page type, while other scans recommend adding
  `/llms.txt`. More evidence is needed to prove a mismatch rather than a per-run coverage
  difference.
- Expected: If `/llms.txt` was fetched in the same report, the doctor should not recommend adding
  it.
- Fix idea: Add a report-level invariant test that compares the readable check and top fixes against
  the scan page inventory.
- Test fixture idea: Fixture with `/llms.txt` linked from sitemap and homepage; assert no "Add
  /llms.txt" recommendation appears.
