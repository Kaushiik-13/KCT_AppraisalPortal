import { evaluatePredictionReadiness } from "../../src/prediction/readiness.js";

const MAX_BODY_BYTES = 6_000_000;
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

export async function predictionReadiness(request) {
  if (!validOrigin(request)) return json({ error: "Use the application to make this request." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ error: "Use JSON." }, 415);
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES)
    return json({ error: "Dataset snapshot is too large for the prototype readiness endpoint." }, 413);

  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES)
      return json({ error: "Dataset snapshot is too large for the prototype readiness endpoint." }, 413);
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid JSON." }, 400);
    }

    if (!data?.snapshot || typeof data.snapshot.id !== "string" || !data.snapshot.id.trim() || !Array.isArray(data.snapshot.rows))
      return json({ error: "Provide a frozen snapshot with an ID and rows array." }, 400);
    if (!data.policy || typeof data.policy !== "object")
      return json({ error: "Provide the policy contract used by the snapshot." }, 400);
    if (!Array.isArray(data.featureSelection))
      return json({ error: "Provide an explicit featureSelection array." }, 400);

    const result = evaluatePredictionReadiness({
      snapshotId: data.snapshot.id,
      rows: data.snapshot.rows,
      policy: data.policy,
      expectedOrganizationId: data.snapshot.organizationId || data.organization?.id,
      expectedPolicyVersion: data.snapshot.policyVersion || data.policy.version,
      expectedFrameworkVersion: data.snapshot.frameworkVersion,
      featureSelection: data.featureSelection,
      readinessProfile: data.readinessProfile,
    });
    return json(result);
  } catch {
    return json({ error: "Could not evaluate prediction readiness." }, 500);
  }
}
