# Framework Studio creator walkthrough

Independent usability walkthrough of Inputs → Scoring policy → Workflow → Test & review, recorded for [issue #3](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/3). Both sessions were run by the second contributor and reported on that issue. They took place on 30 October 2026 against `main` at `ebbb301`, with the dev server on `127.0.0.1:5173` and Chromium. Both used a fresh incognito profile with empty storage, synthetic values and a dummy PDF. No faculty records, real submissions or external uploads were involved, and neither session changed the repository.

The third coverage pass — Publication Crossref success and forced failure, PDF extraction, duplicate detection, and AI modes — is recorded in [Testing](TESTING.md#publication-extraction-duplicate-and-ai-mode-coverage--30-october-2026). This document keeps the two original creator sessions.

No screenshots were attached to either session; the record below is textual, with the intended KPI, steps, expected/actual behavior and reproducibility details.

## Session 1 — build "Guest lecture delivery" from an empty draft

Storage state: one draft under `afpi.kpi-draft.v1`, no template or plugin loaded. Values were invented; evidence was a 188-byte dummy PDF.

### Intended KPI

| Field | Type | Required |
| --- | --- | --- |
| Lectures delivered | Whole number | yes |
| Audience | Dropdown — Students / Faculty / Industry | yes |
| Session proof | File upload (`.pdf,.pptx,.xls,.xlsx`) | yes |

### Steps

1. **Inputs** — created the three fields and confirmed the submission preview showed labels, required markers, the dropdown and the file input.
2. **Scoring policy** — style "Conditional scoring rules", "Apply this rule policy automatically at workflow Results", version name `v1`, three rules:
   - "Three or more lectures" — Input: Lectures delivered, At least `3`, `10` points, multiplier `1`, outcome `Eligible`.
   - "One or two lectures" — At least `1`, `5` points, outcome `Partially met`.
   - "No lectures" — Equals `0`, `0` points, outcome `Not met`.
   - No-match behavior left at "Pending / insufficient evidence". **Save policy version** reported "Version saved and selected. You can now map it in Workflow."
3. **Workflow** — Trigger → Condition "Check lecture count" (`Form: Lectures delivered`, `At least`, `3`) → Met: Result `Eligible`; Not met: Result `Not eligible`; Needs review: Human review (role `Appraiser`).
4. **Test & review** — six runs.

### Run results

| Submission | Path | Workflow outcome | Scoring outcome | Assessment |
| --- | --- | --- | --- | --- |
| 3 lectures, Faculty, PDF | Met → Eligible | `Eligible` | `Eligible`, policy `v1`, 10 points | as expected |
| 1 lecture | Not met → Not eligible | `Not eligible` | `Partially met`, policy `v1`, 5 points | **contradicts the workflow verdict** |
| 0 lectures | Not met → Not eligible | `Not eligible` | `Not met`, policy `v1`, 0 points | consistent |
| `-2` lectures | Not met → Not eligible | `Not eligible` | `Pending review`, policy `v1` | **contradicts**, and the negative value was never rejected |
| blank, field optional | Needs review → Human review | `sent-to-review` ("Sent to Appraiser in the separate Human Review module") | — | as expected |
| blank, field required | blocked | — | — | "Before this workflow can finish: Lectures delivered is required." |

Reload test: after `F5`, the name, three fields, five workflow nodes, policy `v1` with three rules and active version `v1` all returned, with the banner "Draft restored. Your fields, workflow and scoring settings are ready. Reattach PDFs and enter test submissions again; test results are not saved." Test values, the attached file, the trace and the run history were discarded as the user guide states. The saved draft was not damaged.

### Findings

#### High

1. **Two independent verdict systems can disagree on the same submission, with no reconciliation.** A creator who defines a threshold in the scoring policy and again in the workflow gets two answers in one trace panel: `Outcome: Not eligible` beside `Scoring outcome: Partially met` (1 lecture), and `Outcome: Not eligible` beside `Scoring outcome: Pending review` (`-2`). Nothing warns that the condition duplicates the policy thresholds, and nothing states which verdict governs the appraisal.
   - Expected: one authoritative verdict, or an explicit precedence plus a warning when a rule and a condition read the same field.
   - Suggested fix: detect policy rules and workflow conditions that share a source field and warn at save time; label the panels "workflow result" and "policy result" and state which one is recorded.

#### Medium

2. **A new scoring rule arrives configured to award points.** `newScoringRule()` starts with name `New rule`, source `Final workflow outcome`, `12` points, multiplier `1`, outcome `Eligible`, and only the comparison value blank. Validation catches the missing value ("New rule: enter a valid comparison value.", which clears when the rule is removed), but as soon as any value is typed the rule is live and awards 12 points while marking the submission Eligible.
   - Expected: a new rule neutral until the creator chooses points and outcome.
   - Suggested fix: start with empty points/outcome or a neutral "Not scored" state, and mark unchanged defaults visually.

3. **The human-review package prints raw field identifiers instead of labels.**
   ```json
   "submission": { "values": { "cd71ede1-c378-476c-9596-af5695cfb24b": "", "e9e73fa3-0835-4e09-805d-27895dae1d69": "Faculty" } }
   ```
   A reviewer cannot tell which input was blank without cross-referencing the form. The same object also stores the full policy snapshot under the key `policyVersions` (plural, but a single object) and reports `"maxPoints": ""` as an empty string.
   - Suggested fix: include the field label next to each id and normalize empty numerics to `null`.

4. **A Result step pre-maps an unrelated input.** Both Result steps arrived with "Value to use" already set to `Form: Audience`. A creator who does not notice ships an outcome carrying an arbitrary field value.
   - Expected: `Choose a source (optional)` until the creator picks one.
   - Suggested fix: leave the mapping empty, or show a visible "suggested" badge that requires confirmation.

5. **The "Needs review" branch cannot be exercised for a required input.** With "Lectures delivered" required, a blank submission is blocked before execution, so the missing-evidence branch is unreachable in testing. The field had to be marked optional, run, and then restored; the branch itself works once reachable.
   - Suggested fix: offer a test-only "simulate missing value" toggle, or allow the required check to be bypassed inside Test & review.

6. **Whole-number fields accept out-of-range values.** `-2` was accepted with no complaint (`input` has no `min`, and the field editor has no bounds controls) and flowed into scoring, where it matched no rule. This confirms the range-validation gap already recorded in [Testing](TESTING.md).
   - Suggested fix: optional min/max on numeric fields, enforced in the test form and in runtime validation.

#### Low

7. Scoring rules offer only "Move up" and "Remove rule", while input fields offer both "Move up" and "Move down". Rule order decides the first match, so reordering downward requires removing and recreating a rule.
8. The Inputs tab strip (Form builder / Submission preview / Workflow nodes) is still rendered on the Scoring policy stage. Clicking "Submission preview" there silently jumps the user back to the Inputs stage instead of showing the preview in place.
9. `Session testing · 0 session records` remained at 0 after four test runs. The counter describes duplicate-publication decision records (`records` in `src/WorkflowStudio.jsx`), not test runs, so the label misleads on this screen.
10. Defaults that are easy to ship by accident: a new dropdown contains `Option 1` / `Option 2`, a new file upload restricts to `.pdf,.pptx,.xls,.xlsx`, and new steps are named `Condition` / `Result`.
11. The add-step affordance is an unlabeled 32×32 `+` button, and opening or closing the Blocks library shifts the canvas horizontally (main content width 1033 → 1048 px, a horizontal scrollbar appears).

### Behaviors worth preserving

- Draft-restore banner that states plainly what was restored and that PDFs and test values must be re-entered.
- Stale-run warning: "The workflow or submission changed. Run again before reviewing these …".
- Required-field block that names the field, and a trace row showing the run stopped at the trigger.
- Live `3 fields / 3 required` counter that updates as configuration changes.
- Condition step defaulting to Value type `number`, source `Form: Lectures delivered`, comparison `At least`.
- Trace summary that names the steps that did not run: "3 of 5 steps ran. Not eligible, Human review have not run on this path."
- Human-review handoff text making clear the automated workflow ends there and approval branches live in the other module.

### Not covered in session 1

- "Clear saved draft" confirmation behaviour — not clicked, to avoid destroying the draft under test.
- Publication checks, PDF extraction, AI evaluation and duplicate detection.
- Accessibility audit, keyboard-only operation, and browsers other than Chromium.
- Load or concurrency behaviour with more than one draft per origin.

## Session 2 — destructive checks, concurrency and layout

Second session, same day, same build and server, same isolated incognito profile. The same KPI was rebuilt (whole number, dropdown, file upload; policy `v1` with three rules; Trigger → Condition → two Results → Human review). The draft was disposable and cleared at the end, so the destructive checks below carried no risk. No repository changes were made.

| Check | Result |
| --- | --- |
| "Clear saved draft" — cancel path | Pass — explicit warning, cancel is non-destructive |
| "Clear saved draft" — accept path | Pass — fresh session, `Untitled KPI`, 0 fields |
| Draft policy edits versus the saved version | Pass — execution used `v1`, not the draft |
| Autosave of the last keystroke through an immediate reload | Pass |
| `Export configuration` contents | Problems — see 16 |
| `Download draft` after a storage failure | Works, but no way back in — see 13 |
| Simulated storage failure (`setItem` throws) | Pass — clear banner, retry and download |
| Two tabs, one origin, same draft | **Silent data loss — see 12** |
| Field rename referenced by rule and condition | Pass — mappings and labels follow the field |
| Deleting a referenced field | Recovers well, but deletes without warning — see 14 |
| Keyboard-only operation | Pass for order and button focus; muted input focus — see 19 |
| Narrow viewport (1100 px, 390 px) | Problems — see 15, 17 |
| Firefox / WebKit | Not possible in this environment — see the end |

### Findings

12. **Two tabs editing the same draft silently destroy each other's work (High).** Both tabs claim "Saved on this browser". With the draft open twice in the same profile:
    1. Tab B renamed the KPI to `TAB B edit` and added a fourth field (`4 fields / 3 required`). Storage held 4 fields.
    2. Tab A, still holding its own copy of the draft, changed only the KPI name.
    3. Storage afterwards: `TAB A edit`, **3 fields**. Tab B's fourth field was gone, with no notice in either tab; Tab B still displayed 4 fields and would overwrite back on its next keystroke.

    `useDraft` writes the whole draft object on every committed edit and registers no `storage` listener, and the stored record carries `savedAt`/`version` that are never compared before writing. The user guide says to use one draft per origin, but nothing warns at runtime that a second tab is open, and the last writer wins on the entire document.
    - Expected: a second writer either reloads, refuses to overwrite, or warns.
    - Suggested fix: listen for the `storage` event, compare a revision counter before saving, and surface "This draft changed in another tab" with reload/keep options.

13. **Exported files cannot be loaded back into the studio (Medium).** The recovery advice ("Check browser storage or download the draft") produces a usable file, and `Export configuration` produces one too, but there is no import, restore or paste action anywhere in the UI — no file input for JSON, no "Restore from file" control. A creator who loses browser storage can save a copy of the work but cannot put it back.
    - Evidence: `afpi-workflow.json` (5,928 bytes, `"format": "afpi-workflow-v1"`) and `afpi-kpi-draft.json` (6,418 bytes, `"version": 1, "draft": {…}`, including the edit that had not yet been saved to storage). No import control exists in the studio.
    - Suggested fix: add an import action with schema validation, or stop describing the download as a recovery route.

14. **Deleting a field gives no warning that rules and conditions depend on it (Medium).** Deleting `Guest lectures delivered` removed it immediately. Three scoring rules and the workflow condition still pointed at its id. The breakage was only visible later, as three "Choose information" selects, a node badged "Needs setup", and a blocked test run listing `Finish setup: 4 items`.
    - Downstream recovery is genuinely good and should be kept: the scoring selects reset with "Select a compatible source again after building the workflow.", the condition panel says "Source changed or is incompatible. Choose again.", and Test & review refuses to run while naming each broken item with an `Edit step` / `Edit policy` link.
    - Suggested fix: before removal, list what uses the field ("3 scoring rules, 1 workflow condition") and require confirmation, as the clear-draft action already does.

15. **The studio has no usable layout below roughly 700 px (Medium).** At 390 px wide the sidebar stays 205 px, `main` is left with 170 px, and the document scrolls horizontally to 850 px. Collapsing the sidebar helps only partly: the builder grid is `minmax(320px,1fr) 325px`, so it still needs 645 px and the inspector sits off-screen. There is one breakpoint (`max-width:1200px`), which narrows the sidebar and the grid but never stacks them.
    - Suggested fix: a single-column breakpoint for `.builder` below ~760 px, with the inspector below the field list.

16. **`Export configuration` omits the KPI name and carries irrelevant keys (Low).** The file contains `format`, `fields`, `nodes`, `policy` — no KPI name, so a re-import would lose the title. Every field object carries every key regardless of type: a whole-number field exports `"options": "Option 1\nOption 2"` and `"accept": ".pdf,.pptx,.xls,.xlsx"`.

17. **Save status disappears on narrower windows (Low).** At 1100 px both `.draft` status badges are `display: none`, so neither "Saved on this browser" nor "Could not save" is shown. The failure banner does still render with `Retry save` and `Download draft`, so the failure itself is not hidden — only the passive status.

18. **Validation wording does not name the cause (Low).**
    - `Select a compatible source again after building the workflow.` — shown when the real cause is a deleted input.
    - `Value to use uses a removed, later, or incompatible source.`
    - The three rule-level messages repeat identically without saying which input vanished.

19. **Text-field focus is much weaker than button focus (Observation).** Buttons carry `outline: 3px solid #ada2ef` (measured 2.67 px, clearly visible) and every control in the Tab order is reachable: sidebar stages → `Hide sidebar` → `Clear saved draft` → stage tabs → field cards. Text inputs suppress the outline and rely on a border change from `#dbe0eb` to `#9585df` (3.14:1 against white, 2.37:1 against the idle border) plus a 9% purple glow. That is borderline rather than clearly failing; a designer's call.

### Verified and worth keeping

- "Clear saved draft" asks first with complete wording ("…removes its input fields, workflow, scoring policies and saved versions… This cannot be undone"), and cancelling leaves the draft byte-for-byte intact. Accepting starts a clean session with `Untitled KPI` and 0 fields, and leaves the separate `afpi.sidebar.collapsed` preference alone.
- Draft and saved policy stay separate in execution: with a draft rule edited to 99 points, a 3-lecture test still scored **10 points from `v1`**, with the panel stating "Scoring uses saved policy: v1. Draft edits apply only after saving a new version."
- Autosave survives an immediate reload: a name change typed and reloaded at once persisted, and the draft-restore banner explained what to re-enter.
- Storage failure is handled honestly: the badge flips to "Could not save", the banner says "Couldn't save on this browser. Your changes are still open here. Check browser storage or download the draft.", with working `Retry save` and `Download draft`; the download contains the unsaved edit.
- Renaming a field keeps both connections: the rule source and the condition mapping follow the field id, and every label updates to the new name.
- Orphaned references fail loudly and recoverably rather than silently scoring zero (see 14).

### Not covered in session 2

- **Firefox, Safari/WebKit:** no engine is available here — the repository has no `devDependencies` and no Playwright install, and the automation browser is Chromium only. Responsive and focus results are Chromium results.
- Screen-reader behavior and color-vision checks: no assistive technology is available in this environment.
- Publication checks, PDF text extraction, AI evaluation, duplicate detection.
- More than two simultaneous writers, and server-side or multi-user concurrency (the studio is browser-local).

## Tracking status

All 19 findings are filed as separate follow-up issues:

- High: #22 (disagreeing verdicts), #23 (multi-tab overwrite).
- Medium: #25 (review package IDs), #26 (pre-mapped Result input), #40 (unsafe new-rule defaults), #27 (needs-review branch untestable), #28 (numeric bounds), #29 (no import), #30 (field-deletion warning), #31 (narrow layout).
- Low: #24 (rule reordering), #32 (Inputs tab on Scoring stage), #33 (session counter label), #34 (defaults), #35 (add-step affordance), #36 (save status), #37 (validation/trace wording), #38 (input focus).

The later coverage pass filed #39 (unreadable-PDF placeholders), and #37 also covers the skipped-step plural wording. Two items were flagged for re-verification in their issues: #25 for the `policyVersions` shape, and #26 for the Result mapping on the current UI.

## Resolution status — 30 October 2026

The follow-up fixes are implemented on branch `fix/creator-walkthrough-issues` with 178/178 automated tests and a passing production build. The original findings above are retained as the historical walkthrough record.

| Issue | Implemented behavior |
|---|---|
| #22 | Result panels label **Workflow result** and **Policy result**; the policy result is stated as the marks record when a saved rule policy is active. Scoring policy and Workflow warn when a saved rule and a Condition read the same input. |
| #23 | Draft records carry a revision and writer identity. A conflicting tab stops saving and offers **Reload other version** or **Keep my version**. |
| #24 | Conditional scoring rules support **Move down** as well as **Move up**. |
| #25 | The review package includes field definitions and `labelledValues`; `maxPoints`, empty points, multipliers, and component weights are normalized to `null`; policy versions remain an array. |
| #26 | Result steps leave **Value to use** unconnected instead of suggesting a form field. |
| #27 | Test & review has a session-only **Simulate missing required values for this test** toggle, so the Needs review branch is reachable without editing the field. |
| #28 | Number and whole-number fields support optional minimum/maximum values, enforced in the preview and runtime validation. |
| #29 | **Import draft** validates and restores both export shapes; workflow exports now include the KPI name. |
| #30 | Removing a referenced field lists the scoring rules, workflow conditions, and step mappings that depend on it and asks for confirmation. |
| #31 | Narrow windows stack the builder inspector and related layout; the sidebar takes its own row; Workflow settings overlay the canvas. |
| #32 | The Inputs tab strip no longer appears on the Scoring policy stage. |
| #33 | The counter reports test runs and duplicate decision records separately. |
| #34 | New dropdowns start without choices, file fields accept any format, and new Conditions/Results are named **New condition**/**New result**. |
| #35 | Add-step + buttons carry a title alongside the existing accessible name; Blocks overlays rather than shifting the canvas. |
| #36 | Save status stays visible below 1200 px. |
| #37 | Source errors name the removed input, removed/moved step, or incompatible source; skipped-step grammar is singular/plural correct. |
| #38 | Text controls use a visible 3 px focus outline and stronger border/glow. |
| #39 | Placeholder PDF metadata such as `untitled`/`anonymous`, and metadata from documents with no readable page, stays `Not found` rather than a candidate. |
| #40 | New scoring rules start with empty points and outcome, so they cannot silently award 12 points while marking Eligible. |

Not re-verified in the browser during this change: the responsive layout, focus ring, multi-tab banner, import controls, and the required-field toggle. The automated checks and production build passed; a fresh Chromium pass is still required before closing #3.
