# QA_LOG.md

## 当前状态

- 项目：`薄荷工坊 / Mint Atelier`
- 类型：React + Vite 静态高保真桌面原型
- 主要界面：3 列小红书内容创作工作台
- 视觉方向：Pastel 3D Claymorphism Dashboard
- 当前 QA 结论：通过

## 当前实现核对

- 左侧：品牌、创作者资料、主导航、项目列表、设置入口。
- 中间：今日概览、输入灵感、编辑草稿、效果预览、最近任务。
- 右侧：模型配置、Codex 参数、运行历史。
- 右侧已移除旧的 `本地资源` 面板。
- 旧的 `采样参数`、`Temperature`、`Top P`、`重复惩罚` 不再作为主控件出现。

## 右侧配置栏 QA

模型配置：

- 文案生成和图片生成分开设置。
- 每个生成通道都有 `本地 CLI` 和 `云端 API` 两种运行方式。
- 文案模型可在本地 CLI 与云端 API 间切换。
- 图片模型默认展示云端 API 路线，并保留本地 CLI 选项。

Codex 参数：

- `Sandbox -s` 可选择 `read-only`、`workspace-write`、`danger-full-access`。
- `Approval -a` 可选择 `untrusted`、`on-request`、`never`。
- `Reasoning effort` 可在 `low`、`medium`、`high` 间切换。
- `Verbosity` 可在 `low`、`medium`、`high` 间切换。
- `Web Search --search` 可开关。
- 底部命令预览会随文案模型、sandbox 和 approval 变化。

## 最近验证记录

验证环境：

- in-app browser
- 当前页面：`http://127.0.0.1:5174/`
- 构建命令：`npm run build`
- 视口检查：1440x900 与较矮视口

已验证：

- 页面不是空白页。
- 无 Vite / React 错误覆盖层。
- Console `error` / `warn` 为 0。
- 右侧出现文案生成、图片生成、本地 CLI、云端 API 和 Codex 参数。
- 右侧不再出现 `本地资源`。
- 切换文案模型到云端 API 后，模型下拉更新为云端模型。
- 切换 sandbox、reasoning effort 和 Web Search 后，状态正常更新。
- 页面在较矮视口中仍可纵向滚动，右侧运行历史可继续访问。

## 后续注意

- 视觉或布局改动后，至少重新执行 `npm run build`。
- 涉及右栏改动时，必须同时检查模型配置、Codex 参数和运行历史。
- 如果恢复或新增资源监控类信息，需要先更新 `docs/SPEC.md` 和 `docs/DESIGN.md`，再改实现。
- 截图证据默认作为临时 QA 产物，不需要提交到仓库，除非用户明确要求。
