const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function ruleBasedPrediction(row, scoreMaximum) {
  const current = Number(row?.current_overall_score);
  const elapsed = Number(row?.elapsed_fraction);
  if (!Number.isFinite(current) || !Number.isFinite(elapsed) || elapsed < 0 || elapsed > 1) {
    throw new Error("A valid current score and elapsed fraction are required.");
  }
  const projected = elapsed > 0 ? current / elapsed : current;
  return {
    predictedScore: Number(clamp(projected, 0, scoreMaximum).toFixed(2)),
    expectedRange: {
      minimum: Number(clamp(current, 0, scoreMaximum).toFixed(2)),
      maximum: scoreMaximum,
      method: "transparent progress bounds—not an empirical model interval",
      empirical: false,
    },
  };
}

export function modelExpectedRange(predictedScore, metrics, scoreMaximum) {
  const radius = Number(metrics?.expectedRange?.radius);
  if (!Number.isFinite(radius)) throw new Error("Published model range evidence is unavailable.");
  return {
    minimum: Number(clamp(predictedScore - radius, 0, scoreMaximum).toFixed(2)),
    maximum: Number(clamp(predictedScore + radius, 0, scoreMaximum).toFixed(2)),
    radius,
    method: metrics.expectedRange.method,
    empiricalCoverage: metrics.expectedRange.empiricalCoverage,
    empirical: true,
  };
}

export function confidenceLabel(scenario, metrics) {
  if (scenario === "A") return "Rule-based estimate";
  if (scenario === "B") return "Low confidence";
  const normalizedMae = Number(metrics?.normalizedMae);
  if (!Number.isFinite(normalizedMae)) return "Confidence unavailable";
  if (normalizedMae <= 0.05) return "High synthetic confidence";
  if (normalizedMae <= 0.1) return "Medium synthetic confidence";
  return "Low synthetic confidence";
}

export function predictionFactors(row) {
  const factors = [
    `Current verified score is ${row.current_overall_score} at ${Math.round(row.elapsed_fraction * 100)}% of the cycle.`,
    `Latest checkpoint change is ${row.score_change >= 0 ? "+" : ""}${row.score_change} points.`,
    `${row.verified_evidence_count} verified evidence item${row.verified_evidence_count === 1 ? "" : "s"} are reflected in the checkpoint.`,
  ];
  const kraScores = Object.entries(row)
    .filter(([field, value]) => field.startsWith("kra_") && field.endsWith("_score") && Number.isFinite(value))
    .toSorted((left, right) => right[1] - left[1])
    .slice(0, 2);
  for (const [field, value] of kraScores) factors.push(`${field.replace(/^kra_|_score$/g, "").replaceAll("_", " ")} contributes ${value} current points.`);
  return factors;
}
