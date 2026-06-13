# Pinned Issue Template: Share Your AgentLayer Scan

Suggested pinned issue title:

```text
Share your AgentLayer scan result
```

## Intro

AgentLayer is looking for real public-site scan feedback. The read-only demo at
https://agentlayer-readonly-demo.vercel.app uses the fictional AcmeFlow fixture so people can
inspect the report UI. For feedback on your own site, please run the CLI and paste the scan details
below.

After the scoped npm alpha is published, the preferred command is:

```bash
pnpm dlx @junyi5910/agentlayer-cli generate https://your-site.com --out ./agentlayer-output --max-pages 20
```

Please avoid sharing private tokens, credentials, internal URLs, customer data, confidential
screenshots, unpublished launch plans, or other sensitive information.

## Template

```markdown
## AgentLayer scan result

URL:

command:

overall score:

wrong facts/actions:

confusing recommendations:

artifacts you would publish:
```

Pin this issue during the public alpha feedback window and point people to `docs/feedback.md` for
the longer feedback guide.
