# Next.js Deployment

Use AgentLayer during development or CI to generate files, then serve reviewed artifacts from your Next.js app.

## Generate Artifacts

From a repository checkout:

```bash
pnpm agentlayer generate https://example.com --out ./agentlayer-output --max-pages 20
```

For a local fixture:

```bash
pnpm dev:example
pnpm agentlayer generate http://localhost:3001 --out ./agentlayer-output --max-pages 20 --allow-local
```

## Serve Static Files

After review, copy approved artifacts into your app's `public/` directory:

```text
public/llms.txt
public/llms-full.txt
public/.well-known/agents.json
public/.well-known/mcp/server-card.json
public/.well-known/api-catalog
public/.well-known/agent-skills/index.json
```

Next.js will serve files from `public/` at the matching URL path.

## Route Handler Option

If you need dynamic generation, create route handlers for specific files and return reviewed content with the correct content type. Keep dynamic routes deterministic and avoid generating unsupported compliance claims at request time.

## Release Checklist

- Confirm generated facts match current pages.
- Keep draft disclaimers in standards files.
- Add human confirmation to sensitive actions.
- Re-run AgentLayer after navigation, pricing, docs, policy, or security changes.
