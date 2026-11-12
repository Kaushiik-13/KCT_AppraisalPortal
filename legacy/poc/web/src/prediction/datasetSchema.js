export const PREDICTION_TARGET = "final_approved_score";

export const DEFAULT_READINESS_PROFILE = Object.freeze({
  id: "synthetic-demonstration-v1",
  label: "Synthetic demonstration defaults—not production thresholds",
  limitedHistory: {
    minCompletedCases: 20,
    minCompletedCycles: 2,
  },
  sufficientHistory: {
    minCompletedCases: 200,
    minCompletedCycles: 4,
  },
  warnings: {
    maxMissingFeatureRate: 0.05,
    minTestCases: 20,
    maxPatternShare: 0.6,
  },
});

export const DEFAULT_FEATURE_SELECTION = Object.freeze([
  "role_code",
  "checkpoint_index",
  "elapsed_fraction",
  "remaining_days",
  "current_overall_score",
  "previous_overall_score",
  "score_change",
  "verified_evidence_count",
  "mandatory_status",
  "mandatory_route",
]);

export const EXCLUDED_FEATURES = Object.freeze({
  final_approved_score: "target",
  target_available_date: "post-checkpoint target metadata",
  record_id: "row identity",
  organization_id: "organization scope",
  employee_key: "employee grouping identity",
  cycle_id: "time-split identity",
  cycle_status: "readiness state",
  cycle_start_date: "validation-only date",
  cycle_end_date: "validation-only date",
  checkpoint_date: "validation-only date",
  policy_version: "compatibility scope",
  framework_version: "compatibility scope",
  generator_version: "generator metadata",
  generation_seed: "generator metadata",
  source_dataset: "fixture identity",
  is_synthetic: "provenance guard",
  fixture_case_id: "invalid-fixture metadata",
  injected_defect: "invalid-fixture metadata",
  generation_pattern: "generator-only future-unavailable label",
  missing_feature_count: "readiness-only quality field",
});

export function predictionFeatureContract(policy) {
  const dynamic = [];
  for (const kra of policy?.kras || []) {
    dynamic.push(`kra_${kra.id}_score`, `kra_${kra.id}_cap`);
  }
  return {
    target: PREDICTION_TARGET,
    allowed: [...DEFAULT_FEATURE_SELECTION, ...dynamic],
    excluded: { ...EXCLUDED_FEATURES },
  };
}

export function normalizeReadinessProfile(profile = {}) {
  const limited = profile.limitedHistory || {};
  const sufficient = profile.sufficientHistory || {};
  const warnings = profile.warnings || {};
  return {
    id: profile.id || DEFAULT_READINESS_PROFILE.id,
    label: profile.label || DEFAULT_READINESS_PROFILE.label,
    limitedHistory: {
      minCompletedCases: positiveInteger(limited.minCompletedCases, DEFAULT_READINESS_PROFILE.limitedHistory.minCompletedCases),
      minCompletedCycles: positiveInteger(limited.minCompletedCycles, DEFAULT_READINESS_PROFILE.limitedHistory.minCompletedCycles),
    },
    sufficientHistory: {
      minCompletedCases: positiveInteger(sufficient.minCompletedCases, DEFAULT_READINESS_PROFILE.sufficientHistory.minCompletedCases),
      minCompletedCycles: positiveInteger(sufficient.minCompletedCycles, DEFAULT_READINESS_PROFILE.sufficientHistory.minCompletedCycles),
    },
    warnings: {
      maxMissingFeatureRate: boundedNumber(warnings.maxMissingFeatureRate, DEFAULT_READINESS_PROFILE.warnings.maxMissingFeatureRate, 0, 1),
      minTestCases: positiveInteger(warnings.minTestCases, DEFAULT_READINESS_PROFILE.warnings.minTestCases),
      maxPatternShare: boundedNumber(warnings.maxPatternShare, DEFAULT_READINESS_PROFILE.warnings.maxPatternShare, 0, 1),
    },
  };
}

function positiveInteger(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function boundedNumber(value, fallback, minimum, maximum) {
  return Number.isFinite(value) && value >= minimum && value <= maximum ? value : fallback;
}

export function validateFeatureSelection(featureSelection, policy) {
  const contract = predictionFeatureContract(policy);
  const allowed = new Set(contract.allowed);
  const selected = Array.isArray(featureSelection) ? [...new Set(featureSelection)] : [];
  const findings = [];

  if (selected.length === 0) {
    findings.push({
      code: "FEATURE_SELECTION_REQUIRED",
      severity: "block",
      message: "Select at least one checkpoint-safe input feature.",
      fields: [],
    });
  }

  const targetLeakage = selected.filter((field) => field === PREDICTION_TARGET || contract.excluded[field] === "post-checkpoint target metadata");
  if (targetLeakage.length) {
    findings.push({
      code: "TARGET_LEAKAGE_FEATURE",
      severity: "block",
      message: "The target or its post-checkpoint metadata cannot be used as an input feature.",
      fields: targetLeakage,
    });
  }

  const futureUnavailable = selected.filter((field) => field === "generation_pattern");
  if (futureUnavailable.length) {
    findings.push({
      code: "FUTURE_UNAVAILABLE_FEATURE",
      severity: "block",
      message: "Generator-only labels are unavailable during real inference and cannot be selected.",
      fields: futureUnavailable,
    });
  }

  const unsafe = selected.filter((field) => !allowed.has(field) && !targetLeakage.includes(field) && !futureUnavailable.includes(field));
  if (unsafe.length) {
    findings.push({
      code: "UNSAFE_OR_UNKNOWN_FEATURE",
      severity: "block",
      message: "One or more selected fields are identifiers, split metadata, validation-only fields, or unknown to the policy contract.",
      fields: unsafe,
    });
  }

  return { selected, contract, findings };
}
