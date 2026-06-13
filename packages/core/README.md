# @agentlayer/core

Core scanner, extractor, evaluator, CI comparison, and artifact generation library for AgentLayer.

AgentLayer is a deterministic toolkit for checking whether public websites can be read, trusted, and
operated by AI agents.

## Status

`@agentlayer/core` is an alpha package. Generated artifacts and standards-related metadata are
review drafts, not compliance guarantees.

## Install

```bash
pnpm add @agentlayer/core@alpha
```

Most users should start with the CLI package instead:

```bash
pnpm dlx @agentlayer/cli generate https://your-site.com --out ./agentlayer-output --max-pages 20
```

## Links

- Repository: https://github.com/Qqqq5910/agentlayer
- CLI package: https://www.npmjs.com/package/@agentlayer/cli
- CI docs: https://github.com/Qqqq5910/agentlayer/blob/main/docs/ci.md
