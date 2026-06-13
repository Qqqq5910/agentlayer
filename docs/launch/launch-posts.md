# AgentLayer v0.2.0-alpha.2 Launch Drafts

Use these drafts after the scoped npm packages are published and the `pnpm dlx` smoke test passes.
Do not post them while `@junyi5910/agentlayer-core` or `@junyi5910/agentlayer-cli` still returns
`404` from the npm registry.

For this alpha, the npm packages use the `@junyi5910` user scope because npm rejected creating the
`@agentlayer` org for this release. Keep the `@agentlayer` npm org scope as the future migration
target.

## English Short

```text
AgentLayer v0.2.0-alpha.2 is ready for public alpha testing.

SEO made websites discoverable. AgentLayer makes websites operable by AI agents.

Try a bounded public-site scan:

pnpm dlx @junyi5910/agentlayer-cli generate https://your-site.com --out ./agentlayer-output --max-pages 20

You get a report with score breakdowns, task evidence, missing evidence, and suggested fixes.

GitHub: https://github.com/Qqqq5910/agentlayer
Demo: https://agentlayer-readonly-demo.vercel.app
```

## English Longer

```text
AgentLayer v0.2.0-alpha.2 is ready for public alpha testing.

SEO made websites discoverable. AgentLayer makes websites operable by AI agents.

AgentLayer is an open-source deterministic toolkit for checking whether a public website exposes the
facts, policies, action paths, and reviewable artifacts that AI agents need.

This alpha focuses on the first 5-minute path:

- install and run the scoped CLI with pnpm dlx
- scan bounded public pages
- open report.html
- see why tasks passed, failed, or need evidence
- compare local CI baselines when agent-operability changes
- share real scan feedback safely

Try it:

pnpm dlx @junyi5910/agentlayer-cli generate https://your-site.com --out ./agentlayer-output --max-pages 20
open ./agentlayer-output/report.html

The hosted demo is read-only and uses a fictional AcmeFlow fixture. For a real site, run the CLI
locally and review generated artifacts before publishing them.

If you try it, please share what looked wrong or confusing: task results, facts/actions,
recommendations, and which artifacts you would actually publish.

GitHub: https://github.com/Qqqq5910/agentlayer
Demo: https://agentlayer-readonly-demo.vercel.app
```

## Chinese Short

```text
AgentLayer v0.2.0-alpha.2 可以公开 alpha 测试了。

SEO 让网站可被发现；AgentLayer 让网站可被 AI Agent 操作。

试扫一个公开网站：

pnpm dlx @junyi5910/agentlayer-cli generate https://your-site.com --out ./agentlayer-output --max-pages 20

你会得到一份报告：分数、任务证据、缺失证据、修复建议都会写清楚。

GitHub: https://github.com/Qqqq5910/agentlayer
Demo: https://agentlayer-readonly-demo.vercel.app
```

## Chinese Longer

```text
AgentLayer v0.2.0-alpha.2 可以公开 alpha 测试了。

SEO 让网站可被发现；AgentLayer 让网站可被 AI Agent 操作。

AgentLayer 是一个开源、确定性的工具包，用来检查公开网站是否提供了 AI Agent 需要的事实、
政策说明、动作路径，以及可以人工 review 后发布的 agent-facing artifacts。

这个 alpha 版本重点打通 5 分钟试用路径：

- 用 pnpm dlx 运行 scoped CLI
- 扫描有边界的公开页面
- 打开 report.html
- 看清楚任务为什么通过、失败或缺少证据
- 用本地 CI baseline/compare 检查 agent-operability 回归
- 安全地反馈真实网站扫描结果

试用：

pnpm dlx @junyi5910/agentlayer-cli generate https://your-site.com --out ./agentlayer-output --max-pages 20
open ./agentlayer-output/report.html

在线 demo 是只读的，使用虚构的 AcmeFlow fixture。真实网站请在本地运行 CLI，并在发布任何
生成文件之前先人工检查。

如果你试了，欢迎反馈：任务结果、facts/actions、recommendations 哪里不准或不清楚，以及哪些
artifacts 你真的愿意发布。

GitHub: https://github.com/Qqqq5910/agentlayer
Demo: https://agentlayer-readonly-demo.vercel.app
```

## Outreach Prompts

Use these for direct asks to early testers:

```text
Could you run AgentLayer on one public SaaS/docs site you control and send me the report summary?
I am looking for wrong facts/actions, confusing recommendations, and whether report.html points to
2-3 useful website fixes.
```

```text
I am collecting real public-site scans for AgentLayer's alpha. No private URLs or customer data.
The useful feedback is: overall score, failed/partial tasks, false positives, and artifacts you
would publish after review.
```

## Alternative Taglines

1. Make your website readable, trusted, and operable by AI agents.
2. A deterministic readiness check for the agentic web.
3. Turn public websites into reviewable agent-facing artifacts.
4. Find the facts, actions, and gaps that agents need to operate.
5. Agent operability checks for teams that publish on the web.
