# Recommendation

**Status (production-oriented rebuild):** Planned

## Purpose
Provide organization administrators with capabilities to build and evaluate institution-specific recommendations, with authorized outputs available to relevant users.

## Current implementation
No implementation of the **new production-oriented module** has been verified yet. Historical PoC functionality, where available, is retained solely in the [legacy archive](../../reference/legacy/README.md).

## Proposed design
- Organization administrators need a recommendation model-building, training, and evaluation workspace with a sandbox.
- The module should explain the inputs, model/rule version, intended audience, limitations, and status of a recommendation.
- Any faculty-facing recommendations or follow-up actions require explicit institutional policy and access rules.
- Keep sandbox examples separate from enabled recommendations. Where policy permits, show an output only to its intended, authorized audience with its reason, version, provenance, limitations, and clear indication whether any follow-up is optional or required.
- The shared [project role/access proposal](../../project/UI-UX.md) describes cross-platform visibility boundaries; this module owns recommendation-specific audience and output details.
- Recommendation logic, model training, approval/publication, data use, and technical deployment remain undecided. Do not adopt PoC behavior as production design.

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
