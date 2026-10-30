import assert from "node:assert/strict";
import test from "node:test";
import { confidenceLabel, modelExpectedRange, predictionFactors, ruleBasedPrediction } from "./predictionService.js";

test("rule-based prediction is transparent, bounded and does not claim an empirical interval", () => {
  const result = ruleBasedPrediction({ current_overall_score: 50, elapsed_fraction: 0.25 }, 200);
  assert.equal(result.predictedScore, 200);
  assert.deepEqual(result.expectedRange, {
    minimum: 50,
    maximum: 200,
    method: "transparent progress bounds—not an empirical model interval",
    empirical: false,
  });
});

test("model range and confidence use held-out evidence", () => {
  const metrics = {
    normalizedMae: 0.048,
    expectedRange: { radius: 12.5, method: "held-out residual", empiricalCoverage: 0.9 },
  };
  assert.deepEqual(modelExpectedRange(195, metrics, 200), {
    minimum: 182.5,
    maximum: 200,
    radius: 12.5,
    method: "held-out residual",
    empiricalCoverage: 0.9,
    empirical: true,
  });
  assert.equal(confidenceLabel("B", metrics), "Low confidence");
  assert.equal(confidenceLabel("C", metrics), "High synthetic confidence");
});

test("plain-language factors use checkpoint facts without changing them", () => {
  const factors = predictionFactors({
    current_overall_score: 82,
    elapsed_fraction: 0.5,
    score_change: 12,
    verified_evidence_count: 3,
    kra_teaching_score: 40,
    kra_research_score: 30,
  });
  assert.equal(factors.length, 5);
  assert.match(factors[0], /82 at 50%/);
  assert.match(factors[1], /\+12/);
});
