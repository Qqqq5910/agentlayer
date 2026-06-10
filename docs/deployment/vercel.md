# Vercel Deployment

AgentLayer works well as a pre-deploy or CI step for sites hosted on Vercel.

## Local Review Flow

```bash
pnpm agentlayer generate https://agentlayer-demo.vercel.app --out ./agentlayer-output --max-pages 20
```

Review the output, then publish approved files through your app's `public/`
directory or equivalent static asset pipeline.

Replace `https://agentlayer-demo.vercel.app` with the concrete Vercel preview
URL for your deployment.

## Preview Deployments

Preview deployments are useful for checking whether new navigation, pricing,
docs, security, or support pages remain agent-operable before production
release.

Suggested flow:

1. Deploy a Vercel preview.
2. Run AgentLayer against the preview URL.
3. Review `report.html`, `tasks-report.json`, and `recommendations.json`.
4. Update site content or generated artifacts.
5. Promote only after the reviewed artifacts are current.

## Production Paths

Serve reviewed artifacts at:

```text
/llms.txt
/llms-full.txt
/.well-known/agents.json
/.well-known/mcp/server-card.json
/.well-known/api-catalog
/.well-known/agent-skills/index.json
```

Keep draft/non-compliance disclaimers in files for evolving standards.
