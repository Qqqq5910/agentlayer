# GitHub Launch Setup

Use this checklist before publishing `v0.1.0` and announcing AgentLayer.

## Repository Metadata

Repository description:

```text
Deterministic toolkit for making websites readable, trusted, and operable by AI agents.
```

Website URL:

```text
https://github.com/Qqqq5910/agentlayer#readme
```

Use the GitHub README URL until a hosted project website is live.

Recommended topics:

- `agentlayer`
- `llms-txt`
- `mcp`
- `webmcp`
- `ai-agents`
- `agent-operability`
- `agentic-web`

## Suggested Social Preview

Use `docs/assets/agentlayer-preview.svg` for the first GitHub social preview. If you want a product
screenshot instead, run the local web app and capture `http://localhost:3000/demo`.

Suggested screenshot checklist:

- Shows the AgentLayer demo report or generated artifact preview.
- Includes visible scoring/report context.
- Avoids local terminal chrome or private browser details.
- Uses a wide image suitable for GitHub's social preview crop.

## Release Steps

1. Confirm the working tree only contains intended release-doc changes.
2. Run the local quality checks if the code changed elsewhere:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```

3. Create or verify the `v0.1.0` tag.
4. Open GitHub Releases and create a new release from `v0.1.0`.
5. Paste `release-notes/v0.1.0.md` into the release body.
6. Include the local demo path, `http://localhost:3000/demo`, and fixture path,
   `http://localhost:3001`.
7. Publish the release.
8. Update any launch posts with the release URL once GitHub generates it.

## First Launch Post Copy

Short version:

```text
Launching AgentLayer v0.1.0.

SEO made websites discoverable. AgentLayer makes websites operable by AI agents.

It is an open-source deterministic toolkit that scans a public website, extracts
sourced facts, checks action paths, runs agent-readiness tasks, and generates
reviewable agent-facing artifacts like llms.txt, .well-known drafts, WebMCP
suggestions, JSON reports, and report.html.

This first release is repo-local and conservative by design: no form submission,
no private crawling, no compliance claims, and no LLM judge required by default.

GitHub: https://github.com/Qqqq5910/agentlayer
```

Longer version:

```text
AgentLayer v0.1.0 is live.

SEO made websites discoverable. AgentLayer makes websites operable by AI agents.

Most websites are built for humans and search engines. AI agents need something
different: sourced facts, clear policies, machine-readable snapshots, action
boundaries, and testable paths for tasks like finding pricing, docs, security
information, integrations, support, and demo/contact flows.

AgentLayer is an open-source deterministic toolkit for checking that layer. It
scans bounded public pages, extracts evidence-backed facts, detects action
paths, runs task checks, and generates reviewable outputs such as llms.txt,
llms-full.txt, Markdown snapshots, .well-known drafts, WebMCP suggestions,
tasks-report.json, recommendations.json, and report.html.

v0.1 is intentionally conservative. It is not a crawler API, not an AI SEO rank
tracker, not a compliance guarantee, and not browser automation. It does not
authenticate, submit forms, crawl private areas, or perform destructive actions.

GitHub: https://github.com/Qqqq5910/agentlayer
Local demo: http://localhost:3000/demo
Fixture site: http://localhost:3001
```

## Launch Notes

- Keep the README positioning line unchanged:
  `SEO made websites discoverable. AgentLayer makes websites operable by AI agents.`
- Keep the AgentLayer vs Firecrawl section visible because it clarifies positioning without framing
  the tools as replacements.
- Link to `docs/integrations/firecrawl.md` when people ask whether AgentLayer competes with
  Firecrawl.
- Be explicit that generated standards files are draft suggestions that require human review before
  production use.
