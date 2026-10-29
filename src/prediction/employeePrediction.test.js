import assert from "node:assert/strict";
import test from "node:test";
import policy from "../../fixtures/prediction/kct/config/pads-policy-v1.json" with { type: "json" };
import active from "../../fixtures/prediction/kct/generated/active-employee-snapshots.json" with { type: "json" };
import { validatePredictionDataset } from "./datasetValidation.js";
import { advanceSyntheticCheckpoint, buildKraProgress, predictionIsFresh } from "./employeePrediction.js";

test("verified progress refresh creates a later valid active checkpoint without a training label", () => {
  const current = active.rows[0];
  const refreshed = advanceSyntheticCheckpoint(current, policy);
  const validation = validatePredictionDataset({
    rows: [refreshed],
    policy,
    expectedOrganizationId: "kct",
    expectedPolicyVersion: policy.version,
    expectedFrameworkVersion: current.framework_version,
  });
  assert.equal(validation.blocks.length, 0);
  assert.ok(refreshed.current_overall_score > current.current_overall_score);
  assert.ok(refreshed.elapsed_fraction > current.elapsed_fraction);
  assert.ok(refreshed.remaining_days < current.remaining_days);
  assert.equal(refreshed.previous_overall_score, current.current_overall_score);
  assert.equal(refreshed.final_approved_score, null);
  assert.equal(refreshed.target_available_date, null);
});

test("employee KRA progress stays policy-labelled and bounded", () => {
  const progress = buildKraProgress(active.rows[0], policy);
  assert.equal(progress.length, policy.kras.length);
  assert.equal(progress[0].name, "Teaching & Learning");
  assert.ok(progress.every((entry) => entry.score >= 0 && entry.score <= entry.cap && entry.percent <= 100));
});

test("prediction freshness follows employee, verified score and policy version", () => {
  const row = active.rows[0];
  const result = { employeeKey: row.employee_key, currentVerifiedScore: row.current_overall_score, versions: { policy: policy.version } };
  assert.equal(predictionIsFresh(result, row, policy.version), true);
  assert.equal(predictionIsFresh({ ...result, currentVerifiedScore: row.current_overall_score + 1 }, row, policy.version), false);
  assert.equal(predictionIsFresh(result, { ...row, employee_key: "another" }, policy.version), false);
});
