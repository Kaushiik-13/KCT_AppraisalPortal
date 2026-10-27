# Feature history

This is a development summary, not a version-control commit log. The package remains `0.1.0`; no release/deployment is implied.

## 27 October 2026 — Simplified Publication verification

Removed the simulated Scopus/Web of Science check and automatic index-based points from the new Publication plugin flow. The new 10-step flow checks DOI/Crossref data, PDF consistency, first authorship, assessment dates, and local duplicate candidates before appraiser review. Scoring is left to the institution's own policy. The former 12-step template remains available to restored drafts. Live index integrations remain deferred until authorized institutional access and approved use are available.

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
