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

## Verified 29 October 2026 — PADS individual KPI scores

Built and exercised 59 of the 64 KPI rows in `public/samples/PADS.xlsx` (14 TL, 16 RD, 11 EI, 10 Operations, 6 SD, 2 EC) as saved `v1` rules policies. The five optional `INSTITUTIONAL OR DEPARTMENTAL CONTRIBUTIONS AND OUTCOMES` rows use a separate 5-point supervisor scale and were not built. 201 UI checks covering award tiers, zero/boundary cases and below-threshold fallbacks passed. RD-6 uses enumerated combinations because the formula mode cannot express its base-plus-increment rule. Supplementary edge checks confirmed required-field blocking, pending review for missing evidence and human-review handoff; negative values are not range-validated. This verifies individual KPI rule encoding and UI scoring only; PADS KRA weights/totals, role maxima, the 200-point cap, mandatory eligibility, dual self/supervisor scores, descriptive review and the five institutional rows remain unimplemented. Some KPI nuances remain simplified; see [testing](TESTING.md).

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

Delivered 27 October: selecting the Publication plugin added a complete twelve-step workflow automatically, with confirmation and Undo on replacement. Later updates supersede that template for new workflows: no simulated index checks or AI; Clear runs the selected conditional scoring policy, while Needs review and Ineligible bypass scoring. All three outcomes converge on one Appraiser review node. The old nodes remain available to restored drafts. The creator-usability review below remains planned for testing broader authoring flows with the project owner.

Delivered on 6 October: migrated the PoC from Vite to Next.js 16 App Router, retained the browser-owned studio through a client boundary, moved AI access to Node route handlers, and prepared the PDF worker during development/build. Local production build and runtime checks pass. The application has not been pushed or deployed.

## Next priorities — planned, not implemented

1. **Creator usability review.** Have the project owner build a KPI from scratch and record confusing steps. Do not assume seeded test workflows prove independent authoring is easy.
2. **Persist final scoring and review handoffs.** Define the canonical durable final-score record, how pending facts are resolved, and the separate Human Review module's assignment and outcome contract before production.
3. **Agree institutional rules and PADS aggregation.** Resolve co-author conflict, corresponding-author precedence, SAE treatment, date precedence, caps, and journal-versus-paper indexing evidence. Decide whether AFPI will implement PADS KRA totals and role-specific maxima, the 200-point cap, mandatory assessment eligibility, dual self/supervisor scores, descriptive/overall review, and the five institutional 5-point rows; the current PoC scores individual KPIs only.
4. **Optional live index verification.** Only pursue Scopus/Web of Science adapters after the institution confirms API entitlement, authorized credentials, and approved use. Coverage gaps and failures must remain explicit; DOI lookup alone cannot establish index status.
5. **Portable draft lifecycle.** Add validated import, multiple drafts, schema migrations, and cross-tab conflict handling.

## Prediction Framework — planned 27 October 2026

The detailed [Prediction Framework implementation plan](PREDICTION-FRAMEWORK-IMPLEMENTATION-PLAN.md) defines a new organization-scoped module for predicting the final approved overall score. It is planned work and no prediction screen, dataset, model, API, or employee dashboard is implemented yet.

The planned sequence is:

1. Obtain KCT KRA/KPI, scoring, role, cycle, and checkpoint definitions.
2. Create reproducible synthetic KCT fixtures for no-history, limited-history, sufficient-history, and invalid-data cases.
3. Build configuration, data mapping, readiness, rule-based estimate, training, evaluation, approval, test, publication, employee dashboard, and basic retraining screens.
4. Evaluate established candidate algorithms through time-based holdout testing rather than selecting one before the data contract exists.
5. Stabilize prediction before beginning the Recommendation Framework.

The three runtime modes are a transparent rule-based estimate when history is unavailable, an evaluated low-confidence baseline when history is limited, and an approved organization-specific model when sufficient compatible history passes quality gates.

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
