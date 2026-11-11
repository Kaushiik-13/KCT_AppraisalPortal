import { PREDICTION_TARGET, validateFeatureSelection } from "./datasetSchema.js";

export const TRAINING_CANDIDATES = Object.freeze([
  {
    id: "ridge",
    label: "Ridge regression",
    description: "Regularized linear model with scaled numeric inputs.",
    parameters: { alpha: 1 },
  },
  {
    id: "random_forest",
    label: "Random forest",
    description: "Nonlinear tree ensemble with controlled depth and leaf size.",
    parameters: { n_estimators: 200, max_depth: 8, min_samples_leaf: 3 },
  },
  {
    id: "gradient_boosting",
    label: "Gradient boosting",
    description: "Sequential tree ensemble with a conservative learning rate.",
    parameters: { n_estimators: 150, learning_rate: 0.05, max_depth: 3 },
  },
]);

export const TRANSPARENT_BASELINES = Object.freeze([
  { id: "pace", label: "Pace projection" },
  { id: "grouped_median", label: "Role + checkpoint median" },
]);

const CANDIDATE_IDS = new Set(TRAINING_CANDIDATES.map((candidate) => candidate.id));

export function validateTrainingConfiguration({
  target = PREDICTION_TARGET,
  featureSelection,
  candidates,
  seed,
  policy,
  readiness,
}) {
  const errors = [];
  if (target !== PREDICTION_TARGET) errors.push(`The prototype target must remain ${PREDICTION_TARGET}.`);

  const featureContract = validateFeatureSelection(featureSelection, policy);
  for (const finding of featureContract.findings.filter((entry) => entry.severity === "block")) {
    errors.push(finding.message);
  }

  const selectedCandidates = Array.isArray(candidates) ? [...new Set(candidates)] : [];
  if (!selectedCandidates.length) errors.push("Select at least one established candidate model.");
  const unsupported = selectedCandidates.filter((candidate) => !CANDIDATE_IDS.has(candidate));
  if (unsupported.length) errors.push(`Unsupported candidate models: ${unsupported.join(", ")}.`);

  const normalizedSeed = Number(seed);
  if (!Number.isInteger(normalizedSeed) || normalizedSeed < 1 || normalizedSeed > 2_147_483_647) {
    errors.push("Training seed must be a whole number between 1 and 2147483647.");
  }

  if (readiness?.status !== "ready-for-training" || !readiness?.eligibility?.modelTraining) {
    errors.push("The selected frozen dataset is not eligible for model training.");
  }
  if (!readiness?.split?.trainCycleIds?.length || !readiness?.split?.testCycleIds?.length) {
    errors.push("A valid earlier-cycle training and latest-cycle test split is required.");
  }
  if (readiness?.split?.employeeCycleOverlap !== 0) {
    errors.push("Employee-cycle groups cannot cross the training and test partitions.");
  }
  if (readiness?.featureContract?.preprocessingFitScope !== "train-only") {
    errors.push("Preprocessing must be fitted only on training data.");
  }

  return {
    errors: [...new Set(errors)],
    configuration: {
      target: PREDICTION_TARGET,
      featureSelection: featureContract.selected,
      candidates: selectedCandidates.filter((candidate) => CANDIDATE_IDS.has(candidate)),
      seed: normalizedSeed,
      baselines: TRANSPARENT_BASELINES.map((baseline) => baseline.id),
      scoreMinimum: 0,
      scoreMaximum: Number(policy?.overallScoreCap) || 200,
      preprocessingFitScope: "train-only",
    },
    featureContract,
  };
}
