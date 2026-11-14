# Prediction

**Status (production-oriented rebuild):** Planned

## Purpose
Provide institution administrator workspaces for building and evaluating prediction models, alongside role-appropriate prediction outputs and analytics.

## Current implementation
No implementation of the **new production-oriented module** has been verified yet. Historical PoC functionality, where available, is retained solely in the [legacy archive](../../reference/legacy/README.md).

## Proposed design
- Organization administrators need a model-building, training, and evaluation workflow with a sandbox for prediction experiments.
- The module should make data readiness, evaluation results, model versions, limitations, and operational status understandable.
- Prediction outputs may inform dashboards or faculty-facing experiences only under approved institutional policy and access rules.
- Keep experimental outputs, approved predictions, and supervisor-released KPI marks distinct. Where policy enables faculty-facing predictions, show only the faculty member's permitted result as an estimate with its cycle and model context; predictions do not change official marks.
- The shared [project role/access proposal](../../project/UI-UX.md) describes the cross-platform visibility boundary; this module owns prediction experiment and output details.
- Training runtime, job processing, model storage, approval/publication, and monitoring are technical decisions still to be made. Existing PoC behavior is not a production contract.

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
