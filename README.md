# 薄荷工坊 / Mint Atelier

`薄荷工坊 / Mint Atelier` 是一个 React + Vite 桌面端应用，用于生成小红书图文笔记：5 个可选标题、尾部包含 tag 的正文、以及笔记封面 prompt。

当前项目保持 3 列内容创作工作台形态，并保留 Pastel 3D Claymorphism 视觉方向。后续生成链路会围绕本地 CLI 模型、云端 API 模型、`xiaohongshu-cli` 搜索和本地 RAG 知识库继续实现。

## 本地运行

安装依赖后启动开发服务器：

```bash
npm run dev -- --port 5173
```

构建检查：

```bash
npm run build
```

## 文档入口

- `AGENTS.md`：项目契约、核心功能、风控边界和实现地图。
- `docs/DESIGN.md`：视觉系统、布局规则和资产风格。
- `docs/VERIFICATION.md`：构建、截图和交互验证清单。
- `docs/QA_LOG.md`：最近视觉 QA 记录和当前状态。

## 当前项目状态

- 左侧：品牌、创作者资料、主导航、项目列表、设置入口。
- 中间：今日概览、输入灵感、编辑草稿、效果预览、最近任务。
- 右侧：模型配置、Codex 参数、运行历史。
- 本地 React state 驱动主导航、编辑标签、模型选择、运行方式、Codex 参数、Web Search 开关和灵感输入。

核心边界：`xiaohongshu-cli` 调用、搜索、RAG 入库和生成链路都必须保留用户主动触发和确认边界；当前不做自动发布、自动评论、自动私信或自动批量采集。
