import test from "node:test";
import assert from "node:assert/strict";
import {
  generatePredictionPreview,
  predictionDatasetGeneration,
  resolveGenerationConfiguration,
} from "./prediction/generationRoute.js";

const endpoint = "http://127.0.0.1:3000/api/prediction/datasets/generate";
const post = (body, headers = {}) => new Request(endpoint, {
  method: "POST",
  headers: {
    Origin: "http://127.0.0.1:3000",
    Host: "127.0.0.1:3000",
    "Content-Type": "application/json",
    ...headers,
  },
  body: typeof body === "string" ? body : JSON.stringify(body),
});

test("generation configuration validates bounds and resolves cycle/checkpoint decisions", () => {
  const invalid = resolveGenerationConfiguration({
    seed: 0,
    activeEmployeeCount: 0,
    limitedCycleCount: 1,
    sufficientCycleCount: 9,
    checkpointCount: 1,
    patternWeights: { steady: -1 },
  });
  assert.ok(invalid.errors.length >= 6);

  const valid = resolveGenerationConfiguration({
    seed: 42,
    activeCycleStartYear: 2027,
    limitedCycleCount: 2,
    sufficientCycleCount: 5,
    checkpointCount: 5,
  });
  assert.deepEqual(valid.errors, []);
  assert.deepEqual(valid.defaults.limitedHistory.cycleStartYears, [2025, 2026]);
  assert.deepEqual(valid.defaults.sufficientHistory.cycleStartYears, [2022, 2023, 2024, 2025, 2026]);
  assert.deepEqual(valid.defaults.checkpointFractions, [0.2, 0.4, 0.6, 0.8, 1]);
});

test("generation preview is deterministic and returns every synthetic scenario", () => {
  const first = generatePredictionPreview({ seed: 42 });
  const second = generatePredictionPreview({ seed: 42 });
  assert.equal(first.snapshotGroupId, second.snapshotGroupId);
  assert.equal(first.datasets.current.checksum, second.datasets.current.checksum);
  assert.equal(first.datasets.sufficient.checksum, second.datasets.sufficient.checksum);
  assert.deepEqual(Object.keys(first.datasets), ["current", "limited", "sufficient", "invalid"]);
  assert.equal(first.datasets.current.summary.rows, 40);
  assert.equal(first.datasets.limited.summary.completedCases, 60);
  assert.equal(first.datasets.sufficient.summary.completedCases, 240);
  assert.equal(first.datasets.invalid.summary.rows, 12);
  assert.deepEqual(first.datasets.sufficient.profile.checkpointIndices, [1, 2, 3, 4]);
  assert.equal(first.datasets.sufficient.profile.missingValueRows, 0);
  assert.equal(first.datasets.sufficient.profile.duplicateRows, 0);
  assert.ok(first.datasets.invalid.profile.missingValueRows > 0);
  assert.ok(first.datasets.invalid.profile.duplicateRows > 0);
  assert.equal(first.synthetic, true);
});

test("generation route returns previews and useful configuration errors", async () => {
  const response = await predictionDatasetGeneration(post({ configuration: { seed: 84 } }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const result = await response.json();
  assert.equal(result.configuration.seed, 84);
  assert.equal(result.datasets.current.rows.length, 40);

  const invalid = await predictionDatasetGeneration(post({ configuration: { checkpointCount: 1 } }));
  assert.equal(invalid.status, 400);
  const invalidResult = await invalid.json();
  assert.equal(invalidResult.error, "Check the generation settings.");
  assert.ok(invalidResult.issues.some((issue) => issue.includes("Checkpoint count")));
});

test("generation route enforces origin, JSON and body limits", async () => {
  assert.equal((await predictionDatasetGeneration(post({}, { Origin: "https://unrelated.example" }))).status, 403);
  assert.equal((await predictionDatasetGeneration(post("{}", { "Content-Type": "text/plain" }))).status, 415);
  assert.equal((await predictionDatasetGeneration(post("invalid"))).status, 400);
  assert.equal((await predictionDatasetGeneration(post({}, { "Content-Length": "100001" }))).status, 413);
});
