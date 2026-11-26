# Prediction — Module decisions

**Status:** Proposed product decision recorded for review. Nothing below is implemented or verified in the new application.

## Current implementation

No implementation of the new production-oriented Prediction module has been verified. Historical PoC behavior is retained only in the [legacy archive](../../reference/legacy/README.md) and is not a production contract.

## PD-001 — The organization trains and publishes its own prediction models

**Tracking:** Issue #65. **Status:** Proposed.

### Proposed decision

- An institution's **organization administrators** train, evaluate and publish prediction models for their own institution.
- **Faculty members and reviewers do not train or publish models.** They can only see an output that the institution has published and enabled for them.
- **Publishing** is the act that moves a model from the administrator's sandbox to use. A sandbox or experimental result is not a published prediction and must not appear to faculty or reviewers.
- A published model makes outputs available only to the audiences the institution enables under its policy, within each person's access scope: a faculty member sees only their own result, and a reviewer sees only results for assigned faculty when permitted.
- A prediction is an **estimate**. It never decides, releases or changes a KPI mark; only a reviewer's per-KPI release makes a mark official.

### Rationale

The institution owns its appraisal data and is accountable for how it is used, so model building and publication stay with its administrators. Keeping publication as a separate step lets sandbox experiments be tried safely without reaching other users.

### Open questions

- Whether publication needs a second approval before an administrator's model goes live, and who may give it.
- Whether, and for which roles, faculty-facing predictions are enabled at all.
- Approved prediction goals, training data, evaluation criteria, fairness checks and monitoring.
- Whether published models can be withdrawn or rolled back, and how that is recorded.
- Where training runs and how model versions are stored.

## Known limitations

- This is a proposed decision awaiting institutional agreement. It is not a permission contract, schema or API.
- The shared [project role/access proposal](../../project/UI-UX.md) describes the cross-platform visibility boundary; this module owns prediction-specific decisions.
