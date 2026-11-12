# AFPI repository structure

## Purpose and status

This document explains where the new AFPI code belongs and how the current repository foundation relates to the proposed product architecture. It follows Issue #51 and the product workflows in the [project overview](OVERVIEW.md) and [architecture](ARCHITECTURE.md).

**Status:** The codebase foundation was merged into `main` through PR #53. The layout and scaffolds do not mean that the product workflows are implemented.

## Current implementation

The codebase is organized as a small npm workspace for the JavaScript applications and shared contracts, with a separate location reserved for Python model training. The repository-level `docs/` folder remains the source of product and architecture requirements.

| Path | Responsibility | Current state |
|---|---|---|
| `apps/web/` | Next.js application for the administrator, faculty, and supervisor experiences | Clean starter shell. No product UI or workflow has been carried over from the PoC. |
| `apps/api/` | NestJS modular monolith and application API | Health endpoint and empty modules for identity/access, organization, Framework Studio, prediction, recommendation, and analytics. No business workflows or persistence are implemented. |
| `services/model-training/` | Future Python model training and evaluation worker/service | Reserved with a README only. Its data contract, job lifecycle, and governance need agreement before implementation. |
| `packages/contracts/` | Shared API schemas and generated types | Reserved. No cross-application contract has been approved yet. |
| `legacy/poc/` | Preserved previous web and synthetic model-training proof of concept | Historical reference only. It is outside the new app workspaces and is not production behavior. |
| `docs/` | Product requirements, architecture, development guidance, module documentation, and historical references | Kept at the repository root as the shared source of truth. |

The top-level `package.json` includes `apps/web`, `apps/api`, and `packages/contracts` as npm workspaces. The Python service and archived PoC are not npm workspaces. Root commands currently provide web/API build and development entry points; they do not start a production model-training service.

## Proposed design

The first release is intended to deliver the complete core appraisal and analytics workflow for one institution:

1. Administrators configure the organization, KPIs/KRAs, appraisal cycle, assignments, and model workspaces/sandboxes.
2. Faculty submit KPI information and evidence and follow review progress.
3. Supervisors/reviewers assess assigned submissions, record decisions, and release marks for each KPI.
4. Administrators, supervisors, and faculty see analytics and results appropriate to their approved access.

The repository layout supports those responsibilities without forcing each area to run as a separate service. The API is a modular monolith by default; the model-training service remains a future boundary until its contract and operational needs are settled. The product is designed for one institution in its first release. Future multi-organization support is a design consideration, not an implemented tenant-isolation feature.

## Known limitations

- The web workspace is a shell; the user journeys, UI, and product workflows remain to be built.
- API feature folders are placeholders. There is no production authentication, authorization, database, evidence storage, appraisal workflow, analytics, or model orchestration.
- KPI scoring formulas, reviewer rules, model governance, analytics measures, and other institutional policy decisions must be approved before implementation; do not infer them from PoC behavior.
- No service-to-service or web-to-API contracts have been approved. Define them in `packages/contracts/` only after the relevant boundaries agree.
- No training worker, production model, deployment topology, or future tenant isolation is implemented.
- The old PoC is retained for traceability and may contain synthetic data and behavior that are not valid product requirements.

## Placement rules

- Put new browser routes and presentation code in `apps/web/`.
- Put application APIs and business capabilities in the appropriate `apps/api/src/modules/<module>/` folder. Keep cross-module contracts explicit.
- Put Python training and evaluation behavior in `services/model-training/` only after its inputs, outputs, lifecycle, and governance are approved.
- Put agreed shared API schemas and types in `packages/contracts/`.
- Keep product and architecture documentation under the root `docs/` tree. Module-specific documentation belongs under `docs/modules/<module>/`.
- Keep old PoC code under `legacy/poc/`; do not import its behavior into the new product without a deliberate, documented decision.

## Related documentation

- [Local setup and development commands](../../README.md)
- [Project overview and first-release roles](OVERVIEW.md)
- [Proposed product architecture](ARCHITECTURE.md)
- [Engineering design principles](DESIGN-PRINCIPLES.md)
- [Cross-module integration](INTEGRATION.md)
- [Documentation and ownership rules](../development/DOCUMENTATION-RULES.md)
- [Historical PoC archive](../reference/legacy/README.md)
