import {
  DEFAULT_FEATURE_SELECTION,
  normalizeReadinessProfile,
  validateFeatureSelection,
} from "./datasetSchema.js";
import { validatePredictionDataset } from "./datasetValidation.js";

const completedCaseKey = (row) => `${row.organization_id}|${row.employee_key}|${row.cycle_id}`;

function finding(code, severity, message, details = {}) {
  return { code, severity, message, ...details };
}

function uniqueFindings(findings) {
  const byCode = new Map();
  for (const entry of findings) {
    const existing = byCode.get(entry.code);
    if (!existing) byCode.set(entry.code, entry);
    else if (entry.count) existing.count = (existing.count || 0) + entry.count;
  }
  return [...byCode.values()];
}

export function buildTimeBasedSplit(completedRows) {
  const cycleMetadata = new Map();
  for (const row of completedRows) {
    const existing = cycleMetadata.get(row.cycle_id);
    if (!existing || row.cycle_end_date > existing.endDate)
      cycleMetadata.set(row.cycle_id, { id: row.cycle_id, endDate: row.cycle_end_date });
  }
  const cycles = [...cycleMetadata.values()].sort((left, right) => left.endDate.localeCompare(right.endDate) || left.id.localeCompare(right.id));
  if (cycles.length < 2) return null;

  const testCycleId = cycles.at(-1).id;
  const trainCycleIds = cycles.slice(0, -1).map((cycle) => cycle.id);
  const trainRows = completedRows.filter((row) => trainCycleIds.includes(row.cycle_id));
  const testRows = completedRows.filter((row) => row.cycle_id === testCycleId);
  const trainCases = new Set(trainRows.map(completedCaseKey));
  const testCases = new Set(testRows.map(completedCaseKey));
  const overlap = [...trainCases].filter((key) => testCases.has(key));
  if (!trainRows.length || !testRows.length || overlap.length) return null;

  return {
    strategy: "time-based-cycle-holdout",
    trainCycleIds,
    testCycleIds: [testCycleId],
    trainRows: trainRows.length,
    testRows: testRows.length,
    trainCases: trainCases.size,
    testCases: testCases.size,
    employeeCycleOverlap: overlap.length,
    preprocessingFitScope: "train-only",
  };
}

function qualityWarnings({ completedRows, activeRows, featureSelection, policy, split, profile }) {
  const warnings = [];
  const trainingRoles = new Set(completedRows.map((row) => row.role_code));
  const missingRoles = policy.roles.map((role) => role.code).filter((role) => !trainingRoles.has(role));
  if (completedRows.length && missingRoles.length) {
    warnings.push(finding(
      "LIMITED_ROLE_COVERAGE",
      "warning",
      "Historical rows do not cover every configured role.",
      { roles: missingRoles },
    ));
  }

  const runtimeOnlyRoles = [...new Set(activeRows.map((row) => row.role_code))].filter((role) => !trainingRoles.has(role));
  if (completedRows.length && runtimeOnlyRoles.length) {
    warnings.push(finding(
      "RUNTIME_ROLE_UNSEEN",
      "warning",
      "An active-cycle role is absent from the training history.",
      { roles: runtimeOnlyRoles },
    ));
  }

  let missing = 0;
  let checked = 0;
  for (const row of completedRows) {
    for (const field of featureSelection) {
      if (field === "previous_overall_score" && row.checkpoint_index === 1) continue;
      checked += 1;
      if (row[field] === null || row[field] === undefined || row[field] === "") missing += 1;
    }
  }
  const missingFeatureRate = checked ? missing / checked : 0;
  if (missingFeatureRate > profile.warnings.maxMissingFeatureRate) {
    warnings.push(finding(
      "HIGH_MISSING_FEATURE_RATE",
      "warning",
      "Selected model features have a high missing-value rate.",
      { rate: Number(missingFeatureRate.toFixed(4)), threshold: profile.warnings.maxMissingFeatureRate },
    ));
  }

  if (split && split.testCases < profile.warnings.minTestCases) {
    warnings.push(finding(
      "SMALL_TEST_CYCLE",
      "warning",
      "The held-out cycle has few completed employee cases.",
      { cases: split.testCases, threshold: profile.warnings.minTestCases },
    ));
  }

  const patterns = completedRows.map((row) => row.generation_pattern).filter(Boolean);
  if (patterns.length) {
    const counts = new Map();
    for (const pattern of patterns) counts.set(pattern, (counts.get(pattern) || 0) + 1);
    const largest = Math.max(...counts.values()) / patterns.length;
    if (largest > profile.warnings.maxPatternShare) {
      warnings.push(finding(
        "IMBALANCED_SYNTHETIC_PATTERNS",
        "warning",
        "One synthetic generation pattern dominates the completed history.",
        { share: Number(largest.toFixed(4)), threshold: profile.warnings.maxPatternShare },
      ));
    }
  }

  return { warnings, missingFeatureRate };
}

export function evaluatePredictionReadiness({
  snapshotId,
  rows,
  policy,
  expectedOrganizationId,
  expectedPolicyVersion = policy?.version,
  expectedFrameworkVersion,
  featureSelection = DEFAULT_FEATURE_SELECTION,
  readinessProfile,
}) {
  const profile = normalizeReadinessProfile(readinessProfile);
  const features = validateFeatureSelection(featureSelection, policy);
  const validation = validatePredictionDataset({
    rows,
    policy,
    expectedOrganizationId,
    expectedPolicyVersion,
    expectedFrameworkVersion,
  });
  const validationBlocks = [...validation.blocks];
  if (Array.isArray(rows) && rows.length === 0) {
    validationBlocks.push(finding(
      "DATASET_EMPTY",
      "block",
      "The frozen dataset snapshot contains no rows.",
      { count: 1, recordIds: [] },
    ));
  }

  const validRows = validation.validRows;
  const completedRows = validRows.filter((row) => row.cycle_status === "completed");
  const activeRows = validRows.filter((row) => row.cycle_status === "active");
  const completedCases = new Set(completedRows.map(completedCaseKey));
  const completedCycles = [...new Set(completedRows.map((row) => row.cycle_id))];
  const split = buildTimeBasedSplit(completedRows);
  const quality = qualityWarnings({ completedRows, activeRows, featureSelection: features.selected, policy, split, profile });
  const blocks = uniqueFindings([...validationBlocks, ...features.findings.filter((entry) => entry.severity === "block")]);
  const warnings = uniqueFindings([...validation.warnings, ...features.findings.filter((entry) => entry.severity === "warning"), ...quality.warnings]);

  let scenario = null;
  let status = "blocked";
  let ruleBasedEligible = false;
  let modelTrainingEligible = false;

  if (!blocks.length && completedRows.length === 0) {
    scenario = "A";
    status = "ready-rule-based";
    ruleBasedEligible = activeRows.length > 0;
    warnings.push(finding(
      "NO_COMPLETED_HISTORY",
      "warning",
      "No completed labelled history is available; use only the transparent rule-based estimate.",
    ));
  } else if (!blocks.length) {
    scenario = completedCases.size >= profile.sufficientHistory.minCompletedCases
      && completedCycles.length >= profile.sufficientHistory.minCompletedCycles
      ? "C"
      : "B";
    ruleBasedEligible = activeRows.length > 0;

    if (!split) {
      blocks.push(finding(
        "NO_VALID_TIME_SPLIT",
        "block",
        "At least two ordered completed cycles are required for a time-based holdout.",
      ));
      status = "fallback-only";
    } else if (
      completedCases.size < profile.limitedHistory.minCompletedCases
      || completedCycles.length < profile.limitedHistory.minCompletedCycles
    ) {
      warnings.push(finding(
        "BELOW_LIMITED_TRAINING_THRESHOLD",
        "warning",
        "Completed history is below the configured demonstration threshold for model training.",
        {
          cases: completedCases.size,
          cycles: completedCycles.length,
          requiredCases: profile.limitedHistory.minCompletedCases,
          requiredCycles: profile.limitedHistory.minCompletedCycles,
        },
      ));
      status = "fallback-only";
    } else {
      modelTrainingEligible = true;
      status = "ready-for-training";
      if (scenario === "B") {
        warnings.push(finding(
          "LIMITED_HISTORY_LOW_CONFIDENCE",
          "warning",
          "The dataset meets the limited-history demonstration profile; any model remains low confidence and must beat transparent baselines.",
        ));
      }
    }
  }

  if (validationBlocks.length || features.findings.some((entry) => entry.severity === "block")) {
    scenario = null;
    status = "blocked";
    ruleBasedEligible = false;
    modelTrainingEligible = false;
  }

  return {
    snapshotId: snapshotId || null,
    status,
    scenario,
    scenarioLabel: scenario === "A"
      ? "No historical data"
      : scenario === "B"
        ? "Limited historical data"
        : scenario === "C"
          ? "Sufficient historical data"
          : "Blocked",
    methodLabel: scenario === "A" ? "Rule-based estimate" : scenario === "B" ? "Low confidence" : scenario === "C" ? "Evaluation required" : "Unavailable",
    profile: {
      ...profile,
      productionThreshold: false,
    },
    counts: {
      totalRows: Array.isArray(rows) ? rows.length : 0,
      validRows: validRows.length,
      rejectedRows: validation.rejectedRows.length,
      activeRows: activeRows.length,
      completedRows: completedRows.length,
      completedCases: completedCases.size,
      completedCycles: completedCycles.length,
      roles: new Set(validRows.map((row) => row.role_code)).size,
    },
    split,
    eligibility: {
      ruleBasedEstimate: ruleBasedEligible,
      modelTraining: modelTrainingEligible,
    },
    featureContract: {
      selected: features.selected,
      target: features.contract.target,
      allowed: features.contract.allowed,
      excluded: features.contract.excluded,
      preprocessingFitScope: "train-only",
      activeRowsExcludedFromTraining: true,
    },
    quality: {
      missingFeatureRate: Number(quality.missingFeatureRate.toFixed(4)),
    },
    blocks: uniqueFindings(blocks),
    warnings: uniqueFindings(warnings),
    rejectedRows: validation.rejectedRows,
  };
}
