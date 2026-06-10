# Cloudflare Workers Deployment

AgentLayer can generate static artifacts that are served by Cloudflare Pages, Workers, or an
existing edge app.

## Static Assets

For Cloudflare Pages, place reviewed artifacts in your static output directory so these paths
resolve:

```text
/llms.txt
/llms-full.txt
/.well-known/agents.json
/.well-known/mcp/server-card.json
/.well-known/api-catalog
/.well-known/agent-skills/index.json
```

## Worker Routes

For Workers, add explicit routes for the generated files and return the reviewed content with stable
cache headers.

Recommended content types:

- `text/plain; charset=utf-8` for `llms.txt` and `llms-full.txt`
- `application/json; charset=utf-8` for JSON artifacts
- `text/markdown; charset=utf-8` for Markdown alternatives

## Cache Guidance

Use normal static caching for reviewed artifacts, but purge or redeploy after material site changes.
Pricing, policy, docs, and security updates should trigger a fresh AgentLayer run and human review.

## Boundaries

Do not use a Worker route to create live action execution unless you have implemented
authentication, authorization, auditing, rate limits, and human confirmation where needed.
AgentLayer's generated action files are suggestions, not executable tools.
