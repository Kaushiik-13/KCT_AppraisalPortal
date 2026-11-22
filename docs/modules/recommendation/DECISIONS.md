# Recommendation — Module decisions

**Status:** Proposed product decision recorded for review. Nothing below is implemented or verified in the new application.

## Current implementation

No implementation of the new production-oriented Recommendation module has been verified. Historical PoC behavior is retained only in the [legacy archive](../../reference/legacy/README.md) and is not a production contract.

## RD-001 — The organization builds and publishes its own recommendations

**Tracking:** Issue #66. **Status:** Proposed.

### Proposed decision

- An institution's **organization administrators** build, evaluate and publish recommendation models or rule sets for their own institution.
- **Faculty members and supervisors do not build or publish recommendations.** They can only see a recommendation that the institution has published and enabled for them.
- **Publishing** is the act that moves a configuration from the administrator's sandbox to use. A sandbox example is not a live recommendation and must not appear to faculty or supervisors.
- A published recommendation is shown only to the named audiences the institution enables under its policy, within each person's access scope: a faculty member sees only their own, and a supervisor sees only those for assigned faculty when permitted.
- A recommendation is advice. It never decides, releases or changes a KPI mark; only a supervisor's per-KPI release makes a mark official.

### Rationale

The institution owns its appraisal data and is accountable for how it is used, so building and publishing stay with its administrators. Keeping publication as a separate step lets sandbox experiments be tried safely without reaching other users.

### Open questions

- Whether publication needs a second approval before an administrator's configuration goes live, and who may give it.
- Whether, and for which roles, faculty-facing recommendations are enabled at all.
- Whether a suggested follow-up is optional or required.
- Approved recommendation goals, permitted data, evaluation criteria, fairness checks, explanation standards, expiry rules and monitoring.
- Whether published recommendations can be withdrawn, and how that is recorded.

## Known limitations

- This is a proposed decision awaiting institutional agreement. It is not a permission contract, schema or API.
- The shared [project role/access proposal](../../project/UI-UX.md) describes the cross-platform visibility boundary; this module owns recommendation-specific decisions.
