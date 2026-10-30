import { PREDICTION_TARGET, validateFeatureSelection } from "./datasetSchema.js";

const groupKey = (row) => `${row.organization_id}|${row.employee_key}|${row.cycle_id}`;
const BASELINE_FEATURES = ["role_code", "checkpoint_index", "elapsed_fraction", "current_overall_score"];

export function buildCheckpointSafeFeatureMatrix({ rows, featureSelection, policy, split }) {
  const contract = validateFeatureSelection(featureSelection, policy);
  if (contract.findings.some((finding) => finding.severity === "block")) {
    const error = new Error("Feature selection is not checkpoint-safe.");
    error.codes = contract.findings.map((finding) => finding.code);
    throw error;
  }
  if (!split?.trainCycleIds?.length || !split?.testCycleIds?.length)
    throw new Error("A valid time-based split is required.");

  const completed = rows.filter((row) => row.cycle_status === "completed");
  const toExample = (row) => ({
    recordId: row.record_id,
    group: groupKey(row),
    cycleId: row.cycle_id,
    features: Object.fromEntries(contract.selected.map((field) => [field, row[field] ?? null])),
    baseline: Object.fromEntries(BASELINE_FEATURES.map((field) => [field, row[field] ?? null])),
    target: row[PREDICTION_TARGET],
  });
  const train = completed.filter((row) => split.trainCycleIds.includes(row.cycle_id)).map(toExample);
  const test = completed.filter((row) => split.testCycleIds.includes(row.cycle_id)).map(toExample);
  const trainGroups = new Set(train.map((example) => example.group));
  const overlap = test.filter((example) => trainGroups.has(example.group));
  if (overlap.length) throw new Error("Employee-cycle groups overlap between training and test partitions.");
  if (!train.length || !test.length) throw new Error("The split produced an empty training or test partition.");
  if ([...train, ...test].some((example) => typeof example.target !== "number" || !Number.isFinite(example.target)))
    throw new Error("Every supervised example requires a numeric final target.");

  return {
    schema: {
      features: contract.selected,
      baselineFeatures: BASELINE_FEATURES,
      target: PREDICTION_TARGET,
      excluded: contract.contract.excluded,
    },
    split: {
      strategy: split.strategy,
      trainCycleIds: split.trainCycleIds,
      testCycleIds: split.testCycleIds,
      preprocessingFitScope: "train-only",
    },
    train,
    test,
  };
}
