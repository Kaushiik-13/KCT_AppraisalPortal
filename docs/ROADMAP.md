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

## Verified 30 October 2026 — PADS 59-KPI committed fixtures and automated coverage

The 59 individual KPI policies checked through the UI on 29 October 2026 are now committed reference fixtures: `public/samples/pads/kpis/` holds one saved draft per row (`tl-1` … `ec-2`), the 201 expected scoring cases (`cases.json`), a 59-row source map with workbook rows and expected-point sets (`index.json`), and a load/usage README. `src/padsAllKpis.test.js` runs all 201 cases through the workflow engine and asserts the exact points, so the coverage no longer depends on ignored local artifacts. Focused file **60/60**; full suite **167/167**; production build passed. Institutional rows 173–177 stay excluded, with the PADS gap and the AFPI requirements recorded in `index.json`, the sample README, the test header, and [PADS individual KPI verification](PADS-INDIVIDUAL-KPIS.md). No application behavior changed.

## Verified 30 October 2026 — PADS TL-1 initial KPI end-to-end

Built one committed reference fixture for `TL-1 Teaching Pedagogy & Content Preparation` from `public/samples/PADS.xlsx` (sheet `PADS Template`, columns `A–E`, rows 13–15): Inputs → Scoring policy → Workflow → Test & review with synthetic clear, unreadable, missing, and invalid evidence. The clear path scored **8 points** and reached a terminal Appraiser handoff; band checks covered `85 → 8`, `84 → 6`, `75 → 6`, `74 → 4`, `65 → 4`, `64 → 0`; missing/invalid inputs blocked; the unreadable PDF remained explicitly unverified and was sent to review with a provisional 8. Five focused tests were added; the full suite passed **107/107** and the production build succeeded. Evidence and screenshots: [PADS TL-1 walkthrough](PADS-TL1-WALKTHROUGH.md). This is one reference-only KPI, not a full PADS implementation or independent creator-usability review (#3). A review-package defect found during the test was filed as [#17](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/17) rather than fixed here. The 29 October note that range validation is absent still applies; min/max validation was not added.

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
3. **Agree institutional rules and PADS aggregation.** Resolve co-author conflict, corresponding-author precedence, SAE treatment, date precedence, caps, and journal-versus-paper indexing evidence. Decide whether AFPI will implement PADS KRA totals and role-specific maxima, the 200-point cap, mandatory assessment eligibility, dual self/supervisor scores, descriptive/overall review, and the five institutional 5-point rows; the 59 individual rows now have committed fixtures and automated coverage, while PADS-wide aggregation and the institutional rows remain open.
4. **Optional live index verification.** Only pursue Scopus/Web of Science adapters after the institution confirms API entitlement, authorized credentials, and approved use. Coverage gaps and failures must remain explicit; DOI lookup alone cannot establish index status.
5. **Portable draft lifecycle.** Add validated import, multiple drafts, schema migrations, and cross-tab conflict handling.

## Prediction Framework — in progress

The detailed [Prediction Framework implementation plan](PREDICTION-FRAMEWORK-IMPLEMENTATION-PLAN.md) defines a new organization-scoped module for predicting the final approved overall score. The seeded synthetic dataset foundation, configurable generation route, first three Prediction Studio screens, backend readiness API, Scenario A/B/C selection, time-based split and leakage-safe feature contract are implemented. No trained model, inference API or employee dashboard is implemented yet.

The [Prediction prototype implementation plan](PREDICTION-PROTOTYPE-IMPLEMENTATION-PLAN.md) defines the KCT review slice. Phase 1 provides configuration-driven KCT/PADS KRA-level fixtures for no history, limited history, sufficient history and invalid data. Phase 2 now presents those fixtures, selects scenarios, creates the latest-cycle holdout and blocks unsafe features through the shared UI/API contract. Detailed KPI scoring-band conversion, persistent organization configuration, established algorithm candidates, model evaluation, approval/publication, sandbox and employee view remain planned.

The planned sequence is:

1. Obtain KCT KRA/KPI, scoring, role, cycle, and checkpoint definitions.
2. **Implemented foundation:** create reproducible synthetic KCT fixtures for no-history, limited-history, sufficient-history, and invalid-data cases. Current fixtures use KRA-level role caps; detailed current KPI policy conversion remains open.
3. **Implemented backend gate:** validate synthetic snapshots, select Scenario A/B/C, produce a time-based split and block target/identity/generator leakage.
4. **Implemented prototype screens:** configure generation, generate all four scenarios, preview/filter/download them and display the shared readiness result.
5. Build the rule-based estimate, training, evaluation, approval, test, publication, employee dashboard and basic retraining screens.
6. Evaluate established candidate algorithms through time-based holdout testing rather than selecting one before the data contract exists.
7. Stabilize prediction before beginning the Recommendation Framework.

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
