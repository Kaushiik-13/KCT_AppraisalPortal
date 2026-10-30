import { createHash } from "node:crypto";
import { buildCheckpointSafeFeatureMatrix } from "../../src/prediction/featureMatrix.js";
import { evaluatePredictionReadiness } from "../../src/prediction/readiness.js";
import { validateTrainingConfiguration } from "../../src/prediction/trainingConfig.js";
import { runTrainingProvider } from "./trainingClient.js";

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

const checksum = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export async function predictionTraining(request, { provider = runTrainingProvider } = {}) {
  if (!validOrigin(request)) return json({ error: "Use the application to make this request." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "Use JSON." }, 415);
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return json({ error: "Training request is too large." }, 413);

  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return json({ error: "Training request is too large." }, 413);
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid JSON." }, 400);
    }

    if (!data?.snapshot || typeof data.snapshot.id !== "string" || !data.snapshot.id.trim() || !Array.isArray(data.snapshot.rows)) {
      return json({ error: "Provide a frozen snapshot with an ID and rows array." }, 400);
    }
    if (!data.policy || typeof data.policy !== "object") return json({ error: "Provide the snapshot policy contract." }, 400);

    const readiness = evaluatePredictionReadiness({
      snapshotId: data.snapshot.id,
      rows: data.snapshot.rows,
      policy: data.policy,
      expectedOrganizationId: data.snapshot.organizationId,
      expectedPolicyVersion: data.snapshot.policyVersion || data.policy.version,
      expectedFrameworkVersion: data.snapshot.frameworkVersion,
      featureSelection: data.configuration?.featureSelection,
      readinessProfile: data.readinessProfile,
    });
    const validation = validateTrainingConfiguration({
      ...data.configuration,
      policy: data.policy,
      readiness,
    });
    if (validation.errors.length) {
      return json({
        error: "The training configuration is not ready.",
        issues: validation.errors,
        readiness: {
          status: readiness.status,
          scenario: readiness.scenario,
          blocks: readiness.blocks,
          warnings: readiness.warnings,
        },
      }, 422);
    }

    const matrix = buildCheckpointSafeFeatureMatrix({
      rows: data.snapshot.rows,
      featureSelection: validation.configuration.featureSelection,
      policy: data.policy,
      split: readiness.split,
    });
    const configurationChecksum = checksum(validation.configuration);
    const snapshotChecksum = checksum(data.snapshot.rows);
    const runId = `training-${checksum({ snapshotId: data.snapshot.id, snapshotChecksum, configurationChecksum }).slice(0, 16)}`;
    const startedAt = new Date().toISOString();
    const result = await provider({
      operation: "train_compare",
      matrix,
      options: validation.configuration,
    });
    return json({
      runId,
      status: "succeeded",
      synthetic: true,
      snapshotId: data.snapshot.id,
      snapshotChecksum,
      configurationChecksum,
      scoreRange: {
        minimum: validation.configuration.scoreMinimum,
        maximum: validation.configuration.scoreMaximum,
      },
      startedAt,
      completedAt: new Date().toISOString(),
      readiness: {
        scenario: readiness.scenario,
        scenarioLabel: readiness.scenarioLabel,
        status: readiness.status,
        warnings: readiness.warnings,
      },
      ...result,
    });
  } catch (error) {
    const unavailable = error?.code === "TRAINING_PROVIDER_UNAVAILABLE";
    const timeout = error?.code === "TRAINING_PROVIDER_TIMEOUT";
    return json({
      error: unavailable
        ? "The local Python training provider is unavailable."
        : timeout
          ? "The local Python training provider timed out."
          : "The model comparison could not be completed safely.",
      issues: [],
    }, unavailable ? 503 : timeout ? 504 : 500);
  }
}
