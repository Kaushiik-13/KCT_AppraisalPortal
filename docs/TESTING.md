# Testing and acceptance

## Commands

```powershell
npm.cmd test
npm.cmd run build
```

## Publication simplification — implementation status

The current Publication plugin has ten steps, no simulated index or AI node, a Clear-only scoring Action, and one shared Appraiser review target for all three outcomes. Regression assertions check route convergence, saved-policy selection, score mapping into review, and setup validation. All 102 automated tests and the production build passed on 28 October 2026. `git diff --check` passed; historical reports below cover earlier versions.

Tests use Node's built-in test runner over `src/*.test.js` and `server/*.test.js`. A passing build verifies bundling, not browser behavior. There is no lint script or committed full browser automation suite.

Most recent automated baseline: **167 passing tests** and a successful production build on 30 October 2026 after committing the 59 individual PADS KPI fixtures and their 201 automated cases. The 27 October picker report, 101-test report from 7 October, and earlier [Phase 6 report](../PHASE-6-VERIFICATION.md) remain historical checkpoints.

## PADS TL-1 initial-KPI verification — 30 October 2026

Verified one reference KPI row, `TL-1 Teaching Pedagogy & Content Preparation`, against `public/samples/PADS.xlsx`, sheet `PADS Template`, columns `A–E` (KRA code, Sl No, KPI, Criteria, Max Points), rows 13–15. The workbook is the owner-supplied 2021 reference template; institutional approval is not verified. See the [TL-1 walkthrough](PADS-TL1-WALKTHROUGH.md) for source, mapping, boundary choice, screenshots, and reproduction steps.

The committed fixture `public/samples/pads/tl1-initial-kpi.json` defines Inputs → Scoring policy → Workflow → Test & review: required percentage and evidence, labelled extraction, a three-band rules policy with zero fallback, and a terminal Appraiser review. Synthetic evidence: `evidence-tl1-clear.pdf` (line `Teaching score: 90`), `evidence-tl1-unreadable.pdf` (no extractable text), and `evidence-tl1-invalid.txt`.

Observed results:

- Clear `90` + clear PDF: extraction candidate, **8 points**, `Eligible`, `sent-to-review`.
- Band boundaries: `85 → 8`, `84 → 6`, `75 → 6`, `74 → 4`, `65 → 4`, `64 → 0`.
- Missing score or evidence blocked execution; missing evidence did not call the extractor.
- Non-numeric score and `.txt` evidence produced validation errors.
- Unreadable PDF produced `candidate_with_warnings`, reported score **Unknown**, two warnings, provisional **8**, and `sent-to-review`.
- Role-cap and mandatory-rule checks were not applicable; TL-1 has no such rule. No approve/reject decision was recorded.

Evidence: focused tests in `src/padsInitialKpi.test.js` (5 tests) plus screenshots in `docs/assets/pads-tl1/`. Full suite: **107/107 passing**; `npm run build` completed successfully on 30 October 2026. This is individual-KPI provisional scoring only; PADS totals, role maxima, mandatory assessment eligibility, institutional approval, OCR/arbitrary evidence, and live external checks remain unverified. The open boundary question (`> 85` versus `>= 85`) and the [filed #17 review-package defect](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/17) are recorded in the walkthrough.

## PADS 59-KPI automated verification — 30 October 2026

Committed the 59 individual PADS KPI policies and their 201 expected scoring cases as reference fixtures. `public/samples/pads/kpis/` holds one saved draft per row (`tl-1` … `ec-2`), `cases.json` (59 groups, 201 `{values, expect}` cases), `index.json` (workbook row, Sl No, fields, case count and expected-point set per id, plus the excluded institutional rows), and `README.md` with the localStorage load procedure. Full description: [PADS individual KPI verification](PADS-INDIVIDUAL-KPIS.md).

`src/padsAllKpis.test.js` scores every case through `runWorkflow` with `extract: null` and asserts `status === "completed"`, `scoring.status === "scored"`, and the exact points. It also asserts each fixture's ordered `{id, type}` fields match its case group, that every fixture policy is enabled, and that `index.json` agrees with `cases.json`. No assertion accepts `pending`, `invalid`, or error states; all 201 cases matched on the first committed run.

- Focused file: **60 tests** (1 fixture-metadata test, 59 KPI tests) — 60/60 passing.
- Full suite: **167/167** passing (`npm.cmd test` from the repository root; the existing `src/*.test.js` glob picks up the new file).
- `npm.cmd run build`: successful production build.
- No UI sweep was re-run for this step; the 201 workflow executions are the behavioural proof, and the 29 October UI report below stays as the historical UI record.

Institutional rows 173–177 (`BOS coordinator/Placement Coordinator`, `NAAC criteria I Coordinator`, `MS Team Coordinator`, `Spoken Tutorial Coordinator`, `Class Advisor`) are excluded by design. PADS scores them on a 5-point supervisor scale with no Max Points, evidence fields, role eligibility, caps, or aggregation rules; the gap and what AFPI would need are recorded in `index.json.excluded.reason`, `public/samples/pads/kpis/README.md`, the test-file header, and [PADS individual KPI verification](PADS-INDIVIDUAL-KPIS.md). No test asserts an institutional score.

Limits: all 59 rows are form-value policies, so no PDF evidence, extraction comparison, or network path is exercised. Author role is Primary/Co-author only (no third-author 25% share); TL-11 scores one course; TL-12 omits the additive PhD/guideship components; role and eligibility wording (primary coordinator, RD-5 co-author, RD-12 combined conference-plus-publication, O-4's 40-attendee minimum) has no validating field; O-2/O-3/O-5/O-7/O-10 cannot reach their multi-event maxima; RD-6 uses enumerated combinations; negative values fall through the zero fallback without range validation. PADS KRA weights and totals, role maxima, the 200-point cap, mandatory assessment eligibility, dual self/supervisor scores, descriptive/overall review, HR observations, panel review, and any cross-KPI aggregation remain unimplemented.

Evidence: `public/samples/pads/kpis/`, [PADS individual KPI verification](PADS-INDIVIDUAL-KPIS.md), and the prior RD-12 zero-case screenshot `docs/assets/pads-kpis/rd-12-zero-points.png` (a 29 October UI capture, not a new walkthrough).

## Publication, extraction, duplicate and AI-mode coverage — 30 October 2026

Extends the independent creator walkthrough ([#3](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/3)) to the paths its two sessions did not cover; those two sessions and their 19 findings are recorded in the [creator walkthrough](CREATOR-WALKTHROUGH.md). Build `ebbb301`, dev server on `127.0.0.1:5173`, throwaway managed Chromium profile (no relay), Chromium only. Storage was cleared between scenarios with the browser API; every value was synthetic. No application code changed, so the automated suite was not rerun for this record. The AI modes were first exercised without a key (`GET /api/ai-status` → `{"configured":false,"model":"openrouter/free"}`); a key was then added in the gitignored `.env.local` and live generation was exercised (`configured:true`).

Scenarios and observed results:

| Scenario | Observed |
|---|---|
| Publication clear path, PRISMA sample | Crossref returned the record; extraction read 15 pages with page-1 evidence for title, DOI, journal, authors and date; comparison, first author, period and duplicates all `clear`; saved `pub-v1` scored **10 points**; Appraiser review was awaiting a decision; approving recorded a session decision and the header changed to `1 session records`. |
| Repeat submission, same DOI and faculty | Duplicate check `candidate` (1 matching prior submission) → decision `uncertain` → review, **9 of 10 steps ran**, scoring skipped, recommendation pending. |
| Seed record only, after reload | `0 session records`, draft restored, seed persisted; duplicate check `candidate`, evidence listed `Matthew J. Page · 10.1371/journal.pmed.1003583`; decision `uncertain`; scoring skipped. |
| Assessment period set to 2022 | Period `ineligible` → decision `ineligible`; scoring skipped; review showed the 0-point ineligible fallback and the decision form. |
| Crossref request aborted in the browser | Lookup `unknown`; comparison, author, period and duplicate `uncertain` → needs review; scoring skipped; no fabricated publication data. |
| Unreadable one-page PDF (`evidence-tl1-unreadable.pdf`) | Step reported `PDF read` with placeholder title `untitled`, DOI `Not found`, authors `anonymous`, dates `Not found`; comparison `uncertain` → needs review. Extraction placeholders are presented as candidates, not as unknowns ([#39](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/39)). |
| AI evaluation, simulated mode | Step status `simulated`; Result value `Simulated AI response. No model was called…`; no provider request. |
| AI evaluation, disabled mode | Step status `not-connected`; Result value `Live AI is not connected. Findings have been passed…`; workflow continued. |
| AI evaluation, OpenRouter mode without key | Step status `not-connected`; explicit `OpenRouter key is missing…`; workflow continued to Result. No fabricated advice. |
| AI evaluation, OpenRouter live (key in `.env.local`) | First attempt aborted at the 45 s server timeout and reported `AI assistance timed out. Continue with human review.`; the immediate retry returned `advisory` in ~3.1 s. Model used: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`; two bullets labelled synthetic as instructed; response text carried into the Result value. |
| Publication plugin contents | Ten steps; no AI evaluation, no simulated index or Scopus/Web of Science step. |

Also verified: the preflight rejects a scoring rule sourced from `Final workflow outcome` when no Result precedes the Apply scoring policy step, with `final outcome is unavailable before Result. Use inputs or earlier outputs.` — the correct guidance for the Publication plugin, whose clear path reaches review rather than a Result.

Wording defect seen in this pass (low): the skipped-step summary uses a plural verb for one step — `Apply scoring policy have not run on this path.` (`src/WorkflowTest.jsx:426`, [#37](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/37)).

Limits: the live free model timed out once at the 45 s server abort before succeeding on retry, so latency is provider-dependent and the rate-limit path was not exercised; OpenRouter selected a different free model for a direct key probe (`nvidia/nemotron-3.5-super-vl:free`), confirming that the routed model varies; Crossref success is live but the failure path was forced by aborting the request, not by a provider outage; no Firefox/WebKit, screen reader or colour-vision checks; one browser session, so multi-tab behaviour is unchanged from the walkthrough record. Screenshots from this pass were not committed.

## Creator walkthrough follow-up verification — 30 October 2026

Implemented the #22–#40 follow-up fixes on branch `fix/creator-walkthrough-issues`. Automated verification:

- `npm test`: **178/178 passed**.
- `npm run build`: passed (Next.js 16.3.8 production build).
- New regression coverage checks: multi-tab revision conflict and same-writer revision advance; import validation for both export shapes and rejection of unrelated JSON; optional numeric bounds in persisted drafts and runtime validation; required-field bypass for the Needs review branch; neutral new-rule defaults; duplicate workflow/policy source detection with field labels; named missing-condition-source messages; Result steps not pre-mapping unrelated fields; review-package labels and normalized `maxPoints`; and unreadable-PDF metadata placeholders staying `Not found`.

Not performed in this change: a fresh Chromium walkthrough of the responsive layout, focus ring, multi-tab banner, import controls, or the new test-only required-field toggle. The existing walkthrough and coverage-pass records above remain the browser evidence; their 19 findings are marked resolved here only for the code paths covered by the automated checks. Screen-reader, Firefox/WebKit, and colour-vision checks remain unavailable.

## PADS individual-KPI Framework Studio verification — 29 October 2026

Built and exercised **59 of the 64 KPI rows** in `public/samples/PADS.xlsx` (sheet `PADS Template`): 14 Teaching & Learning, 16 Research & Development, 11 External Interface, 10 Operations, 6 Student Development and 2 Extra & Co-Curricular. The workbook's seventh KRA, `INSTITUTIONAL OR DEPARTMENTAL CONTRIBUTIONS AND OUTCOMES`, has five optional rows with no Max Points that use `Supervisor Scoring (on 5 pt. scale)`, so they were not built. The request referred to 55, but the template contains 64 KPI rows, 59 with an explicit Max Points value.

Each of the 59 was loaded as a saved `v1` conditional rules policy with Inputs → Scoring Policy → Workflow (Submit → Result), then run through Test & review. **201 UI checks passed** across every award tier, boundary/zero scores and below-threshold fallbacks; no check remained pending. On 30 October 2026 the automated suite passed **102/102** and `npm run build` completed successfully; those tests do not exercise these 59 policies. The set includes the role-dependent RD-1 primary/co-author outcomes, the TL-5 cap and the RD-12 publication cap. Every policy uses the zero fallback when a present value matches no rule; missing or unparseable evidence still returns Pending review from the engine. RD-6 is encoded as 15 enumerated submitted/presented combinations because the formula mode cannot express `6 × submitted + 4 × presented`; RD-12 is capped at 30.

This is **individual-KPI provisional scoring, not a complete PADS appraisal**. PADS KRA totals and role-specific maxima (Assistant/Associate Professor, Professor, HOD), the 200-point cap, mandatory assessment eligibility (Scopus/Annexure-I paper or 7-day FDP), separate self and supervisor scores, descriptive assessments, overall feedback, HR observations, and panel review of institutional contributions are not implemented or tested.

Known rule simplifications: author role is Primary/Co-author only, so the Guidelines’ third-author 25% share is absent; TL-11 scores one course rather than multiple courses, and TL-12 does not model its additive PhD/guideship/guiding components. Eligibility language such as “primary coordinator” (EI-1, EI-3, EI-4, EI-11, SD-1, SD-4, SD-6, EC-1, EC-2), RD-5’s co-author requirement, RD-12’s combined conference-plus-publication condition and O-4’s minimum 40 external attendees has no validating field. O-2 awards 3 points for any committee membership rather than 3 points per member up to two; O-3, O-5, O-7 and O-10 score a single event/visit and cannot reach their multi-event maxima.

Evidence: local ignored `artifacts/pads-kpis/` (59 KPI JSON drafts, `cases.json`, edge drafts and `edge-results.json`, screenshot `rd-12-zero-points.png`). These are local test artifacts, not committed fixtures. This verifies that the app computes the encoded rules through its UI; it does not establish institutional approval of the mappings, live index checks, or independent creator usability (still #3).

Supplementary edge-path checks on representative drafts:

- A required numeric field left blank blocked execution with “Percentage is required.”
- Leaving an optional field blank returned **Pending review**, not zero points.
- A draft with an Apply scoring policy Action followed by a Human review node reached **sent-to-review** with the review package rendered.
- A negative percentage (`-5`) was accepted by the number field and scored **0 points** through the zero fallback; no range validation rejected it. This is an observed input-validation gap, not an approved mapping. Values above the workbook maximum (for example, 150%) were not exercised.

Extraction/comparison uncertainty was not exercised because these 59 rows are form-value policies; they have no PDF evidence or comparison nodes.

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

`public/samples/PADS.xlsx` is the reference PADS Academic Review 2021 template (sheets `PADS Overview`, `PADS Template`, `Guidelines`), with provenance in [sample notes](../public/samples/README.txt). The 29 October 2026 run above records 59 of 64 KPI rows and their expected-versus-actual results; the five institutional 5-point rows and PADS-wide aggregate mechanics remain uncovered. It is not an independent creator walkthrough or an institutional-compliance check.

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
