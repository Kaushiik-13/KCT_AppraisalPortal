import {
  datasetSummary,
  generateSyntheticDatasets,
  rowsToCsv,
  sha256,
  SYNTHETIC_COLUMNS,
} from "../../src/prediction/syntheticGenerator.js";
import { DEFAULT_FEATURE_SELECTION } from "../../src/prediction/datasetSchema.js";
import organization from "../../fixtures/prediction/kct/config/organization.json" with { type: "json" };
import policy from "../../fixtures/prediction/kct/config/pads-policy-v1.json" with { type: "json" };
import committedDefaults from "../../fixtures/prediction/kct/config/generation-defaults.json" with { type: "json" };
const MAX_BODY_BYTES = 100_000;
const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

function validOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    const originUrl = new URL(origin);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const requestHost = forwardedHost || request.headers.get("host") || new URL(request.url).host;
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const requestProtocol = forwardedProtocol || new URL(request.url).protocol.replace(":", "");
    return originUrl.host === requestHost && originUrl.protocol === `${requestProtocol}:`;
  } catch {
    return false;
  }
}

const integer = (value, minimum, maximum) => Number.isInteger(value) && value >= minimum && value <= maximum;

function cycleYears(activeYear, count) {
  return Array.from({ length: count }, (_, index) => activeYear - count + index);
}

function checkpointFractions(count) {
  return Array.from({ length: count }, (_, index) => Number(((index + 1) / count).toFixed(4)));
}

function scoreRange(rows, field) {
  const values = rows.map((row) => row[field]).filter(Number.isFinite);
  return values.length ? { minimum: Math.min(...values), maximum: Math.max(...values) } : null;
}

function dataProfile(rows) {
  const keys = new Set();
  let duplicateRows = 0;
  let missingValueRows = 0;
  for (const row of rows) {
    const key = `${row.employee_key}|${row.cycle_id}|${row.checkpoint_index}`;
    if (keys.has(key)) duplicateRows += 1;
    keys.add(key);
    if (!Number.isFinite(row.current_overall_score) || (row.cycle_status === "completed" && !Number.isFinite(row.final_approved_score))) {
      missingValueRows += 1;
    }
  }
  return {
    checkpointIndices: [...new Set(rows.map((row) => row.checkpoint_index))].sort((left, right) => left - right),
    currentScoreRange: scoreRange(rows, "current_overall_score"),
    targetScoreRange: scoreRange(rows, "final_approved_score"),
    missingValueRows,
    duplicateRows,
  };
}

export function resolveGenerationConfiguration(input = {}) {
  const errors = [];
  const seed = Number(input.seed ?? committedDefaults.seed);
  const activeCycleStartYear = Number(input.activeCycleStartYear ?? committedDefaults.activeCycleStartYear);
  const activeEmployeeCount = Number(input.activeEmployeeCount ?? committedDefaults.activeEmployeeCount);
  const activeElapsedFraction = Number(input.activeElapsedFraction ?? committedDefaults.activeElapsedFraction);
  const limitedEmployees = Number(input.limitedEmployees ?? committedDefaults.limitedHistory.employees);
  const limitedCycleCount = Number(input.limitedCycleCount ?? committedDefaults.limitedHistory.cycleStartYears.length);
  const sufficientEmployees = Number(input.sufficientEmployees ?? committedDefaults.sufficientHistory.employees);
  const sufficientCycleCount = Number(input.sufficientCycleCount ?? committedDefaults.sufficientHistory.cycleStartYears.length);
  const checkpointCount = Number(input.checkpointCount ?? committedDefaults.checkpointFractions.length);

  if (!integer(seed, 1, 4_294_967_295)) errors.push("Seed must be a whole number between 1 and 4294967295.");
  if (!integer(activeCycleStartYear, 2020, 2100)) errors.push("Active cycle start year must be between 2020 and 2100.");
  if (!integer(activeEmployeeCount, 1, 200)) errors.push("Active employee count must be between 1 and 200.");
  if (!Number.isFinite(activeElapsedFraction) || activeElapsedFraction <= 0 || activeElapsedFraction >= 1)
    errors.push("Current cycle progress must be greater than 0 and less than 100%.");
  if (!integer(limitedEmployees, 1, 200)) errors.push("Limited-history employee count must be between 1 and 200.");
  if (!integer(limitedCycleCount, 2, 5)) errors.push("Limited history must contain 2 to 5 completed cycles.");
  if (!integer(sufficientEmployees, 1, 500)) errors.push("Sufficient-history employee count must be between 1 and 500.");
  if (!integer(sufficientCycleCount, 2, 8)) errors.push("Sufficient history must contain 2 to 8 completed cycles.");
  if (!integer(checkpointCount, 2, 6)) errors.push("Checkpoint count must be between 2 and 6.");
  if (sufficientCycleCount < limitedCycleCount)
    errors.push("Sufficient history cannot contain fewer cycles than limited history.");

  const requestedWeights = input.patternWeights && typeof input.patternWeights === "object" ? input.patternWeights : {};
  const patterns = committedDefaults.patterns.map((pattern) => {
    const weight = Number(requestedWeights[pattern.id] ?? pattern.weight);
    if (!Number.isFinite(weight) || weight < 0 || weight > 100)
      errors.push(`${pattern.id} pattern weight must be between 0 and 100.`);
    return { id: pattern.id, weight };
  });
  if (patterns.every((pattern) => pattern.weight === 0)) errors.push("At least one performance pattern needs a positive weight.");

  const defaults = {
    ...committedDefaults,
    seed,
    activeCycleStartYear,
    activeEmployeeCount,
    activeElapsedFraction,
    checkpointFractions: integer(checkpointCount, 2, 6) ? checkpointFractions(checkpointCount) : committedDefaults.checkpointFractions,
    limitedHistory: {
      employees: limitedEmployees,
      cycleStartYears: integer(activeCycleStartYear, 2020, 2100) && integer(limitedCycleCount, 2, 5)
        ? cycleYears(activeCycleStartYear, limitedCycleCount)
        : committedDefaults.limitedHistory.cycleStartYears,
    },
    sufficientHistory: {
      employees: sufficientEmployees,
      cycleStartYears: integer(activeCycleStartYear, 2020, 2100) && integer(sufficientCycleCount, 2, 8)
        ? cycleYears(activeCycleStartYear, sufficientCycleCount)
        : committedDefaults.sufficientHistory.cycleStartYears,
    },
    patterns,
  };

  return { errors: [...new Set(errors)], defaults, includeInvalidCases: input.includeInvalidCases !== false };
}

export function generatePredictionPreview(configuration = {}) {
  const resolved = resolveGenerationConfiguration(configuration);
  if (resolved.errors.length) return { errors: resolved.errors };
  const datasets = generateSyntheticDatasets({ organization, policy, defaults: resolved.defaults });
  if (!resolved.includeInvalidCases) datasets.invalid = [];
  const configurationText = JSON.stringify({
    organizationId: organization.id,
    policyVersion: policy.version,
    ...resolved.defaults,
    includeInvalidCases: resolved.includeInvalidCases,
  });
  const snapshotGroupId = `synthetic-${sha256(configurationText).slice(0, 12)}`;
  const entries = {
    current: { label: "No history", fileName: "no-history-current.csv", rows: datasets.current },
    limited: { label: "Limited history", fileName: "limited-history.csv", rows: datasets.limited },
    sufficient: { label: "Sufficient history", fileName: "sufficient-history.csv", rows: datasets.sufficient },
    invalid: { label: "Invalid history", fileName: "invalid-history.csv", rows: datasets.invalid },
  };
  const resultDatasets = Object.fromEntries(Object.entries(entries).map(([id, entry]) => {
    const csv = rowsToCsv(entry.rows);
    return [id, {
      id,
      label: entry.label,
      fileName: entry.fileName,
      snapshotId: `${snapshotGroupId}-${id}`,
      summary: datasetSummary(entry.rows, policy),
      profile: dataProfile(entry.rows),
      checksum: sha256(csv),
      rows: entry.rows,
    }];
  }));
  return {
    synthetic: true,
    snapshotGroupId,
    organization,
    policy,
    generatorVersion: resolved.defaults.generatorVersion,
    frameworkVersion: resolved.defaults.frameworkVersion,
    configuration: {
      seed: resolved.defaults.seed,
      activeCycleStartYear: resolved.defaults.activeCycleStartYear,
      activeEmployeeCount: resolved.defaults.activeEmployeeCount,
      activeElapsedFraction: resolved.defaults.activeElapsedFraction,
      limitedEmployees: resolved.defaults.limitedHistory.employees,
      limitedCycleCount: resolved.defaults.limitedHistory.cycleStartYears.length,
      sufficientEmployees: resolved.defaults.sufficientHistory.employees,
      sufficientCycleCount: resolved.defaults.sufficientHistory.cycleStartYears.length,
      checkpointCount: resolved.defaults.checkpointFractions.length,
      patternWeights: Object.fromEntries(resolved.defaults.patterns.map((pattern) => [pattern.id, pattern.weight])),
      includeInvalidCases: resolved.includeInvalidCases,
    },
    columns: SYNTHETIC_COLUMNS,
    defaultFeatureSelection: DEFAULT_FEATURE_SELECTION,
    datasets: resultDatasets,
  };
}

export async function predictionDatasetGeneration(request) {
  if (!validOrigin(request)) return json({ error: "Use the application to make this request." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "Use JSON." }, 415);
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return json({ error: "Generation configuration is too large." }, 413);
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return json({ error: "Generation configuration is too large." }, 413);
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid JSON." }, 400);
    }
    const result = generatePredictionPreview(data?.configuration || {});
    if (result.errors) return json({ error: "Check the generation settings.", issues: result.errors }, 400);
    return json(result);
  } catch {
    return json({ error: "Could not generate the synthetic dataset preview." }, 500);
  }
}
