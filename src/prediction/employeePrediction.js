const round = (value, digits = 2) => Number(Number(value).toFixed(digits));

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(start, end) {
  return Math.max(0, Math.round((new Date(`${end}T00:00:00.000Z`) - new Date(`${start}T00:00:00.000Z`)) / 86_400_000));
}

export function buildKraProgress(row, policy) {
  return policy.kras.map((kra) => {
    const score = Number(row[`kra_${kra.id}_score`]);
    const cap = Number(row[`kra_${kra.id}_cap`]);
    return {
      id: kra.id,
      name: kra.name,
      score,
      cap,
      percent: cap > 0 ? round(Math.min(100, Math.max(0, (score / cap) * 100)), 1) : 0,
    };
  });
}

export function advanceSyntheticCheckpoint(row, policy, { elapsedStep = 0.08, scoreGain = 8 } = {}) {
  if (!row || row.cycle_status !== "active" || !policy?.kras?.length) throw new Error("An active synthetic checkpoint and policy are required.");
  const role = policy.roles.find((entry) => entry.code === row.role_code);
  if (!role) throw new Error("The checkpoint role is not available in the policy.");

  const fields = policy.kras.map((kra) => ({
    name: `kra_${kra.id}_score`,
    score: Number(row[`kra_${kra.id}_score`]),
    cap: Number(role.kraCaps[kra.id]),
  }));
  const currentScore = Number(row.current_overall_score);
  const availableByKra = fields.reduce((total, field) => total + Math.max(0, field.cap - field.score), 0);
  const targetGain = Math.max(0, Math.min(scoreGain, policy.overallScoreCap - currentScore, availableByKra));
  const next = { ...row };
  let remainingGain = targetGain;
  let remainingHeadroom = availableByKra;
  fields.forEach((field, index) => {
    const headroom = Math.max(0, field.cap - field.score);
    const isLast = index === fields.length - 1;
    const proportional = remainingHeadroom > 0 ? remainingGain * (headroom / remainingHeadroom) : 0;
    const delta = Math.min(headroom, remainingGain, isLast ? remainingGain : round(proportional));
    next[field.name] = round(field.score + delta);
    remainingGain = round(remainingGain - delta);
    remainingHeadroom = round(remainingHeadroom - headroom);
  });

  const nextScore = round(fields.reduce((total, field) => total + Number(next[field.name]), 0));
  const nextElapsed = round(Math.min(0.99, Number(row.elapsed_fraction) + elapsedStep));
  const cycleDays = Math.max(1, daysBetween(row.cycle_start_date, row.cycle_end_date));
  const checkpointAdvanceDays = Math.max(1, Math.round(cycleDays * (nextElapsed - Number(row.elapsed_fraction))));
  const nextCheckpointDate = addDays(row.checkpoint_date, Math.min(checkpointAdvanceDays, Number(row.remaining_days)));

  return {
    ...next,
    record_id: `${row.record_id}-verified-refresh`,
    source_dataset: `${row.source_dataset}-verified-refresh`,
    checkpoint_index: Number(row.checkpoint_index) + 1,
    checkpoint_date: nextCheckpointDate > row.cycle_end_date ? row.cycle_end_date : nextCheckpointDate,
    elapsed_fraction: nextElapsed,
    remaining_days: daysBetween(nextCheckpointDate > row.cycle_end_date ? row.cycle_end_date : nextCheckpointDate, row.cycle_end_date),
    previous_overall_score: currentScore,
    current_overall_score: nextScore,
    score_change: round(nextScore - currentScore),
    verified_evidence_count: Number(row.verified_evidence_count) + 2,
    final_approved_score: null,
    target_available_date: null,
  };
}

export function predictionIsFresh(result, row, policyVersion) {
  return Boolean(
    result
    && row
    && result.employeeKey === row.employee_key
    && Number(result.currentVerifiedScore) === Number(row.current_overall_score)
    && result.versions?.policy === policyVersion,
  );
}
