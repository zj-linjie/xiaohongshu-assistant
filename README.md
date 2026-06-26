# 薄荷工坊 / Mint Atelier

`薄荷工坊 / Mint Atelier` 是一个 React + Vite 桌面端 Web App，用于辅助生成小红书内容草稿。当前设计稿以阶段式工作台表达完整流程：人设和关键词输入、热门内容搜索、手动加入本地 RAG、生成选题、生成文案、生成封面 Prompt、生成封面图。

项目保持 3 列内容创作工作台形态，并保留 Pastel 3D Claymorphism 视觉方向。当前生成链路已接入本地 Codex CLI：生成选题、生成文案、生成封面 Prompt 和生成 imagegen PNG 封面图都会调用本机 `codex exec`；热门搜索和 RAG 来源仍使用本地 mock 数据表达流程。

## 本地运行

安装依赖后启动开发服务器：

```bash
npm run dev -- --port 5173
```

构建检查：

```bash
npm run build
```

本地 Codex CLI 默认使用 `/opt/homebrew/bin/codex`，可通过环境变量覆盖：

```bash
CODEX_CLI_PATH=/path/to/codex npm run dev -- --port 5173
```

## 文档入口

- `docs/SPEC.md`：详细产品规格和完整核心流程。
- `AGENTS.md`：项目契约、边界、实现地图和修改规则。
- `docs/DESIGN.md`：视觉系统、布局规则和资产风格。
- `docs/VERIFICATION.md`：构建、截图和交互验证清单。
- `docs/QA_LOG.md`：最近视觉 QA 记录和当前状态。

## 当前项目状态

- 左侧：品牌、创作者资料、创作流程、草稿项目、保存入口。
- 中间：概览、人设关键词、热门搜索、RAG 入库、Codex 选题候选、撰写思路、Codex 文案候选、小红书预览、Codex 封面 Prompt 和 Codex imagegen PNG 封面图结果。
- 右侧：文案模型配置、图片模型配置、Codex CLI 调用状态、错误提示、错误覆盖检查。
- 本地 React state 驱动流程推进、结果选择、错误提示和封面图展示；人设、关键词、撰写思路和模型配置会写入 `localStorage`。

核心边界：搜索、RAG 入库、Codex 文本生成和 Codex 封面图生成都必须由用户主动点击触发；当前不做自动发布、自动点赞、自动评论、自动收藏、自动关注、自动私信或自动批量采集。
