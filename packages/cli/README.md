# @junyi5910/agentlayer-cli

Command-line interface for scanning public websites and generating AgentLayer reports and draft
agent-facing artifacts.

## Quickstart

```bash
pnpm dlx @junyi5910/agentlayer-cli generate https://your-site.com --out ./agentlayer-output --max-pages 20
```

Open:

```bash
open ./agentlayer-output/report.html
```

You can also run a quick diagnosis:

```bash
pnpm dlx @junyi5910/agentlayer-cli doctor https://your-site.com --max-pages 20
```

## Status

`@junyi5910/agentlayer-cli` is an alpha package. AgentLayer scans bounded public pages, does not
submit forms, does not crawl authenticated/private areas, and does not perform destructive actions.

Generated artifacts are drafts. Review facts, actions, policies, and standards-related files before
publishing them on a production site.

## Links

- Repository: https://github.com/Qqqq5910/agentlayer
- Feedback guide: https://github.com/Qqqq5910/agentlayer/blob/main/docs/feedback.md
- CI docs: https://github.com/Qqqq5910/agentlayer/blob/main/docs/ci.md
