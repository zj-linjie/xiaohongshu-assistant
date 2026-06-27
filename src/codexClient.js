async function requestJson(endpoint, payload, fallbackMessage, badJsonCode) {
  const response = await fetch(endpoint, {
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
    throw Object.assign(new Error(fallbackMessage.nonJson), {
      code: badJsonCode,
      details: text.slice(0, 400),
    });
  }

  if (!response.ok || !data.ok) {
    throw Object.assign(new Error(data.error || fallbackMessage.failed), {
      code: data.code || badJsonCode,
      details: data.details,
    });
  }

  return data;
}

export async function requestCodexGeneration(payload) {
  return requestJson(
    "/api/codex/generate",
    payload,
    {
      nonJson: "本地生成服务返回了非 JSON 内容。",
      failed: "Codex CLI 生成失败。",
    },
    "CODEX_BAD_JSON",
  );
}

export async function requestCloudGeneration(payload) {
  return requestJson(
    "/api/cloud/generate",
    payload,
    {
      nonJson: "云端文本 API 返回了非 JSON 内容。",
      failed: "云端文本 API 生成失败。",
    },
    "API_BAD_JSON",
  );
}

export async function requestCodexCoverImage(payload) {
  return requestJson(
    "/api/codex/cover-image",
    payload,
    {
      nonJson: "本地封面图服务返回了非 JSON 内容。",
      failed: "Codex CLI 封面图生成失败。",
    },
    "CODEX_BAD_JSON",
  );
}

export async function requestCloudCoverImage(payload) {
  return requestJson(
    "/api/cloud/cover-image",
    payload,
    {
      nonJson: "云端图片 API 返回了非 JSON 内容。",
      failed: "云端图片 API 生成失败。",
    },
    "API_BAD_JSON",
  );
}
