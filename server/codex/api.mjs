import { buildCodexPrompt } from "./prompts.mjs";
import { runCodex } from "./runCodex.mjs";
import {
  CodexApiError,
  normalizeCodexItems,
  parseJsonFromCodex,
  validateRequest,
} from "./validation.mjs";

const MAX_BODY_BYTES = 128 * 1024;

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk.toString("utf8");
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      throw new CodexApiError("BAD_REQUEST", "请求体过大。");
    }
  }

  try {
    return JSON.parse(body || "{}");
  } catch {
    throw new CodexApiError("BAD_REQUEST", "请求体不是合法 JSON。");
  }
}

function serializeError(error) {
  if (error instanceof CodexApiError) {
    return {
      status: error.status,
      payload: {
        ok: false,
        code: error.code,
        error: error.message,
        details: error.details,
      },
    };
  }

  return {
    status: 500,
    payload: {
      ok: false,
      code: "INTERNAL_ERROR",
      error: error?.message || "本地生成服务发生未知错误。",
    },
  };
}

export function codexGenerateMiddleware() {
  return async (req, res, next) => {
    const requestUrl = new URL(req.url ?? "/", "http://localhost");
    if (requestUrl.pathname !== "/api/codex/generate") {
      next();
      return;
    }

    if (req.method !== "POST") {
      sendJson(res, 405, {
        ok: false,
        code: "METHOD_NOT_ALLOWED",
        error: "Only POST is supported.",
      });
      return;
    }

    try {
      const payload = await readJsonBody(req);
      validateRequest(payload);

      const prompt = buildCodexPrompt(payload);
      const codexResult = await runCodex({
        prompt,
        modelName: payload.modelName,
      });
      const parsed = parseJsonFromCodex(codexResult.raw);
      const items = normalizeCodexItems(payload.kind, parsed, payload);

      sendJson(res, 200, {
        ok: true,
        kind: payload.kind,
        items,
        raw: codexResult.raw,
        commandPreview: codexResult.commandPreview,
        durationMs: codexResult.durationMs,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      const { status, payload } = serializeError(error);
      sendJson(res, status, payload);
    }
  };
}
