# 薄荷工坊 / Mint Atelier

`薄荷工坊 / Mint Atelier` 是一个 React + Vite 桌面端高保真原型，用于呈现小红书内容创作工作台。当前版本是静态/演示型 UI，重点是 3 列工作台布局、Pastel 3D Claymorphism 视觉风格、可见交互状态和视觉 QA。

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

- `AGENTS.md`：协作入口、实现地图和持久边界。
- `docs/SPEC.md`：产品结构、交互状态和右侧配置栏规则。
- `docs/DESIGN.md`：视觉系统、布局规则和资产风格。
- `docs/VERIFICATION.md`：构建、截图和交互验证清单。
- `docs/QA_LOG.md`：最近视觉 QA 记录和当前状态。

## 当前原型状态

- 左侧：品牌、创作者资料、主导航、项目列表、设置入口。
- 中间：今日概览、输入灵感、编辑草稿、效果预览、最近任务。
- 右侧：模型配置、Codex 参数、运行历史。
- 本地 React state 驱动主导航、编辑标签、模型选择、运行方式、Codex 参数、Web Search 开关和灵感输入。

当前项目不包含后端生成能力，也不恢复旧的采样参数或本地资源面板。
