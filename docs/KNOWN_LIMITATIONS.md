# 已知限制与领域适配分析

本文档记录当前项目的已知设计限制，以及对不同内容领域（穿搭 vs 科技/技术分享等）的适配性分析。

## 1. 草稿项目列表是静态占位数据

**位置：** `src/App.jsx`，第 95-100 行

`sidebarProjects` 是一个硬编码数组，包含以下默认项目：

```js
const sidebarProjects = [
  { title: "夏日通勤穿搭", meta: "新版流程草稿", active: true },
  { title: "治愈系家居好物", meta: "待补参考" },
  { title: "露营装备红榜", meta: "选题阶段" },
  { title: "轻便出行搭配", meta: "封面待生成" },
];
```

- 这些条目不会随用户操作动态增删，刷新页面后始终显示相同内容。
- 项目按钮**没有绑定 `onClick` 事件**，点击后不会加载或切换任何状态。
- 侧边栏的"保存"按钮（`saveDraft`）只更新 `lastSavedAt` 时间戳显示，**不会将工作流状态写入 `localStorage`**。

**结论：** 草稿项目功能目前为 UI 占位，跨会话持久化和项目切换尚未实现。

## 2. 工作流状态不持久化

**位置：** `src/App.jsx`，第 330-338 行

以下关键状态使用纯 `useState`，不经过 `useStoredState`，刷新页面后全部丢失：

- `searchResults` — 热门搜索结果
- `selectedSearchIds` — 已勾选的搜索结果
- `ragItems` — 已入库的参考内容
- `topics` — 生成的 10 个选题
- `selectedTopicId` — 已选中的选题
- `drafts` — 生成的 5 篇文案
- `selectedDraftId` — 已选中的文案
- `prompts` — 生成的 5 份封面 Prompt
- `selectedPromptId` — 已选中的 Prompt
- `coverImage` — 生成的封面图

**持久化的只有：** `persona`、`keyword`、`writingBrief`、`modelConfig`（存于 `localStorage`，key 为 `mint-atelier-v2:*`）。

**结论：** 这是一个单会话工作流工具。刷新后需从"搜索热门内容"重新开始，但人设和关键词会自动回填。

## 3. 封面图 Prompt 模板硬编码穿搭/生活方式审美

**位置：** `server/codex/coverImage.mjs`，第 39-51 行

`buildCoverImagePrompt` 函数硬编码了以下样式指令：

```js
"Style/medium: photorealistic editorial still-life image with soft pastel claymorphism influence",
"Lighting/mood: soft natural studio light, fresh mint atelier mood, refined and practical",
"Color palette: mint green, cream white, pale rose, soft lavender, low-saturation summer colors",
"Materials/textures: fabric, paper, bag, shoes, stationery, color cards, desk surface, plants or flowers if useful",
```

这套指令对穿搭、家居、生活方式类内容适配良好，但**不适合科技/技术分享类内容**：

- 科技内容需要展示的是代码截图、架构图、硬件产品、仪表盘等，而非 pastel 静物
- 颜色偏好（薄荷绿、奶油白、淡粉）与科技感的深色/冷色调不匹配
- 材质列表（fabric、bag、shoes）对技术分享无意义

**修复方向：** 引入一个用户可配置的"封面风格预设"字段，或在 prompt 模板中根据人设关键词动态调整风格指令。

## 4. 文案 Prompt 模板对非穿搭内容适用，但需调整默认值

**位置：** `server/codex/prompts.mjs` 和 `src/App.jsx` 第 20-24 行

模板本身是参数化的（`persona`、`keyword`、`ragItems`、`writingBrief` 均通过 `buildCodexPrompt` 动态填入），不硬编码内容领域。但三个默认值写死了穿搭场景：

```js
const defaultPersona = "26 岁轻熟风穿搭博主，分享通勤、周末出行和约会搭配。表达温柔具体，重点放在真实穿着体验、单品组合和可复用公式。";
const defaultKeyword = "夏日通勤穿搭";
const defaultBrief = "创作上班族可收藏实用穿搭内容，核心突出清爽利落、提气色不闷汗，口吻贴近闺蜜走心分享。";
```

用户切换到科技博主场景时，需要手动修改这三个字段。

**结论：** 模板逻辑通用，默认值需要手动替换，否则模型会以穿搭风格作为初始倾向。

## 5. RAG 决策逻辑偏好"实用性/收藏价值"

**位置：** `server/codex/prompts.mjs`，第 153 行

自动化流程中的 RAG 入库决策 prompt 包含：

> "Prioritize specificity, practical usefulness, fit with the persona, keyword, writing brief, and platform-safe claims."

这条规则对穿搭内容（强调实用穿搭技巧、可收藏公式）是合理的，但对技术分享类内容，更合适的优先级可能是"技术深度、原理清晰度、避坑价值、代码可复现性"。

**修复方向：** 在决策 prompt 中增加根据 `persona` 动态调整优先级的逻辑，或将"实用性"泛化为"与当前账号定位高度匹配"。

## 6. 搜索适配：已迁移至 opencli，但仍受小红书风控限制

**位置：** `server/xhs/runXhs.mjs`

- 公开 npm 包 `xhs-cli` 不含 `search` 子命令，项目已改为调用 `opencli xiaohongshu search`。
- `opencli` 通过 Chrome CDP 控制浏览器，触发频率过高时小红书会弹出验证码或限制访问。
- 搜索超时设置为 150 秒，超时后自动终止进程。

## 7. 云端图片 API：移除非标准参数

**位置：** `server/codex/cloudProvider.mjs`，第 325-330 行（已修复）

原 `imageBody` 函数发送了 `response_format: "b64_json"` 和 `output_format: "png"`，这两个参数非 OpenAI 标准参数，在部分代理层（如 LiteLLM）会返回 `UnsupportedParamsError`。已移除这两个字段，现在只发送标准字段。

## 领域适配速查表

| 领域 | 选题生成 | 文案生成 | 封面图 Prompt | RAG 决策 |
|---|---|---|---|---|
| 穿搭/生活方式 | ✅ 完全适配 | ✅ 完全适配 | ✅ 完全适配 | ✅ 适配 |
| 科技/技术分享 | ⚠️ 需改默认人设 | ⚠️ 需改默认人设 | ❌ 风格不匹配 | ⚠️ 优先级逻辑需调整 |
| 美食/探店 | ⚠️ 需改默认人设 | ⚠️ 需改默认人设 | ⚠️ 色彩偏好偏淡 | ✅ 适配 |
| 健身/健康 | ⚠️ 需改默认人设 | ⚠️ 需改默认人设 | ⚠️ 色彩偏好偏淡 | ⚠️ 健康类有风险内容过滤 |
| 知识科普 | ⚠️ 需改默认人设 | ⚠️ 需改默认人设 | ❌ 风格不匹配 | ⚠️ 优先级逻辑需调整 |

---

*最后更新：2026-08-03*
