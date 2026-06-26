import { useEffect, useMemo, useState } from "react";
import { requestCodexCoverImage, requestCodexGeneration } from "./codexClient.js";

const STORAGE_PREFIX = "mint-atelier-v2";

const defaultPersona =
  "26 岁轻熟风穿搭博主，分享通勤、周末出行和小个子显高搭配。表达温柔具体，重点放在真实穿着体验、单品组合和可复用公式。";
const defaultKeyword = "夏日通勤穿搭";
const defaultBrief =
  "想写一篇适合上班族收藏的内容，重点讲清爽、显精神、不闷热，语气像朋友认真分享。";

const defaultModelConfig = {
  text: {
    provider: "local",
    modelName: "Codex CLI / gpt-5-codex",
    apiKey: "",
    baseUrl: "",
  },
  image: {
    provider: "local",
    modelName: "Codex CLI / imagegen skill",
    apiKey: "",
    baseUrl: "",
  },
};

const flowSteps = [
  { id: "input", label: "人设关键词", meta: "账号约束" },
  { id: "research", label: "热门搜索", meta: "手动触发" },
  { id: "rag", label: "RAG 入库", meta: "勾选确认" },
  { id: "topics", label: "生成选题", meta: "10 个候选" },
  { id: "drafts", label: "生成文案", meta: "5 篇草稿" },
  { id: "cover", label: "封面生成", meta: "Prompt 到图" },
];

const generationLabels = {
  topics: "选题",
  drafts: "文案",
  coverPrompts: "封面 Prompt",
};

const sidebarProjects = [
  { title: "夏日通勤穿搭", meta: "新版流程草稿", active: true },
  { title: "治愈系家居好物", meta: "待补参考" },
  { title: "露营装备红榜", meta: "选题阶段" },
  { title: "轻便出行搭配", meta: "封面待生成" },
];

const seedSearchResults = [
  {
    id: "note-1842",
    title: "35 度也能穿出清爽感的通勤公式",
    excerpt: "薄针织、棉麻半裙和低饱和配色组合起来，比全套短袖更显得利落，也适合空调房。",
    tags: ["通勤穿搭", "夏日搭配", "轻熟风"],
    metrics: "赞 1.8w | 藏 9200 | 评 368",
    source: "note_1842_clean_workwear",
  },
  {
    id: "note-2197",
    title: "小个子夏天上班别乱买，先看这 4 个单品",
    excerpt: "上短下长、鞋包同色、轻薄外搭和小面积亮色最容易复制，照片里也更有层次。",
    tags: ["小个子穿搭", "上班穿搭", "显高公式"],
    metrics: "赞 9860 | 藏 7400 | 评 211",
    source: "note_2197_petite_office",
  },
  {
    id: "note-3076",
    title: "不想穿得太正式，夏季通勤这样松弛一点",
    excerpt: "把西装裤换成垂感阔腿裤，衬衫选择柔软面料，再用浅色包做呼应，日常感会更强。",
    tags: ["松弛感", "职场穿搭", "夏日灵感"],
    metrics: "赞 6420 | 藏 5100 | 评 142",
    source: "note_3076_soft_office",
  },
  {
    id: "note-4129",
    title: "清爽穿搭的关键不是少穿，而是颜色干净",
    excerpt: "薄荷绿、奶油白和浅蓝能减少视觉闷感，适合拍封面时做同色系静物搭配。",
    tags: ["配色公式", "穿搭笔记", "封面灵感"],
    metrics: "赞 2.1w | 藏 1.1w | 评 486",
    source: "note_4129_color_formula",
  },
];

const errorMessages = {
  search: "搜索失败：请确认关键词不为空，并检查 xiaohongshu-cli 或网络状态后重试。",
  rag: "RAG 加入失败：请先勾选至少一条搜索结果，再点击加入本地知识库。",
  topics: "选题生成失败：请补充人设、关键词，并至少加入一条参考内容。",
  drafts: "文案生成失败：请先选择一个选题，并补充必要的撰写思路。",
  prompts: "封面 Prompt 生成失败：请先选择一篇文案。",
  image: "封面图生成失败：已保留原始 Prompt，可以检查图片模型配置后重新生成。",
  config: "模型配置缺失：云端 API 需要填写 API Key、API Base URL 和模型名称。",
  cloud: "云端 API 暂未接入：本轮请切换到本地 CLI 生成。",
  key: "API Key 无效：请检查密钥是否完整，或切换到本地 CLI 运行方式。",
  cli: "本地 CLI 不可用：请确认 Codex CLI 已安装并可在终端运行。",
  network: "网络请求失败：请检查代理、API Base URL 或稍后重试。",
};

function useStoredState(key, initialValue) {
  const storageKey = `${STORAGE_PREFIX}:${key}`;
  const [value, setValue] = useState(() => {
    try {
      const storedValue = window.localStorage.getItem(storageKey);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // Local storage can be unavailable in private or embedded contexts.
    }
  }, [storageKey, value]);

  return [value, setValue];
}

function nowText() {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function SoftIcon({ children, tone = "mint" }) {
  return <span className={`soft-icon ${tone}`}>{children}</span>;
}

function StageBadge({ children, tone = "mint" }) {
  return <span className={`stage-badge ${tone}`}>{children}</span>;
}

function SectionHeader({ icon, tone = "mint", title, meta, action }) {
  return (
    <header className="section-header">
      <div>
        <SoftIcon tone={tone}>{icon}</SoftIcon>
        <span>
          <h2>{title}</h2>
          {meta ? <p>{meta}</p> : null}
        </span>
      </div>
      {action}
    </header>
  );
}

function ProviderSwitch({ value, onChange }) {
  return (
    <div className="provider-switch">
      {[
        ["local", "本地 CLI"],
        ["cloud", "云端 API"],
      ].map(([provider, label]) => (
        <button
          key={provider}
          className={value === provider ? "selected" : ""}
          onClick={() => onChange(provider)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function ModelConfig({ title, tone, icon, value, onChange }) {
  const update = (field, nextValue) => onChange({ ...value, [field]: nextValue });
  const localDescription =
    title === "图片生成" ? "本地 imagegen skill，模型由 Codex worker 决定" : "本地 CLI 路线";

  return (
    <article className="model-config-block">
      <header>
        <SoftIcon tone={tone}>{icon}</SoftIcon>
        <div>
          <h3>{title}</h3>
          <p>{value.provider === "local" ? localDescription : "云端 API 路线"}</p>
        </div>
      </header>
      <ProviderSwitch value={value.provider} onChange={(provider) => update("provider", provider)} />
      <label className="mini-field">
        <span>模型名称</span>
        <input value={value.modelName} onChange={(event) => update("modelName", event.target.value)} />
      </label>
      <label className="mini-field">
        <span>API Key</span>
        <input
          value={value.apiKey}
          onChange={(event) => update("apiKey", event.target.value)}
          placeholder={value.provider === "local" ? "本地 CLI 可留空" : "必填"}
          type="password"
        />
      </label>
      <label className="mini-field">
        <span>API Base URL</span>
        <input
          value={value.baseUrl}
          onChange={(event) => update("baseUrl", event.target.value)}
          placeholder={value.provider === "local" ? "本地 CLI 可留空" : "https://api.example.com"}
        />
      </label>
    </article>
  );
}

export function App() {
  const [persona, setPersona] = useStoredState("persona", defaultPersona);
  const [keyword, setKeyword] = useStoredState("keyword", defaultKeyword);
  const [writingBrief, setWritingBrief] = useStoredState("writingBrief", defaultBrief);
  const [modelConfig, setModelConfig] = useStoredState("modelConfig", defaultModelConfig);
  const [activeStep, setActiveStep] = useState("input");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchIds, setSelectedSearchIds] = useState([]);
  const [ragItems, setRagItems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [generatingKind, setGeneratingKind] = useState("");
  const [cliStatus, setCliStatus] = useState({
    state: "idle",
    text: "尚未调用 Codex CLI。",
    commandPreview: "",
    durationMs: null,
    generatedAt: "",
    code: "",
  });
  const [notice, setNotice] = useState({
    type: "ready",
    text: "已加载新版阶段式工作台，搜索和生成链路均为手动触发。",
  });

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId),
    [selectedTopicId, topics],
  );
  const selectedDraft = useMemo(
    () => drafts.find((draft) => draft.id === selectedDraftId),
    [drafts, selectedDraftId],
  );
  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === selectedPromptId),
    [prompts, selectedPromptId],
  );

  const progress = useMemo(() => {
    const checks = [
      persona.trim().length > 0,
      keyword.trim().length > 0,
      searchResults.length > 0,
      ragItems.length > 0,
      topics.length > 0 && selectedTopic,
      drafts.length > 0 && selectedDraft,
      prompts.length > 0 && selectedPrompt,
      Boolean(coverImage),
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [
    coverImage,
    drafts.length,
    keyword,
    persona,
    prompts.length,
    ragItems.length,
    searchResults.length,
    selectedDraft,
    selectedPrompt,
    selectedTopic,
    topics.length,
  ]);

  const setError = (key) => {
    setNotice({ type: "error", text: errorMessages[key] });
  };

  const setSuccess = (text) => {
    setNotice({ type: "success", text });
  };

  const setCustomError = (text) => {
    setNotice({ type: "error", text });
  };

  const updateModelConfig = (channel, value) => {
    setModelConfig((current) => ({ ...current, [channel]: value }));
  };

  const requireTextModel = () => {
    const config = modelConfig.text;
    if (!config.modelName.trim()) {
      setError("config");
      return false;
    }
    if (config.provider === "cloud") {
      setError("cloud");
      return false;
    }
    return true;
  };

  const requireImageModel = () => {
    const config = modelConfig.image;
    if (!config.modelName.trim()) {
      setError("config");
      return false;
    }
    if (config.provider === "cloud") {
      setError("cloud");
      return false;
    }
    return true;
  };

  const runCodexGeneration = async (kind, payload) => {
    const label = generationLabels[kind];
    setGeneratingKind(kind);
    setCliStatus({
      state: "running",
      text: `正在通过本地 Codex CLI 生成${label}...`,
      commandPreview: "codex exec ...",
      durationMs: null,
      generatedAt: "",
      code: "",
    });

    try {
      const result = await requestCodexGeneration({
        kind,
        persona,
        keyword,
        ragItems,
        writingBrief,
        modelName: modelConfig.text.modelName,
        ...payload,
      });

      setCliStatus({
        state: "success",
        text: `Codex CLI 已生成 ${result.items.length} 条${label}。`,
        commandPreview: result.commandPreview,
        durationMs: result.durationMs,
        generatedAt: result.generatedAt,
        code: "",
      });
      return result.items;
    } catch (error) {
      const message = error?.message || "Codex CLI 生成失败。";
      setCliStatus({
        state: "error",
        text: message,
        commandPreview: "",
        durationMs: null,
        generatedAt: "",
        code: error?.code || "CODEX_FAILED",
      });
      setCustomError(message);
      return null;
    } finally {
      setGeneratingKind("");
    }
  };

  const runSearch = () => {
    if (!keyword.trim()) {
      setError("search");
      return;
    }

    const lookupTime = nowText();
    setSearchResults(
      seedSearchResults.map((result) => ({
        ...result,
        keyword: keyword.trim(),
        lookupTime,
      })),
    );
    setSelectedSearchIds([]);
    setActiveStep("research");
    setSuccess(`已手动搜索「${keyword.trim()}」，结果尚未自动入库。`);
  };

  const toggleSearchResult = (id) => {
    setSelectedSearchIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  };

  const addToRag = () => {
    if (selectedSearchIds.length === 0) {
      setError("rag");
      return;
    }

    const selectedItems = searchResults.filter((result) => selectedSearchIds.includes(result.id));
    setRagItems((current) => {
      const existingIds = new Set(current.map((item) => item.id));
      return [...current, ...selectedItems.filter((item) => !existingIds.has(item.id))];
    });
    setActiveStep("rag");
    setSuccess(`已加入 ${selectedItems.length} 条参考内容到本地 RAG。`);
  };

  const generateTopics = async () => {
    if (!persona.trim() || !keyword.trim() || ragItems.length === 0) {
      setError("topics");
      return;
    }
    if (!requireTextModel()) return;

    const nextTopics = await runCodexGeneration("topics", {});
    if (!nextTopics) return;

    setTopics(nextTopics);
    setSelectedTopicId(nextTopics[0].id);
    setDrafts([]);
    setSelectedDraftId(null);
    setPrompts([]);
    setSelectedPromptId(null);
    setCoverImage(null);
    setActiveStep("topics");
    setSuccess("已通过本地 Codex CLI 生成 10 个选题。");
  };

  const generateDrafts = async () => {
    if (!selectedTopic) {
      setError("drafts");
      return;
    }
    if (!requireTextModel()) return;

    const nextDrafts = await runCodexGeneration("drafts", { selectedTopic });
    if (!nextDrafts) return;

    setDrafts(nextDrafts);
    setSelectedDraftId(nextDrafts[0].id);
    setPrompts([]);
    setSelectedPromptId(null);
    setCoverImage(null);
    setActiveStep("drafts");
    setSuccess("已通过本地 Codex CLI 生成 5 篇文案，可选择一篇继续生成封面 Prompt。");
  };

  const generatePrompts = async () => {
    if (!selectedDraft) {
      setError("prompts");
      return;
    }
    if (!requireTextModel()) return;

    const nextPrompts = await runCodexGeneration("coverPrompts", {
      selectedTopic,
      selectedDraft,
    });
    if (!nextPrompts) return;

    setPrompts(nextPrompts);
    setSelectedPromptId(nextPrompts[0].id);
    setCoverImage(null);
    setActiveStep("cover");
    setSuccess("已通过本地 Codex CLI 生成 5 份封面 Prompt，默认不包含真人、脸、手和动物。");
  };

  const generateCoverImage = async (promptId = selectedPromptId) => {
    const prompt = prompts.find((item) => item.id === promptId);
    if (!prompt) {
      setError("image");
      return;
    }
    if (!requireImageModel()) return;

    setSelectedPromptId(promptId);
    setGeneratingKind("coverImage");
    setCliStatus({
      state: "running",
      text: "正在通过本地 Codex CLI 生成封面图...",
      commandPreview: "codex exec ...",
      durationMs: null,
      generatedAt: "",
      code: "",
    });

    try {
      const result = await requestCodexCoverImage({
        persona,
        keyword,
        selectedDraft,
        selectedPrompt: prompt,
        prompt: prompt.prompt,
        modelName: modelConfig.image.modelName,
      });

      setCoverImage({
        promptId,
        src: result.image.src,
        alt: result.image.alt,
        title: result.image.title,
        createdAt: nowText(),
        generatedAt: result.generatedAt,
      });
      setCliStatus({
        state: "success",
        text: "Codex CLI 已生成封面图。",
        commandPreview: result.commandPreview,
        durationMs: result.durationMs,
        generatedAt: result.generatedAt,
        code: "",
      });
      setActiveStep("cover");
      setSuccess("已通过本地 Codex CLI 生成封面图，原始 Prompt 已保留。");
    } catch (error) {
      const message = error?.message || "Codex CLI 封面图生成失败。";
      setCliStatus({
        state: "error",
        text: message,
        commandPreview: "",
        durationMs: null,
        generatedAt: "",
        code: error?.code || "CODEX_FAILED",
      });
      setCustomError(message);
    } finally {
      setGeneratingKind("");
    }
  };

  const saveDraft = () => {
    const savedAt = nowText();
    setLastSavedAt(savedAt);
    setSuccess(`草稿已保存到本地状态，保存时间 ${savedAt}。`);
  };

  return (
    <main className="app-shell" aria-label="薄荷工坊新版小红书 AI 助理">
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
            <span>内容创作助理</span>
            <p><i /> 本地草稿</p>
          </div>
        </section>

        <section className="flow-nav" aria-label="创作流程">
          <header>
            <h3>创作流程</h3>
            <strong>{progress}%</strong>
          </header>
          <div className="progress-track">
            <i style={{ "--progress": `${progress}%` }} />
          </div>
          {flowSteps.map((step, index) => (
            <button
              key={step.id}
              className={activeStep === step.id ? "active" : ""}
              onClick={() => setActiveStep(step.id)}
              type="button"
            >
              <SoftIcon tone={["pink", "yellow", "mint", "blue", "lavender", "rose"][index]}>
                {index + 1}
              </SoftIcon>
              <span>
                <strong>{step.label}</strong>
                <small>{step.meta}</small>
              </span>
            </button>
          ))}
        </section>

        <section className="project-list">
          <header>
            <h3>草稿项目</h3>
            <button type="button" onClick={saveDraft}>保存</button>
          </header>
          {sidebarProjects.map((project) => (
            <button key={project.title} className={project.active ? "project active" : "project"} type="button">
              <SoftIcon tone={project.active ? "mint" : "pink"}>稿</SoftIcon>
              <span>
                <strong>{project.title}</strong>
                <small>{project.meta}</small>
              </span>
            </button>
          ))}
        </section>

        <button className="settings-button" type="button" onClick={() => setActiveStep("cover")}>
          <SoftIcon tone="lavender">收</SoftIcon>
          <span>{lastSavedAt ? `已保存 ${lastSavedAt}` : "保存与继续编辑"}</span>
        </button>
      </aside>

      <section className="workspace-shell column-bottom-fade" aria-label="阶段式创作工作台">
        <div className="workspace">
        <section className="overview clay-panel">
          <div className="overview-copy">
            <StageBadge tone="mint">新版流程</StageBadge>
            <h2>从关键词到可发布草稿</h2>
            <p>人设、热门参考、选题、文案、封面 Prompt 和封面图都在同一条手动确认链路里推进。</p>
            <div className="metric-grid">
              <div className="metric">
                <span>搜索结果</span>
                <strong>{searchResults.length}</strong>
                <em>条</em>
              </div>
              <div className="metric">
                <span>RAG 参考</span>
                <strong>{ragItems.length}</strong>
                <em>条</em>
              </div>
              <div className="metric">
                <span>选题候选</span>
                <strong>{topics.length}</strong>
                <em>个</em>
              </div>
              <div className="metric">
                <span>文案草稿</span>
                <strong>{drafts.length}</strong>
                <em>篇</em>
              </div>
            </div>
          </div>
          <img className="hero-asset" src="/assets/notebook-pencil.png" alt="薄荷笔记本和粉色铅笔" />
        </section>

        <section className="input-panel clay-panel mint-glow">
          <SectionHeader
            icon="入"
            tone="mint"
            title="账号人设与创作关键词"
            meta="人设最多 1000 字，关键词用于搜索和生成"
            action={<button className="primary-button" type="button" onClick={runSearch}>搜索热门内容</button>}
          />
          <div className="input-grid">
            <label className="field persona-field">
              <span>账号人设</span>
              <textarea
                maxLength={1000}
                value={persona}
                onChange={(event) => setPersona(event.target.value)}
              />
              <small>{persona.length} / 1000</small>
            </label>
            <label className="field keyword-field">
              <span>创作关键词</span>
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
              <small>自动缓存</small>
            </label>
          </div>
        </section>

        <section className="stage-grid">
          <article className="stage-card clay-panel">
            <SectionHeader
              icon="搜"
              tone="yellow"
              title="热门内容搜索"
              meta="搜索只在点击后执行，结果不会自动入库"
              action={<button className="soft-button yellow" type="button" onClick={runSearch}>重新搜索</button>}
            />
            <div className="result-list">
              {searchResults.length === 0 ? (
                <div className="empty-state">
                  <SoftIcon tone="yellow">待</SoftIcon>
                  <p>输入关键词后点击搜索，热门内容会显示在这里。</p>
                </div>
              ) : (
                searchResults.map((result) => (
                  <label
                    key={result.id}
                    className={selectedSearchIds.includes(result.id) ? "search-result selected" : "search-result"}
                  >
                    <input
                      checked={selectedSearchIds.includes(result.id)}
                      onChange={() => toggleSearchResult(result.id)}
                      type="checkbox"
                    />
                    <span>
                      <strong>{result.title}</strong>
                      <p>{result.excerpt}</p>
                      <em>{result.metrics}</em>
                      <small>{result.source} | {result.keyword} | {result.lookupTime}</small>
                      <b>
                        {result.tags.map((tag) => (
                          <i key={tag}>#{tag}</i>
                        ))}
                      </b>
                    </span>
                  </label>
                ))
              )}
            </div>
          </article>

          <article className="stage-card clay-panel">
            <SectionHeader
              icon="库"
              tone="mint"
              title="本地 RAG 知识库"
              meta="只保存用户勾选并确认的参考内容"
              action={<button className="soft-button mint" type="button" onClick={addToRag}>加入 RAG</button>}
            />
            <div className="rag-stack">
              {ragItems.length === 0 ? (
                <div className="empty-state">
                  <SoftIcon tone="mint">选</SoftIcon>
                  <p>勾选搜索结果后，点击加入本地 RAG。</p>
                </div>
              ) : (
                ragItems.map((item) => (
                  <article key={item.id} className="rag-item">
                    <strong>{item.title}</strong>
                    <p>{item.excerpt}</p>
                    <small>{item.tags.join(" / ")}</small>
                  </article>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="stage-card clay-panel wide-card">
          <SectionHeader
            icon="题"
            tone="blue"
            title="生成 10 个选题"
            meta="参考人设、关键词与本地 RAG"
            action={
              <button
                className="primary-button"
                disabled={Boolean(generatingKind)}
                type="button"
                onClick={generateTopics}
              >
                {generatingKind === "topics" ? "生成中..." : "生成选题"}
              </button>
            }
          />
          <div className="topic-grid">
            {topics.length === 0 ? (
              <div className="empty-state inline">
                <SoftIcon tone="blue">10</SoftIcon>
                <p>完成搜索和 RAG 入库后，生成选题会出现在这里。</p>
              </div>
            ) : (
              topics.map((topic, index) => (
                <button
                  key={topic.id}
                  className={selectedTopicId === topic.id ? "topic-card selected" : "topic-card"}
                  onClick={() => setSelectedTopicId(topic.id)}
                  type="button"
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{topic.title}</strong>
                  <p>{topic.angle}</p>
                  <small>{topic.audience}</small>
                  <em>{topic.hook}</em>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="copy-grid">
          <article className="stage-card clay-panel">
            <SectionHeader
              icon="写"
              tone="lavender"
              title="撰写思路与 5 篇文案"
              meta={selectedTopic ? selectedTopic.title : "先选择一个选题"}
              action={
                <button
                  className="primary-button"
                  disabled={Boolean(generatingKind)}
                  type="button"
                  onClick={generateDrafts}
                >
                  {generatingKind === "drafts" ? "生成中..." : "生成文案"}
                </button>
              }
            />
            <label className="field brief-field">
              <span>补充撰写思路</span>
              <textarea value={writingBrief} onChange={(event) => setWritingBrief(event.target.value)} />
            </label>
            <div className="draft-list">
              {drafts.length === 0 ? (
                <div className="empty-state">
                  <SoftIcon tone="lavender">5</SoftIcon>
                  <p>选题确认后生成 5 篇文案。</p>
                </div>
              ) : (
                drafts.map((draft, index) => (
                  <button
                    key={draft.id}
                    className={selectedDraftId === draft.id ? "draft-card selected" : "draft-card"}
                    onClick={() => setSelectedDraftId(draft.id)}
                    type="button"
                  >
                    <span>文案 {index + 1}</span>
                    <strong>{draft.title}</strong>
                    <p>{draft.body}</p>
                  </button>
                ))
              )}
            </div>
          </article>

          <article className="preview clay-panel">
            <SectionHeader icon="预" tone="pink" title="小红书预览" meta="选择文案后实时查看草稿" />
            <div className="post-card">
              <div className="post-author">
                <img src="/assets/avatar-creator.png" alt="" />
                <strong>薄荷小丸子</strong>
                <button type="button">关注</button>
              </div>
              <div className="post-cover-wrap">
                <img
                  className="post-cover"
                  src={coverImage?.src ?? "/assets/spring-outfit.png"}
                  alt={coverImage?.alt ?? "夏日穿搭系列封面预览"}
                />
                <span className="cover-count">{coverImage ? "已生成" : "预览"}</span>
              </div>
              <h3>{selectedDraft?.title ?? "选择一篇文案后，这里显示小红书标题"}</h3>
              <p>{selectedDraft?.body ?? "正文预览会保留话题标签格式，例如 #夏日通勤[话题]#。"}</p>
              <footer>
                <span><b className="post-icon like">心</b>1289</span>
                <span><b className="post-icon star">藏</b>965</span>
                <span><b className="post-icon chat">评</b>213</span>
              </footer>
            </div>
          </article>
        </section>

        <section className="cover-grid">
          <article className="stage-card clay-panel">
            <SectionHeader
              icon="图"
              tone="rose"
              title="封面 Prompt 与封面图"
              meta="Prompt 默认禁真人、脸、手和动物，允许植物花材"
              action={
                <button
                  className="primary-button"
                  disabled={Boolean(generatingKind)}
                  type="button"
                  onClick={generatePrompts}
                >
                  {generatingKind === "coverPrompts" ? "生成中..." : "生成 Prompt"}
                </button>
              }
            />
            <div className="prompt-list">
              {prompts.length === 0 ? (
                <div className="empty-state inline">
                  <SoftIcon tone="rose">P</SoftIcon>
                  <p>选择文案后生成 5 份封面 Prompt。</p>
                </div>
              ) : (
                prompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    className={selectedPromptId === prompt.id ? "prompt-card selected" : "prompt-card"}
                    disabled={Boolean(generatingKind)}
                    onClick={() => generateCoverImage(prompt.id)}
                    type="button"
                  >
                    <strong>{prompt.title}</strong>
                    <p>{prompt.prompt}</p>
                  </button>
                ))
              )}
            </div>
          </article>

          <article className="cover-result clay-panel">
            <SectionHeader
              icon="成"
              tone="mint"
              title="封面结果"
              meta={generatingKind === "coverImage" ? "正在生成封面图" : coverImage ? `生成于 ${coverImage.createdAt}` : "点击 Prompt 后生成"}
            />
            <div className="cover-frame">
              {generatingKind === "coverImage" ? (
                <div className="cover-placeholder">
                  <SoftIcon tone="mint">成</SoftIcon>
                  <p>Codex CLI 正在生成封面图...</p>
                </div>
              ) : coverImage ? (
                <img src={coverImage.src} alt={coverImage.alt} />
              ) : (
                <div className="cover-placeholder">
                  <SoftIcon tone="mint">图</SoftIcon>
                  <p>封面图会展示在这里。</p>
                </div>
              )}
            </div>
            <div className="prompt-keeper">
              <span>原始 Prompt</span>
              <p>{selectedPrompt?.prompt ?? "尚未选择封面 Prompt。"}</p>
              <button
                className="soft-button mint"
                disabled={Boolean(generatingKind)}
                type="button"
                onClick={() => generateCoverImage()}
              >
                {generatingKind === "coverImage" ? "生成中..." : "重新生成"}
              </button>
            </div>
          </article>
        </section>
        </div>
      </section>

      <aside className="config-shell column-bottom-fade" aria-label="右侧配置栏">
        <div className="config-rail">
          <section className="model-card clay-panel">
            <h2>模型配置</h2>
            <p>文案生成与图片生成分开配置，字段会自动缓存。</p>
            <div className="model-route-list">
              <ModelConfig
                title="文案生成"
                icon="文"
                tone="mint"
                value={modelConfig.text}
                onChange={(value) => updateModelConfig("text", value)}
              />
              <ModelConfig
                title="图片生成"
                icon="图"
                tone="pink"
                value={modelConfig.image}
                onChange={(value) => updateModelConfig("image", value)}
              />
            </div>
          </section>

        <section className={`notice-card clay-panel ${notice.type}`}>
          <header>
            <h2>状态与错误提示</h2>
            <StageBadge tone={notice.type === "error" ? "rose" : "mint"}>
              {notice.type === "error" ? "需处理" : "正常"}
            </StageBadge>
          </header>
          <p>{notice.text}</p>
          <div className="manual-boundary">
            <span>搜索</span>
            <span>入库</span>
            <span>生成</span>
            <span>封面</span>
            <strong>均需点击确认</strong>
          </div>
          <div className={`cli-status ${cliStatus.state}`}>
            <span>Codex CLI</span>
            <p>{cliStatus.text}</p>
            {cliStatus.commandPreview ? <code>{cliStatus.commandPreview}</code> : null}
            {cliStatus.durationMs ? (
              <small>{Math.round(cliStatus.durationMs / 1000)}s · {new Date(cliStatus.generatedAt).toLocaleString("zh-CN")}</small>
            ) : null}
            {cliStatus.code ? <small>{cliStatus.code}</small> : null}
          </div>
        </section>

        <section className="error-lab clay-panel">
          <h2>错误覆盖</h2>
          <div>
            {Object.entries({
              search: "搜索失败",
              rag: "RAG 失败",
              topics: "选题失败",
              drafts: "文案失败",
              prompts: "Prompt 失败",
              image: "封面失败",
              config: "配置缺失",
              key: "Key 无效",
              cli: "CLI 不可用",
              network: "网络失败",
            }).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setError(key)}>
                {label}
              </button>
            ))}
          </div>
        </section>
        </div>
      </aside>
    </main>
  );
}
