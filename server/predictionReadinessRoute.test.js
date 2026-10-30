import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { generateSyntheticDatasets } from "../src/prediction/syntheticGenerator.js";
import { DEFAULT_FEATURE_SELECTION } from "../src/prediction/datasetSchema.js";
import { predictionReadiness } from "./prediction/readinessRoute.js";

const configRoot = new URL("../fixtures/prediction/kct/config/", import.meta.url);
const readJson = (name) => JSON.parse(fs.readFileSync(new URL(name, configRoot), "utf8"));
const organization = readJson("organization.json");
const policy = readJson("pads-policy-v1.json");
const defaults = readJson("generation-defaults.json");
const datasets = generateSyntheticDatasets({ organization, policy, defaults });
const endpoint = "http://127.0.0.1:3000/api/prediction/datasets/readiness";

function post(body, headers = {}) {
  return new Request(endpoint, {
    method: "POST",
    headers: {
      Origin: "http://127.0.0.1:3000",
      Host: "127.0.0.1:3000",
      "Content-Type": "application/json",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function payload(rows, featureSelection = DEFAULT_FEATURE_SELECTION) {
  return {
    snapshot: {
      id: "synthetic-test-snapshot",
      organizationId: organization.id,
      policyVersion: policy.version,
      frameworkVersion: defaults.frameworkVersion,
      rows,
    },
    policy,
    featureSelection,
  };
}

test("prediction readiness route validates origin, content type and body contract", async () => {
  const unrelated = post(payload(datasets.current), { Origin: "https://unrelated.example" });
  assert.equal((await predictionReadiness(unrelated)).status, 403);
  const text = post("{}", { "Content-Type": "text/plain" });
  assert.equal((await predictionReadiness(text)).status, 415);
  assert.equal((await predictionReadiness(post("invalid"))).status, 400);
  assert.equal((await predictionReadiness(post({ policy, featureSelection: [] }))).status, 400);
  assert.equal((await predictionReadiness(post({ snapshot: { id: "x", rows: [] }, featureSelection: [] }))).status, 400);
  assert.equal((await predictionReadiness(post({ snapshot: { id: "x", rows: [] }, policy }))).status, 400);
});

test("prediction readiness route returns structured Scenario B output", async () => {
  const response = await predictionReadiness(post(payload(datasets.limited)));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const result = await response.json();
  assert.equal(result.snapshotId, "synthetic-test-snapshot");
  assert.equal(result.scenario, "B");
  assert.equal(result.status, "ready-for-training");
  assert.deepEqual(result.split.trainCycleIds, ["2024-25"]);
  assert.deepEqual(result.split.testCycleIds, ["2025-26"]);
  assert.equal(result.counts.completedCases, 60);
});

test("prediction readiness route reports blocked data and feature leakage without training", async () => {
  const invalid = await predictionReadiness(post(payload(datasets.invalid)));
  assert.equal(invalid.status, 200);
  const invalidResult = await invalid.json();
  assert.equal(invalidResult.status, "blocked");
  assert.equal(invalidResult.eligibility.modelTraining, false);
  assert.ok(invalidResult.blocks.length > 0);

  const leakage = await predictionReadiness(post(payload(datasets.sufficient, ["current_overall_score", "final_approved_score"])));
  const leakageResult = await leakage.json();
  assert.equal(leakageResult.status, "blocked");
  assert.ok(leakageResult.blocks.some((finding) => finding.code === "TARGET_LEAKAGE_FEATURE"));
});

test("prediction readiness route rejects declared oversized snapshots", async () => {
  const request = post(payload(datasets.current), { "Content-Length": "6000001" });
  assert.equal((await predictionReadiness(request)).status, 413);
});
