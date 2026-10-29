import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_FEATURE_SELECTION } from "./datasetSchema.js";
import { TRAINING_CANDIDATES, validateTrainingConfiguration } from "./trainingConfig.js";

const policy = {
  overallScoreCap: 200,
  kras: [{ id: "teaching" }],
};

const readiness = {
  status: "ready-for-training",
  eligibility: { modelTraining: true },
  split: {
    trainCycleIds: ["2023-24"],
    testCycleIds: ["2024-25"],
    employeeCycleOverlap: 0,
  },
  featureContract: { preprocessingFitScope: "train-only" },
};

test("training configuration fixes the target, baselines and registered candidates", () => {
  const result = validateTrainingConfiguration({
    featureSelection: DEFAULT_FEATURE_SELECTION,
    candidates: TRAINING_CANDIDATES.map((candidate) => candidate.id),
    seed: 42,
    policy,
    readiness,
  });
  assert.deepEqual(result.errors, []);
  assert.equal(result.configuration.target, "final_approved_score");
  assert.deepEqual(result.configuration.baselines, ["pace", "grouped_median"]);
  assert.equal(result.configuration.preprocessingFitScope, "train-only");
});

test("training configuration blocks leakage, unknown models, bad seeds and unsafe splits", () => {
  const result = validateTrainingConfiguration({
    target: "current_overall_score",
    featureSelection: ["final_approved_score", "generation_pattern"],
    candidates: ["invented_model"],
    seed: 0,
    policy,
    readiness: {
      status: "fallback-only",
      eligibility: { modelTraining: false },
      split: { trainCycleIds: [], testCycleIds: [], employeeCycleOverlap: 1 },
      featureContract: { preprocessingFitScope: "all-data" },
    },
  });
  assert.ok(result.errors.some((error) => error.includes("target must remain")));
  assert.ok(result.errors.some((error) => error.includes("target or its post-checkpoint")));
  assert.ok(result.errors.some((error) => error.includes("Generator-only")));
  assert.ok(result.errors.some((error) => error.includes("Unsupported candidate")));
  assert.ok(result.errors.some((error) => error.includes("seed")));
  assert.ok(result.errors.some((error) => error.includes("not eligible")));
  assert.ok(result.errors.some((error) => error.includes("cannot cross")));
  assert.ok(result.errors.some((error) => error.includes("training data")));
});
