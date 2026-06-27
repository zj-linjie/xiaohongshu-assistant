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
- 当前 UI 使用本地 mock 搜索/RAG 数据和 React state 驱动可见交互；选题、文案、封面 Prompt 和 PNG 封面图可通过本地 Codex CLI 或云端 OpenAI-compatible API 生成。
- 人设、关键词、撰写思路和模型配置使用 `localStorage` 自动缓存。

## 新版流程 QA 重点

- 搜索必须由用户点击触发，搜索结果不会自动加入 RAG。
- RAG 入库必须先勾选搜索结果，再点击加入。
- 生成选题、生成文案、生成封面 Prompt 和生成封面图都必须由用户点击触发，并在右侧显示所选生成通道状态。
- 生成封面图会返回本地临时托管的 PNG 图片，必须由用户点击 Prompt 触发。
- 封面 Prompt 默认不包含真人、脸、手和动物，可以包含植物或花材。
- 封面图生成失败时必须保留原始 Prompt，方便重新生成。
- 云端 API 缺少模型名、API Key 或 API Base URL 时，需要显示配置缺失提示且不发起请求。

## 最近验证记录

### 2026-06-27 云端选题 reason 字段兼容修复

验证环境：

- 命令：`npm run build`、`git diff --check`
- App URL：`http://127.0.0.1:5179/`
- 真实云端文本 API：用户已在浏览器配置，回归时未回显 API Key
- 浏览器：Chrome，用户已打开页面，当前视口约 `1497x806`

已验证：

- 云端选题返回缺少 `reason` 字段时不再整批失败；服务端会基于同一条选题的 `angle`、`audience`、`hook` 生成内部推荐理由。
- 选题仍强校验 10 条数量，以及 `title`、`angle`、`audience`、`hook` 核心字段；不会用 mock 数据静默补齐缺失选题。
- 选题字段兼容常见中文 key，例如 `标题`、`选题角度`、`目标受众`、`推荐理由`、`内容爆点`。
- Prompt 已加固，明确要求云端模型每条选题都返回英文 key：`title`、`angle`、`audience`、`reason`、`hook`。
- API smoke 已覆盖：10 条选题缺少 `reason` 成功归一化、中文 key 成功归一化、缺少核心字段仍失败、数量不足仍失败。
- Chrome QA 已用当前页面配置跑通：搜索、勾选入库、云端生成 10 个选题；页面未再出现“云端 API 返回缺少字段：reason。”。
- 页面不是空白页，无 Vite / React 错误覆盖层，Console `error` / `warn` 为 0。

### 2026-06-27 云端 API 支持

验证环境：

- 命令：`npm run build`、`git diff --check`
- App URL：`http://127.0.0.1:5179/`（5173-5178 已被占用，本轮使用 5179）
- Mock provider：`http://127.0.0.1:5999/v1`
- 浏览器：in-app Browser，视口 `1440x900` 和 `1440x720`

已验证：

- 新增 `/api/cloud/generate` 可通过 OpenAI-compatible Chat Completions mock 返回 10 个选题、5 篇文案和 5 份封面 Prompt。
- 云端文案正文保留 `#话题名称[话题]#` 格式，封面 Prompt 保留“明确排除真人、脸、手和动物”边界。
- 新增 `/api/cloud/cover-image` 可处理 `b64_json` 和 `url` 两种图片响应，并统一发布为 `/generated/covers/*.png`。
- 云端图片输出已验证 HTTP 可访问、PNG signature 正确、封面结果和小红书预览使用同一个 PNG URL。
- 云端错误分支已验证：配置缺失 `API_CONFIG_MISSING`、数量不足 `API_BAD_JSON`、HTML 响应 `API_BAD_JSON`、坏 JSON `API_BAD_JSON`、HTTP 500 `API_HTTP_ERROR`、非 PNG `API_BAD_IMAGE`、空图片数据 `API_UNSUPPORTED_RESPONSE`、缺少 Prompt `BAD_REQUEST`。
- 右侧状态卡显示所选生成通道、云端 endpoint 摘要、耗时和错误码；`commandPreview` 不回显 API Key。
- Browser QA 跑通：搜索、勾选入库、缺配置提示、云端生成选题、云端生成文案、云端生成 Prompt、云端生成封面图。
- 页面不是空白页，无 Vite / React 错误覆盖层，Console `error` / `warn` 为 0。
- `1440x900` 和 `1440x720` 下整页不纵向滚动；`.sidebar`、`.workspace`、`.config-rail` 均保持独立滚动容器。
- 本地 Codex 文本 route 重新 smoke：`POST /api/codex/generate` 返回 10 个选题，耗时约 46s。
- 本地 PNG 发布函数的 `imagePath` 分支已用临时 PNG 验证；本轮未重新触发完整 600s Codex imagegen worker，完整本地 imagegen 链路沿用上一轮真实验收记录。

### 2026-06-27 本地 Codex CLI 与 imagegen PNG

验证环境：

- 命令：`npm run build`
- API：`POST /api/codex/generate` 和 `POST /api/codex/cover-image` 真实 Codex CLI smoke test
- 浏览器：in-app Browser QA；Playwright 固定视口截图
- URL：`http://127.0.0.1:5178/`（5173、5177 已被占用，本轮使用 5178）
- 视口：in-app Browser 当前视口

已验证：

- HTML 入口标题为 `薄荷工坊 / Mint Atelier`，不再保留 `Prototype` 标题。
- 生产构建可以完成。
- 本地 API smoke test 成功：`/api/codex/generate` 通过 Codex CLI 返回 10 个结构化选题，耗时约 44s。
- 本地封面图 API smoke test 成功：`/api/codex/cover-image` 通过 Codex CLI imagegen worker 返回 `/generated/covers/*.png`，PNG 托管响应 200，PNG signature 正确，文件大小约 2.27MB，耗时约 99s。
- 页面不是空白页，无 Vite / React 错误覆盖层。
- Console `error` / `warn` 为 0。
- 1440x900 下保持 3 列工作台，无横向溢出。
- 1440x720 下整页不纵向滚动，左侧保存入口、右侧错误覆盖和中间底部封面区均可在各自栏内滚动访问。
- 3 栏独立滚动已验证：`body`、`html`、`.app-shell` 不产生纵向滚动，`.sidebar`、`.workspace`、`.config-rail` 各自 `overflow-y: auto` 并响应本栏滚轮。
- 本轮 UI polish 重点：顶部指标卡完整露出、左侧身份标签不换行、滚动条降噪、空状态收紧、右侧模型配置表单减重。
- 页面主流程可点击推进：搜索、勾选入库、通过 Codex CLI 生成 10 个选题、通过 Codex CLI 生成 5 篇文案、通过 Codex CLI 生成 5 份 Prompt、点击 Prompt 生成 PNG 封面图。
- 前端封面图链路已验证：封面结果和小红书预览都切换到同一个 `/generated/covers/*.png`，图片自然尺寸有效，进度达到 100%，原始 Prompt 保留。
- 右侧状态卡显示 Codex CLI 执行中、成功、命令摘要和耗时。
- 当时云端 API 仍处于保留入口状态，点击后显示明确提示且不发起云端请求。
- API 错误分支已验证：缺少 RAG 返回 `BAD_REQUEST`，CLI 路径不可用返回 `CODEX_UNAVAILABLE`，非 JSON 输出解析返回 `CODEX_BAD_JSON`，缺少 Prompt 返回 `BAD_REQUEST`，imagegen worker 未写结果返回 `IMAGEGEN_BAD_OUTPUT`。`CODEX_TIMEOUT` 为 600s 超时保护分支，本轮未强制等待触发。
- 封面 Prompt 边界已加固：Prompt 生成要求包含“明确排除真人、脸、手和动物”，校验兼容常见中英文边界表达。
- 新版 Codex CLI 文本与 imagegen PNG 封面图边界已写入 `docs/SPEC.md`。
- `AGENTS.md`、`README.md`、`docs/VERIFICATION.md` 已同步到本地 Codex CLI 文本与封面图生成流程。

## 后续注意

- 视觉或布局改动后，至少重新执行 `npm run build`。
- 浏览器 QA 时必须检查页面不是空白页、无 Vite / React 错误覆盖层、Console `error` / `warn` 为 0。
- 涉及 `xiaohongshu-cli`、搜索、RAG 入库或生成链路时，必须检查用户主动触发和确认边界。
- 截图证据默认作为临时 QA 产物，不需要提交到仓库，除非用户明确要求。
