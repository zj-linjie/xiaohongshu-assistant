# QA_LOG.md

## 当前状态

- 项目：`薄荷工坊 / Mint Atelier`
- 类型：React + Vite 桌面端小红书 AI 助理
- 主要界面：3 列独立滚动的阶段式小红书内容创作工作台
- 视觉方向：Pastel 3D Claymorphism Dashboard
- 当前 QA 结论：通过

## 当前实现核对

- 左侧：品牌、创作者资料、创作流程、草稿项目、保存入口。
- 中间：新版概览、人设关键词、热门内容搜索、RAG 入库、10 个选题、撰写思路、5 篇文案、小红书预览、5 份封面 Prompt 和封面图结果。
- 右侧：文案生成模型配置、图片生成模型配置、状态与错误提示、错误覆盖检查。
- 当前 UI 使用本地 mock 搜索/RAG 数据和 React state 驱动可见交互；选题、文案和封面 Prompt 通过本地 Codex CLI 真实生成，封面图仍为 mock 结果。
- 人设、关键词、撰写思路和模型配置使用 `localStorage` 自动缓存。

## 新版流程 QA 重点

- 搜索必须由用户点击触发，搜索结果不会自动加入 RAG。
- RAG 入库必须先勾选搜索结果，再点击加入。
- 生成选题、生成文案和生成封面 Prompt 都必须由用户点击触发，并在右侧显示 Codex CLI 调用状态。
- 生成封面图仍为 mock 结果，必须由用户点击 Prompt 触发。
- 封面 Prompt 默认不包含真人、脸、手和动物，可以包含植物或花材。
- 封面图生成失败时必须保留原始 Prompt，方便重新生成。
- 云端 API 暂未接入时，需要显示“云端 API 暂未接入”提示。

## 最近验证记录

验证环境：

- 命令：`npm run build`
- API：`POST /api/codex/generate` 真实 Codex CLI smoke test
- 浏览器：in-app Browser QA；Playwright 固定视口截图
- URL：`http://127.0.0.1:5176/`（5173、5174、5175 已被占用，本轮使用 5176）
- 视口：in-app Browser 当前视口、1440x900 和 1440x720 CSS px

已验证：

- HTML 入口标题为 `薄荷工坊 / Mint Atelier`，不再保留 `Prototype` 标题。
- 生产构建可以完成。
- 本地 API smoke test 成功：`/api/codex/generate` 通过 Codex CLI 返回 10 个结构化选题，耗时约 44s。
- 页面不是空白页，无 Vite / React 错误覆盖层。
- Console `error` / `warn` 为 0。
- 1440x900 下保持 3 列工作台，无横向溢出。
- 1440x720 下整页不纵向滚动，左侧保存入口、右侧错误覆盖和中间底部封面区均可在各自栏内滚动访问。
- 3 栏独立滚动已验证：`body`、`html`、`.app-shell` 不产生纵向滚动，`.sidebar`、`.workspace`、`.config-rail` 各自 `overflow-y: auto` 并响应本栏滚轮。
- 本轮 UI polish 重点：顶部指标卡完整露出、左侧身份标签不换行、滚动条降噪、空状态收紧、右侧模型配置表单减重。
- 页面主流程可点击推进：搜索、勾选入库、通过 Codex CLI 生成 10 个选题、通过 Codex CLI 生成 5 篇文案、通过 Codex CLI 生成 5 份 Prompt、点击 Prompt 生成封面 mock 图。
- 右侧状态卡显示 Codex CLI 执行中、成功、命令摘要和耗时。
- 云端 API 暂未接入时显示明确提示，不发起云端请求。
- API 错误分支已验证：缺少 RAG 返回 `BAD_REQUEST`，CLI 路径不可用返回 `CODEX_UNAVAILABLE`，非 JSON 输出解析返回 `CODEX_BAD_JSON`。`CODEX_TIMEOUT` 为超时保护分支，本轮未强制等待触发。
- 新版 Codex CLI 边界已写入 `docs/SPEC.md`。
- `AGENTS.md`、`README.md`、`docs/VERIFICATION.md` 已同步到本地 Codex CLI 文本生成流程。

## 后续注意

- 视觉或布局改动后，至少重新执行 `npm run build`。
- 浏览器 QA 时必须检查页面不是空白页、无 Vite / React 错误覆盖层、Console `error` / `warn` 为 0。
- 涉及 `xiaohongshu-cli`、搜索、RAG 入库或生成链路时，必须检查用户主动触发和确认边界。
- 截图证据默认作为临时 QA 产物，不需要提交到仓库，除非用户明确要求。
