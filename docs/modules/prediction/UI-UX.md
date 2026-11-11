# Prediction — UI/UX

## Status

**Proposed design** for an organization administrator's model workspace. No production model-training or prediction UI has been verified as implemented.

## User and purpose

Organization administrators need to build and evaluate prediction models in a sandbox, understand data readiness and model quality, and use institution-level analytics. The interface must make clear which data, model version, and evaluation produced a result.

## Proposed journey

1. Administrator opens the institution's prediction workspace.
2. Reviews permitted data readiness and selects an authorized dataset or input source.
3. Configures an experiment and starts model training/evaluation in a sandbox.
4. Tracks queued, running, completed, or failed status without confusing an experiment with a published model.
5. Reviews evaluation results, model version, data provenance, limitations, and any required approval.
6. Uses permitted outputs in institution analytics; faculty visibility is controlled by institutional policy and access rules.

The actual screens, training sequence, and publication gates remain open.

## Required states

- No authorized dataset, readiness checks incomplete, or validation errors.
- Experiment draft, queued, running, succeeded, failed, canceled, or stale.
- Evaluation unavailable or results insufficient to support a decision.
- Model draft, awaiting decision, approved, active, retired, or unavailable only if those lifecycle states are adopted.
- Access denied, data scope changed, or institution context missing.

These state examples are proposed UX considerations, not an approved lifecycle contract.

## Known limitations and open decisions

- Approved prediction goals, features, training data, evaluation metrics, thresholds, and fairness checks are not defined.
- Model approval, publication, monitoring, rollback, and faculty visibility rules are open.
- Whether training runs in the API deployment, a background worker, or a separate service is undecided.
- No wireframes, accessibility review, or usability evidence are available yet.
