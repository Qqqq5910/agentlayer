# Release Checklist

Use this checklist for the `0.2.0-alpha.1` npm alpha and GitHub release. It keeps the public README,
npm registry, GitHub release page, and CI smoke test in the same state.

## Before Publishing

Confirm the working tree is clean and the local branch contains only intended release commits:

```bash
git status --short --branch
```

Run the full release gate:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm readability:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Check package contents and dry-run publishing:

```bash
pnpm --filter @agentlayer/core pack --pack-destination /tmp/agentlayer-pack-check
pnpm --filter @agentlayer/cli pack --pack-destination /tmp/agentlayer-pack-check

pnpm --filter @agentlayer/core publish --access public --tag alpha --dry-run
pnpm --filter @agentlayer/cli publish --access public --tag alpha --dry-run
```

Confirm npm authentication and registry availability:

```bash
npm whoami
npm view @agentlayer/core version --json
npm view @agentlayer/cli version --json
```

If the package names still return `404`, that is expected before the first publish. If `npm whoami`
returns `ENEEDAUTH`, run `npm login` locally before continuing.

## Publish Order

Publish core first, then CLI:

```bash
pnpm --filter @agentlayer/core publish --access public --tag alpha
pnpm --filter @agentlayer/cli publish --access public --tag alpha
```

If npm returns `E403` and says two-factor authentication is required, publish with a current 6-digit
OTP from the npm account:

```bash
pnpm --filter @agentlayer/core publish --access public --tag alpha --otp=<current-otp>
pnpm --filter @agentlayer/cli publish --access public --tag alpha --otp=<current-otp>
```

If the OTP expires between commands, use a fresh OTP for the CLI package. Do not paste long-lived
npm tokens into issues, docs, commits, or chat logs.

Verify the registry:

```bash
npm view @agentlayer/core version --json
npm view @agentlayer/cli version --json
```

Both should return `0.2.0-alpha.1`.

## Post-Publish Smoke

Use a fresh directory so the smoke test proves package-manager execution works:

```bash
mkdir -p /tmp/agentlayer-smoke
cd /tmp/agentlayer-smoke

pnpm dlx @agentlayer/cli --help
pnpm dlx @agentlayer/cli doctor https://example.com --max-pages 3
pnpm dlx @agentlayer/cli generate https://example.com --out ./agentlayer-output --max-pages 3
```

After local smoke passes, run the manual GitHub workflow
`.github/workflows/published-cli-smoke.yml`.

## GitHub Sync

Push the release commits to GitHub only after the scoped npm packages are available. This avoids a
public `main` branch whose README points to packages that do not exist yet.

After pushing, create the GitHub release for `v0.2.0-alpha.1` using
`release-notes/v0.2.0-alpha.1.md`.

## Do Not Do

- Do not publish or recommend the unscoped `agentlayer` package name.
- Do not mark generated MCP, WebMCP, API Catalog, or Agent Skills files as compliance guarantees.
- Do not upload private URLs, credentials, customer data, or raw private scan output.
