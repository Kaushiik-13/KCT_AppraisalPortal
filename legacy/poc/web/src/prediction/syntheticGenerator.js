import { createHash } from "node:crypto";
import { rowsToCsv as serializeRowsToCsv } from "./csv.js";

const PATTERN_CURVES = {
  steady: [0.24, 0.5, 0.76, 1],
  early_fast: [0.44, 0.7, 0.89, 1],
  late_improvement: [0.08, 0.24, 0.56, 1],
  stalled: [0.42, 0.7, 0.88, 1],
  irregular: [0.18, 0.54, 0.63, 1],
  high_consistent: [0.28, 0.55, 0.81, 1],
  low_consistent: [0.23, 0.48, 0.74, 1],
  evidence_delayed: [0.05, 0.21, 0.61, 1],
};

const PATTERN_ABILITY_ADJUSTMENT = {
  steady: 0,
  early_fast: 0.04,
  late_improvement: 0.01,
  stalled: -0.14,
  irregular: -0.03,
  high_consistent: 0.16,
  low_consistent: -0.2,
  evidence_delayed: 0.02,
};

const ROLE_KRA_ADJUSTMENT = {
  assistant_professor: { teaching_learning: 0.05, research_development: -0.02 },
  associate_professor: { teaching_learning: 0.03, research_development: 0.02 },
  professor: { teaching_learning: -0.02, research_development: 0.06 },
  professor_hod: { teaching_learning: -0.04, research_development: 0.04, operations: 0.08 },
};

export const SYNTHETIC_COLUMNS = [
  "record_id",
  "organization_id",
  "policy_version",
  "framework_version",
  "generator_version",
  "generation_seed",
  "source_dataset",
  "employee_key",
  "role_code",
  "cycle_id",
  "cycle_status",
  "cycle_start_date",
  "cycle_end_date",
  "checkpoint_index",
  "checkpoint_date",
  "elapsed_fraction",
  "remaining_days",
  "current_overall_score",
  "previous_overall_score",
  "score_change",
  "verified_evidence_count",
  "mandatory_status",
  "mandatory_route",
  "kra_teaching_learning_score",
  "kra_teaching_learning_cap",
  "kra_research_development_score",
  "kra_research_development_cap",
  "kra_external_interface_score",
  "kra_external_interface_cap",
  "kra_operations_score",
  "kra_operations_cap",
  "kra_student_development_score",
  "kra_student_development_cap",
  "kra_extra_cocurricular_score",
  "kra_extra_cocurricular_cap",
  "kra_optional_contributions_score",
  "kra_optional_contributions_cap",
  "missing_feature_count",
  "target_available_date",
  "final_approved_score",
  "generation_pattern",
  "is_synthetic",
  "fixture_case_id",
  "injected_defect"
];

export function rowsToCsv(rows, columns = SYNTHETIC_COLUMNS) {
  return serializeRowsToCsv(rows, columns);
}

const round = (value, digits = 2) => Number(value.toFixed(digits));
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const isoDate = (date) => date.toISOString().slice(0, 10);

function addDays(date, days) {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return isoDate(result);
}

function daysBetween(start, end) {
  return Math.max(0, Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000));
}

export function seededRandom(seed) {
  let state = Number(seed) >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(random) {
  const first = Math.max(random(), Number.EPSILON);
  const second = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

function chooseWeighted(random, entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let point = random() * total;
  for (const entry of entries) {
    point -= entry.weight;
    if (point <= 0) return entry.id;
  }
  return entries.at(-1).id;
}

function academicCycle(startYear, fractions) {
  const endYear = startYear + 1;
  const start = `${startYear}-07-01`;
  const end = `${endYear}-06-30`;
  const totalDays = daysBetween(start, end);
  return {
    id: `${startYear}-${String(endYear).slice(-2)}`,
    start,
    end,
    checkpoints: fractions.map((fraction, index) => ({
      index: index + 1,
      fraction,
      date: fraction === 1 ? end : addDays(start, Math.round(totalDays * fraction)),
    })),
  };
}

function interpolateCurve(curve, fraction) {
  const anchors = [0, 0.25, 0.5, 0.75, 1];
  const values = [0, ...curve];
  for (let index = 1; index < anchors.length; index += 1) {
    if (fraction <= anchors[index]) {
      const span = anchors[index] - anchors[index - 1];
      const position = (fraction - anchors[index - 1]) / span;
      return values[index - 1] + (values[index] - values[index - 1]) * position;
    }
  }
  return 1;
}

export function validateSyntheticPolicy(policy) {
  const issues = [];
  if (!policy || !Number.isFinite(policy.overallScoreCap) || policy.overallScoreCap <= 0)
    issues.push("Policy needs a positive overallScoreCap.");
  if (!Array.isArray(policy?.kras) || policy.kras.length === 0)
    issues.push("Policy needs at least one KRA.");
  if (!Array.isArray(policy?.roles) || policy.roles.length === 0)
    issues.push("Policy needs at least one role.");
  const kraIds = new Set((policy?.kras || []).map((kra) => kra.id));
  if (kraIds.size !== (policy?.kras || []).length)
    issues.push("KRA IDs must be unique.");
  for (const role of policy?.roles || []) {
    if (!role.code || !role.name) issues.push("Every role needs a code and name.");
    for (const kraId of kraIds) {
      if (!Number.isFinite(role.kraCaps?.[kraId]) || role.kraCaps[kraId] < 0)
        issues.push(`${role.code} needs a non-negative cap for ${kraId}.`);
    }
  }
  return [...new Set(issues)];
}

function finalKraScores(random, policy, role, pattern) {
  const baseAbility = clamp(0.64 + normal(random) * 0.13 + PATTERN_ABILITY_ADJUSTMENT[pattern], 0.18, 0.97);
  return Object.fromEntries(policy.kras.map((kra) => {
    const roleAdjustment = ROLE_KRA_ADJUSTMENT[role.code]?.[kra.id] || 0;
    const ability = clamp(baseAbility + roleAdjustment + normal(random) * 0.09, 0.08, 0.99);
    return [kra.id, round(role.kraCaps[kra.id] * ability)];
  }));
}

function mandatoryOutcome(random, pattern) {
  const highChance = ["high_consistent", "early_fast"].includes(pattern) ? 0.9 : ["stalled", "low_consistent"].includes(pattern) ? 0.55 : 0.76;
  const met = random() < highChance;
  return {
    metAt: met ? 1 + Math.floor(random() * 4) : null,
    route: random() < 0.52 ? "research_publication" : "faculty_development",
  };
}

function roleForEmployee(policy, employeeIndex) {
  return policy.roles[employeeIndex % policy.roles.length];
}

function employeeKey(index) {
  return `SYN-KCT-${String(index + 1).padStart(4, "0")}`;
}

function makeCase({ random, organization, policy, defaults, employeeIndex, cycle, sourceDataset, activeFraction = null }) {
  const role = roleForEmployee(policy, employeeIndex);
  const pattern = chooseWeighted(random, defaults.patterns);
  const finalScores = finalKraScores(random, policy, role, pattern);
  const finalTotal = round(Math.min(policy.overallScoreCap, Object.values(finalScores).reduce((sum, value) => sum + value, 0)));
  const mandatory = mandatoryOutcome(random, pattern);
  const curve = PATTERN_CURVES[pattern];
  const checkpoints = activeFraction === null
    ? cycle.checkpoints
    : [{ index: Math.max(1, Math.ceil(activeFraction * defaults.checkpointFractions.length)), fraction: activeFraction, date: addDays(cycle.start, Math.round(daysBetween(cycle.start, cycle.end) * activeFraction)) }];
  const previousByKra = Object.fromEntries(policy.kras.map((kra) => [kra.id, 0]));
  let previousOverall = null;
  return checkpoints.map((checkpoint) => {
    const progress = interpolateCurve(curve, checkpoint.fraction);
    const currentScores = {};
    for (const kra of policy.kras) {
      const finalScore = finalScores[kra.id];
      const noise = checkpoint.fraction === 1 ? 0 : normal(random) * Math.max(0.15, finalScore * 0.018);
      const score = checkpoint.fraction === 1
        ? finalScore
        : clamp(round(finalScore * progress + noise), previousByKra[kra.id], finalScore);
      previousByKra[kra.id] = score;
      currentScores[kra.id] = score;
    }
    const currentOverall = round(Math.min(policy.overallScoreCap, Object.values(currentScores).reduce((sum, value) => sum + value, 0)));
    const scoreChange = previousOverall === null ? currentOverall : round(currentOverall - previousOverall);
    const mandatoryStatus = mandatory.metAt !== null && checkpoint.index >= mandatory.metAt
      ? "met"
      : checkpoint.fraction >= 1
        ? "not_met"
        : "pending";
    const completed = activeFraction === null;
    const record = {
      record_id: `${sourceDataset}-${cycle.id}-${employeeKey(employeeIndex)}-cp${checkpoint.index}`,
      organization_id: organization.id,
      policy_version: policy.version,
      framework_version: defaults.frameworkVersion,
      generator_version: defaults.generatorVersion,
      generation_seed: defaults.seed,
      source_dataset: sourceDataset,
      employee_key: employeeKey(employeeIndex),
      role_code: role.code,
      cycle_id: cycle.id,
      cycle_status: completed ? "completed" : "active",
      cycle_start_date: cycle.start,
      cycle_end_date: cycle.end,
      checkpoint_index: checkpoint.index,
      checkpoint_date: checkpoint.date,
      elapsed_fraction: round(checkpoint.fraction, 4),
      remaining_days: daysBetween(checkpoint.date, cycle.end),
      current_overall_score: currentOverall,
      previous_overall_score: previousOverall,
      score_change: scoreChange,
      verified_evidence_count: Math.max(0, Math.round(currentOverall / 4 + random() * 4)),
      mandatory_status: mandatoryStatus,
      mandatory_route: mandatory.route,
      missing_feature_count: 0,
      target_available_date: completed ? addDays(cycle.end, 30) : null,
      final_approved_score: completed ? finalTotal : null,
      generation_pattern: pattern,
      is_synthetic: true,
      fixture_case_id: "",
      injected_defect: "",
    };
    for (const kra of policy.kras) {
      record[`kra_${kra.id}_score`] = currentScores[kra.id];
      record[`kra_${kra.id}_cap`] = role.kraCaps[kra.id];
    }
    previousOverall = currentOverall;
    return record;
  });
}

function completedRows({ random, organization, policy, defaults, employeeCount, cycleStartYears, sourceDataset }) {
  const rows = [];
  for (const startYear of cycleStartYears) {
    const cycle = academicCycle(startYear, defaults.checkpointFractions);
    for (let employeeIndex = 0; employeeIndex < employeeCount; employeeIndex += 1)
      rows.push(...makeCase({ random, organization, policy, defaults, employeeIndex, cycle, sourceDataset }));
  }
  return rows;
}

function activeRows({ random, organization, policy, defaults }) {
  const cycle = academicCycle(defaults.activeCycleStartYear, defaults.checkpointFractions);
  const rows = [];
  for (let employeeIndex = 0; employeeIndex < defaults.activeEmployeeCount; employeeIndex += 1)
    rows.push(...makeCase({ random, organization, policy, defaults, employeeIndex, cycle, sourceDataset: "no-history-current", activeFraction: defaults.activeElapsedFraction }));
  return rows;
}

function invalidRows(limitedRows, currentRows) {
  const rows = [];
  const add = (source, id, defect, mutate = () => {}) => {
    const row = structuredClone(source);
    row.record_id = `invalid-${id}`;
    row.source_dataset = "invalid-history";
    row.fixture_case_id = id;
    row.injected_defect = defect;
    mutate(row);
    rows.push(row);
  };
  add(limitedRows[0], "missing-target", "missing_target", (row) => { row.final_approved_score = null; });
  add(limitedRows[1], "missing-current-score", "missing_current_score", (row) => { row.current_overall_score = null; row.missing_feature_count = 1; });
  add(limitedRows[2], "duplicate-a", "duplicate_canonical_key");
  add(limitedRows[2], "duplicate-b", "duplicate_canonical_key");
  add(limitedRows[3], "score-above-cap", "score_above_overall_cap", (row) => { row.current_overall_score = 250; });
  add(limitedRows[4], "date-outside-cycle", "checkpoint_outside_cycle", (row) => { row.checkpoint_date = "2010-01-01"; });
  add(limitedRows[5], "unknown-role", "unknown_role", (row) => { row.role_code = "unknown_role"; });
  add(limitedRows[6], "policy-mismatch", "incompatible_policy", (row) => { row.policy_version = "pads-obsolete-version"; });
  add(currentRows[0], "active-with-target", "target_before_cycle_close", (row) => { row.final_approved_score = 120; row.target_available_date = row.checkpoint_date; });
  const sequence = limitedRows.filter((row) => row.employee_key === limitedRows[8].employee_key && row.cycle_id === limitedRows[8].cycle_id).slice(0, 2);
  add(sequence[0], "decreasing-a", "decreasing_cumulative_sequence");
  add(sequence[1], "decreasing-b", "decreasing_cumulative_sequence", (row) => { row.current_overall_score = Math.max(0, sequence[0].current_overall_score - 5); });
  add(limitedRows[10], "not-synthetic", "synthetic_flag_false", (row) => { row.is_synthetic = false; });
  return rows;
}

export function generateSyntheticDatasets({ organization, policy, defaults }) {
  const policyIssues = validateSyntheticPolicy(policy);
  if (policyIssues.length) throw new Error(policyIssues.join(" "));
  const random = seededRandom(defaults.seed);
  const current = activeRows({ random, organization, policy, defaults });
  const limited = completedRows({
    random,
    organization,
    policy,
    defaults,
    employeeCount: defaults.limitedHistory.employees,
    cycleStartYears: defaults.limitedHistory.cycleStartYears,
    sourceDataset: "limited-history",
  });
  const sufficient = completedRows({
    random,
    organization,
    policy,
    defaults,
    employeeCount: defaults.sufficientHistory.employees,
    cycleStartYears: defaults.sufficientHistory.cycleStartYears,
    sourceDataset: "sufficient-history",
  });
  return {
    current,
    limited,
    sufficient,
    invalid: invalidRows(limited, current),
  };
}

export function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

export function datasetSummary(rows, policy) {
  const completedCases = new Set(rows.filter((row) => row.cycle_status === "completed").map((row) => `${row.employee_key}|${row.cycle_id}`));
  const roles = Object.fromEntries(policy.roles.map((role) => [role.code, rows.filter((row) => row.role_code === role.code).length]));
  const patterns = Object.fromEntries(Object.keys(PATTERN_CURVES).map((pattern) => [pattern, rows.filter((row) => row.generation_pattern === pattern).length]));
  return {
    rows: rows.length,
    employees: new Set(rows.map((row) => row.employee_key)).size,
    cycles: [...new Set(rows.map((row) => row.cycle_id))],
    completedCases: completedCases.size,
    roles,
    patterns,
  };
}
