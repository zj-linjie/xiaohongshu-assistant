import { useMemo, useState } from "react";

const navItems = [
  { id: "workspace", icon: "房", label: "创作工作台" },
  { id: "ideas", icon: "灯", label: "灵感库" },
  { id: "assets", icon: "夹", label: "素材库" },
  { id: "templates", icon: "模", label: "模板中心" },
  { id: "data", icon: "图", label: "数据看板" },
];

const summerTopic = "夏日穿搭系列";
const summerInspiration = "夏日穿搭系列：清爽、舒适、适合日常出行的穿搭灵感。";
const summerTitle = "夏日穿搭系列｜清爽舒适的日常搭配灵感";
const summerPostTitle = "夏日通勤穿搭｜清爽舒适的5个搭配技巧";
const summerBody =
  "夏日穿搭系列，重点放在轻盈面料、清爽配色和实用单品组合。\n\n1. 选择透气材质\n棉麻、薄棉和轻薄针织更适合炎热天气，日常活动也更自在。\n\n2. 保持配色清爽\n浅蓝、米白、薄荷绿和柔和灰色容易搭配，也能让整体视觉更干净。\n\n3. 加入实用配饰\n遮阳帽、帆布包和舒适凉鞋可以提升完整度，同时保持轻松自然。";
const summerPreviewText =
  "夏天来了，通勤穿搭也要清新又舒适！今天分享5个日常搭配技巧，轻松穿出清爽状态。";

const projects = [
  { title: summerTopic, meta: "今天 10:24", active: true },
  { title: "治愈系家居好物", meta: "昨天 16:48" },
  { title: "露营装备红榜", meta: "5月11日 09:30" },
  { title: "轻便出行搭配", meta: "5月9日 14:12" },
];

const logs = [
  ["10:24", `生成完成：${summerTopic}`, "mint"],
  ["10:22", "开始生成内容...", "blue"],
  ["10:21", "导入参考素材：穿搭参考图.jpg", "pink"],
  ["10:20", "切换文案模型：Codex CLI / gpt-5-codex", "yellow"],
  ["10:18", `新建项目：${summerTopic}`, "mint"],
];

const taskCards = [
  { title: summerTopic, meta: "10:24", status: "已完成", image: "/assets/spring-outfit.png" },
  { title: "治愈系家居好物", meta: "昨天 16:48", status: "生成中", image: "/assets/avatar-creator.png", progress: 60 },
  { title: "露营装备红榜", meta: "5月11日 09:30", status: "草稿中", image: "/assets/notebook-pencil.png" },
  { title: "轻便出行搭配", meta: "5月9日 14:12", status: "已完成", image: "/assets/spring-outfit.png" },
];

const textModelOptions = {
  local: ["Codex CLI / gpt-5-codex", "Ollama / qwen3:14b", "LM Studio / local"],
  cloud: ["OpenAI API / gpt-5.1", "OpenAI API / gpt-4.1", "兼容 API / custom"],
};

const imageModelOptions = {
  local: ["Codex image CLI", "ComfyUI CLI", "本地兼容图像 CLI"],
  cloud: ["OpenAI Images API", "Gemini API", "兼容 API / image"],
};

const providerLabels = {
  local: "本地 CLI",
  cloud: "云端 API",
};

const sandboxOptions = [
  { value: "read-only", label: "read-only" },
  { value: "workspace-write", label: "workspace-write" },
  { value: "danger-full-access", label: "danger-full-access" },
];

const approvalOptions = [
  { value: "untrusted", label: "untrusted" },
  { value: "on-request", label: "on-request" },
  { value: "never", label: "never" },
];

function SoftIcon({ children, tone = "mint" }) {
  return <span className={`soft-icon ${tone}`}>{children}</span>;
}

function SegmentedControl({ label, value, options, onChange }) {
  return (
    <div className="segment-field">
      <span>{label}</span>
      <div className="segment-row">
        {options.map((option) => (
          <button
            key={option}
            className={value === option ? "selected" : ""}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ModelRoute({ title, icon, tone, provider, setProvider, model, setModel, options }) {
  const activeOptions = options[provider];

  return (
    <article className="model-route">
      <header>
        <SoftIcon tone={tone}>{icon}</SoftIcon>
        <div>
          <h3>{title}</h3>
          <span>{providerLabels[provider]}</span>
        </div>
      </header>
      <div className="provider-toggle" aria-label={`${title}运行方式`}>
        {Object.keys(providerLabels).map((key) => (
          <button
            key={key}
            className={provider === key ? "selected" : ""}
            onClick={() => {
              setProvider(key);
              setModel(options[key][0]);
            }}
          >
            {providerLabels[key]}
          </button>
        ))}
      </div>
      <select value={model} onChange={(event) => setModel(event.target.value)}>
        {activeOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </article>
  );
}

export function App() {
  const [selectedNav, setSelectedNav] = useState("workspace");
  const [selectedTab, setSelectedTab] = useState("标题");
  const [textProvider, setTextProvider] = useState("local");
  const [imageProvider, setImageProvider] = useState("cloud");
  const [textModel, setTextModel] = useState(textModelOptions.local[0]);
  const [imageModel, setImageModel] = useState(imageModelOptions.cloud[0]);
  const [sandboxMode, setSandboxMode] = useState("workspace-write");
  const [approvalPolicy, setApprovalPolicy] = useState("on-request");
  const [reasoningEffort, setReasoningEffort] = useState("medium");
  const [verbosity, setVerbosity] = useState("medium");
  const [webSearch, setWebSearch] = useState(false);
  const [draft, setDraft] = useState(summerInspiration);

  const navLabel = useMemo(
    () => navItems.find((item) => item.id === selectedNav)?.label ?? "创作工作台",
    [selectedNav],
  );

  return (
    <main className="app-shell" aria-label="薄荷工坊桌面工作台">
      <aside className="sidebar clay-panel">
        <div className="brand">
          <SoftIcon tone="mint">叶</SoftIcon>
          <div>
            <h1>薄荷工坊</h1>
            <p>Mint Atelier</p>
          </div>
        </div>

        <section className="profile-card">
          <img src="/assets/avatar-creator.png" alt="薄荷小丸子头像" />
          <div>
            <h2>薄荷小丸子</h2>
            <span>创作者</span>
            <p><i /> 在线</p>
          </div>
        </section>

        <nav className="nav-list" aria-label="主导航">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              className={selectedNav === item.id ? "active" : ""}
              onClick={() => setSelectedNav(item.id)}
            >
              <SoftIcon tone={["pink", "yellow", "blue", "rose", "lavender"][index]}>
                {item.icon}
              </SoftIcon>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <section className="project-list">
          <header>
            <h3>我的项目</h3>
            <button>新建</button>
          </header>
          {projects.map((project) => (
            <button key={project.title} className={project.active ? "project active" : "project"}>
              <SoftIcon tone={project.active ? "mint" : "pink"}>稿</SoftIcon>
              <span>
                <strong>{project.title}</strong>
                <small>{project.meta}</small>
              </span>
            </button>
          ))}
        </section>

        <button className="settings-button">
          <SoftIcon tone="lavender">设</SoftIcon>
          <span>设置</span>
          <b>›</b>
        </button>
      </aside>

      <section className="workspace" aria-label={`${navLabel}主工作区`}>
        <section className="overview clay-panel">
          <div className="overview-copy">
            <h2>今日概览 <span>✦</span></h2>
            <p>创作灵感正在发生，保持轻盈节奏。</p>
            <div className="metric-grid">
              {[
                ["已生成", "8", "篇"],
                ["草稿中", "3", "篇"],
                ["发布数", "12", "篇"],
                ["字数统计", "18.6k", "字"],
              ].map(([label, value, unit]) => (
                <div className="metric" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <em>{unit}</em>
                </div>
              ))}
            </div>
          </div>
          <img className="hero-asset" src="/assets/notebook-pencil.png" alt="薄荷笔记本和粉色铅笔" />
        </section>

        <section className="command clay-panel mint-glow">
          <h2>输入灵感</h2>
          <div className="command-box">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              aria-label="创作灵感输入"
            />
            <div className="command-actions">
              <button className="soft-button mint"><SoftIcon tone="mint">导</SoftIcon>导入素材</button>
              <button className="soft-button pale"><SoftIcon tone="lavender">参</SoftIcon>选择参考</button>
              <span className="counter">{draft.length} / 500</span>
              <button className="generate-button">生成内容</button>
            </div>
          </div>
        </section>

        <section className="creative-grid">
          <article className="editor clay-panel">
            <header>
              <h2>编辑草稿</h2>
              <div className="tab-row">
                {["标题", "正文", "话题标签", "封面设置", "更多设置"].map((tab) => (
                  <button
                    key={tab}
                    className={selectedTab === tab ? "selected" : ""}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </header>
            <label className="field">
              <span>标题</span>
              <input defaultValue={summerTitle} />
            </label>
            <label className="field body-field">
              <span>正文</span>
              <textarea defaultValue={summerBody} />
            </label>
            <div className="editor-tools" aria-label="草稿工具">
              {["AI 改写", "润色", "扩写", "缩写", "清空"].map((tool, index) => (
                <button key={tool}><SoftIcon tone={["lavender", "blue", "mint", "yellow", "pink"][index]}>{tool.slice(0, 1)}</SoftIcon>{tool}</button>
              ))}
            </div>
          </article>

          <article className="preview clay-panel">
            <header>
              <h2>效果预览</h2>
              <div className="preview-tabs">
                <button className="selected">小红书</button>
                <button>笔记卡片</button>
              </div>
            </header>
            <div className="post-card">
              <div className="post-author">
                <img src="/assets/avatar-creator.png" alt="" />
                <strong>薄荷小丸子</strong>
                <button>关注</button>
                <button className="share-button" aria-label="分享">↗</button>
              </div>
              <div className="post-cover-wrap">
                <img className="post-cover" src="/assets/spring-outfit.png" alt="夏日穿搭系列封面预览" />
                <span className="cover-count">1/6</span>
              </div>
              <div className="carousel-dots" aria-hidden="true">
                <i className="active" /><i /><i /><i /><i />
              </div>
              <h3>{summerPostTitle}</h3>
              <p>{summerPreviewText}</p>
              <div className="hashtags">
                <span>#通勤穿搭</span><span>#清爽搭配</span><span>#日常穿搭</span><span>#夏日穿搭</span>
              </div>
              <footer>
                <span><b className="post-icon like">♥</b>1289</span>
                <span><b className="post-icon star">✧</b>965</span>
                <span><b className="post-icon chat">💬</b>213</span>
              </footer>
            </div>
          </article>
        </section>

        <section className="recent clay-panel">
          <header>
            <h2>最近任务</h2>
            <button>查看全部 ›</button>
          </header>
          <div className="task-row">
            {taskCards.map((task) => (
              <article className="task-card" key={task.title}>
                <img src={task.image} alt="" />
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.meta}</p>
                  <span className={task.status === "生成中" ? "running" : ""}>{task.status}</span>
                  {task.progress ? <i style={{ "--progress": `${task.progress}%` }} /> : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <aside className="config-rail" aria-label="右侧配置栏">
        <section className="model-card clay-panel">
          <h2>模型配置</h2>
          <p>分别指定文案与图片生成通道，支持本地 CLI 或云端 API。</p>
          <div className="model-route-list">
            <ModelRoute
              title="文案生成"
              icon="文"
              tone="mint"
              provider={textProvider}
              setProvider={setTextProvider}
              model={textModel}
              setModel={setTextModel}
              options={textModelOptions}
            />
            <ModelRoute
              title="图片生成"
              icon="图"
              tone="pink"
              provider={imageProvider}
              setProvider={setImageProvider}
              model={imageModel}
              setModel={setImageModel}
              options={imageModelOptions}
            />
          </div>
        </section>

        <section className="params-card clay-panel">
          <h2>Codex 参数</h2>
          <SelectField
            label="Sandbox -s"
            value={sandboxMode}
            options={sandboxOptions}
            onChange={setSandboxMode}
          />
          <SelectField
            label="Approval -a"
            value={approvalPolicy}
            options={approvalOptions}
            onChange={setApprovalPolicy}
          />
          <SegmentedControl
            label="Reasoning effort"
            value={reasoningEffort}
            options={["low", "medium", "high"]}
            onChange={setReasoningEffort}
          />
          <SegmentedControl
            label="Verbosity"
            value={verbosity}
            options={["low", "medium", "high"]}
            onChange={setVerbosity}
          />
          <button
            className={`toggle-line ${webSearch ? "enabled" : ""}`}
            onClick={() => setWebSearch((enabled) => !enabled)}
          >
            <span>Web Search --search</span>
            <b>{webSearch ? "开启" : "关闭"}</b>
          </button>
          <code className="cli-preview">
            codex exec -m {textModel.split(" / ").at(-1)} -s {sandboxMode} -a {approvalPolicy}
          </code>
        </section>

        <section className="history-card clay-panel">
          <header>
            <h2>运行历史</h2>
            <button>清空</button>
          </header>
          <ol>
            {logs.map(([time, text, tone]) => (
              <li key={`${time}-${text}`}>
                <i className={tone} />
                <span>{time}</span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </main>
  );
}
