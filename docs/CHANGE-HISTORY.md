# Feature history

This is a development summary, not a version-control commit log. The package remains `0.1.0`; no release/deployment is implied.

## 30 October 2026 — Employee prediction and retraining readiness

Implemented Prediction Studio screens 9–10 and Phase 5. The employee view is scoped to one simulated sandbox selection and shows current/predicted scores, range, time, KRA progress, factors and versions. New verified progress refreshes inference without refitting or changing the active model/run or official score. Retraining settings demonstrate manual, cycle-close and periodic checks, exclude active-cycle rows from labels, require both cycle closure and final outcome approval, apply new-case/cycle thresholds and keep evaluation/approval/publication mandatory. Added a complete review script, helper coverage and documentation; settings and identity remain session-only synthetic demonstrations.
## 30 October 2026 — PADS 59-KPI committed fixtures and automated suite

Committed the 59 individual-KPI policies that had only existed as ignored local artifacts, plus their 201 expected scoring cases, as reference fixtures in `public/samples/pads/kpis/`: one saved draft per row (`tl-1` … `ec-2`), `cases.json` (59 groups, 201 cases), `index.json` (KPI id → workbook row, Sl No, fields, case count, expected-point set, with the excluded institutional rows and the reason), and `README.md` with the localStorage load procedure. New `src/padsAllKpis.test.js` runs every case through `runWorkflow` with `extract: null` and asserts `completed`, `scored`, and the exact points, checks each fixture's ordered `{id, type}` fields against its case group, and checks every policy is enabled: focused file 60/60, full suite 167/167, production build passed. Workbook rows 173–177 (institutional 5-point duties) are intentionally excluded; the PADS gap and the AFPI requirements are recorded in `index.json`, the sample README, the test header, and the new [PADS individual KPI verification](PADS-INDIVIDUAL-KPIS.md) document, which also carries the 59-row source map, limits, and one prior RD-12 screenshot. Updated `TESTING.md`, `ROADMAP.md`, `DECISIONS.md` (D-24), `SECURITY-AND-DATA.md`, `docs/README.md`, the root `README.md`, the sample notes, and the TL-1 walkthrough link. No application behavior, schema, scoring, or UI change.

## 30 October 2026 — PADS TL-1 initial-KPI verification

Added a committed, reference-only end-to-end fixture for `TL-1 Teaching Pedagogy & Content Preparation` from `public/samples/PADS.xlsx`: a saved-draft configuration, two synthetic PDFs (clear and unreadable), one invalid-format text file, five focused engine tests, four browser screenshots, and a [verification walkthrough](PADS-TL1-WALKTHROUGH.md). The clear path scored 8/8 and reached a terminal Appraiser handoff; band boundaries, missing/invalid inputs, and uncertain evidence were exercised. Full suite: 107/107; production build passed. No application behavior changed. Scope is one reference-only KPI; full PADS aggregation, role caps, mandatory eligibility, and independent creator usability remain open. A review-package defect found during the test was filed as [#17](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/17) instead of being fixed in this verification change.

## 29 October 2026 — PADS individual-KPI verification

Loaded 59 of the 64 KPI rows from `public/samples/PADS.xlsx` into Framework Studio as saved `v1` rules policies and ran 201 expected-versus-actual checks through Test & review: all matched, including each award tier and zero/below-threshold fallbacks. The five optional institutional-contribution rows use a separate 5-point supervisor scale and were not built. RD-6 uses 15 enumerated submitted/presented combinations because formula mode cannot express `6 × submitted + 4 × presented`; RD-12 is capped at 30. Supplementary edge checks confirmed required-field blocking, pending review for missing evidence, and human-review handoff. A negative percentage is accepted and scores 0 through the zero fallback; no range validation was observed. No application behavior changed. This verifies individual KPI rules only: KRA totals/role maxima, the 200-point cap, mandatory PADS eligibility, self/appraiser dual scores, descriptive review, the institutional rows and several KPI eligibility/multi-event nuances remain unimplemented or simplified. Institutional approval and independent creator usability remain unverified.


## 29 October 2026 — Prediction prototype delivery planning

Added an implementation-ready plan for the KCT/PADS synthetic prediction review prototype. It refines the eight dataset decisions, policy-aware seeded generation, scenario sizes, canonical fields, time-based split, established scikit-learn candidates, model gates, ten-screen review flow, local prototype service boundary, project structure, API contracts, phases, verification and demonstration script. No dataset, application code, model or prediction screen was implemented by this documentation change.

Implemented the first dataset foundation after that plan: a versioned KCT/PADS reference configuration, deterministic generator, 40 active snapshots, 60 limited-history faculty-cycles, 240 sufficient-history faculty-cycles, controlled invalid cases, generation metadata/checksums and a review workbook. Added the canonical data dictionary and seven automated generator tests. The fixtures operate at KRA level; detailed current KPI scoring-band conversion, readiness, model training and prediction remain unimplemented.

Completed the dataset-foundation integration review. The review found no blocking fixture-contract defect, added automated proof that a different seed changes synthetic values without changing scenario contracts, and corrected the audit's repository status after the branch was pushed. The PADS mapping remains explicitly limited to the synthetic KRA-level prototype pending current institutional policy confirmation.

Implemented the prediction readiness backend: canonical row validation, stable block/warning codes, configurable Scenario A/B/C selection, completed-case counting, latest-cycle holdout, employee-cycle grouping, checkpoint-safe feature selection and a raw train/test matrix contract. Added the no-store same-origin readiness API and expected outcomes for all four synthetic fixtures. Readiness UI, model training and inference remain planned.

Implemented Prediction Studio screens 1–3 at `/prediction`: lifecycle overview, the eight synthetic-data decisions, deterministic generation/regeneration, four-scenario tabs, table filters, complete CSV/metadata downloads and the shared readiness report. Added a bounded same-origin generation route and kept KCT/PADS terms in fixture configuration. Browser verification covered Scenario A, Scenario C, blocked invalid data and role filtering. Model training, approval and inference remain planned.

Implemented Prediction Studio screens 4–5 and Phase 3: fixed-target model configuration, checkpoint-safe feature/candidate selection, reproducibility seed, server-side readiness recheck, local Python/scikit-learn provider, train-only preprocessing, pace and grouped-median baselines, Ridge/Random Forest/Gradient Boosting candidates, held-out MAE/RMSE/nMAE/R²/range evidence, and a recommendation gate that must beat both baselines. Results are synthetic and in memory; approval, persistence, publication and inference remain planned.

Implemented Prediction Studio screens 6–8 and Phase 4: private server-side candidate artifacts, immutable model metadata, recommendation-gated approval/rejection, explicit scope-compatible publication, superseded-version retention, rule-based Scenario A, Scenario B model/fallback behavior, strict Scenario C published-model requirement, invalid-history blocking, empirical ranges, factors, versions and advisory safeguards. Added lifecycle and prediction routes plus registry/inference coverage. The registry is process-memory only, reviewer identity is simulated, and all results remain synthetic.

## 28 October 2026 — Publication scoring and shared review routes

Removed AI evaluation from the new Publication template. Clear now runs the selected saved scoring policy and passes its provisional score into Appraiser review. Needs review and Ineligible bypass scoring; all three outcomes converge on the same review node, where the outcome and reasons are displayed. An unconfigured scoring Action requires a saved policy selection; no institutional point values are supplied by the template.

## 27 October 2026 — Simplified Publication verification

Removed the simulated Scopus/Web of Science check and automatic index-based points from the new Publication plugin flow. The new 10-step flow checks DOI/Crossref data, PDF consistency, first authorship, assessment dates, and local duplicate candidates. Clear outcomes run the institution's selected saved scoring policy; Needs review and Ineligible bypass scoring. All three routes converge at one Appraiser review node. The former 12-step template remains available to restored drafts. Live index integrations remain deferred until authorized institutional access and approved use are available.

The first local setup screen exposed one leftover required Index mapping on the decision node. The new template now excludes that input from its decision contract while retaining it for older workflows.

## 27 October 2026 — One-click Publication workflow

Updated the Plugin picker so choosing Publication adds the complete connected twelve-step workflow, with publication operations represented as plugin nodes. Form fields and earlier outputs are mapped when available. Replacing a populated workflow requires confirmation, and canvas Undo restores the previous graph. Added coverage for generated plugin wrappers and suggested mappings, plus user and technical guidance. The local UI run with the included PRISMA paper reached appraiser review with 24 provisional points from simulated index evidence.

## 27 October 2026 — Prediction Framework planning

Added a detailed, explicitly unimplemented plan for an organization-scoped final-overall-score Prediction Framework. The plan aligns model preparation and live inference with the review architecture, defines no-history, limited-history, and sufficient-history behavior, and specifies synthetic KCT data, screens, data contracts, project structure, algorithm evaluation, approval, publishing, dashboard integration, monitoring, retraining, testing, and phased delivery.

Recorded the decision to build AFPI's configurable prediction lifecycle while evaluating established algorithms instead of inventing a custom ML algorithm. No prediction code, dataset, model, screen, API, or runtime behavior was delivered by this documentation change.

## 7 October 2026 — Evidence-first Framework Studio

Replaced the four typed Read catalogue entries with Use form value and removed generic External lookup from new workflows. Added common PDF/PPTX/XLS/XLSX evidence extraction with fields/content/both modes, format-specific locations, warnings and explicitly unverified candidates. Added multi-pair Compare evidence with match/mismatch/unknown results.

Renamed AI assistance to AI evaluation, retained multi-input/rubric support, and added optional object JSON-schema validation with typed fields available to Conditions. Input fields now support example values. Legacy tool IDs remain readable for existing browser drafts.

Reordered KPI authoring to Inputs → Scoring policy → Workflow. Formula policies now accept any number of organization-defined numeric components with required/optional status, weights, sum/average/weighted-average aggregation, and an optional cap. Apply scoring policy exposes those components as ports for manual mapping, so repeated content evaluations are composable without a KPI-specific block. New generic Human Review nodes are terminal handoffs to a separate module with the complete run package and no approve/reject/clarification branches; older routed review drafts remain compatible.

1. Built the dynamic input form and the publication extraction/verification/scoring/review example.
2. Added browser draft autosave and recovery; kept submission evidence and decisions session-only.
3. Replaced the dense workflow editor with a tree canvas, insertion points, drag movement, zoom, undo, and selected settings.
4. Added reusable blocks and general typed tools; retained publication adapters.
5. Enabled generic execution, condition routes, human-review continuation, and named Results.
6. Added the standalone scoring section, ordered rules, caps, saved versions, and calculation snapshots.
7. Added preflight guidance and shared branch connections; checked training and publication workflows.
8. Generalized AI inputs and system instructions; removed the uncertain-only endpoint restriction; verified live response chaining.
9. Simplified the workflow header, added remembered sidebar collapse, and removed the workspace/help cards.
10. Added confirmed Clear saved draft, retaining sidebar preference.
11. Added this documentation set, with explicit implementation/roadmap boundaries.

Historical evidence: [Phase 6 verification](../PHASE-6-VERIFICATION.md). Current verification overview: [Testing](TESTING.md).

## 5 October 2026 — AI empty-response fix

Raised the free-model response budget from 900 to 4,096 tokens and requested low reasoning effort. Empty/length-limited responses now preserve model diagnostics and show actionable errors; incomplete answers are not accepted. Verified with a live request, 76 tests and production build.

## 5 October 2026 — Publication plugin and reusable tools

Added Plugin below Result with a Publication operation picker. General Actions now offer configurable document extraction, value comparison, date range, duplicate checks, public JSON lookup, AI and saved-policy scoring. Existing publication nodes stay compatible. New drafts use Untitled KPI.

## 5 October 2026 — Document relevance evaluation

Added full-text/page outputs, optional labelled extraction, additional AI inputs, and creator rubric/reference material. Increased text allowance and reject oversize inputs before model calls, preventing a partial document being treated as complete. Added content relevance guide.

## 6 October 2026 — Next.js migration

Replaced the Vite host with Next.js 16 App Router while retaining the existing client-side Framework Studio and browser autosave behavior. Added Node route handlers for AI status/assistance, reverse-proxy-aware same-origin checks, automated PDF worker preparation and a Node engine requirement. The local production build, rendered interface, PDF worker and live OpenRouter route were verified. Vercel deployment was prepared but not performed.
