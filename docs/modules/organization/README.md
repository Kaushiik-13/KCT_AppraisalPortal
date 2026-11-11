# Organization

**Status (production-oriented rebuild):** Planned

## Purpose
Provide the institution setup and administrative workspace that configures and facilitates AFPI's appraisal operations.

## Current implementation
No implementation of the **new production-oriented module** has been verified yet. Historical PoC functionality, where available, is retained solely in the [legacy archive](../../reference/legacy/README.md).

## Proposed design
- Set up the first-release institution workspace and manage permitted members and supervisor assignments.
- Provide entry points for appraisal-cycle configuration, KPI/KRA setup, prediction/recommendation workspaces, and institution-level analytics, while leaving each domain's rules with its owning module.
- Support the first release for one institution. Keep institutional ownership explicit in product concepts so future multi-organization support can be designed, but do not claim multi-tenant isolation.
- Organization administrators facilitate configuration and operations. Supervisors conduct operational reviews and release marks for each KPI; administrators do not release marks in the agreed workflow.
- The user journey and authorization model are proposed; technical persistence, API, and permission contracts remain undecided.

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
