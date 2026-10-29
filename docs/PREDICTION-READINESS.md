# Prediction readiness and feature-safety contract

Status: **implemented for the synthetic prototype; readiness UI and real-data ingestion are not implemented**

Implemented endpoint: `POST /api/prediction/datasets/readiness`

Implemented domain entry point: `evaluatePredictionReadiness` in `src/prediction/readiness.js`

This layer decides whether a frozen dataset can support a rule-based estimate or model training. It does not train, approve, publish or run a model.

## Inputs

The domain function receives:

- Frozen snapshot ID and typed rows.
- Organization, policy and framework compatibility scope.
- Policy contract with overall cap, roles, KRAs and role-specific caps.
- Explicit feature selection.
- Optional readiness-profile overrides.

The API accepts the same information in JSON:

```json
{
  "snapshot": {
    "id": "kct-sufficient-v1",
    "organizationId": "kct",
    "policyVersion": "pads-2021-reference-v1",
    "frameworkVersion": "afpi-framework-prototype-v1",
    "rows": []
  },
  "policy": {
    "version": "pads-2021-reference-v1",
    "overallScoreCap": 200,
    "roles": [],
    "kras": []
  },
  "featureSelection": [
    "role_code",
    "checkpoint_index",
    "elapsed_fraction",
    "remaining_days",
    "current_overall_score"
  ]
}
```

The current API carries rows and the policy in the request because the prototype has no durable dataset repository. A production implementation must resolve immutable snapshots and policy versions server-side under authenticated tenant scope.

## Outputs

The response contains:

- `status`: `ready-rule-based`, `ready-for-training`, `fallback-only` or `blocked`.
- `scenario`: `A`, `B`, `C` or `null` when data/configuration is invalid.
- Scenario and method labels.
- Explicit statement that the default profile is not a production threshold.
- Total, valid, rejected, active, completed-row, completed-case and completed-cycle counts.
- Time-based train/test split summary when available.
- Rule-based and model-training eligibility flags.
- Allowed, selected and excluded feature contracts.
- Blocks, warnings and rejected-row reason codes.

A blocked readiness response is a successful analysis and therefore uses HTTP 200. Malformed requests use 4xx responses.

## Demonstration readiness profile

The committed defaults are configuration values for synthetic review, not universal ML rules:

| Setting | Default |
|---|---:|
| Minimum completed cases for limited-history model eligibility | 20 |
| Minimum completed cycles for limited-history model eligibility | 2 |
| Minimum completed cases for sufficient-history classification | 200 |
| Minimum completed cycles for sufficient-history classification | 4 |
| Missing selected-feature warning threshold | 5% |
| Held-out test-case warning threshold | 20 |
| Synthetic pattern concentration warning threshold | 60% |

Organizations must configure and validate production thresholds against their own policy, data volume and evaluation requirements.

## Scenario behavior

### Scenario A — no completed history

- Requires a valid active snapshot and zero valid completed rows.
- Permits only the transparent rule-based estimate.
- Does not claim ML confidence or permit supervised training.

### Scenario B — limited history

- Has completed history but does not meet both sufficient-history defaults.
- Requires at least two ordered completed cycles for a time-based holdout.
- Permits training only when the limited-history thresholds and all blocking quality gates pass.
- Always carries a low-confidence warning until later evaluation proves otherwise.
- Falls back to the rule-based path when training eligibility fails.

### Scenario C — sufficient history

- Meets both sufficient-history completed-case and completed-cycle defaults.
- Requires a valid held-out latest cycle and no blocking findings.
- Readiness permits candidate evaluation; it does not approve accuracy or publish a model.

### Blocked

- Used for incompatible, invalid, non-synthetic or leakage-prone inputs.
- Does not permit training.
- Returns stable reason codes and example record IDs.

## Dataset validation

The validator checks:

- Explicit synthetic provenance.
- Organization, policy and framework compatibility.
- Canonical employee-cycle-checkpoint keys and duplicates.
- Configured role and KRA cap compatibility.
- ISO cycle/checkpoint dates and checkpoint placement.
- Elapsed fraction and remaining-day ranges.
- Current, KRA and final-score ranges.
- Completed-cycle target presence and availability timing.
- Active-cycle target exclusion.
- Evidence/missing counts and mandatory-status values.
- Non-decreasing cumulative checkpoint scores.
- Previous-checkpoint consistency.

Controlled invalid fixtures map to stable block codes such as `MISSING_TARGET`, `DUPLICATE_CANONICAL_KEY`, `SCORE_OUT_OF_RANGE`, `CHECKPOINT_OUTSIDE_CYCLE`, `UNKNOWN_ROLE`, `POLICY_VERSION_MISMATCH`, `ACTIVE_TARGET_PRESENT`, `DECREASING_CUMULATIVE_SCORE` and `RECORD_NOT_SYNTHETIC`.

## Feature safety

Allowed initial features are:

- Role code.
- Checkpoint index.
- Elapsed fraction and remaining days.
- Current and previous overall score.
- Score change.
- Verified evidence count.
- Mandatory status and route.
- Policy-defined KRA score and cap fields.

The target, target availability, identifiers, cycle/split fields, dates, compatibility metadata, fixture metadata, synthetic provenance, missing-count summary and generator-only pattern are excluded.

Selecting `final_approved_score` or target availability returns `TARGET_LEAKAGE_FEATURE`. Selecting `generation_pattern` returns `FUTURE_UNAVAILABLE_FEATURE`. Selecting identifiers, validation-only fields or unknown fields returns `UNSAFE_OR_UNKNOWN_FEATURE`.

`buildCheckpointSafeFeatureMatrix` creates raw train/test examples only after feature and split validation. It excludes active rows, preserves employee-cycle grouping, exposes the final score only as the target and records that preprocessing must fit on training data only.

## Time-based split

- Sort completed cycles by cycle end date.
- Train on every earlier compatible completed cycle.
- Hold out the latest completed cycle for testing.
- Keep every checkpoint for an employee-cycle in the same partition.
- Reject empty partitions or any employee-cycle overlap.
- Fit later preprocessing only on the training partition.

For the committed sufficient fixture, training uses `2022-23`, `2023-24` and `2024-25`; testing uses `2025-26`.

## Security and prototype limitations

- The endpoint is same-origin in production and accepts JSON up to 6 MB.
- Responses are not cached.
- The endpoint does not persist rows, train a model or modify official scores.
- The route is not authenticated and is therefore not a production data-ingestion API.
- Only synthetic fixture data is approved for the current path.
- Real employee data requires authentication, tenant isolation, approved storage, retention and institutional authorization.
