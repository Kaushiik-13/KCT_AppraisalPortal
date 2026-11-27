# Framework Studio

**Status (production-oriented rebuild):** Planned

## Purpose
Configure appraisal frameworks and support the complete faculty submission, review, and per-KPI mark-release workflow.

## Current implementation
No production implementation exists yet. A clickable, **nonfunctional UI prototype** (Frameworks overview, KRAs and KPIs library, KPI editor with versions) is in `apps/web` with sample data and no backend: see [UI prototype](UI-PROTOTYPE.md). Historical PoC functionality is retained solely in the [legacy archive](../../reference/legacy/README.md).

## Proposed design
- Organization administrators create KPIs/KRAs, appraisal cycles, assignments, evidence requirements, and approved scoring configuration.
- Faculty members submit KPI information and evidence and track each submission.
- Reviewers inspect assigned submissions, make decisions under approved institutional rules, and release marks for each KPI to faculty.
- Provide appraisal data to role-scoped dashboards after the relevant state is reached.
- Keep formula, eligibility, weights, caps, exceptions, and override rules unresolved until confirmed by institutional policy owners. Do not copy PoC behavior as production policy.

## Known limitations
- Technical design, persistence model, integration contracts and production verification are not yet established.

## Module documentation
- [Architecture](ARCHITECTURE.md)
- [Database and ER diagram](DATABASE-SCHEMA.md)
- [API](API.md)
- [UI/UX](UI-UX.md)
- [UI prototype](UI-PROTOTYPE.md)
- [Testing](TESTING.md)
- [Decisions](DECISIONS.md)
- [Audit register and template](audits/README.md)
