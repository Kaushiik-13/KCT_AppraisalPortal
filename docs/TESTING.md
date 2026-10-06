# Testing and acceptance

## Commands

```powershell
npm.cmd test
npm.cmd run build
```

Tests use Node's built-in test runner over `src/*.test.js` and `server/*.test.js`. A passing build verifies bundling, not browser behavior. There is no lint script or committed full browser automation suite.

Most recent automated baseline: **87 passing tests**, after whole-document evaluation support. Later sidebar and clear-draft UI changes were build-checked and browser-checked. The earlier [Phase 6 report](../PHASE-6-VERIFICATION.md) records 67 tests at that checkpoint; it is historical, not the latest count.

## Coverage map

| Suite | Main coverage |
|---|---|
| `draftStorage.test.js` | Autosave schema, recovery, excluded runtime values, storage errors |
| `treeModel.test.js` | Insert, move, remove, cycles, branch/shared layout |
| `blocks.test.js` | Generic block configuration and compatibility |
| `blockExecution.test.js` | Branch values, review continuation, preflight, post-review failure |
| `workflowEngine.test.js` | Publication checks, scores, errors, review restrictions |
| `paperFindings.test.js` | Extraction candidate analysis and PDF fixture cases |
| `scoringPolicy.test.js` | Version snapshots, caps, missing evidence, source changes |
| `aiWorkflow.test.js` | Generic inputs, instructions, response chaining, old drafts |
| `server/ai.test.js` | Provider adapter, bounds, prompt separation, endpoint responses |

Automated provider tests inject responses. They do not establish live indexing or guarantee future Crossref/OpenRouter availability.

## Manual acceptance checklist

Use an isolated profile/session so testing does not replace a user's only draft.

1. **Inputs:** add each needed type; preview required/optional behavior; rename and reorder without losing mappings.
2. **Builder:** add by + and drag/drop; open/close settings; move a linear action; connect a shared result; reject a cycle; inspect orphaned work after removal.
3. **Preflight:** leave a required mapping or comparison blank; verify the test is blocked and Edit step opens its settings.
4. **Training:** follow [the walkthrough](TRAINING-KPI.md); test 8, 7, zero, blank, approval/rejection/clarification, and stale review.
5. **Publication:** follow [the walkthrough](PUBLICATION-KPI.md); verify sample extraction, Crossref response, 24 mock-index points, approval, and repeat-submission uncertainty.
6. **Scoring:** save v1, edit only its draft, verify v1 unchanged; save v2; switch back; test cap and pending fallback.
7. **AI:** test simulation, missing input, and live custom instructions if configured; check an ordinary/clear-path input and response chaining. Never treat simulated output as generation.
8. **Persistence:** reload fields, mappings, instructions and versions; verify file/value/review loss is explicit.
9. **Reset:** cancel Clear saved draft and verify no changes; confirm only in a disposable draft; verify blank configuration and retained sidebar preference.
10. **Layout:** collapse/restore sidebar, reload, open settings and Test & review. Check desktop overflow and browser errors.

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
