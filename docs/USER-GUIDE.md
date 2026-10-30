# User guide

## Navigate

The three creation stages are **Inputs**, **Scoring policy**, and **Workflow**. Define the evidence shape first, then define what must be scored, and finally build the workflow that supplies those score components. The top-left icon hides or restores the sidebar; that preference survives reload. Workflow uses a compact header and toolbar to maximize canvas space.

Within Workflow, **Build workflow** edits the graph and **Test & review** runs a submission. Blocks, zoom, Fit tree width, and Undo are canvas controls. Undo applies to recent canvas edits in the current session, not all form/policy changes. On narrow windows the builder stacks its inspector below the field list and the Workflow settings open over the canvas instead of pushing it off-screen.

## Create inputs

1. Enter a KPI name in Inputs.
2. Click Add field. Give the field a meaningful name and supported data type.
3. Set required status, field description, and an optional example value. For number and whole-number fields, optionally set a minimum and maximum; both the submission preview and the workflow engine enforce them. For choices, enter one option per line. For evidence files, leave the allowed formats empty to accept any file, or enter `.pdf`, `.pptx`, `.xls`, and/or `.xlsx` and choose whether multiple files are accepted.
4. Reorder with arrows, duplicate if useful, or remove a field.
5. Use Submission preview to check the generated form. Its Test submission button validates fields only; it does not run verification tools.

New dropdowns start with no choices and new file fields accept any format, so an accidental default is visible instead of shipped. Renaming/reordering preserves field identity. Removing a field asks for confirmation and lists the scoring rules, workflow conditions, and step mappings that reference it; those references still need repair afterwards. Changing a field's type can invalidate mappings. Required Yes/No fields require an answer; No is a valid answer.

## Build a workflow

1. Start from Submission received. The real trigger is added with the first inserted block.
2. Click a + and choose a block, or drag a block from the library onto a +. Each + names the step it will add after the current step.
3. For an Action, choose the tool, select its inputs, and complete its settings.
4. For a Condition, select value type, source, comparison, and expected value. Connect Met, Not met, and Needs review. A new condition is named **New condition** until you rename it.
5. Add Human review only when automation must stop and send the complete package to the separate review module. It is terminal and has no approval/rejection branches.
6. End automated paths with a named Result, or with the optional Human review handoff. A new result is named **New result**; its optional **Value to use** starts unconnected and is never guessed.

Click a card to configure it. Only compatible earlier sources appear; an automatic suggestion is a starting point, not proof that the intended evidence is mapped. Opening Blocks overlays the canvas instead of shifting it horizontally.

To create the publication flow, choose Plugin → Publication workflow. The complete 10-step workflow is added at once. It checks DOI/Crossref, compares the PDF, checks first authorship, assessment dates, and local duplicate candidates. Clear findings go through the selected saved scoring policy. Needs review and Ineligible skip scoring. All three paths converge on the same Appraiser review node, with their outcomes preserved. There is no AI or Scopus/Web of Science step in this template. If no saved policy is selected, choose one on the Apply scoring policy step before running. If steps already exist, confirm replacement; the previous canvas can be restored with Undo. On an empty canvas, the same workflow is available from **Add full Publication workflow**.

Use **Connect to existing steps** in Condition settings to share a later node. Old saved Human Review nodes may also retain this control for compatibility. Cycles are rejected. Single-route, non-shared actions can be moved using the grip; click the grip and then a + as an alternative to dragging. Removing a linear step bypasses it. Removing a branch leaves child work visible as unconnected rather than deleting it.

## Configure scoring and AI

Create the scoring policy before the workflow. Choose **Combine score components** when several numeric evaluations must become one score. Add any number of organization-defined components, mark required inputs, choose weighted sum, simple average, or weighted average, set an optional cap, and save a version. In Workflow, add Action → Apply scoring policy, select that version, and map each component to an earlier numeric output. Conditional rule policies remain available for threshold/outcome scoring. Draft edits alone do not change test scoring.

A new conditional rule starts neutral: no points and no scoring outcome. Enter both deliberately before saving. Rules support **Move up** and **Move down** because the first match wins. When a saved rule and a workflow Condition read the same input, the Scoring policy and Workflow stages warn that two thresholds can disagree. The workflow result chooses the path; when a saved rule policy is active, the policy result is the marks record.

AI evaluation is an Action tool usable on any path. Select a primary input and up to eight named additional inputs, supply a rubric and system instructions, and optionally define an object JSON schema. Validated schema fields become typed outputs that Conditions can use. Live mode generates a recommendation; simulated mode does not execute instructions. AI never records approval or a score by itself. See [AI and API](AI-AND-API.md).

## Test and review

1. Open Test & review. Resolve Finish setup items; Edit step opens the affected settings.
2. Enter values and attach files once. Later tools reuse the mapped values.
3. To exercise a Needs review branch for a required field, leave it blank and enable **Simulate missing required values for this test**. The bypass applies to that test only and is not saved.
4. Run this submission. Inspect executed steps and the paths not taken. Results now label the **Workflow result** (the path taken) separately from the **Policy result** (the marks record when a saved rule policy is active).
5. If the run ends at Human review, inspect the package sent to the separate module. Submission values now carry their field labels and empty numeric policy values are normalized to `null`. Framework Studio does not ask for approve, reject, or clarification decisions.
6. The original publication Appraiser review remains a legacy specialized flow for compatibility; new generic workflows use the terminal handoff.

The session counter reports test runs and separately reports duplicate decision records, so a run that does not create a duplicate record no longer looks like a failed test.

For a reference-only PADS example, follow the [TL-1 walkthrough](PADS-TL1-WALKTHROUGH.md). It uses a committed saved-draft fixture and synthetic evidence; it is not an approved institutional policy.

For the original publication or an old routed-review draft, changing inputs, workflow, or policy makes an open review stale. Run again. Clarification does not edit the original evidence; correct inputs and start a fresh test.

## Save, recover, and clear

Draft configuration saves automatically in this browser. Uploaded files, values, traces, decisions, and approved duplicate records do not survive reload. A saved badge is not a cloud backup.

When storage fails, follow Retry save or Download draft. An unreadable draft is protected from overwrite. Save current draft instead backs up the unreadable value under the recovery key before replacement.

Use **Import draft** to load a downloaded `afpi-kpi-draft.json` or an exported `afpi-workflow.json`. Import validates the schema, asks before replacing the current draft, and restores fields, workflow, scoring policy and the KPI name. Export configuration now includes the KPI name. Test files and results are still not imported.

Each tab writes under its own identity. If the same draft changes in another tab, the studio stops saving and offers **Reload other version** or **Keep my version** instead of silently overwriting the other tab's work. Use one draft per origin and resolve the banner before typing further.

**Clear saved draft** asks for confirmation, removes the current draft and recovery backup, and reloads into an empty session. Cancel keeps the draft. Sidebar preference is retained. Use an isolated browser profile for examples if you want to keep an existing draft untouched.

## Add a plugin or reusable tool

Click a + on the tree, then Plugin (below Result), then Publication workflow. The complete publication flow is added automatically; you no longer need to add its operations one by one. Create and save the institution's scoring policy, then select the version on the Apply scoring policy Action. Only Clear findings run that step. Clear, Needs review, and Ineligible all end at Appraiser review, where the decision and any score are visible. If the chart already has steps, the picker asks before replacing them. Use the workflow Undo control to restore the previous chart. Existing publication operation nodes can still be edited individually in their settings. For other KPIs, choose Action and a general tool.

Use **Use form value** when an explicit mapping step helps the workflow remain readable. Choose the field; its type is inherited automatically. Use **Extract evidence** for selected `Label: value` fields, full content, or both. Use **Compare evidence** for one or more submitted-versus-extracted pairs. Missing evidence becomes `unknown`, never `mismatch`. Route its status with a Condition. Save scoring rules in Scoring policy, then select the version in Apply scoring policy.

For a document-content KPI, choose Full content or Both in Extract evidence, map its Full content object to AI evaluation, add named topic/faculty inputs, and provide the rubric plus system instructions. See [Content relevance KPI](CONTENT-RELEVANCE-KPI.md) for exact steps.
