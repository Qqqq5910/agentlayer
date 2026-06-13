# AgentLayer CI examples

These GitHub Actions snippets are copyable starting points for the AgentLayer CI alpha. They use the
published alpha CLI through `pnpm dlx @junyi5910/agentlayer-cli`.

For `v0.2.0-alpha.1`, the alpha packages use the `@junyi5910` npm user scope because npm rejected
creating the `@agentlayer` org for this release. The `@agentlayer` org scope remains the future
migration target.

- [github-actions-public-site.yml](./github-actions-public-site.yml) scans an owned public site,
  uploads the current baseline and compare JSON, and compares against a committed baseline path.
- [github-actions-local-fixture.yml](./github-actions-local-fixture.yml) starts a local fixture or
  app, then runs baseline and compare with `--allow-local`.

For repository development, you can still use the local `pnpm agentlayer` alias after installing and
building the workspace.

Keep committed baselines and uploaded artifacts safe to share. Do not include secrets, credentials,
private URLs, internal paths, customer data, confidential screenshots, or unpublished launch plans.
