# Design decisions and open questions

These records summarize accepted conversation choices and implemented behavior; they are not signed institutional approvals.

| ID | Decision | Reason / consequence |
|---|---|---|
| D-01 | Build Framework Studio first | Test workflow creation before the full appraisal platform |
| D-02 | Use no persistent database in the PoC | Faster experimentation; browser draft only, session reviews |
| D-03 | Support dynamic forms and reusable blocks | Allow different institutions/KPIs to compose workflows |
| D-04 | Use a tree/DAG canvas with simple insertion | Clear hierarchy, shared later steps, no cycles |
| D-05 | Keep the publication example optional | Complex reference case without forcing every KPI into it |
| D-06 | Legacy publication auto-scoring was limited to first-listed author | Other-author and corresponding-author rules need agreement; the new Publication workflow leaves scoring institution-specific |
| D-07 | Mock index verification was used in the original template | Demonstrated the legacy workflow without claiming provider integration; superseded for new workflows by D-21 |
| D-08 | Use OpenRouter free routing for live AI | User-selected provider; no paid fallback configured |
| D-09 | Let creators configure AI purpose per node | Summary on clear paths and analysis on uncertain paths |
| D-10 | Keep deterministic scoring and recorded review separate from AI generation | AI text does not directly mutate marks or evidence |
| D-11 | Save named standalone policy versions | Draft edits must not alter earlier test snapshots |
| D-12 | Keep two scoring paths temporarily | Preserve existing publication behavior while generalizing the builder |
| D-13 | Desktop first, compact canvas | Mobile excluded; collapsible navigation and reduced chrome |
| D-16 | Use Next.js App Router for deployment readiness | Preserve the browser workflow engine behind a client-only boundary; expose AI through Node route handlers and keep secrets server-side |
| D-24 | Make prediction readiness a strict, configurable gate | Select Scenario A/B/C from compatible completed cases and cycles; block invalid/leaking data before training |
| D-26 | Keep prototype training local, reproducible and baseline-gated | Compare established candidates on the latest-cycle holdout; do not persist or publish a model yet |
| D-27 | Use explicit, scope-compatible prototype model governance | Keep artifacts server-side, require one-way approval/publication, supersede instead of delete, and keep prediction advisory |
| D-28 | Separate employee inference from retraining eligibility | Refresh verified progress with the active model; count labels only after cycle closure and final approval; never auto-replace the active model |

## Unresolved domain questions

- The reported workbook co-author rule conflict: all co-authors at 50% versus second at 50% and third at 25%.
- Corresponding author versus list-position precedence and evidence requirements.
- SAE meaning/treatment in the institutional KPI, including whether it is a publication category rather than an index.
- Publication date precedence: online, print, issued, accepted; treatment of conflicting dates.
- Whether indexing evidence must be paper-level, journal-level, or both, and at which date.
- Eligibility of specific publication/document types, including the methodology guideline used as the fixture.
- Cycle-level score caps, repeat submissions across cycles, and legitimate co-author submissions.

## Unresolved product/technical decisions

Canonical durable final-score records; policy release governance; reviewer permissions; evidence trust levels; multi-tenant model; durable review/job infrastructure; integration provider contracts; import/migration behavior; plugin installation/security.

Resolve these with the project owner and institutional stakeholders before presenting the PoC's defaults as policy authority.

## AI response allowance — 5 October 2026

Use 4,096 completion tokens and low reasoning effort on the free router. Exclude reasoning text, reject length-limited answers, and retain safe response metadata. Keep existing timeouts and manual retry; no paid fallback. This addresses a reproduced successful HTTP response with no final answer at the earlier 900-token limit.

## D-14 — Built-in plugins and reusable actions

Publication is offered through a Plugin block/modal; legacy IDs stay compatible. General actions expose configurable typed outputs and verification checks. The initial generic extractor is deterministic label-based extraction, not an AI/OCR promise. Public external lookup runs in the browser; authenticated integration/installation remains planned. An explicit scoring step uses saved policy versions before final outcome.

## D-15 — Full document text and explicit evaluation context

Expose extracted PDF text and pages without requiring labelled fields. Preserve page/coverage warnings; all-unreadable PDFs yield null text. Support named additional AI inputs and separate creator reference material. Replace the 2,000-character string clipping with a 100,000-character combined budget and refuse truncated evaluation. Chunking/OCR and web-search integration remain separate work.

## D-16 — Next.js migration and Vercel boundary

Use Next.js 16 App Router as the application host. Keep the existing Framework Studio, workflow engine, PDF processing and autosave in a client-only boundary because they depend on browser APIs and browser-owned state. Use Node route handlers for AI status and provider calls. Copy the PDF.js worker into `public/` during development/build instead of relying on a bundler URL import. This establishes deployment compatibility; it does not add a database, authentication, distributed rate limiting or a production deployment.

## D-17 — Evidence-first Framework Studio vocabulary

Replace the four creator-facing typed Read actions with one `use_form_value` mapping action. Replace the PDF-only generic extractor and single-pair comparator with `extract_evidence` and `compare_evidence`; preserve legacy IDs only for saved-draft compatibility. Remove generic External lookup from the new catalogue until a connector/MCP contract can own authentication, secrets, permissions, schemas, retries and timeouts.

Extraction produces candidates, not verification. Common evidence output carries format-specific page/slide/sheet locations, warnings, confidence and `verified:false`. Missing comparison operands produce `unknown`, not `mismatch`. AI is named evaluation, accepts multiple inputs plus rubric, and may expose validated JSON-schema fields. It remains advisory. The evidence-package portion of this decision remains current; D-18 supersedes its original routed generic-review behavior.

## D-18 — Policy-first manual composition and terminal review

Order KPI creation as Inputs → Scoring policy → Workflow. Add formula policies composed of arbitrary organization-defined numeric components, required/optional status, weights, sum/average/weighted-average aggregation, and an optional cap. Save the source-independent policy first; Apply scoring policy then exposes those component IDs as numeric ports so the creator can manually map any earlier workflow outputs. This supports repeated evidence evaluation without embedding a two-document or faculty-specific assumption.

For new generic workflows, Human review is an optional terminal handoff rather than an approval branch. It ends automation and sends the complete execution package to a separate module. Keep routed generic review resumption only for old saved drafts and keep the specialized publication review unchanged for compatibility.

## D-19 — Organization-scoped Prediction Framework

Plan prediction as a framework that organizations configure around their own versioned appraisal cycles, roles, scoring policies, and verified checkpoint data. The first target is only the final approved overall score. Prediction remains advisory and cannot change verified evidence or the official score.

Use three readiness modes: a transparent rule-based estimate when usable completed history is absent, an evaluated limited-data model with explicit low confidence when evidence is sparse, and an approved organization-specific model when sufficient compatible data passes time-based accuracy, interval, stability, and subgroup checks. Current-cycle data is used for inference and checkpoint capture; it becomes labelled training data only after cycle closure and final approval.

AFPI owns ingestion, readiness, feature safety, candidate comparison, approval, publication, monitoring, and fallback. Do not invent a custom ML algorithm for the prototype. Evaluate established baseline, linear, and tree candidates after the KCT data contract and synthetic fixtures exist, then choose the simplest candidate that beats transparent baselines. Model publication and future retraining require explicit administrator approval.

## D-20 — Add Publication as a complete workflow

The original complete template added twelve connected steps, including simulated index evidence and index-based scoring. Superseded for new workflows by D-21. The original graph remains available for saved-draft compatibility. Replacement still requires confirmation and can be undone.

## D-21 — Keep Publication usable without index-provider access

For new workflows, check DOI/Crossref metadata, PDF consistency, first authorship, assessment period, and local duplicate candidates. Clear findings run the selected saved scoring policy; Needs review and Ineligible bypass scoring. All three routes converge at one Appraiser review node. Exclude mock Scopus/Web of Science results and AI evaluation from the template. Keep older index/AI/scoring nodes readable for saved-draft compatibility. Consider live index adapters only after institutional entitlement and approved use are confirmed.

## D-22 — Route Publication outcomes through scoring and one review node

Remove AI evaluation from the new Publication template. The Clear branch applies the selected saved scoring policy and passes its provisional score to Appraiser review. Needs review and Ineligible skip scoring and join that same review node, with the outcome and reasons shown to the appraiser. Do not invent point values; a missing or unmatched saved policy remains setup-required or pending.

## D-23 — PADS TL-1 reference fixture

Use `TL-1 Teaching Pedagogy & Content Preparation` as the single initial-KPI verification row because it has a complete three-band rule set and an 8-point maximum. Treat `> 85` as 85 and above for integer percentages, but record this as an unapproved mapping question. Extract the synthetic percentage from a deliberate `Teaching score: <number>` line; this is a test convention, not an institutional evidence format. Keep the workflow terminal at Appraiser review with no decision branches. Commit only synthetic artifacts and screenshots, not the 59-row local set or any personal data. Scope excludes min/max validation, other KPIs, KRA totals, role caps, and mandatory eligibility; a related review-package defect is tracked separately rather than expanded into this deliverable.

## D-24 — Commit and automate the 59-row PADS policy set

Promote the 59 local saved drafts and their 201 expected cases verified through the UI on 29 October 2026 into committed reference fixtures under `public/samples/pads/kpis/`, with `cases.json`, a workbook-derived `index.json`, and a README load procedure. This supersedes the D-23 instruction to keep the 59-row set out of the repository: without it, the only coverage lived in ignored artifacts and could not regress. Verify through `runWorkflow` in `src/padsAllKpis.test.js` rather than 59 stored screenshots, so all 201 cases are re-executed on every `npm test`; one prior RD-12 screenshot is kept as visual evidence only. Keep the five institutional rows 173-177 out of scope and record what PADS leaves undefined and what AFPI would need (1-5 institutional score field, duty/role eligibility, evidence or notes, supervisor or panel review, one claim per duty per period, audit history, aggregation). Keep full PADS aggregation, KRA weights, role maxima, the 200-point cap, mandatory eligibility, and dual self/supervisor scores out of scope. Fixtures remain reference-only: they are a working interpretation, not institutional approval, and contain no personal data.

## D-25 — End-to-end synthetic prediction review prototype

Deliver the first Prediction Framework review as a complete local demonstration rather than configuration-only screens. The path covers eight synthetic-dataset decisions, seeded PADS-aware generation, readiness, time-based splitting, established candidate training, held-out testing, simulated approval/publication, a prediction sandbox, and a simulated employee view.

Use generic configuration and stable IDs so KCT/PADS remains the first fixture rather than hard-coded application behavior. Generate final targets through the configured scoring policy and future synthetic achievements. Use established scikit-learn regressors behind a local prototype service instead of implementing new ML mathematics. Treat every resulting metric and model as synthetic demonstration evidence, not real institutional accuracy.

## D-24 — Configurable prediction readiness and strict leakage gate

Implement readiness before model training. Validate synthetic provenance, organization/policy/framework compatibility, canonical keys, score/date/role/KRA contracts, target timing and cumulative checkpoint order. Return stable block/warning codes instead of silently repairing invalid training rows.

Use completed employee-cycles—not checkpoint-row count—to select readiness. Scenario A has no completed history and permits only the transparent rule-based path. Scenario B has limited compatible history and remains low confidence. Scenario C meets configurable sufficient-history defaults. The committed 20-case/two-cycle and 200-case/four-cycle bands are synthetic demonstration settings, not production policy.

Hold out the latest completed cycle, keep each employee-cycle in one partition, fit later preprocessing on training data only, and exclude targets, target timing, identities, split metadata and generator-only labels from inputs. Readiness permits training or fallback; it does not approve, publish or claim model quality.

## D-25 — Thin Prediction Studio over shared generation and readiness contracts

Implement the first three prototype screens as a separate `/prediction` module linked from Framework Studio. The browser owns only editable generation choices, the current generated response, preview filters and the latest readiness result. Server routes own bounded generation and the canonical readiness decision; React components must not copy validation or scenario-selection rules.

Generate all four scenarios together, keep them in memory, and allow complete CSV plus metadata download. Preview filters never alter the frozen snapshot evaluated by readiness. Keep KCT/PADS organization and policy terms in versioned configuration rather than UI components. This is a demonstrable data-preparation layer, not model training, approval or real-data ingestion.

## D-26 — Local established-candidate training with transparent gates

Implement screens 4–5 with a Node route that reruns canonical readiness and creates the checkpoint-safe matrix before invoking an isolated local Python/scikit-learn provider. Fit imputation, encoding and scaling only on earlier-cycle training rows; evaluate the latest completed cycle. Compare Ridge, Random Forest and Gradient Boosting with pace projection and role-plus-checkpoint median baselines using a fixed seed.

Recommend a candidate only when its held-out MAE beats both baselines and its clamped outputs remain in the configured score range. Record metrics, parameters, counts, feature/split contracts and checksums in the in-memory response. Do not persist, approve, publish or use the fitted pipeline for inference in this phase. Every metric remains synthetic demonstration evidence.

## D-27 — Explicit prototype governance and read-only inference

Register successful fitted pipelines only in server process memory and return public metadata without the serialized artifact. Permit approval only for the recommendation-eligible candidate, require an authenticated production replacement later, and make prototype approval/rejection final. Publication is a separate action that requires the exact organization, target, policy and framework scope. A newer compatible publication supersedes the prior record rather than deleting it; only one is active per scope.

Inference always revalidates the selected synthetic history and active checkpoint. Scenario A uses the transparent pace rule without a model. Scenario B uses a compatible published model when available and otherwise a low-confidence transparent fallback. Scenario C requires the compatible approved and published organization model. Return score, empirical/transparent range, method, confidence, factors, versions and warnings, but never mutate verified evidence or the official appraisal score. The in-process registry, simulated reviewer and pickle artifact are local-review constraints, not a production storage/security design.

## D-28 — Employee inference and retraining remain separate

Show one simulated employee the latest advisory result after a sandbox selection. A newer verified checkpoint calls the same inference contract again with the active compatible model; it does not call training, create a label or change the official score. Keep the active published model available while a later candidate is configured, trained and evaluated.

Treat manual, cycle-close and periodic choices as retraining-eligibility triggers, not automatic training schedules. Active-cycle checkpoints never count as labels. A completed-cycle row becomes eligible only after the cycle closes and its final outcome is approved. Minimum new-case/cycle thresholds must also pass. Readiness cannot publish: evaluation, explicit approval and publication remain mandatory. The current screen is a session-only review simulation, not a durable scheduler, monitoring service or access-control boundary.
