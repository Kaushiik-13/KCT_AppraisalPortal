# Documentation rules

## Ownership
- Feature branches may update only their assigned module's `docs/modules/<module>/` documentation.
- `docs/project/`, `docs/development/`, root `AGENTS.md`, `CONTRIBUTING.md`, `README.md`, and governance configuration are protected: change only through an expressly authorized dedicated documentation/governance branch and PR.
- Cross-module source-code changes still use module-owned PRs; shared documentation is updated separately.

## Canonical documentation
- Project architecture and shared module relationships: `docs/project/ARCHITECTURE.md`.
- Shared schema, Mermaid ER diagram and database ownership: `docs/project/DATABASE-SCHEMA.md`.
- Cross-module contracts: `docs/project/INTEGRATION.md`.
- Module-specific architecture, database choices/ER diagrams, API, UI/UX, tests and decisions: respective module folders.
- Significant project-level technical decisions: `docs/project/DECISIONS.md`.

## Accuracy
- Module README declares one status: **Planned**, **In development**, **Prototype**, or **Implemented**.
- Explicitly separate **Current implementation**, **Proposed design**, and **Known limitations**.
- Check code/tests before claiming a feature is implemented. Never infer a database, tenant isolation, deployment or trained model solely from a design document.
- Blank placeholder documents are intentional until module owners have verified content.

## Synchronization
Architecture-changing features require linked, expressly authorized project-documentation PRs. The overarching Issue remains open until module implementation and linked documentation are merged.

## Historical material
Pre-reorganization technical references remain under `docs/reference/legacy/` to prevent loss of research evidence. They may describe historical branches and are not current specifications; verify before reuse.

## Audits and verification records
- Every module maintains `docs/modules/<module>/audits/README.md` (audit register), `AUDIT-TEMPLATE.md`, and dated `YYYY-MM-DD-topic.md` audit reports.
- New module audits are module-owned and may be updated only on an assigned module branch within the authorized Issue scope.
- Cross-module, shared-schema and system-level audits belong to `docs/project/audits/` and require a separately authorized documentation PR.
- Each audit states its baseline, objective, scope, evidence, findings, severity, GitHub Issues, action owners, limitations and verification status.
- Keep audit records immutable as historical snapshots once finalized; add follow-up or re-audit documents instead of silently rewriting evidence.
- Link relevant audit findings from the module/project audit register, and track remediation through Issues.
- Migrated historical material is a **copy** for active discovery; the original source remains in `docs/reference/legacy/`. Historical claims are not automatically current verification.
