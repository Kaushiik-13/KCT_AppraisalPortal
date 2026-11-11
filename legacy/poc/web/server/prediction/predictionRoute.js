import { DEFAULT_FEATURE_SELECTION } from "../../src/prediction/datasetSchema.js";
import { validatePredictionDataset } from "../../src/prediction/datasetValidation.js";
import { evaluatePredictionReadiness } from "../../src/prediction/readiness.js";
import {
  confidenceLabel,
  modelExpectedRange,
  predictionFactors,
  ruleBasedPrediction,
} from "../../src/prediction/predictionService.js";
import { modelRegistry } from "./modelRegistry.js";
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

function compatibilityFrom(data) {
  return {
    organizationId: data.historySnapshot.organizationId,
    target: "final_approved_score",
    policyVersion: data.historySnapshot.policyVersion || data.policy.version,
    frameworkVersion: data.historySnapshot.frameworkVersion,
  };
}

function responseBase({ data, current, readiness, method, confidence, expectedRange, predictedScore, factors, model, warnings, now }) {
  return {
    synthetic: true,
    advisory: true,
    officialScoreChanged: false,
    employeeKey: current.employee_key,
    currentVerifiedScore: current.current_overall_score,
    predictedFinalScore: Number(predictedScore.toFixed(2)),
    expectedRange,
    scenario: readiness.scenario,
    scenarioLabel: readiness.scenarioLabel,
    method,
    confidence,
    factors,
    versions: {
      model: model?.publication?.version || null,
      modelId: model?.id || null,
      policy: data.policy.version,
      framework: data.historySnapshot.frameworkVersion,
    },
    warnings,
    predictedAt: now(),
  };
}

export async function predictionInference(request, {
  registry = modelRegistry,
  provider = runTrainingProvider,
  now = () => new Date().toISOString(),
} = {}) {
  if (!validOrigin(request)) return json({ error: "Use the application to make this request." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "Use JSON." }, 415);
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return json({ error: "Prediction request is too large." }, 413);
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return json({ error: "Prediction request is too large." }, 413);
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid JSON." }, 400);
    }
    if (!data?.historySnapshot?.id || !Array.isArray(data.historySnapshot.rows) || !data?.currentRecord || !data?.policy) {
      return json({ error: "Provide a frozen history snapshot, current synthetic checkpoint and policy." }, 400);
    }

    const currentValidation = validatePredictionDataset({
      rows: [data.currentRecord],
      policy: data.policy,
      expectedOrganizationId: data.historySnapshot.organizationId,
      expectedPolicyVersion: data.historySnapshot.policyVersion || data.policy.version,
      expectedFrameworkVersion: data.historySnapshot.frameworkVersion,
    });
    if (currentValidation.blocks.length || data.currentRecord.cycle_status !== "active") {
      return json({
        error: "The current checkpoint is invalid for prediction.",
        issues: currentValidation.blocks.map((finding) => finding.message).concat(data.currentRecord.cycle_status === "active" ? [] : ["Current checkpoint must belong to an active cycle."]),
      }, 422);
    }

    const compatibility = compatibilityFrom(data);
    const published = registry.findPublished(compatibility, { includeArtifact: true });
    const featureSelection = published?.featureSchema?.selected || DEFAULT_FEATURE_SELECTION;
    const readiness = evaluatePredictionReadiness({
      snapshotId: data.historySnapshot.id,
      rows: data.historySnapshot.rows,
      policy: data.policy,
      expectedOrganizationId: compatibility.organizationId,
      expectedPolicyVersion: compatibility.policyVersion,
      expectedFrameworkVersion: compatibility.frameworkVersion,
      featureSelection,
      readinessProfile: data.readinessProfile,
    });
    if (!readiness.scenario || readiness.status === "blocked") {
      return json({ error: "Prediction is blocked by the selected history snapshot.", issues: readiness.blocks.map((finding) => finding.message), readiness }, 422);
    }

    const current = currentValidation.validRows[0];
    const factors = predictionFactors(current);
    const scoreMaximum = Number(data.policy.overallScoreCap) || 200;
    if (readiness.scenario === "A") {
      const rule = ruleBasedPrediction(current, scoreMaximum);
      return json(responseBase({
        data, current, readiness,
        method: "Transparent pace projection",
        confidence: confidenceLabel("A"),
        expectedRange: rule.expectedRange,
        predictedScore: rule.predictedScore,
        factors,
        model: null,
        warnings: ["No completed history is available; this is a rule-based indicator, not a trained-model prediction.", "Synthetic and advisory only. The official appraisal score is unchanged."],
        now,
      }));
    }

    if (!published) {
      if (readiness.scenario === "C") {
        return json({ error: "Scenario C requires a compatible approved and published organization model." }, 409);
      }
      const rule = ruleBasedPrediction(current, scoreMaximum);
      return json(responseBase({
        data, current, readiness,
        method: "Transparent fallback projection",
        confidence: "Low confidence",
        expectedRange: rule.expectedRange,
        predictedScore: rule.predictedScore,
        factors,
        model: null,
        warnings: ["No compatible published model is available for limited history; the transparent fallback is shown.", "Synthetic and advisory only. The official appraisal score is unchanged."],
        now,
      }));
    }

    const inference = await provider({
      operation: "predict",
      artifact: published.artifact,
      features: Object.fromEntries(published.featureSchema.selected.map((field) => [field, current[field] ?? null])),
    });
    const expectedRange = modelExpectedRange(inference.predictedScore, published.evaluation.metrics, scoreMaximum);
    return json(responseBase({
      data, current, readiness,
      method: `${published.algorithm.label} · published organization model`,
      confidence: confidenceLabel(readiness.scenario, published.evaluation.metrics),
      expectedRange,
      predictedScore: inference.predictedScore,
      factors,
      model: published,
      warnings: ["The expected range is empirical held-out evidence, not a guaranteed probability.", "Synthetic and advisory only. The official appraisal score is unchanged."],
      now,
    }));
  } catch (error) {
    const unavailable = error?.code === "TRAINING_PROVIDER_UNAVAILABLE";
    const timeout = error?.code === "TRAINING_PROVIDER_TIMEOUT";
    return json({
      error: unavailable ? "The local inference provider is unavailable." : timeout ? "The local inference provider timed out." : "Prediction could not be completed safely.",
      issues: [],
    }, unavailable ? 503 : timeout ? 504 : 500);
  }
}
