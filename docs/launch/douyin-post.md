# AgentLayer 抖音发布稿

目标：30-45 秒，让开发者愿意试跑一次 alpha。开头不要放 GitHub 截图；GitHub 截图只放最后，作为开源可信度的收尾证明。

## 视频结构

| 时间   | 画面                                                       | 重点                                    |
| ------ | ---------------------------------------------------------- | --------------------------------------- |
| 0-3s   | 真实网站页面 + 光标停在导航/价格/文档入口                  | 钩子：AI Agent 能不能真的操作你的网站？ |
| 3-8s   | 切到终端，贴出命令                                         | 一条命令扫公开网站                      |
| 8-18s  | 终端运行 + 生成 `agentlayer-output`                        | 不讲原理，先展示结果出来了              |
| 18-30s | 打开 `report.html`，快速扫过分数、任务证据、缺失证据、建议 | 价值：看到 Agent 卡在哪里               |
| 30-38s | 展示可分享的报告片段，遮掉无关信息                         | 强调安全边界                            |
| 38-45s | GitHub repo 截图 + alpha 字样 + 评论区 CTA                 | 最后给信任证明和行动                    |

## Shot List

1. 浏览器打开一个公开网站，停在首页或 docs 页。
2. 终端输入固定命令：

```bash
pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20
```

3. 展示命令跑完，目录里出现 `agentlayer-output`。
4. 打开 `report.html`，镜头停在 overall score。
5. 快速切 2-3 个报告细节：passed/partial/failed task、missing evidence、recommendations。
6. 最后 3-5 秒展示 GitHub 页面截图：repo 名、README、开源代码位置。这里是信任证明，不是开头钩子。

## 口播稿

```text
你的网站，AI Agent 真的会用吗？

不是“能不能被搜到”，而是 Agent 能不能找到事实、理解政策、走通关键路径。

我做了一个开源 alpha 工具：AgentLayer。
一条命令，扫一个公开网站。

它会生成一份报告：哪些任务能跑通，哪些证据缺失，哪些页面需要补清楚。

比如价格、退款政策、联系方式、操作入口，Agent 到底能不能稳定读到。

注意：只扫公开页面。不要扫登录后台，不要放账号密码，不要上传客户数据，也不要公开保密截图。

现在是 alpha，我想找真实网站试跑。
想试的话，评论“AgentLayer”或者私信我，我把命令和 GitHub 发你。
```

## 屏幕文字

```text
AI Agent 真的会用你的网站吗？
```

```text
SEO 让网站可被发现
AgentLayer 让网站可被 Agent 操作
```

```text
一条命令扫公开网站
生成 agent-readiness 报告
```

```text
看清楚：
任务是否跑通
证据是否够
哪里需要补
```

```text
安全边界：
只扫公开页面
不放账号密码
不放客户/内部/保密数据
```

```text
GitHub 开源 alpha
评论 / 私信：AgentLayer
```

## 封面标题备选

1. AI Agent 真的会用你的网站吗？
2. 我做了个网站 Agent 体检工具
3. 一条命令，看网站能不能被 Agent 操作
4. SEO 之后，该轮到 Agent 可操作性了
5. 公开网站的 AI Agent readiness 检查

## 文案 Caption

```text
AgentLayer v0.2.0-alpha.3 开始找真实网站试跑。

它不是测 SEO，而是测一个公开网站是否给 AI Agent 提供了足够清楚的事实、政策、动作路径和可 review 的证据。

试跑命令：

pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20

安全边界：只扫公开网站；不要使用账号密码；不要扫描私有/内部/客户数据；不要发布含保密信息的截图。

想试的话，评论或私信「AgentLayer」。
```

## 评论 / 私信 CTA

评论区置顶：

```text
想试跑的评论「AgentLayer」。只建议扫公开页面；不要发账号密码、后台地址、客户数据或保密截图。
```

私信回复：

```text
可以，先扫一个公开网站：

pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20

跑完打开 ./agentlayer-output/report.html。方便的话，把 overall score、失败/部分通过的任务、你觉得不准的地方发我。不需要发任何私密数据。
```

## Hashtag 建议

```text
#AI工具 #Agent #开源项目 #独立开发 #开发者工具 #网站优化 #SaaS #程序员 #AI应用 #AgenticWeb
```
