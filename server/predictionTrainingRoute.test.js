import assert from "node:assert/strict";
import test from "node:test";
import { generatePredictionPreview } from "./prediction/generationRoute.js";
import { predictionTraining } from "./prediction/trainingRoute.js";

function request(body, headers = {}) {
  return new Request("http://localhost/api/prediction/training", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function trainingBody(datasetId = "sufficient", configuration = {}) {
  const generated = generatePredictionPreview({ seed: 42 });
  const dataset = generated.datasets[datasetId];
  return {
    snapshot: {
      id: dataset.snapshotId,
      organizationId: generated.organization.id,
      policyVersion: generated.policy.version,
      frameworkVersion: generated.frameworkVersion,
      rows: dataset.rows,
    },
    policy: generated.policy,
    configuration: {
      target: "final_approved_score",
      featureSelection: generated.defaultFeatureSelection,
      candidates: ["ridge"],
      seed: 77,
      ...configuration,
    },
  };
}

const providerResult = {
  status: "succeeded",
  synthetic: true,
  provider: { id: "test-provider", seed: 77 },
  target: "final_approved_score",
  featureSchema: { preprocessingFitScope: "train-only" },
  split: {},
  baselines: [{ id: "pace" }, { id: "grouped_median" }],
  candidates: [{ id: "ridge", status: "succeeded" }],
  recommendation: { candidateId: "ridge", gatePassed: true },
  warnings: [],
};

test("training route rebuilds a checkpoint-safe, time-based matrix", async () => {
  let providerPayload;
  const response = await predictionTraining(request(trainingBody()), {
    provider: async (payload) => {
      providerPayload = payload;
      return providerResult;
    },
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.status, "succeeded");
  assert.equal(result.synthetic, true);
  assert.equal(result.readiness.scenario, "C");
  assert.equal(providerPayload.operation, "train_compare");
  assert.deepEqual(providerPayload.matrix.split.testCycleIds, ["2025-26"]);
  assert.ok(providerPayload.matrix.split.trainCycleIds.length >= 2);
  assert.equal(providerPayload.matrix.split.preprocessingFitScope, "train-only");
  assert.ok(providerPayload.matrix.train.length > 0);
  assert.ok(providerPayload.matrix.test.length > 0);
  assert.ok(providerPayload.matrix.train.every((row) => row.target !== null));
  assert.ok(providerPayload.matrix.train.every((row) => !("final_approved_score" in row.features)));
  assert.ok(providerPayload.matrix.train.every((row) => !("generation_pattern" in row.features)));
  assert.deepEqual(providerPayload.matrix.schema.baselineFeatures, ["role_code", "checkpoint_index", "elapsed_fraction", "current_overall_score"]);
  assert.ok(providerPayload.matrix.train.every((row) => Number.isFinite(row.baseline.current_overall_score)));
  assert.ok(providerPayload.matrix.train.every((row) => !row.cycleId.includes("2026")));
});

test("same snapshot and configuration produce the same run identity", async () => {
  const body = trainingBody();
  const first = await predictionTraining(request(body), { provider: async () => providerResult });
  const second = await predictionTraining(request(body), { provider: async () => providerResult });
  const firstResult = await first.json();
  const secondResult = await second.json();
  assert.equal(firstResult.runId, secondResult.runId);
  assert.equal(firstResult.configurationChecksum, secondResult.configurationChecksum);
});

test("training route refuses non-eligible history without calling provider", async () => {
  let called = false;
  const response = await predictionTraining(request(trainingBody("current")), {
    provider: async () => {
      called = true;
      return providerResult;
    },
  });
  const result = await response.json();
  assert.equal(response.status, 422);
  assert.equal(result.readiness.scenario, "A");
  assert.equal(called, false);
});

test("training route blocks target and future-label leakage", async () => {
  const body = trainingBody("sufficient", {
    featureSelection: ["current_overall_score", "final_approved_score", "generation_pattern"],
  });
  const response = await predictionTraining(request(body), { provider: async () => providerResult });
  const result = await response.json();
  assert.equal(response.status, 422);
  assert.ok(result.issues.some((issue) => issue.includes("target")));
  assert.ok(result.issues.some((issue) => issue.includes("Generator-only")));
});

test("training route enforces origin, content type and safe provider errors", async () => {
  const wrongOrigin = await predictionTraining(request(trainingBody(), { origin: "https://example.com" }));
  assert.equal(wrongOrigin.status, 403);

  const wrongType = await predictionTraining(new Request("http://localhost/api/prediction/training", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "{}",
  }));
  assert.equal(wrongType.status, 415);

  const providerFailure = new Error("private provider details");
  providerFailure.code = "TRAINING_PROVIDER_UNAVAILABLE";
  const failed = await predictionTraining(request(trainingBody()), {
    provider: async () => { throw providerFailure; },
  });
  const failedResult = await failed.json();
  assert.equal(failed.status, 503);
  assert.equal(failedResult.error, "The local Python training provider is unavailable.");
  assert.deepEqual(failedResult.issues, []);
});
