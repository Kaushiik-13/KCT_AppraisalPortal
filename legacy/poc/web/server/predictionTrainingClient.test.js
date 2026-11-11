import assert from "node:assert/strict";
import test from "node:test";
import { buildCheckpointSafeFeatureMatrix } from "../src/prediction/featureMatrix.js";
import { evaluatePredictionReadiness } from "../src/prediction/readiness.js";
import { generatePredictionPreview } from "./prediction/generationRoute.js";
import { parseTrainingProviderOutput, runTrainingProvider } from "./prediction/trainingClient.js";

test("provider output parser rejects unreadable and incomplete responses", () => {
  assert.throws(() => parseTrainingProviderOutput("not-json", 0), /unreadable/);
  assert.throws(() => parseTrainingProviderOutput(JSON.stringify({ status: "failed", error: "safe failure" }), 1), /safe failure/);
  assert.throws(() => parseTrainingProviderOutput(JSON.stringify({ status: "succeeded" }), 0), /incomplete/);
});

test("local Python provider trains one established candidate end to end", { timeout: 60_000 }, async () => {
  const generated = generatePredictionPreview({ seed: 42, sufficientEmployees: 24 });
  const dataset = generated.datasets.sufficient;
  const readiness = evaluatePredictionReadiness({
    snapshotId: dataset.snapshotId,
    rows: dataset.rows,
    policy: generated.policy,
    expectedOrganizationId: generated.organization.id,
    expectedPolicyVersion: generated.policy.version,
    expectedFrameworkVersion: generated.frameworkVersion,
    featureSelection: generated.defaultFeatureSelection,
  });
  const matrix = buildCheckpointSafeFeatureMatrix({
    rows: dataset.rows,
    featureSelection: generated.defaultFeatureSelection,
    policy: generated.policy,
    split: readiness.split,
  });

  const result = await runTrainingProvider({
    operation: "train_compare",
    matrix,
    options: {
      candidates: ["ridge"],
      seed: 77,
      scoreMinimum: 0,
      scoreMaximum: 200,
    },
  });

  assert.equal(result.status, "succeeded");
  assert.equal(result.synthetic, true);
  assert.deepEqual(result.baselines.map((entry) => entry.id), ["pace", "grouped_median"]);
  assert.equal(result.candidates[0].id, "ridge");
  assert.equal(result.candidates[0].status, "succeeded");
  assert.equal(result.split.preprocessingFitScope, "train-only");
});
