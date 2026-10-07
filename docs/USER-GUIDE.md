# User guide

## Navigate

The three sections are **Inputs**, **Workflow**, and **Scoring policy**. The top-left icon hides or restores the sidebar; that preference survives reload. Workflow uses a compact header and toolbar to maximize canvas space.

Within Workflow, **Build workflow** edits the graph and **Test & review** runs a submission. Blocks, zoom, Fit tree width, and Undo are canvas controls. Undo applies to recent canvas edits in the current session, not all form/policy changes.

## Create inputs

1. Enter a KPI name in Inputs.
2. Click Add field. Give the field a meaningful name and supported data type.
3. Set required status, field description, and an optional example value. For choices, enter one option per line. For evidence files, allow `.pdf`, `.pptx`, `.xls`, and/or `.xlsx` and choose whether multiple files are accepted.
4. Reorder with arrows, duplicate if useful, or remove a field.
5. Use Submission preview to check the generated form. Its Test submission button validates fields only; it does not run verification tools.

Renaming/reordering preserves field identity. Removing a field or changing its type can invalidate existing node and policy mappings. Required Yes/No fields require an answer; No is a valid answer.

## Build a workflow

1. Start from Submission received. The real trigger is added with the first inserted block.
2. Click a + and choose a block, or drag a block from the library onto a +.
3. For an Action, choose the tool, select its inputs, and complete its settings.
4. For a Condition, select value type, source, comparison, and expected value. Connect Met, Not met, and Needs review.
5. For Human review, name the reviewer role and instructions. Connect Approved, Rejected, and Clarification paths.
6. End each path with a named Result, or use the original publication template's terminal Appraiser review.

Click a card to configure it. Only compatible earlier sources appear. Automatic suggestions are a starting point, not proof that the intended evidence is mapped.

Use **Connect to existing steps** in Condition/Human review settings to share a later node. Cycles are rejected. Single-route, non-shared actions can be moved using the grip; click the grip and then a + as an alternative to dragging. Removing a linear step bypasses it. Removing a branch leaves child work visible as unconnected rather than deleting it.

## Configure scoring and AI

For generic Result workflows, use [Scoring policy](SCORING.md), enable it, save a named version, and select that version. Draft edits alone do not change test scoring. Existing publication Calculate marks policies remain editable under Existing publication policies.

AI evaluation is an Action tool usable on any path. Select a primary input and up to eight named additional inputs, supply a rubric and system instructions, and optionally define an object JSON schema. Validated schema fields become typed outputs that Conditions can use. Live mode generates a recommendation; simulated mode does not execute instructions. AI never records approval or a score by itself. See [AI and API](AI-AND-API.md).

## Test and review

1. Open Test & review. Resolve Finish setup items; Edit step opens the affected settings.
2. Enter values and attach files once. Later tools reuse the mapped values.
3. Run this submission. Inspect executed steps and the paths not taken.
4. If paused for review, inspect the package containing the original submission, extracted evidence, comparisons, AI recommendation, scoring, and policy versions. Enter reviewer identity and a decision. Rejection, clarification, and score override need a reason.
5. Generic review continues down the chosen route. Original publication review finalizes a recommendation and permits reasoned score overrides.

Changing inputs, workflow, or policy makes the old review stale. Run again. Clarification does not edit the original evidence; correct inputs and start a fresh test.

## Save, recover, and clear

Draft configuration saves automatically in this browser. Uploaded files, values, traces, decisions, and approved duplicate records do not survive reload. A saved badge is not a cloud backup.

When storage fails, follow Retry save or Download draft. An unreadable draft is protected from overwrite. Save current draft instead backs up the unreadable value under the recovery key before replacement. There is currently no import UI for downloaded configurations.

**Clear saved draft** asks for confirmation, removes the current draft and recovery backup, and reloads into an empty session. Cancel keeps the draft. Sidebar preference is retained. There is only one current draft per origin; use an isolated browser profile for examples if you want to keep an existing draft untouched.

## Add a plugin or reusable tool

Click a + on the tree, then Plugin (below Result). Choose Publication and its operation. Configure sources in the drawer. For other KPIs, choose Action and a general tool.

Use **Use form value** when an explicit mapping step helps the workflow remain readable. Choose the field; its type is inherited automatically. Use **Extract evidence** for selected `Label: value` fields, full content, or both. Use **Compare evidence** for one or more submitted-versus-extracted pairs. Missing evidence becomes `unknown`, never `mismatch`. Route its status with a Condition. Save scoring rules in Scoring policy, then select the version in Apply scoring policy.

For a document-content KPI, choose Full content or Both in Extract evidence, map its Full content object to AI evaluation, add named topic/faculty inputs, and provide the rubric plus system instructions. See [Content relevance KPI](CONTENT-RELEVANCE-KPI.md) for exact steps.
