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
