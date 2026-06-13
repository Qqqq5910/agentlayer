# GitHub Metadata

Recommended metadata for the AgentLayer v0.2.0-alpha.1 public alpha.

## Description

```text
Deterministic toolkit for making websites readable, trusted, and operable by AI agents.
```

## Website

```text
https://agentlayer-readonly-demo.vercel.app
```

## Repository

```text
https://github.com/Qqqq5910/agentlayer
```

## Topics

- `agentlayer`
- `llms-txt`
- `mcp`
- `webmcp`
- `ai-agents`
- `agent-operability`
- `agentic-web`
- `ai-readiness`

## Social Preview

Use `docs/assets/agentlayer-preview.svg` until a fresh screenshot from the hosted read-only demo is
ready. If using a screenshot, capture the report UI at:

```text
https://agentlayer-readonly-demo.vercel.app
```

Recommended preview criteria:

- Shows the AgentLayer report or generated artifact preview.
- Makes the score, task evidence, and recommendation context legible.
- Avoids terminal chrome, private browser details, or local-only URLs.
- Fits GitHub's wide social preview crop.

## Pinned Issue Title

```text
Share your AgentLayer scan result
```

## Release Post Timing

Publish launch posts only after:

- `@agentlayer/core@0.2.0-alpha.1` is visible on npm.
- `@agentlayer/cli@0.2.0-alpha.1` is visible on npm.
- `pnpm dlx @agentlayer/cli --help` works in a fresh directory.
- `pnpm dlx @agentlayer/cli generate https://example.com --out ./agentlayer-output --max-pages 3`
  completes.
- GitHub `main` includes the release commits.
