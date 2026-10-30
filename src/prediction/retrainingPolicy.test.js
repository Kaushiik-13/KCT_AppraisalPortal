import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_RETRAINING_SETTINGS, evaluateRetrainingStatus, validateRetrainingSettings } from "./retrainingPolicy.js";

const base = {
  settings: DEFAULT_RETRAINING_SETTINGS,
  publishedAt: "2026-10-01T00:00:00.000Z",
  now: "2026-10-15T00:00:00.000Z",
  cycleClosed: false,
  finalScoresApproved: false,
  newCompletedCases: 120,
  completedCycleCoverage: 2,
  manualRequested: false,
};

test("active-cycle rows never count as labelled retraining cases", () => {
  const result = evaluateRetrainingStatus(base);
  assert.equal(result.labelsAvailable, false);
  assert.equal(result.usableNewCases, 0);
  assert.equal(result.candidateTrainingEligible, false);
  assert.equal(result.status, "waiting-for-cycle-close");
});

test("cycle closure still waits for final approved outcomes", () => {
  const result = evaluateRetrainingStatus({ ...base, cycleClosed: true, manualRequested: true });
  assert.equal(result.status, "waiting-for-final-approval");
  assert.equal(result.candidateTrainingEligible, false);
});

test("approved cycle outcomes and a configured trigger allow candidate training only", () => {
  const result = evaluateRetrainingStatus({ ...base, cycleClosed: true, finalScoresApproved: true });
  assert.equal(result.status, "eligible-for-candidate-training");
  assert.equal(result.candidateTrainingEligible, true);
  assert.match(result.nextAction, /published model stays active/i);
});

test("periodic checks calculate the next date and still enforce data thresholds", () => {
  const settings = { ...DEFAULT_RETRAINING_SETTINGS, cycleCloseEnabled: false, periodicEnabled: true, periodicDays: 30 };
  const result = evaluateRetrainingStatus({
    ...base,
    settings,
    now: "2026-11-01T00:00:00.000Z",
    cycleClosed: true,
    finalScoresApproved: true,
    newCompletedCases: 10,
  });
  assert.equal(result.nextPeriodicCheck, "2026-10-31T00:00:00.000Z");
  assert.equal(result.periodicDue, true);
  assert.equal(result.status, "waiting-for-new-outcomes");
});

test("publication and active-model safeguards cannot be disabled", () => {
  const errors = validateRetrainingSettings({
    ...DEFAULT_RETRAINING_SETTINGS,
    keepPublishedModelActive: false,
    approvalRequired: false,
  });
  assert.equal(errors.length, 2);
});
