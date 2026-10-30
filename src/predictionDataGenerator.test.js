import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  generateSyntheticDatasets,
  rowsToCsv,
  SYNTHETIC_COLUMNS,
  validateSyntheticPolicy,
} from "./prediction/syntheticGenerator.js";

const configRoot = new URL("../fixtures/prediction/kct/config/", import.meta.url);
const readJson = (name) => JSON.parse(fs.readFileSync(new URL(name, configRoot), "utf8"));
const organization = readJson("organization.json");
const policy = readJson("pads-policy-v1.json");
const defaults = readJson("generation-defaults.json");
const build = () => generateSyntheticDatasets({ organization, policy, defaults });

test("PADS synthetic policy defines valid role caps for every KRA", () => {
  assert.deepEqual(validateSyntheticPolicy(policy), []);
  assert.equal(policy.overallScoreCap, 200);
  for (const role of policy.roles)
    assert.deepEqual(Object.keys(role.kraCaps).sort(), policy.kras.map((kra) => kra.id).sort());
});

test("generator is deterministic and produces the planned scenario sizes", () => {
  const first = build();
  const second = build();
  assert.deepEqual(first, second);
  assert.equal(first.current.length, 40);
  assert.equal(first.limited.length, 60 * 4);
  assert.equal(first.sufficient.length, 240 * 4);
  assert.equal(first.invalid.length, 12);
});

test("changing the seed changes synthetic values without changing scenario contracts", () => {
  const baseline = build();
  const alternative = generateSyntheticDatasets({
    organization,
    policy,
    defaults: { ...defaults, seed: defaults.seed + 1 },
  });

  assert.equal(alternative.current.length, baseline.current.length);
  assert.equal(alternative.limited.length, baseline.limited.length);
  assert.equal(alternative.sufficient.length, baseline.sufficient.length);
  assert.equal(alternative.invalid.length, baseline.invalid.length);
  assert.notEqual(rowsToCsv(alternative.current), rowsToCsv(baseline.current));
  assert.notEqual(rowsToCsv(alternative.sufficient), rowsToCsv(baseline.sufficient));
  assert.ok(alternative.current.every((row) => row.generation_seed === defaults.seed + 1));
});

test("clean completed rows stay within role and overall caps and progress cumulatively", () => {
  const { sufficient } = build();
  const roles = new Map(policy.roles.map((role) => [role.code, role]));
  const prior = new Map();
  for (const row of sufficient) {
    assert.equal(row.is_synthetic, true);
    assert.ok(row.current_overall_score >= 0 && row.current_overall_score <= policy.overallScoreCap);
    assert.ok(row.final_approved_score >= row.current_overall_score);
    assert.ok(row.final_approved_score <= policy.overallScoreCap);
    const role = roles.get(row.role_code);
    for (const kra of policy.kras) {
      assert.ok(row[`kra_${kra.id}_score`] >= 0);
      assert.ok(row[`kra_${kra.id}_score`] <= role.kraCaps[kra.id]);
    }
    const key = `${row.employee_key}|${row.cycle_id}`;
    assert.ok(row.current_overall_score >= (prior.get(key) ?? 0));
    prior.set(key, row.current_overall_score);
    if (row.elapsed_fraction === 1)
      assert.equal(row.current_overall_score, row.final_approved_score);
  }
});

test("active rows contain checkpoint features but no final target", () => {
  const { current } = build();
  assert.ok(current.every((row) => row.cycle_status === "active"));
  assert.ok(current.every((row) => row.final_approved_score === null));
  assert.ok(current.every((row) => row.target_available_date === null));
});

test("clean datasets have unique canonical checkpoint keys", () => {
  const { current, limited, sufficient } = build();
  for (const rows of [current, limited, sufficient]) {
    const keys = rows.map((row) => `${row.organization_id}|${row.employee_key}|${row.cycle_id}|${row.checkpoint_index}`);
    assert.equal(new Set(keys).size, keys.length);
  }
});

test("invalid fixture contains each named defect including a duplicate key", () => {
  const { invalid } = build();
  const defects = new Set(invalid.map((row) => row.injected_defect));
  for (const expected of [
    "missing_target",
    "missing_current_score",
    "duplicate_canonical_key",
    "score_above_overall_cap",
    "checkpoint_outside_cycle",
    "unknown_role",
    "incompatible_policy",
    "target_before_cycle_close",
    "decreasing_cumulative_sequence",
    "synthetic_flag_false",
  ]) assert.ok(defects.has(expected), expected);
  const duplicateRows = invalid.filter((row) => row.injected_defect === "duplicate_canonical_key");
  assert.equal(duplicateRows.length, 2);
  assert.equal(duplicateRows[0].employee_key, duplicateRows[1].employee_key);
  assert.equal(duplicateRows[0].cycle_id, duplicateRows[1].cycle_id);
  assert.equal(duplicateRows[0].checkpoint_index, duplicateRows[1].checkpoint_index);
});

test("CSV serialization includes the canonical columns and every row", () => {
  const { current } = build();
  const csv = rowsToCsv(current);
  assert.equal(csv.split("\n")[0], SYNTHETIC_COLUMNS.join(","));
  assert.equal(csv.trimEnd().split("\n").length, current.length + 1);
});
