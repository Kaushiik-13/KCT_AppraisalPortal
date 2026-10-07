# Roadmap and remaining work

## Completed PoC phases

| Phase | Delivered |
|---|---|
| 1 | Browser autosave, recovery, stable draft storage |
| 2 | Tree canvas, drag/drop insertion, zoom, selected settings |
| 3 | Reusable Action, Condition, Human review, Result |
| 4 | Generic execution, branch selection, terminal review handoff, legacy review continuation |
| 5 | Formula and conditional scoring policies, caps, saved versions |
| 6 | Publication/training acceptance checks and setup guidance |

## Delivered 7 October 2026 — Framework Studio evidence workflow

- Replaced creator-facing typed Read tools with Use form value.
- Added common PDF/PPTX/XLS/XLSX extraction modes and source locations.
- Added multi-pair Compare evidence with match/mismatch/unknown semantics.
- Renamed and extended AI evaluation with multi-input context and optional validated JSON-schema outputs.
- Added an optional terminal Human Review handoff carrying the complete evidence and scoring package; legacy routed reviews remain readable.
- Removed generic External lookup from the new MVP catalogue while retaining old-draft compatibility.
- Reordered creation to Inputs → Scoring policy → Workflow and added arbitrary weighted formula components that creators manually map to workflow outputs.

Subsequent delivered improvements: configurable AI instructions and any-path inputs, live free-model check, compact whiteboard layout, sidebar toggle, removal of extra sidebar cards, confirmed Clear saved draft, and the AI response-budget fix with safe diagnostics.

Delivered on 5 October: built-in Publication plugin picker and reusable verification Actions, including explicit saved-policy scoring. General OCR, authenticated integrations and installable plugins remain planned.

Delivered on 6 October: migrated the PoC from Vite to Next.js 16 App Router, retained the browser-owned studio through a client boundary, moved AI access to Node route handlers, and prepared the PDF worker during development/build. Local production build and runtime checks pass. The application has not been pushed or deployed.

## Next priorities — planned, not implemented

1. **Creator usability review.** Have the project owner build a KPI from scratch and record confusing steps. Do not assume seeded test workflows prove independent authoring is easy.
2. **Persist final scoring and review handoffs.** Define the canonical durable final-score record, how pending facts are resolved, and the separate Human Review module's assignment and outcome contract before production.
3. **Agree institutional rules.** Resolve co-author conflict, corresponding-author precedence, SAE treatment, date precedence, caps, and journal-versus-paper indexing evidence.
4. **Real verification adapters.** Add authorized index sources and reliable identity/duplicate data, with explicit coverage and failure semantics.
5. **Portable draft lifecycle.** Add validated import, multiple drafts, schema migrations, and cross-tab conflict handling.

## Production track — requires a separate design

- Database-backed KPI definitions, immutable policy releases, submissions, evidence references, runs and audit events.
- Authentication, tenant isolation, permissions, genuine reviewer assignment and notifications.
- Durable job execution, resumable reviews, idempotency, concurrency, and external-service retries.
- Secure evidence/object storage, retention controls, backups, monitoring, authenticated rate limiting, and production deployment.
- Plugin manifests and adapter registration if integrations must be installed without code changes.

No backend/database/cloud vendor has been selected in these docs. No production dates, costs, compliance status, or organizational ownership are implied.

## Deferred by current preference

Mobile layouts, broad KPI catalogues, scheduling, and platform-wide administration remain outside the desktop workflow PoC. Revisit them only when the core creator experience has been validated.

Delivered: full PDF text/page outputs and rubric-based AI evaluation with named context sources. Planned: automatic chunking for oversized documents, OCR, and a configured web-search provider for current-market evidence. SearXNG and Brave were researched; neither is installed or connected.
