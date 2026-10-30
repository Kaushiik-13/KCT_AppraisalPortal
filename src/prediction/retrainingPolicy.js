export const DEFAULT_RETRAINING_SETTINGS = Object.freeze({
  manualEnabled: true,
  cycleCloseEnabled: true,
  periodicEnabled: false,
  periodicDays: 30,
  minimumNewCompletedCases: 100,
  minimumCompletedCycles: 1,
  keepPublishedModelActive: true,
  approvalRequired: true,
});

const positiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

export function validateRetrainingSettings(settings) {
  const errors = [];
  if (!settings.manualEnabled && !settings.cycleCloseEnabled && !settings.periodicEnabled) errors.push("Enable at least one readiness-check trigger.");
  if (!positiveInteger(settings.minimumNewCompletedCases)) errors.push("Minimum new completed cases must be a positive integer.");
  if (!positiveInteger(settings.minimumCompletedCycles)) errors.push("Minimum completed-cycle coverage must be a positive integer.");
  if (settings.periodicEnabled && (!positiveInteger(settings.periodicDays) || Number(settings.periodicDays) > 365)) errors.push("Periodic readiness interval must be between 1 and 365 days.");
  if (!settings.keepPublishedModelActive) errors.push("The prototype must keep the current published model active while a candidate is prepared.");
  if (!settings.approvalRequired) errors.push("Administrator approval must remain required before publication.");
  return errors;
}

export function evaluateRetrainingStatus({
  settings,
  publishedAt,
  now,
  cycleClosed,
  finalScoresApproved,
  newCompletedCases,
  completedCycleCoverage,
  manualRequested,
}) {
  const errors = validateRetrainingSettings(settings);
  const publishedTime = new Date(publishedAt).getTime();
  const currentTime = new Date(now).getTime();
  const nextPeriodicCheck = settings.periodicEnabled && Number.isFinite(publishedTime)
    ? new Date(publishedTime + Number(settings.periodicDays) * 86_400_000).toISOString()
    : null;
  const periodicDue = Boolean(nextPeriodicCheck && Number.isFinite(currentTime) && currentTime >= new Date(nextPeriodicCheck).getTime());
  const labelsAvailable = Boolean(cycleClosed && finalScoresApproved);
  const usableNewCases = labelsAvailable ? Math.max(0, Number(newCompletedCases) || 0) : 0;
  const usableCycleCoverage = labelsAvailable ? Math.max(0, Number(completedCycleCoverage) || 0) : 0;
  const missingCases = Math.max(0, Number(settings.minimumNewCompletedCases) - usableNewCases);
  const missingCycles = Math.max(0, Number(settings.minimumCompletedCycles) - usableCycleCoverage);
  const dataEligible = labelsAvailable && missingCases === 0 && missingCycles === 0;
  const triggerReady = Boolean(
    (settings.manualEnabled && manualRequested)
    || (settings.cycleCloseEnabled && cycleClosed)
    || periodicDue,
  );
  const candidateTrainingEligible = errors.length === 0 && dataEligible && triggerReady;

  let status = "waiting-for-cycle-close";
  let nextAction = "Keep active-cycle checkpoints for inference only until the cycle closes.";
  if (errors.length) {
    status = "configuration-invalid";
    nextAction = "Resolve the retraining configuration errors.";
  } else if (cycleClosed && !finalScoresApproved) {
    status = "waiting-for-final-approval";
    nextAction = "Record final approved scores before any checkpoint becomes labelled training data.";
  } else if (labelsAvailable && !dataEligible) {
    status = "waiting-for-new-outcomes";
    nextAction = `${missingCases} more approved completed case${missingCases === 1 ? "" : "s"} and ${missingCycles} more completed cycle${missingCycles === 1 ? "" : "s"} are required.`;
  } else if (dataEligible && !triggerReady) {
    status = "waiting-for-trigger";
    nextAction = "Request a manual check or wait for the next configured trigger.";
  } else if (candidateTrainingEligible) {
    status = "eligible-for-candidate-training";
    nextAction = "A new frozen completed-data snapshot may enter training; the published model stays active.";
  }

  return {
    status,
    nextAction,
    errors,
    labelsAvailable,
    usableNewCases,
    usableCycleCoverage,
    missingCases,
    missingCycles,
    manualCheckAvailable: Boolean(settings.manualEnabled),
    periodicDue,
    nextPeriodicCheck,
    candidateTrainingEligible,
  };
}
