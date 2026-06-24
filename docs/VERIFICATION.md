# VERIFICATION.md

## 基础命令

构建检查：

```bash
npm run build
```

默认本地预览：

```bash
npm run dev -- --port 5173
```

如果当前 in-app browser 已经打开其他端口，例如 `http://127.0.0.1:5174/`，可以直接使用该页面做刷新和交互验证，但文档中的默认命令仍以 `5173` 为准。

## Playwright 截图

在本地服务器运行后执行：

```bash
npx playwright@1.61.1 screenshot --viewport-size=1440,900 http://127.0.0.1:5173/ output/playwright/xhs-g4-1440.png
npx playwright@1.61.1 screenshot --viewport-size=1440,720 --full-page http://127.0.0.1:5173/ /tmp/xhs-g4-scroll-check.png
```

截图证据默认作为临时 QA 产物，不需要提交到仓库，除非用户明确要求。

## 视觉检查清单

修改视觉、布局、资产或交互后，至少检查：

- 1440x900 设计比例是否保持。
- 1440x720 或其他较矮视口是否可以上下滚动。
- 中间编辑区、预览区、最近任务是否被切割、剪裁或遮挡。
- 底部最近任务和左侧设置入口是否可滚动访问。
- 右侧模型配置、Codex 参数和运行历史是否完整可见或可滚动访问。
- 文案是否可读，按钮文字是否完整。
- 文本、按钮、卡片是否互不重叠。
- 3D 资产是否加载并与背景自然融合。
- 页面是否没有 Vite / React 错误覆盖层。
- Console `error` / `warn` 是否为 0。

## 交互检查清单

修改产品结构或交互后，至少检查：

- 左侧导航选中态可以切换。
- 编辑标签选中态可以切换。
- 文案生成模型和图片生成模型下拉可以切换。
- 本地 CLI / 云端 API 运行方式分段控件可以切换。
- Sandbox、Approval、Reasoning effort、Verbosity 和 Web Search 开关可以更新 UI 状态。
- 底部命令预览会随文案模型、sandbox 和 approval 变化。
- 输入灵感文本可以编辑，字数计数会更新。

## 文档检查

文档重组或路径变更后执行：

```bash
git diff --check
rg -n "<过期定位词>|<旧方向词>|<废弃文档入口>" AGENTS.md README.md docs
```

确认项目定位保持为小红书图文生成器，且没有过期文档入口或旧方向表述。
