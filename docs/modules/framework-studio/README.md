# Framework Studio

**Status (production-oriented rebuild):** Planned

## Purpose
Configure appraisal frameworks and support the complete faculty submission, supervisor review, and per-KPI mark-release workflow.

## Current implementation
No implementation of the **new production-oriented module** has been verified yet. Historical PoC functionality, where available, is retained solely in the [legacy archive](../../reference/legacy/README.md).

## Proposed design
- Organization administrators create KPIs/KRAs, appraisal cycles, assignments, evidence requirements, and approved scoring configuration.
- Faculty members submit KPI information and evidence and track each submission.
- Supervisors/reviewers inspect assigned submissions, make decisions under approved institutional rules, and release marks for each KPI to faculty.
- Provide appraisal data to role-scoped dashboards after the relevant state is reached.
- Keep formula, eligibility, weights, caps, exceptions, and override rules unresolved until confirmed by institutional policy owners. Do not copy PoC behavior as production policy.

## Known limitations
- Technical design, persistence model, integration contracts and production verification are not yet established.

## Module documentation
- [Architecture](ARCHITECTURE.md)
- [Database and ER diagram](DATABASE-SCHEMA.md)
- [API](API.md)
- [UI/UX](UI-UX.md)
- [Testing](TESTING.md)
- [Decisions](DECISIONS.md)
- [Audit register and template](audits/README.md)
