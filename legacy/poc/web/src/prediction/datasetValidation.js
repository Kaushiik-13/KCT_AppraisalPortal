const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MANDATORY_STATUSES = new Set(["pending", "met", "not_met"]);

const finite = (value) => typeof value === "number" && Number.isFinite(value);
const blank = (value) => value === null || value === undefined || value === "";

function validIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function canonicalKey(row) {
  return `${row.organization_id}|${row.employee_key}|${row.cycle_id}|${row.checkpoint_index}`;
}

function aggregateRowFindings(rowFindings) {
  const aggregate = new Map();
  for (const finding of rowFindings.flatMap((entry) => entry.findings)) {
    const existing = aggregate.get(finding.code) || {
      code: finding.code,
      severity: finding.severity,
      message: finding.message,
      count: 0,
      recordIds: [],
    };
    existing.count += 1;
    if (finding.recordId && existing.recordIds.length < 10 && !existing.recordIds.includes(finding.recordId))
      existing.recordIds.push(finding.recordId);
    aggregate.set(finding.code, existing);
  }
  return [...aggregate.values()].sort((left, right) => left.code.localeCompare(right.code));
}

export function validatePredictionDataset({
  rows,
  policy,
  expectedOrganizationId,
  expectedPolicyVersion = policy?.version,
  expectedFrameworkVersion,
}) {
  if (!Array.isArray(rows)) {
    return {
      validRows: [],
      rejectedRows: [],
      rowFindings: [],
      blocks: [{
        code: "DATASET_ROWS_REQUIRED",
        severity: "block",
        message: "The frozen dataset snapshot must contain a rows array.",
        count: 1,
        recordIds: [],
      }],
      warnings: [],
    };
  }

  if (!policy || !finite(policy.overallScoreCap) || !Array.isArray(policy.roles) || !Array.isArray(policy.kras)) {
    return {
      validRows: [],
      rejectedRows: rows.map((row, index) => ({ index, recordId: row?.record_id || `row-${index + 1}` })),
      rowFindings: [],
      blocks: [{
        code: "POLICY_CONTRACT_INVALID",
        severity: "block",
        message: "A policy with an overall score cap, roles, and KRAs is required.",
        count: 1,
        recordIds: [],
      }],
      warnings: [],
    };
  }

  const roleByCode = new Map(policy.roles.map((role) => [role.code, role]));
  const rowFindings = rows.map((row, index) => ({
    index,
    recordId: row?.record_id || `row-${index + 1}`,
    findings: [],
  }));

  const add = (index, code, message, severity = "block") => {
    const finding = rowFindings[index];
    if (finding.findings.some((entry) => entry.code === code)) return;
    finding.findings.push({ code, severity, message, recordId: finding.recordId });
  };

  rows.forEach((row, index) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      add(index, "ROW_NOT_OBJECT", "Every dataset row must be an object.");
      return;
    }

    if (row.is_synthetic !== true)
      add(index, "RECORD_NOT_SYNTHETIC", "Prototype readiness accepts only explicitly synthetic records.");

    if (!row.organization_id || (expectedOrganizationId && row.organization_id !== expectedOrganizationId))
      add(index, "ORGANIZATION_MISMATCH", "The row organization does not match the frozen snapshot scope.");
    if (!row.policy_version || row.policy_version !== expectedPolicyVersion)
      add(index, "POLICY_VERSION_MISMATCH", "The row policy version is missing or incompatible.");
    if (!row.framework_version || (expectedFrameworkVersion && row.framework_version !== expectedFrameworkVersion))
      add(index, "FRAMEWORK_VERSION_MISMATCH", "The row framework version is missing or incompatible.");
    if (!row.employee_key || !row.cycle_id || !Number.isInteger(row.checkpoint_index) || row.checkpoint_index < 1)
      add(index, "CANONICAL_KEY_INVALID", "Organization, employee, cycle, and positive checkpoint index are required.");

    const role = roleByCode.get(row.role_code);
    if (!role) add(index, "UNKNOWN_ROLE", "The row role is not defined by the selected policy.");

    const datesValid = validIsoDate(row.cycle_start_date) && validIsoDate(row.cycle_end_date) && row.cycle_start_date <= row.cycle_end_date;
    if (!datesValid) add(index, "INVALID_CYCLE_DATES", "Cycle start and end must be valid ordered ISO dates.");
    if (!validIsoDate(row.checkpoint_date) || (datesValid && (row.checkpoint_date < row.cycle_start_date || row.checkpoint_date > row.cycle_end_date)))
      add(index, "CHECKPOINT_OUTSIDE_CYCLE", "Checkpoint date must be a valid ISO date within the cycle.");
    if (!finite(row.elapsed_fraction) || row.elapsed_fraction < 0 || row.elapsed_fraction > 1)
      add(index, "INVALID_ELAPSED_FRACTION", "Elapsed fraction must be between 0 and 1.");
    if (!Number.isInteger(row.remaining_days) || row.remaining_days < 0)
      add(index, "INVALID_REMAINING_DAYS", "Remaining days must be a non-negative integer.");

    if (!finite(row.current_overall_score))
      add(index, "MISSING_CURRENT_SCORE", "A numeric current verified score is required.");
    else if (row.current_overall_score < 0 || row.current_overall_score > policy.overallScoreCap)
      add(index, "SCORE_OUT_OF_RANGE", `Current score must be between 0 and ${policy.overallScoreCap}.`);

    if (!finite(row.score_change)) add(index, "INVALID_SCORE_CHANGE", "Score change must be numeric.");
    if (!Number.isInteger(row.verified_evidence_count) || row.verified_evidence_count < 0)
      add(index, "INVALID_EVIDENCE_COUNT", "Verified evidence count must be a non-negative integer.");
    if (!Number.isInteger(row.missing_feature_count) || row.missing_feature_count < 0)
      add(index, "INVALID_MISSING_COUNT", "Missing feature count must be a non-negative integer.");
    if (!MANDATORY_STATUSES.has(row.mandatory_status))
      add(index, "INVALID_MANDATORY_STATUS", "Mandatory status must be pending, met, or not_met.");

    if (row.cycle_status === "completed") {
      if (!finite(row.final_approved_score))
        add(index, "MISSING_TARGET", "Completed-cycle rows require a numeric final approved score.");
      else {
        if (row.final_approved_score < 0 || row.final_approved_score > policy.overallScoreCap)
          add(index, "TARGET_OUT_OF_RANGE", `Final approved score must be between 0 and ${policy.overallScoreCap}.`);
        if (finite(row.current_overall_score) && row.current_overall_score > row.final_approved_score)
          add(index, "CURRENT_EXCEEDS_TARGET", "A checkpoint score cannot exceed the completed-cycle target.");
      }
      if (!validIsoDate(row.target_available_date))
        add(index, "TARGET_AVAILABLE_DATE_MISSING", "Completed-cycle targets require a valid availability date.");
      else if (datesValid && row.target_available_date < row.cycle_end_date)
        add(index, "TARGET_BEFORE_CYCLE_CLOSE", "A target cannot be available before the cycle closes.");
    } else if (row.cycle_status === "active") {
      if (!blank(row.final_approved_score) || !blank(row.target_available_date))
        add(index, "ACTIVE_TARGET_PRESENT", "Active-cycle rows must not contain a final target or target availability date.");
    } else {
      add(index, "INVALID_CYCLE_STATUS", "Cycle status must be active or completed.");
    }

    if (role) {
      for (const kra of policy.kras) {
        const score = row[`kra_${kra.id}_score`];
        const cap = row[`kra_${kra.id}_cap`];
        const expectedCap = role.kraCaps?.[kra.id];
        if (!finite(cap) || cap !== expectedCap)
          add(index, "KRA_CAP_MISMATCH", "KRA caps must match the selected role and policy.");
        if (!finite(score) || score < 0 || score > expectedCap)
          add(index, "KRA_SCORE_OUT_OF_RANGE", "Every KRA score must be numeric and within its role-specific cap.");
      }
    }
  });

  const duplicateGroups = new Map();
  rows.forEach((row, index) => {
    if (!row || typeof row !== "object") return;
    const key = canonicalKey(row);
    const indices = duplicateGroups.get(key) || [];
    indices.push(index);
    duplicateGroups.set(key, indices);
  });
  for (const indices of duplicateGroups.values()) {
    if (indices.length > 1) {
      for (const index of indices)
        add(index, "DUPLICATE_CANONICAL_KEY", "Employee-cycle-checkpoint keys must be unique.");
    }
  }

  const sequences = new Map();
  rows.forEach((row, index) => {
    if (!row || typeof row !== "object" || !row.employee_key || !row.cycle_id || !finite(row.current_overall_score)) return;
    const key = `${row.organization_id}|${row.employee_key}|${row.cycle_id}`;
    const sequence = sequences.get(key) || [];
    sequence.push({ row, index });
    sequences.set(key, sequence);
  });
  for (const sequence of sequences.values()) {
    sequence.sort((left, right) => left.row.checkpoint_index - right.row.checkpoint_index || String(left.row.checkpoint_date).localeCompare(String(right.row.checkpoint_date)));
    for (let position = 1; position < sequence.length; position += 1) {
      const previous = sequence[position - 1];
      const current = sequence[position];
      if (current.row.current_overall_score < previous.row.current_overall_score)
        add(current.index, "DECREASING_CUMULATIVE_SCORE", "Cumulative verified score cannot decrease without an explicit correction contract.");
      if (finite(current.row.previous_overall_score) && Math.abs(current.row.previous_overall_score - previous.row.current_overall_score) > 0.01)
        add(current.index, "PREVIOUS_SCORE_MISMATCH", "Previous checkpoint score must match the prior captured checkpoint.");
    }
  }

  const blocks = aggregateRowFindings(rowFindings).filter((finding) => finding.severity === "block");
  const warnings = aggregateRowFindings(rowFindings).filter((finding) => finding.severity === "warning");
  const rejectedIndices = new Set(rowFindings.filter((entry) => entry.findings.some((finding) => finding.severity === "block")).map((entry) => entry.index));
  return {
    validRows: rows.filter((_, index) => !rejectedIndices.has(index)),
    rejectedRows: rowFindings.filter((entry) => rejectedIndices.has(entry.index)).map(({ index, recordId, findings }) => ({
      index,
      recordId,
      codes: findings.filter((finding) => finding.severity === "block").map((finding) => finding.code),
    })),
    rowFindings: rowFindings.filter((entry) => entry.findings.length),
    blocks,
    warnings,
  };
}
