# Prediction training and comparison contract

Status: **implemented for the local synthetic prototype**

## Purpose and boundary

Screens 4–5 demonstrate how one organization can configure and compare established final-score models after readiness succeeds. The target is fixed to `final_approved_score` within the policy range (0–200 for the KCT fixture). This phase does not invent an algorithm, persist a fitted model, approve/publish a version, serve predictions or establish real KCT accuracy.

## Request contract

`POST /api/prediction/training` accepts one frozen synthetic snapshot, its policy contract, selected checkpoint-safe features, one or more supported candidate IDs, and a positive integer seed. The same-origin JSON endpoint is no-store and limits the request body to 6 MB.

The server does not trust the browser's earlier readiness display. It reruns canonical validation and Scenario A/B/C selection, requires `ready-for-training`, validates the fixed target/candidates/seed, and rebuilds the feature matrix. Completed rows only are admitted; active rows are excluded. Earlier completed cycles train and the latest completed cycle tests. Employee-cycle groups cannot cross partitions.

## Feature and preprocessing contract

Allowed features come from the versioned policy/readiness contract. Target values, target timing, identities, organization/cycle split fields, active targets, generator metadata and `generation_pattern` are rejected. Missing numeric inputs use training-set medians with indicators. Categorical values use training-fitted most-frequent imputation and one-hot encoding with unknown-category handling. Ridge additionally scales numeric inputs. The held-out cycle never fits preprocessing.

## Compared methods

Transparent baselines are always present and receive their four required baseline-only values independently of the candidate feature selection:

- Pace projection: `current_overall_score / elapsed_fraction`, clamped to the configured range.
- Grouped median: training-target median by role and checkpoint, with global training median fallback.

Established candidates are Ridge regression, Random Forest regressor and Gradient Boosting regressor with the displayed fixed prototype parameters and seed. Random Forest uses one worker to keep reproducibility controlled.

## Evaluation and recommendation

Each successful method reports held-out MAE, RMSE, normalized MAE (`MAE / score range`), R² when meaningful, a 90th-percentile absolute-residual range with empirical held-out coverage/width, and prediction-range evidence. Candidate parameters and duration are included. A candidate failure is isolated and returned without raw rows or Python stderr.

A candidate is recommended only when:

1. training succeeded;
2. its held-out MAE is lower than the pace baseline;
3. its held-out MAE is lower than the grouped-median baseline; and
4. final evaluated predictions are within the configured range after the explicit output clamp.

Lowest held-out MAE breaks ties among candidates that pass. This gate is a prototype comparison rule, not model approval.

## Provider boundary and lifecycle

The Node route starts `ml/prediction_service/app.py`, sends one JSON operation through stdin and accepts bounded JSON stdout. The child process is hidden, has a 60-second timeout and 2 MB response limit, and returns controlled unavailable/timeout/failure responses. `PREDICTION_PYTHON` can select the executable.

Run identity derives from the snapshot ID plus validated configuration checksum. The response and fitted estimator live only for the request/page session; page reload loses the comparison. A production version requires authenticated organization scope, immutable server-resolved snapshots/policies, a durable training job, isolated compute, model/artifact storage, approval records, audit events, monitoring and rollback.
