# AGENTS.md

Guidance for future coding agents working on AgentLayer.

- Use TypeScript strict mode.
- Keep `packages/core` deterministic without external AI APIs by default.
- Do not invent compliance claims, pricing, facts, certifications, APIs, or actions.
- Every generated fact must include `sourceUrl` and `confidence`.
- Keep generated manifests conservative and label experimental MCP/WebMCP drafts clearly.
- Do not submit forms, send POST requests, or perform destructive actions during scans.
- Do not bypass authentication, private areas, robots.txt intent, max page limits, or timeouts.
- Prefer clear Zod schemas and source evidence over fuzzy free text.
- Run tests before finalizing changes.
- Keep scanner, extractor, generator, evaluator, CLI, and web app boundaries clear.
