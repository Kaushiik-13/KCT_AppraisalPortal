# Prediction — UI/UX

## Status

**Proposed design** for an organization administrator's model workspace. No production model-training or prediction UI has been verified as implemented.

## User and purpose

Organization administrators need to build and evaluate prediction models in a sandbox, understand data readiness and model quality, and use institution-level analytics. The interface must make clear which data, model version, and evaluation produced a result.

## Proposed journey

1. Administrator opens the institution's prediction workspace.
2. Reviews permitted data readiness and selects an authorized dataset or input source for an explicitly stated prediction purpose.
3. Configures an experiment and starts model training/evaluation in a sandbox.
4. Tracks queued, running, completed, or failed status without confusing an experiment with an approved or enabled prediction.
5. Reviews evaluation results, model version, data provenance, limitations, and any required approval; compare results against institution-approved criteria once defined.
6. Makes outputs available to institution analytics or other approved workflows only after required policy and approval gates are satisfied.
7. If faculty predictions are enabled, a faculty member sees only their own authorized estimate, labeled as a prediction and accompanied by the relevant appraisal cycle, model/version context, generated date, and explanation or limitations where available.
8. A supervisor sees prediction details only when required and permitted for their assigned review scope; model outputs do not decide, release, or alter KPI marks.

The actual screens, training sequence, and publication gates remain open.

### Role-specific information

- **Administrator:** experiment configuration, data readiness, evaluation details, provenance, model versions, and institution-level prediction analytics within approved duties.
- **Supervisor/reviewer:** only prediction information explicitly approved for assigned faculty and the relevant appraisal task. A prediction is contextual information, not a substitute for evidence review or the supervisor's decision.
- **Faculty member:** own prediction only when enabled by institutional policy. Present it as an estimate, separate from submitted evidence and released marks; include its cycle/model context and any available explanation, limitations, or unavailable status.

Do not expose training data, other faculty's predictions, or detailed model diagnostics through a faculty or supervisor view unless a separately approved policy permits it. A model result must never be rendered as an official KPI mark or as a guarantee of a future outcome.

## Required states

- No authorized dataset, readiness checks incomplete, or validation errors.
- Experiment draft, queued, running, succeeded, failed, canceled, or stale.
- Evaluation unavailable or results insufficient to support a decision.
- Model draft, awaiting decision, approved, active, retired, or unavailable only if those lifecycle states are adopted.
- Prediction not enabled for the cycle, no result available, stale result, or output outside the approved presentation policy.
- Access denied, data scope changed, or institution context missing.

These state examples are proposed UX considerations, not an approved lifecycle contract.

## Known limitations and open decisions

- Approved prediction goals, features, training data, evaluation metrics, thresholds, and fairness checks are not defined.
- Model approval, publication, monitoring, rollback, and faculty visibility rules are open.
- The prediction audience, explanation/confidence presentation, and any supervisor need for predictions require institutional approval.
- Whether training runs in the API deployment, a background worker, or a separate service is undecided.
- No wireframes, accessibility review, or usability evidence are available yet.
