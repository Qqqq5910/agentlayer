# AgentLayer CI examples

These GitHub Actions snippets are copyable starting points for the AgentLayer CI alpha. They use
repo-local `pnpm agentlayer` commands because the scoped npm CLI may not be published everywhere
yet.

- [github-actions-public-site.yml](./github-actions-public-site.yml) scans an owned public site,
  uploads the current baseline and compare JSON, and compares against a committed baseline path.
- [github-actions-local-fixture.yml](./github-actions-local-fixture.yml) starts a local fixture or
  app, then runs baseline and compare with `--allow-local`.

After the npm alpha is published, replace `pnpm agentlayer` with:

```bash
pnpm dlx @agentlayer/cli
```

Keep committed baselines and uploaded artifacts safe to share. Do not include secrets, credentials,
private URLs, internal paths, customer data, confidential screenshots, or unpublished launch plans.
