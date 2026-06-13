# AgentLayer Alpha Xiaohongshu Post

## 定位

AgentLayer 的小红书发布不要写成融资稿、产品发布会或“AI 改造一切”的口吻。它更适合被介绍成一个开源、可本地运行的 alpha 工具：帮网站 owner 检查一个公开网站是否把 AI
Agent 需要的信息、路径和证据讲清楚。

核心表达：

- SEO 让网站可被搜索引擎发现；AgentLayer 想检查网站是否可被 AI Agent 理解和操作。
- 这不是让 Agent 代替你做决策，也不是抓取私有系统。
- 它更像一次“agent 可操作性体检”：扫公开页面，生成报告，看哪里证据不够、动作路径不清楚、政策说明缺失。
- 现在是 public alpha，目标是收集真实公开网站的扫描反馈。

适合点名的人群：

- 做 SaaS 官网、文档站、开源项目主页的人。
- 关心 AI Agent、SEO、文档体验、转化路径的人。
- 想知道自己网站对机器读者是否友好的人。

不要承诺：

- 不承诺自动提升流量、排名或转化。
- 不承诺 Agent 一定能完成所有任务。
- 不建议扫描需要登录、内网、客户数据或保密内容的网站。

## 图片轮播计划（6 张）

GitHub 截图只作为证明和信任页，不做封面。封面应该讲清楚问题本身，而不是把仓库截图放第一张。

1. 封面：问题页
   - 主标题：`你的网站，AI Agent 真的能操作吗？`
   - 副标题：`一个开源 alpha 工具，扫公开网站并生成 agent 可操作性报告`
   - 画面建议：用报告截图、CLI 输出局部或干净的产品图做背景，不用 GitHub 截图。

2. 为什么需要这个
   - 文案：`SEO 解决“能不能被发现”；AgentLayer 关注“能不能被理解、信任、操作”。`
   - 画面建议：左边是搜索/SEO，右边是 Agent 需要的 facts、actions、evidence。

3. 它会检查什么
   - 文案：`事实信息、政策说明、动作路径、任务证据、缺失证据。`
   - 画面建议：用 5 个简洁模块展示，不要堆太多字。

4. 5 分钟试用路径
   - 文案：`扫一个公开网站 -> 打开 report.html -> 看通过/失败/缺证据原因。`
   - 画面建议：展示命令行和输出目录，突出“本地运行”和“可 review”。

5. 报告长什么样
   - 文案：`不是只给一个分数，而是给任务证据和可改的地方。`
   - 画面建议：放 report.html 的局部截图，注意遮掉任何真实敏感信息。

6. 开源与可信度证明
   - 文案：`开源 alpha，欢迎真实公开网站反馈。`
   - 画面建议：这里再放 GitHub
     repo 截图、README 局部或 release/tag 信息。明确这张是证明/信任页，不是封面。

## 封面文字备选

1. `你的网站，AI Agent 真的能操作吗？`
2. `不只 SEO：给 AI Agent 的网站体检`
3. `我做了一个网站 Agent 可操作性检查工具`
4. `5 分钟扫一下：网站对 AI Agent 友好吗？`
5. `公开网站如何变得更适合 Agent 读取？`

## 完整可复制正文

```text
我做了一个开源 alpha 工具：AgentLayer。

一句话说，它想检查一个公开网站是否“适合被 AI Agent 理解和操作”。

SEO 解决的是：你的网站能不能被搜索引擎发现。
AgentLayer 关注的是：当 AI Agent 来读你的网站时，它能不能找到清楚的事实信息、政策说明、动作路径和可验证证据。

它现在能做的事情比较朴素：

- 扫描一个有边界的公开网站
- 生成本地 report.html
- 给出 agent 可操作性相关的检查结果
- 标出任务为什么通过、失败或缺少证据
- 给出一些可以人工 review 后再处理的改进建议

试用命令：

pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20

然后打开：

open ./agentlayer-output/report.html

这个版本还是 public alpha，不适合拿来当“最终评分”或者销售材料。我更想收集真实反馈：

- 哪些事实识别错了？
- 哪些 action/path 判断不准？
- 哪些 recommendation 看起来有用？
- 哪些 artifact 你会愿意人工检查后发布？
- report.html 里有什么地方不清楚？

安全边界也说清楚：

只扫公开网站。不要扫需要登录的网站、内网地址、后台系统、客户数据页面、含凭证的 URL，或者任何不能公开截图/讨论的内容。不要上传 token、cookie、账号密码、内部文档、客户信息、保密截图。

如果你有一个公开 SaaS 官网、文档站、开源项目主页，或者你正在研究 AI Agent 会怎么读取网页，可以试一下。

GitHub:
https://github.com/Qqqq5910/agentlayer

Demo:
https://agentlayer-readonly-demo.vercel.app

评论区可以直接留“想试”，或者 DM 我你扫的是哪类公开网站。我最想要的是具体反馈，不是夸夸：哪里错、哪里不清楚、哪里真的帮你发现了网站问题。
```

## 短版正文

```text
我做了一个开源 alpha 工具：AgentLayer。

SEO 让网站可被发现；AgentLayer 想检查网站是否可被 AI Agent 理解和操作。

它会扫描一个有边界的公开网站，生成本地 report.html，看清楚 facts、actions、policy、evidence 这些信息够不够，哪些任务通过、失败或缺少证据。

试用命令：

pnpm dlx @junyi5910/agentlayer-cli@0.2.0-alpha.3 generate https://your-site.com --out ./agentlayer-output --max-pages 20

请只扫公开网站，不要扫需要登录、内网、后台、客户数据、含凭证 URL 或任何保密内容。

GitHub:
https://github.com/Qqqq5910/agentlayer

如果你有 SaaS 官网、文档站、开源项目主页，欢迎试一下。评论或 DM 我你的反馈：哪里识别错了、哪里建议有用、report 有没有看不懂的地方。
```

## 评论 / DM CTA

评论区 CTA：

- `想试的话评论“AgentLayer”，我把命令和反馈模板发你。`
- `如果你扫了公开网站，欢迎贴 overall score 和 1-2 个最有用/最不准的结果。不要贴任何私有信息。`
- `我现在最需要真实反馈：错判、看不懂、建议没用，都很有价值。`

DM CTA：

- `可以 DM 我：你扫的网站类型 + overall score + 哪条结果最不准/最有用。`
- `如果你不方便公开网站链接，可以只说网站类型和截图局部，但请不要发客户数据、内部页面或任何凭证。`

## 标签建议

可选标签：

- `#AI工具`
- `#开源项目`
- `#AI Agent`
- `#独立开发`
- `#SaaS`
- `#网站优化`
- `#SEO`
- `#开发者工具`
- `#产品设计`
- `#技术分享`

建议组合：

```text
#AI工具 #AI Agent #开源项目 #独立开发 #开发者工具 #SaaS #网站优化
```

## 发布前检查

- 封面不要用 GitHub 截图；GitHub 截图放第 6 张作为开源和可信度证明。
- 所有截图都检查一遍：没有账号、token、cookie、内部 URL、客户名、客户数据、后台页面、未公开 roadmap。
- 命令里的版本号保持为 `0.2.0-alpha.3`。
- 语气保持“邀请试用和反馈”，不要写成“已经解决 Agent 访问网站问题”。
