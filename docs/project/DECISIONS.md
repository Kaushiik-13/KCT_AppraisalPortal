# AFPI — Production-oriented project decisions

This is the decision log for **new production-oriented AFPI development**. The earlier PoC decision log has been preserved in [legacy/DECISIONS.md](../reference/legacy/DECISIONS.md) as historical context only.

## Decision log

No technical architecture or implementation decisions have been finalized in this document yet. The following product-direction baseline is captured from stakeholder discussion; it is not a technology, deployment, data-schema, or authorization decision.

### PD-001 — Complete core role workflows in the first release

- **Date:** 2026-11-11
- **Status:** Agreed product direction; detailed requirements remain open
- **Context:** AFPI is being redesigned from a proof of concept into an analytics-oriented faculty appraisal product. The first release must cover the core responsibilities of organization administrators, faculty members, and supervisors/reviewers rather than shipping only a small isolated workflow.
- **Direction:** The first release is intended for one institution. Organization administrators configure and facilitate appraisal operations, create KPIs/KRAs, build/train/evaluate prediction and recommendation models in sandboxes, and view institution-level KPI/KRA and faculty performance/level analytics. Faculty members submit KPI information/evidence, track review, and see KPI marks after release. Supervisors/reviewers perform operational review, decide and release marks per KPI, and view analytics for faculty within their authorized scope. Future multi-organization SaaS support is a design goal for a later evolution, not a first-release requirement.
- **Implications:** The production design must map all three core role journeys and their data/access needs. Keep institution-owned information explicit in the design, but do not describe the first release as multi-tenant or claim tenant isolation is implemented.
- **Open questions:** Approved scoring rules and KPI/KRA definitions; reviewer assignment and override policy; exact mark-release states; model training/evaluation/approval rules; faculty visibility of predictions/recommendations; dashboard metric definitions; authentication, authorization, and data architecture.
- **Related:** [Project overview](OVERVIEW.md), [proposed architecture](ARCHITECTURE.md), [UI/UX specification](UI-UX.md), [integration flow](INTEGRATION.md).

For each new significant decision, record the ID, date, context/problem, chosen approach, alternatives, trade-offs, owner, and related Issue/PR. Identify the decision's status as proposed, accepted, superseded or implemented.

## Governance baseline
The agreed [development rules](../development/BRANCHING-AND-PRS.md), [documentation ownership](../development/DOCUMENTATION-RULES.md), and [testing standards](../development/TESTING-STANDARDS.md) govern new implementation work. Architecture-specific choices must be decided independently of the old PoC.
