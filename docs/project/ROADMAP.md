# AFPI — Production-oriented development roadmap

This roadmap tracks **new production-oriented AFPI development**, not delivery status of the earlier proof of concept. The original PoC roadmap remains available as [historical reference](../reference/legacy/ROADMAP.md).

## Product direction captured

The first release is intended to provide the complete core appraisal and analytics workflow for one institution:

- Organization administrators set up the institution's appraisal operations, create KPIs/KRAs and appraisal cycles, build/train/evaluate prediction and recommendation models in sandbox workspaces, and view institution-level KPI/KRA and faculty performance/level analytics.
- Faculty members submit assigned KPI information and evidence, track review progress, and view KPI marks after a supervisor releases them.
- Supervisors/reviewers review assigned faculty submissions, decide and release marks per KPI, and view analytics within their authorized faculty scope.
- The architecture should not block a later move to multi-organization SaaS, but multi-tenant access is not required for the first release.

This is a product-scope direction, not an implementation status claim. Policy details, technical architecture, and acceptance criteria still require design and verification.

## Proposed sequence

1. **Define product workflows:** document role responsibilities, appraisal-cycle states, review/return paths, mark release, dashboards, and failure/recovery cases.
2. **Complete architecture decisions:** define module boundaries, identity and access model, data ownership, API contracts, model lifecycle, and deployment approach. Record unresolved institutional rules rather than inventing them.
3. **Establish design and integration contracts:** define shared navigation and UI patterns, module responsibilities, and cross-module data flow before implementation.
4. **Implement the complete core workflow:** deliver administrator setup, faculty submission, supervisor review and per-KPI mark release, and role-scoped analytics as an integrated product slice.
5. **Verify production readiness:** validate security and access boundaries, scoring correctness against approved policy, model governance, accessibility, reliability, backups, monitoring, and operational recovery.
6. **Evaluate multi-organization evolution:** design and verify tenant isolation before enabling multiple institutions in a shared product.

The sequence is a proposal. It does not authorize code changes or claim any milestone is complete.

## Progress and evidence

Track milestone status only when supported by approved requirements, reviewed documentation, merged implementation, tests, and current audit evidence. Do not mark a capability complete because it exists in the historical PoC or a prototype.
