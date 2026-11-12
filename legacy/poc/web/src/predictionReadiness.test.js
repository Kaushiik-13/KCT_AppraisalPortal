import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { generateSyntheticDatasets } from "./prediction/syntheticGenerator.js";
import {
  DEFAULT_FEATURE_SELECTION,
  predictionFeatureContract,
} from "./prediction/datasetSchema.js";
import { buildCheckpointSafeFeatureMatrix } from "./prediction/featureMatrix.js";
import { evaluatePredictionReadiness } from "./prediction/readiness.js";

const configRoot = new URL("../fixtures/prediction/kct/config/", import.meta.url);
const expectedRoot = new URL("../fixtures/prediction/kct/expected/", import.meta.url);
const readJson = (name, root = configRoot) => JSON.parse(fs.readFileSync(new URL(name, root), "utf8"));
const organization = readJson("organization.json");
const policy = readJson("pads-policy-v1.json");
const defaults = readJson("generation-defaults.json");
const expected = readJson("readiness-cases.json", expectedRoot);
const datasets = generateSyntheticDatasets({ organization, policy, defaults });
const fixtureRows = {
  "no-history-current": datasets.current,
  "limited-history": datasets.limited,
  "sufficient-history": datasets.sufficient,
  "invalid-history": datasets.invalid,
};

function readiness(rows, featureSelection = DEFAULT_FEATURE_SELECTION) {
  return evaluatePredictionReadiness({
    snapshotId: "test-snapshot",
    rows,
    policy,
    expectedOrganizationId: organization.id,
    expectedPolicyVersion: policy.version,
    expectedFrameworkVersion: defaults.frameworkVersion,
    featureSelection,
  });
}

test("documented synthetic fixtures select the expected readiness scenarios", () => {
  for (const expectedCase of expected.cases) {
    const result = readiness(fixtureRows[expectedCase.fixture]);
    assert.equal(result.profile.id, expected.profileId, expectedCase.fixture);
    assert.equal(result.scenario, expectedCase.scenario, expectedCase.fixture);
    assert.equal(result.status, expectedCase.status, expectedCase.fixture);
    assert.equal(result.eligibility.modelTraining, expectedCase.modelTraining, expectedCase.fixture);
    const warningCodes = new Set(result.warnings.map((finding) => finding.code));
    const blockCodes = new Set(result.blocks.map((finding) => finding.code));
    for (const code of expectedCase.requiredWarningCodes || []) assert.ok(warningCodes.has(code), `${expectedCase.fixture}: ${code}`);
    for (const code of expectedCase.requiredBlockCodes || []) assert.ok(blockCodes.has(code), `${expectedCase.fixture}: ${code}`);
    if (expectedCase.trainCycles) assert.deepEqual(result.split.trainCycleIds, expectedCase.trainCycles);
    if (expectedCase.testCycles) assert.deepEqual(result.split.testCycleIds, expectedCase.testCycles);
  }
});

test("readiness counts cases rather than mistaking checkpoint rows for employees", () => {
  const limited = readiness(datasets.limited);
  assert.equal(limited.counts.completedRows, 240);
  assert.equal(limited.counts.completedCases, 60);
  assert.equal(limited.counts.completedCycles, 2);
  assert.equal(limited.split.trainCases, 30);
  assert.equal(limited.split.testCases, 30);

  const sufficient = readiness(datasets.sufficient);
  assert.equal(sufficient.counts.completedRows, 960);
  assert.equal(sufficient.counts.completedCases, 240);
  assert.equal(sufficient.split.trainCases, 180);
  assert.equal(sufficient.split.testCases, 60);
});

test("feature safety blocks target, generator-only and identity leakage", () => {
  const result = readiness(datasets.sufficient, [
    "current_overall_score",
    "final_approved_score",
    "generation_pattern",
    "employee_key",
  ]);
  const codes = new Set(result.blocks.map((finding) => finding.code));
  assert.equal(result.status, "blocked");
  assert.equal(result.scenario, null);
  assert.ok(codes.has("TARGET_LEAKAGE_FEATURE"));
  assert.ok(codes.has("FUTURE_UNAVAILABLE_FEATURE"));
  assert.ok(codes.has("UNSAFE_OR_UNKNOWN_FEATURE"));
});

test("one completed cycle cannot form a valid time-based holdout", () => {
  const oneCycle = datasets.limited.filter((row) => row.cycle_id === "2024-25");
  const result = readiness(oneCycle);
  assert.equal(result.scenario, "B");
  assert.equal(result.status, "fallback-only");
  assert.equal(result.eligibility.modelTraining, false);
  assert.ok(result.blocks.some((finding) => finding.code === "NO_VALID_TIME_SPLIT"));
});

test("checkpoint-safe feature matrix keeps cycles and employee cases separated", () => {
  const rows = [...datasets.sufficient, ...datasets.current];
  const result = readiness(rows);
  const matrix = buildCheckpointSafeFeatureMatrix({
    rows,
    featureSelection: DEFAULT_FEATURE_SELECTION,
    policy,
    split: result.split,
  });
  assert.equal(matrix.train.length, 720);
  assert.equal(matrix.test.length, 240);
  assert.equal(result.counts.activeRows, 40);
  assert.ok([...matrix.train, ...matrix.test].every((example) => !example.recordId.startsWith("no-history-current")));
  assert.deepEqual(matrix.split.trainCycleIds, ["2022-23", "2023-24", "2024-25"]);
  assert.deepEqual(matrix.split.testCycleIds, ["2025-26"]);
  assert.equal(matrix.split.preprocessingFitScope, "train-only");
  assert.equal(Object.hasOwn(matrix.train[0].features, "final_approved_score"), false);
  assert.equal(Object.hasOwn(matrix.train[0].features, "employee_key"), false);
  assert.equal(typeof matrix.train[0].target, "number");
  const trainGroups = new Set(matrix.train.map((example) => example.group));
  assert.ok(matrix.test.every((example) => !trainGroups.has(example.group)));
});

test("policy KRA score and cap fields are explicit allowed features", () => {
  const contract = predictionFeatureContract(policy);
  for (const kra of policy.kras) {
    assert.ok(contract.allowed.includes(`kra_${kra.id}_score`));
    assert.ok(contract.allowed.includes(`kra_${kra.id}_cap`));
  }
  assert.equal(contract.excluded.final_approved_score, "target");
  assert.equal(contract.excluded.generation_pattern, "generator-only future-unavailable label");
});
