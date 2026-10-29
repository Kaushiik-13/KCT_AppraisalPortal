# Prediction governance and inference

Status: **implemented for the local synthetic prototype**

## Purpose and boundary

Screens 6–8 turn a recommendation-eligible synthetic candidate into an explicitly approved and published prototype version, then exercise read-only prediction. This is model governance, not the KPI Human Review module. It does not authenticate a real administrator, persist a production artifact, change evidence, or update an official appraisal score.

## Candidate registry

`POST /api/prediction/training` registers each successful fitted candidate in a private in-process registry. Public training/model responses omit the serialized pipeline. Each record captures:

- organization, target, policy and framework compatibility;
- training run, dataset snapshot/checksum and configuration checksum;
- selected/excluded feature schema and score range;
- algorithm, fixed parameters and provider;
- held-out metrics, baselines, recommendation gate and warnings;
- approval and publication metadata.

The registry is shared only inside the current Node process. Restart, another replica or an independent serverless invocation may not see the record. It is a demonstration boundary, not durable storage.

## Lifecycle rules

`POST /api/prediction/models/{modelId}/decision` accepts `approved` or `rejected`, reviewer and a required note. Only the recommendation-eligible candidate can be approved. A decision is final for that candidate.

`POST /api/prediction/models/{modelId}/publish` accepts the exact organization/target/policy/framework compatibility. Only an approved record can publish. One model is active per exact scope. A replacement receives the next version and changes the prior record to `superseded`; the prior metadata is retained.

The current prototype reviewer is a user-entered label, not an authenticated identity. Production requires role-based authorization and durable audit events.

## Inference contract

`POST /api/prediction/predict` accepts a frozen synthetic history snapshot, one active synthetic checkpoint, policy contract and readiness thresholds. The server revalidates both inputs, recomputes readiness and selects behavior:

- Scenario A: transparent pace projection, no model call.
- Scenario B: active compatible published model; if absent, transparent low-confidence fallback.
- Scenario C: active compatible published organization model is mandatory; otherwise the request is rejected.
- Invalid/blocked: no prediction is returned.

Model inference loads only the server-owned artifact and sends the selected checkpoint-safe fields to the local Python provider. It does not refit the estimator. Output is clamped to the policy range. Model ranges use the held-out absolute-residual 90th percentile; rule/fallback ranges are labelled transparent bounds rather than probability intervals.

The response includes current and predicted scores, range/method, readiness scenario, confidence, plain-language factors, policy/framework/model versions, warnings, timestamp, `advisory: true`, and `officialScoreChanged: false`.

## Safety and prototype limits

- Same-origin JSON, request-size and no-store controls apply.
- The browser cannot submit or retrieve a serialized artifact.
- Python pickle is loaded only from the trusted local provider's server-owned record; untrusted/client artifacts must never be accepted.
- Prediction cannot mutate workflow evidence, scoring state or appraisal records.
- Synthetic metrics/ranges are not real KCT accuracy, fairness, calibration or production-readiness evidence.
- No authentication, tenant isolation, durable registry, signed/encrypted artifact store, distributed locking, monitoring, rollback or serverless-safe storage is implemented.
