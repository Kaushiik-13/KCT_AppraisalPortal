import { modelRegistry } from "./modelRegistry.js";

const MAX_BODY_BYTES = 20_000;
const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

function validOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    const originUrl = new URL(origin);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const requestHost = forwardedHost || request.headers.get("host") || new URL(request.url).host;
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const requestProtocol = forwardedProtocol || new URL(request.url).protocol.replace(":", "");
    return originUrl.host === requestHost && originUrl.protocol === `${requestProtocol}:`;
  } catch {
    return false;
  }
}

async function readBody(request) {
  if (!validOrigin(request)) return { response: json({ error: "Use the application to make this request." }, 403) };
  if (!request.headers.get("content-type")?.startsWith("application/json")) return { response: json({ error: "Use JSON." }, 415) };
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return { response: json({ error: "Model request is too large." }, 413) };
  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return { response: json({ error: "Model request is too large." }, 413) };
  try {
    return { data: JSON.parse(raw) };
  } catch {
    return { response: json({ error: "Invalid JSON." }, 400) };
  }
}

function lifecycleError(error) {
  const status = error?.code === "MODEL_NOT_FOUND" ? 404
    : error?.code === "MODEL_DECISION_INVALID" || error?.code === "MODEL_INCOMPATIBLE" ? 422
      : 409;
  return json({ error: error?.message || "The model lifecycle request could not be completed." }, status);
}

export async function modelDecision(request, modelId, { registry = modelRegistry, now = () => new Date().toISOString() } = {}) {
  try {
    const { data, response } = await readBody(request);
    if (response) return response;
    const model = registry.decide(modelId, {
      decision: data?.decision,
      reviewer: data?.reviewer,
      note: data?.note,
      decidedAt: now(),
    });
    return json({ model });
  } catch (error) {
    return lifecycleError(error);
  }
}

export async function modelPublish(request, modelId, { registry = modelRegistry, now = () => new Date().toISOString() } = {}) {
  try {
    const { data, response } = await readBody(request);
    if (response) return response;
    const result = registry.publish(modelId, data?.compatibility, now());
    return json(result);
  } catch (error) {
    return lifecycleError(error);
  }
}
