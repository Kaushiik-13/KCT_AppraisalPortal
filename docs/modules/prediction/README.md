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
