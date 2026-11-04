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

## Production-oriented rebuild
- The current AFPI architecture and module designs will be created anew as the production-oriented implementation is designed and built.
- Do **not** migrate earlier PoC architecture, APIs, schemas, UI/UX plans or audit results into active documentation as specifications or proof of current behavior.
- `docs/reference/legacy/` is a **read-only historical archive**. Existing evidence stays there for traceability; the new project does not inherit the PoC's technical decisions automatically.
- Historical links inside archived files may point to their former locations. Do not rewrite original historical files; verify referenced evidence by searching the archive when needed.

## Accuracy
- Module README declares one status: **Planned**, **In development**, **Prototype**, or **Implemented**, relative to the stated implementation scope.
- Explicitly separate **Current implementation**, **Proposed design**, and **Known limitations**.
- Check code/tests before claiming a feature is implemented. Never infer a database, tenant isolation, deployment or trained model solely from a design document.
- Placeholder documents remain deliberately minimal until verified production-oriented design and implementation information is ready.

## Synchronization
Architecture-changing features require linked, expressly authorized project-documentation PRs. The overarching Issue remains open until module implementation and linked documentation are merged.

## New audits and verification
- Each module has `docs/modules/<module>/audits/README.md` (register) and `AUDIT-TEMPLATE.md`; project-wide audits have `docs/project/audits/`.
- Create `YYYY-MM-DD-topic.md` for each new audit. Record baseline, objective, scope, methodology, evidence, findings/severity, GitHub follow-up Issues, owners, limitations and verification status.
- The module's assigned owner may update module audits within the authorized Issue scope. Project audits require a dedicated authorized docs PR.
- Once finalized, preserve the audit report as evidence; record corrections or re-audits separately instead of silently changing original findings.
- Do not copy earlier PoC audits into these active folders. Their originals remain under `docs/reference/legacy/`.

## Link verification
- Verify relative Markdown links from **active** documentation against current repository paths before merging documentation PRs. Old historical links in the read-only archive are outside active-documentation checks.
- When moving a current document, update active inbound links to its canonical location; avoid altering archived files.
