# Contributing

Thanks for helping build AgentLayer.

## Development Setup

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Principles

- Keep the core package deterministic without external AI APIs.
- Do not invent facts, prices, compliance claims, certifications, or actions.
- Every extracted fact should include a source URL and confidence score.
- Generated MCP, WebMCP, and action manifests are conservative drafts.
- Do not submit forms during scans.
- Respect max page limits, timeouts, and same-host crawl boundaries.
- Add focused tests when changing scanner, extractor, generator, evaluator, or CLI behavior.

## Pull Requests

1. Keep changes focused.
2. Add or update tests for behavioral changes.
3. Run `pnpm typecheck`, `pnpm test`, and `pnpm build`.
4. Document known limitations clearly.
