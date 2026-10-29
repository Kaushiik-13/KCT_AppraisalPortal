# Testing and acceptance

## Commands

```powershell
npm.cmd test
npm.cmd run test:prediction-ml
npm.cmd run build
```

## Publication simplification — implementation status

The current Publication plugin has ten steps, no simulated index or AI node, a Clear-only scoring Action, and one shared Appraiser review target for all three outcomes. Regression assertions check route convergence, saved-policy selection, score mapping into review, and setup validation. All 102 automated tests and the production build passed on 28 October 2026. `git diff --check` passed; historical reports below cover earlier versions.

Tests use Node's built-in test runner over `src/*.test.js` and `server/*.test.js`. A passing build verifies bundling, not browser behavior. There is no lint script or committed full browser automation suite.

Most recent automated baseline: **131 passing JavaScript tests plus 4 passing Python tests** on 29 October 2026 after Prediction Studio screens 4–5 and the local training provider. The 124-test screens 1–3 result, 120-test readiness result, 110-test dataset-integration result, 109-test dataset-foundation result, 102-test reports from 27–28 October, 101-test report from 7 October, and earlier [Phase 6 report](../PHASE-6-VERIFICATION.md) remain historical checkpoints.

## Prediction model configuration and comparison — 29 October 2026

Seven new JavaScript tests cover fixed-target/configuration validation, leakage rejection, candidate/seed/readiness/split guards, server-side readiness recomputation, completed-only time-split matrix construction, deterministic run identity, safe provider errors, output parsing and a real Node-to-Python Ridge integration. Four Python tests cover both baselines and all three candidate metrics, baseline-only inputs, configured-range evidence, deterministic metrics/recommendation for the same seed, and unsupported-candidate rejection.

`npm.cmd test` passed all **131 JavaScript tests**. `npm.cmd run test:prediction-ml` passed all **4 Python tests**. `npm.cmd run build` passed with Next.js 16.3.8 and included dynamic `/api/prediction/training`. The React quality review found components declared at module scope, no new effects or dependency arrays, labelled controls/fieldsets, disabled-state guards and no large new client library.

A local browser walkthrough generated the default 1,252 synthetic rows, confirmed Scenario C and its 2022–25 training/2025–26 holdout split, opened Screen 4, reviewed ten selected checkpoint-safe inputs plus three candidates, and completed Screen 5. The default synthetic run recommended Random Forest with MAE 9.60 after it beat pace MAE 20.83 and grouped-median MAE 24.38; Ridge and Gradient Boosting also completed. The screen showed RMSE, nMAE, R², residual ranges, seed, counts and parameters. This is one deterministic synthetic demonstration, not evidence of real KCT performance.

The local provider requires Python/scikit-learn and is not packaged as a production Vercel training service. No approval, model artifact persistence, inference endpoint, subgroup/fairness validation, real employee data, download click or deployed training run was tested.

## Prediction Studio screens 1–3 — 29 October 2026

Four generation-route tests cover validated configuration bounds, derived cycle/checkpoint settings, deterministic all-scenario output, useful setting errors, same-origin enforcement, JSON requirements and body limits. `npm.cmd test` passed all **124 tests**. `npm.cmd run build` passed with Next.js 16.3.8 and produced static `/prediction` plus the dynamic generation and readiness endpoints.

A local browser walkthrough opened the overview, reviewed all eight decisions, generated 1,252 rows across four scenarios, and displayed the sufficient-history latest-cycle split. Switching to no history produced Scenario A with a rule-based estimate and blocked model training. Invalid history produced a blocked result with named findings. A role filter reduced the preview from 12 to 6 matching rows without changing the readiness result. Server requests returned HTTP 200. Downloads were not clicked during this walkthrough; serialization remains covered by automated tests.

These checks demonstrate synthetic prototype behavior only. They do not train a model, validate prediction accuracy or authorize real employee data.

## Prediction readiness backend — 29 October 2026

Ten new tests cover the no-history, limited-history, sufficient-history and controlled-invalid expectations; completed-case versus checkpoint-row counting; latest-cycle splitting; target/generator/identity leakage rejection; one-cycle fallback; checkpoint-safe matrix grouping; KRA feature contracts; API request validation; blocked responses; same-origin enforcement and body limits.

`npm.cmd test` passed all **120 tests**. `npm.cmd run build` completed successfully with Next.js 16.3.8 and included the dynamic `/api/prediction/datasets/readiness` route. The readiness work does not include a browser screen, trained model, inference endpoint or real employee data; no accuracy claim was tested.

## Synthetic prediction dataset foundation — 29 October 2026

`npm.cmd run generate:prediction-data` created the no-history, limited-history, sufficient-history and invalid CSV fixtures plus active-snapshot and generation-report JSON. The clean fixtures contain 40 current rows, 240 limited-history checkpoint rows (60 completed faculty-cycles) and 960 sufficient-history checkpoint rows (240 completed faculty-cycles). The invalid fixture contains 12 controlled rows covering ten named defect types.

Seven initial automated tests verify PADS role/KRA cap completeness, seed determinism, planned scenario sizes, cumulative/capped progress, absence of active-cycle targets, clean canonical-key uniqueness, invalid-case coverage and CSV shape. The integration review added an eighth generator test proving that a changed seed alters synthetic content while preserving scenario sizes and provenance. `npm.cmd test` passed all **110 tests**. `npm.cmd run build` completed successfully with Next.js 16.3.8. Generated-file SHA-256 values matched `generation-report.json`; the combined review workbook's Overview and each dataset sheet were rendered and inspected.

These checks validate fixture and software behavior only. They do not validate real KCT prediction accuracy or the complete current KPI policy.

## Prediction prototype planning verification — 29 October 2026

The implementation-ready prototype plan was checked for local Markdown links, project-boundary consistency and whitespace. This was a documentation-only change: no synthetic dataset, application code, Python service, trained model, API or screen was implemented, so automated application tests and the production build were not rerun for this planning update.

## Publication workflow picker verification — 27 October 2026

All 102 automated tests passed, including a new case that verifies the complete Publication plugin workflow has twelve nodes, wraps all ten publication operations, suggests mappings for the sample form fields, retains the simulated index record, and remains a valid saved draft. `npm.cmd run build` passed.

An isolated local browser origin verified that Plugin → Publication workflow adds all twelve steps at once. With the publication example inputs loaded, every step showed configured. The populated-workflow confirmation appeared; cancelling retained the current graph, and confirming replacement followed by Undo restored the prior named trigger. Running the included PRISMA sample completed eleven of twelve steps (AI evaluation was correctly skipped on the clear path) and reached Appraiser review with 24 provisional points using mock index evidence. This was an internal sample run, not a factual Scopus/Web of Science check.

## Prediction Framework planning verification — 27 October 2026

Validated local links in the new Prediction Framework plan and all documentation files changed by that planning update. Both JSON examples in the plan parsed successfully, and `git diff --check` reported no whitespace errors. No application code, synthetic dataset, model, API, or screen was implemented, so the automated test and production-build baselines were not rerun for this documentation-only change.

## Coverage map

| Suite | Main coverage |
|---|---|
| `draftStorage.test.js` | Autosave schema, recovery, excluded runtime values, storage errors |
| `treeModel.test.js` | Insert, move, remove, cycles, branch/shared layout |
| `blocks.test.js` | Generic block configuration and compatibility |
| `blockExecution.test.js` | Branch values, review continuation, preflight, post-review failure |
| `reusableTools.test.js` | Generic tools, Publication plugin compatibility, full Publication workflow creation and suggested mappings |
| `workflowEngine.test.js` | Publication checks, scores, errors, review restrictions |
| `paperFindings.test.js` | Extraction candidate analysis and PDF fixture cases |
| `scoringPolicy.test.js` | Version snapshots, conditional rules, arbitrary formula components, aggregations, caps, missing evidence, and manual workflow mappings |
| `aiWorkflow.test.js` | Generic inputs, instructions, response chaining, old drafts |
| `frameworkStudio.test.js` | New catalogue, form-value mapping, evidence candidates/locations, comparison states, AI schema validation, Office adapters, and terminal review packages |
| `server/ai.test.js` | Provider adapter, bounds, prompt separation, endpoint responses |
| `server/nextAiRoute.test.js` | Next route validation, forwarded origin handling, status secrecy, payload limits |

Automated provider tests inject responses. They do not establish live indexing or guarantee future Crossref/OpenRouter availability.

## Manual acceptance checklist

Use an isolated profile/session so testing does not replace a user's only draft.

1. **Inputs:** add each needed type; preview required/optional behavior; rename and reorder without losing mappings.
2. **Builder:** add by + and drag/drop; open/close settings; move a linear action; connect a shared result; reject a cycle; inspect orphaned work after removal.
3. **Preflight:** leave a required mapping or comparison blank; verify the test is blocked and Edit step opens its settings.
4. **Training:** follow [the walkthrough](TRAINING-KPI.md); test 8, 7, zero, blank, and the optional terminal review handoff.
5. **Publication:** follow [the walkthrough](PUBLICATION-KPI.md); verify one-click 10-step workflow insertion, replacement confirmation/undo, sample extraction, Crossref response, first-author/date findings, clear → saved policy → shared review, needs-review/ineligible → shared review without scoring, and repeat-submission uncertainty. Confirm no AI or Scopus/Web of Science step appears in the new plugin.
6. **Scoring:** save v1, edit only its draft, verify v1 unchanged; save v2; switch back; test cap and pending fallback.
7. **AI:** test simulation, missing input, and live custom instructions if configured; check an ordinary/clear-path input and response chaining. Never treat simulated output as generation.
8. **Persistence:** reload fields, mappings, instructions and versions; verify file/value/review loss is explicit.
9. **Reset:** cancel Clear saved draft and verify no changes; confirm only in a disposable draft; verify blank configuration and retained sidebar preference.
10. **Layout:** collapse/restore sidebar, reload, open settings and Test & review. Check desktop overflow and browser errors.
11. **Evidence workflow:** extract a PDF, PPTX, XLS and XLSX; inspect page/slide/sheet references; confirm missing fields are unknown; compare multiple pairs; validate an AI schema; inspect the complete terminal review package.
12. **Formula scoring:** create three differently named components, map numeric outputs manually, test sum/average/weighted average, omit an optional component, and confirm a missing required component remains pending.

## Framework Studio evidence workflow verification — 7 October 2026

All 101 automated tests passed. Added coverage confirms the new catalogue hides Read and External lookup, Use form value records source/type, extraction candidates remain `verified:false`, comparison distinguishes unknown from mismatch, AI schema output is validated and exposed, XLS/XLSX and PPTX adapters preserve locations, arbitrary formula components combine manually mapped outputs, required missing components remain pending, weighted averages calculate correctly, and new Human Review nodes terminate with the complete evidence package. The existing PDF fixture and all legacy publication/training tests still pass.

The production build passed after the final code and documentation pass, producing the static `/` route and dynamic AI routes. No live OpenRouter call or full browser walkthrough was performed for this change.

## Observed browser results

Publication with real PDF extraction/live Crossref reached 24 provisional points using mock indexes. Approval created a session duplicate record; repeat submission became pending. Training paths produced 12/0/pending results and blocked stale review. Custom instructions survived reload and a live OpenRouter free model produced a two-bullet test summary which reached a Result. Sidebar and reset were verified in isolated sessions.

Screenshots under `artifacts/` are local ignored artifacts, not guaranteed portable test assets. Record new evidence when behavior changes, and update counts only after running the corresponding checks.

## AI response-budget verification — 5 October 2026

Reproduced HTTP 200 with null answer and finish_reason length at 900 tokens using the configured key. After increasing the budget and requesting low reasoning, a live free-model adapter call returned the requested five-bullet simulated-evidence summary. All 76 tests and the production build passed. Regression coverage rejects both empty and partial length-limited answers and ensures reasoning text is not returned.

The restarted local Vite endpoint also returned HTTP 200/advisory with a live free-model summary explicitly identifying simulated evidence. Documentation links and seven JSON examples validated. No browser UI changes were made for this fix.

## Plugin and reusable tools verification — 5 October 2026

83 tests passed, including publication plugin clear/uncertain/ineligible paths and legacy compatibility; dynamic PDF candidates and ambiguity; typed comparisons/date boundaries; duplicate owner distinction; public API mapping/failure; and a training extraction → saved policy → Result workflow awarding 12 points. Production build passed.

Isolated browser checks verified Plugin below Result, Publication selection and operation insertion, general-only Action options, and adding a configured extractor output. A seeded training workflow was restored and run through the UI: 8 hours compared with 8 required hours reached Eligible with no publication tools. Browser error check returned no errors. Screenshot: local ignored `artifacts/reusable-training.png`. API tests used injected responses; no live arbitrary external API or OCR coverage is claimed.

## Whole-document evaluation verification — 5 October 2026

87 tests passed. New coverage verifies final-page text survives both client preparation and provider request construction, extraction works without labelled fields, unreadable pages remain explicit, blank scanned documents do not trigger AI, named contexts/rubric reach the evaluator, and oversize inputs are blocked on client and server without provider calls.

An isolated browser workflow extracted the 15-page public sample (62,268 output characters) and sent full text plus topic/faculty and a deliberately mismatched Kubernetes rubric to live OpenRouter. The AI returned an advisory identifying the actual PRISMA topic, the mismatch, and absence of live market research; the response reached Result. No user draft was replaced. This establishes the flow, not universal model quality or OCR support.

## Next.js migration verification — 6 October 2026

All 90 tests passed. `npm.cmd run build` completed with a static `/` route and dynamic `/api/ai-status` and `/api/ai-assistance` routes. An isolated browser session rendered the Framework Studio at `127.0.0.1:5173`, exposed the three KPI sections and autosave controls, and reported no browser errors. The generated PDF worker returned HTTP 200 (1,375,838 bytes). AI status reported a configured server key without exposing it, and a live same-origin POST returned HTTP 200/advisory with the exact requested migration check text. A reverse-proxy origin regression was added after runtime verification exposed Next.js request-URL normalization. No Vercel deployment was run.
