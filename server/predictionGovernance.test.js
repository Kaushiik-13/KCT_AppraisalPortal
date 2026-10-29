import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_FEATURE_SELECTION } from "../src/prediction/datasetSchema.js";
import { generatePredictionPreview } from "./prediction/generationRoute.js";
import { createModelRegistry } from "./prediction/modelRegistry.js";
import { modelDecision, modelPublish } from "./prediction/modelRoutes.js";
import { predictionInference } from "./prediction/predictionRoute.js";

const NOW = "2026-10-29T10:00:00.000Z";

function register(registry, runId = "run-1", candidateId = "random_forest") {
  return registry.registerTraining({
    runId,
    organizationId: "kct",
    target: "final_approved_score",
    snapshotId: `snapshot-${runId}`,
    snapshotChecksum: `data-${runId}`,
    configurationChecksum: `config-${runId}`,
    policyVersion: "pads-2021-reference-v1",
    frameworkVersion: "afpi-framework-prototype-v1",
    scoreRange: { minimum: 0, maximum: 200 },
    featureSchema: { selected: DEFAULT_FEATURE_SELECTION, excluded: {}, preprocessingFitScope: "train-only" },
    provider: { id: "local-scikit-learn", seed: 42 },
    baselines: [
      { id: "pace", metrics: { mae: 20 } },
      { id: "grouped_median", metrics: { mae: 22 } },
    ],
    candidates: [{
      id: candidateId,
      label: candidateId.replaceAll("_", " "),
      status: "succeeded",
      parameters: { seed: 42 },
      metrics: {
        mae: 9,
        normalizedMae: 0.045,
        expectedRange: { radius: 18, method: "held-out absolute residual 90th percentile", empiricalCoverage: 0.9 },
      },
      warnings: [],
      artifact: { format: "python-pickle-base64-v1", payload: `artifact-${runId}` },
    }],
    recommendation: { gatePassed: true, candidateId, reason: "beats both baselines" },
    createdAt: NOW,
  })[0];
}

function request(path, body, headers = {}) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function compatibility() {
  return {
    organizationId: "kct",
    target: "final_approved_score",
    policyVersion: "pads-2021-reference-v1",
    frameworkVersion: "afpi-framework-prototype-v1",
  };
}

function predictionBody(historyId) {
  const generated = generatePredictionPreview({ seed: 42 });
  const history = generated.datasets[historyId];
  return {
    historySnapshot: {
      id: history.snapshotId,
      organizationId: generated.organization.id,
      policyVersion: generated.policy.version,
      frameworkVersion: generated.frameworkVersion,
      rows: history.rows,
    },
    currentRecord: generated.datasets.current.rows[0],
    policy: generated.policy,
  };
}

test("registry blocks unapproved publication and keeps artifacts server-only", () => {
  const registry = createModelRegistry();
  const candidate = register(registry);
  assert.equal(candidate.lifecycle, "candidate");
  assert.equal("artifact" in candidate, false);
  assert.equal(registry.get(candidate.id, { includeArtifact: true }).artifact.payload, "artifact-run-1");
  assert.throws(() => registry.publish(candidate.id, compatibility(), NOW), /Only an approved/);
});

test("approval, publication and replacement retain immutable lifecycle metadata", () => {
  const registry = createModelRegistry();
  const first = register(registry, "run-1");
  const approved = registry.decide(first.id, { decision: "approved", reviewer: "Prototype Admin", note: "Synthetic gate reviewed.", decidedAt: NOW });
  assert.equal(approved.lifecycle, "approved");
  const published = registry.publish(first.id, compatibility(), NOW).model;
  assert.equal(published.lifecycle, "published");
  assert.equal(published.publication.version, "kct-final_approved_score-v1");

  const second = register(registry, "run-2", "gradient_boosting");
  registry.decide(second.id, { decision: "approved", reviewer: "Prototype Admin", note: "Replacement gate reviewed.", decidedAt: NOW });
  const replacement = registry.publish(second.id, compatibility(), "2026-10-29T11:00:00.000Z");
  assert.equal(replacement.model.publication.version, "kct-final_approved_score-v2");
  assert.equal(replacement.supersededModel.lifecycle, "superseded");
  assert.equal(registry.findPublished(compatibility()).id, second.id);
  assert.equal(registry.get(first.id).dataset.checksum, "data-run-1");
});

test("decision and publication routes validate notes, compatibility and lifecycle", async () => {
  const registry = createModelRegistry();
  const candidate = register(registry);
  const invalid = await modelDecision(request(`/api/prediction/models/${candidate.id}/decision`, {
    decision: "approved", reviewer: "A", note: "x",
  }), candidate.id, { registry, now: () => NOW });
  assert.equal(invalid.status, 422);

  const approvedResponse = await modelDecision(request(`/api/prediction/models/${candidate.id}/decision`, {
    decision: "approved", reviewer: "Prototype Admin", note: "Metrics and limitations reviewed.",
  }), candidate.id, { registry, now: () => NOW });
  assert.equal(approvedResponse.status, 200);

  const incompatible = await modelPublish(request(`/api/prediction/models/${candidate.id}/publish`, {
    compatibility: { ...compatibility(), policyVersion: "wrong" },
  }), candidate.id, { registry, now: () => NOW });
  assert.equal(incompatible.status, 422);

  const published = await modelPublish(request(`/api/prediction/models/${candidate.id}/publish`, {
    compatibility: compatibility(),
  }), candidate.id, { registry, now: () => NOW });
  assert.equal(published.status, 200);
  const result = await published.json();
  assert.equal(result.model.lifecycle, "published");
});

test("Scenario A predicts transparently without a model and Scenario B falls back safely", async () => {
  const registry = createModelRegistry();
  let providerCalled = false;
  const provider = async () => { providerCalled = true; throw new Error("must not run"); };

  const noHistory = await predictionInference(request("/api/prediction/predict", predictionBody("current")), { registry, provider, now: () => NOW });
  const noHistoryResult = await noHistory.json();
  assert.equal(noHistory.status, 200);
  assert.equal(noHistoryResult.scenario, "A");
  assert.equal(noHistoryResult.method, "Transparent pace projection");
  assert.equal(noHistoryResult.officialScoreChanged, false);

  const limited = await predictionInference(request("/api/prediction/predict", predictionBody("limited")), { registry, provider, now: () => NOW });
  const limitedResult = await limited.json();
  assert.equal(limited.status, 200);
  assert.equal(limitedResult.scenario, "B");
  assert.equal(limitedResult.method, "Transparent fallback projection");
  assert.equal(providerCalled, false);
});

test("Scenario C requires a published compatible model and returns empirical model evidence", async () => {
  const registry = createModelRegistry();
  const withoutModel = await predictionInference(request("/api/prediction/predict", predictionBody("sufficient")), { registry, provider: async () => ({}), now: () => NOW });
  assert.equal(withoutModel.status, 409);

  const candidate = register(registry);
  registry.decide(candidate.id, { decision: "approved", reviewer: "Prototype Admin", note: "Synthetic evaluation reviewed.", decidedAt: NOW });
  registry.publish(candidate.id, compatibility(), NOW);
  let providerArtifact;
  let providerOperation;
  const response = await predictionInference(request("/api/prediction/predict", predictionBody("sufficient")), {
    registry,
    provider: async (payload) => {
      providerArtifact = payload.artifact;
      providerOperation = payload.operation;
      return { status: "succeeded", predictedScore: 164.25 };
    },
    now: () => NOW,
  });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.scenario, "C");
  assert.equal(result.predictedFinalScore, 164.25);
  assert.equal(result.expectedRange.empirical, true);
  assert.equal(result.versions.model, "kct-final_approved_score-v1");
  assert.equal(result.officialScoreChanged, false);
  assert.equal(providerArtifact.payload, "artifact-run-1");
  assert.equal(providerOperation, "predict");
});

test("invalid history and invalid current records block prediction", async () => {
  const registry = createModelRegistry();
  const invalidHistory = await predictionInference(request("/api/prediction/predict", predictionBody("invalid")), { registry, provider: async () => ({}) });
  assert.equal(invalidHistory.status, 422);

  const body = predictionBody("current");
  body.currentRecord = { ...body.currentRecord, is_synthetic: false };
  const invalidCurrent = await predictionInference(request("/api/prediction/predict", body), { registry, provider: async () => ({}) });
  assert.equal(invalidCurrent.status, 422);
});
