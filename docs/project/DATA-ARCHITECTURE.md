# Data architecture decision

**Status:** Proposed for review in Issue #73. Becomes accepted when this document is approved and merged.

**Current implementation:** none. There is no database, ORM, migration, object store or persistence code. The web app is a prototype that keeps sample data in the browser tab, and `apps/api` has only a health endpoint and empty modules.

## Decision

Use **PostgreSQL** as the single system of record for all modules, plus **S3-compatible object storage** for files. Do not add a NoSQL database for the first release.

| Concern | Choice |
|---|---|
| System of record | PostgreSQL (managed service, version 16 or later) |
| Flexible or configurable shapes | `jsonb` columns inside Postgres, validated by the API |
| Files (evidence uploads, CSV imports, model artifacts, exports) | S3-compatible object storage; Postgres stores only metadata and the object key |
| Data access in `apps/api` | One ORM with versioned migrations (Prisma proposed; see open questions) |
| Analytics for the first release | SQL views and materialized views in Postgres |
| Model training (`services/model-training/`) | Reads approved, read-only exports or views; writes artifacts to object storage and metadata back through the API |

## Why

### What the data looks like

| Module | Main entities | Shape |
|---|---|---|
| Identity | user accounts, sessions, password resets, email verification | Relational, strict uniqueness |
| Organization | organization, settings, departments, people, reviewer assignments, invitations, import jobs | Relational: people belong to departments, each person has one reviewer, invitations belong to people |
| Framework Studio | appraisal cycles, KPI/KRA definitions, evidence requirements, scoring rules, submissions, review decisions, mark releases | Relational core with configurable parts (scoring rules, evidence fields) |
| Prediction and Recommendation | datasets, experiments, training jobs, model versions, approved outputs | Relational metadata plus large files |
| Analytics | metric definitions, role-scoped views | Aggregations over the above |
| Cross-cutting | audit events | Append-only history |

### What the product needs from storage

- **Correctness over scale.** Released marks, corrections and reviewer changes must be transactional and fully auditable. The first release serves one institution, likely thousands of people rather than millions, which is comfortably within one Postgres instance.
- **Joins everywhere.** Almost every screen combines data: people with departments and reviewers, submissions with cycles and KPIs, analytics across all of it. Relational joins and foreign keys do this safely. A document store would push these joins into application code.
- **Configurable frameworks.** KPI definitions and scoring rules vary by institution. `jsonb` holds those variable parts while keeping the stable parts (cycle, owner, status) as real columns that can be indexed and constrained.
- **Scoped access.** Reviewers see only assigned faculty, faculty see only themselves. This is easiest to enforce with relational filters, and later with Postgres row-level security.
- **Future multi-organization support.** Every organization-owned table carries an `organization_id` from day one. Row-level security can be added and tested later without reshaping the data.

### Options considered

| Option | Strengths | Why not chosen |
|---|---|---|
| **PostgreSQL + object storage** (chosen) | Transactions, constraints, joins, `jsonb` for flexible parts, row-level security, mature tooling, one system to operate | — |
| NoSQL only (for example MongoDB) | Flexible documents, easy to start | Weak fit for relational data, multi-document transactions are harder, reporting and joins move into application code, audit and integrity rules are harder to guarantee |
| Hybrid: Postgres + a NoSQL store | Each store fits part of the data | Two databases to run, back up and keep consistent for no current need, since `jsonb` already covers the flexible parts |

### Trade-offs accepted

- Schema changes need migrations. This is deliberate: it keeps the data model reviewed.
- Very high-volume event or log data, if it appears later, may need a separate store. That would be a new decision, not part of this one.
- Files are not in the database, so backups must cover both Postgres and the object store.

## Rules that follow from this decision

1. **Ownership.** Each table belongs to one module, and only that module's API code writes to it. Other modules read through that module's service or published views, never by writing to its tables.
2. **Organization scope.** Every organization-owned row has `organization_id`, and every query filters by it. This is a design guarantee for the future, not a claim of tenant isolation in the first release.
3. **Audit.** Every change to people, reviewer assignments, settings, invitations, marks and releases writes an `audit_events` row in the same transaction: who, what, when, before and after.
4. **No hard deletes for people or marks.** Use status fields (for example `deactivated_at`) so history survives.
5. **Files.** Uploads go straight to object storage with short-lived signed URLs. Postgres keeps the key, size, type, checksum and owner.
6. **Identifiers.** UUIDs (v7, time-ordered) for primary keys. Timestamps are stored in UTC.
7. **Contracts.** Request and response shapes live in `packages/contracts` and are shared by the web app and the API.

## Open questions

- **ORM:** Prisma (strong tooling, widely known) or Drizzle (closer to SQL, simpler row-level security later). Proposed: Prisma, revisit before row-level security work.
- **Hosting:** which managed Postgres and object store, and in which region, given data-privacy requirements and budget.
- **Retention:** how long audit events, evidence files and released marks are kept.
- **Backups:** recovery-point and recovery-time targets.

## Related

- [Shared database schema](DATABASE-SCHEMA.md)
- [Organization database schema](../modules/organization/DATABASE-SCHEMA.md) and [Organization API plan](../modules/organization/API.md)
- [Proposed architecture](ARCHITECTURE.md)
