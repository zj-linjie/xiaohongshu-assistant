export async function requestCodexGeneration(payload) {
  const response = await fetch("/api/codex/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw Object.assign(new Error("本地生成服务返回了非 JSON 内容。"), {
      code: "CODEX_BAD_JSON",
      details: text.slice(0, 400),
    });
  }

  if (!response.ok || !data.ok) {
    throw Object.assign(new Error(data.error || "Codex CLI 生成失败。"), {
      code: data.code || "CODEX_FAILED",
      details: data.details,
    });
  }

  return data;
}
