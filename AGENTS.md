# AGENTS.md

## 项目契约

本仓库是 `薄荷工坊 / Mint Atelier` 的 React + Vite 桌面端高保真原型。产品形态是 Pastel 3D Claymorphism 风格的 3 列小红书内容创作工作台。

修改视觉设计、布局、资产或交互行为前，必须先阅读 `DESIGN.md`。`DESIGN.md` 是视觉系统、布局规则、资产风格和 QA 期望的事实来源。

## 实现地图

- 应用入口：`src/App.jsx`
- 全局样式和视觉 token：`src/styles.css`
- 静态资产：`public/assets/`
- 设计规范：`DESIGN.md`
- 视觉 QA 记录：`design-qa.md`

当前 UI 是静态/演示型原型，使用本地 React state 驱动可见交互，包括主导航、编辑标签、文案/图片模型选择、模型运行方式、Codex 参数、Web Search 开关和灵感输入。

## 开发命令

验证原型时自行启动本地开发服务器：

```bash
npm run dev -- --port 5173
```

构建检查：

```bash
npm run build
```

视觉验证优先使用当前 in-app browser。需要截图时，在本地服务器运行后使用 Playwright：

```bash
npx playwright@1.61.1 screenshot --viewport-size=1440,900 http://127.0.0.1:5173/ output/playwright/xhs-g4-1440.png
npx playwright@1.61.1 screenshot --viewport-size=1440,720 --full-page http://127.0.0.1:5173/ /tmp/xhs-g4-scroll-check.png
```

如果当前 in-app browser 已经打开其他端口，例如 `http://127.0.0.1:5174/`，可以直接使用该页面做刷新和交互验证，但文档中的默认命令仍以 `5173` 为准。

## 设计边界

保持产品形态：

- 3 列桌面工作台：左侧导航、中间创作区、右侧配置栏。
- Pastel 3D Claymorphism 风格，使用马卡龙紫、粉、奶油白、浅蓝、浅黄、薄荷绿。
- 大圆角黏土面板、柔和阴影、轻微内高光、凸起胶囊按钮和 3D soft icon。
- 保持生产力工具的信息层级、留白和可读性。

不要：

- 改成营销落地页。
- 改成深色科技风、玻璃拟态、极简黑白或通用 SaaS 风。
- 用普通线性图标替代软糖/黏土质感图标。
- 重新引入布局裁切、隐藏 overflow 或会切掉中间内容的固定高度容器。
- 添加解释“如何使用界面”的可见说明文字，除非该文案本身属于产品界面。

## 右侧配置栏规则

右侧配置栏当前包含：

- `模型配置`：分开设置文案生成模型和图片生成模型。
- 每个模型通道都支持 `本地 CLI` 和 `云端 API` 两种运行方式。
- `Codex 参数`：呈现与 Codex CLI 运行语义一致的参数，例如 `--sandbox`、`--ask-for-approval`、`--search` 和通过 `-c key=value` 覆盖的推理强度、输出详略等。
- `运行历史`：保留近期任务状态，不再展示本地资源面板。

不要恢复旧的 `采样参数`、`Temperature`、`Top P`、`重复惩罚` 或 `本地资源` 面板，除非产品方向明确改变并同步更新 `DESIGN.md`。

## 布局和滚动规则

原型必须支持较矮浏览器视口的纵向滚动。保留当前防裁切约束：

- `body` 允许滚动。
- `.app-shell` 使用 `min-height`，不要只依赖固定 `height`。
- `.app-shell` 不隐藏 overflow。
- `.creative-grid`、`.editor`、`.preview` 需要足够的垂直空间容纳内容。

布局变更后检查 1440x900 和 1440x720 等较矮视口，确认中间编辑器、预览卡、最近任务、左侧设置入口、右侧模型配置、Codex 参数和运行历史没有被裁切或隐藏。

## 文档维护

以下内容变化时更新 `DESIGN.md`：

- 视觉方向或配色。
- 布局结构或滚动行为。
- 组件结构或交互期望。
- 资产策略或图片风格。
- 视觉 QA 命令或验收标准。

以下内容变化时更新 `AGENTS.md`：

- 实现地图。
- 开发或验证命令。
- 持久协作规则。
- 右侧配置栏等关键产品形态边界。
