# User guide

## Navigate

The three sections are **Inputs**, **Workflow**, and **Scoring policy**. The top-left icon hides or restores the sidebar; that preference survives reload. Workflow uses a compact header and toolbar to maximize canvas space.

Within Workflow, **Build workflow** edits the graph and **Test & review** runs a submission. Blocks, zoom, Fit tree width, and Undo are canvas controls. Undo applies to recent canvas edits in the current session, not all form/policy changes.

## Create inputs

1. Enter a KPI name in Inputs.
2. Click Add field. Give the field a meaningful name and supported data type.
3. Set required status and help text. For choices, enter one option per line. For files, set allowed formats and whether multiple files are accepted.
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

AI is an Action tool usable on any path. Select an earlier output or supported form value, write System instructions, select a mode, and connect the next step. Live mode generates a response; simulated mode does not execute instructions. See [AI and API](AI-AND-API.md).

## Test and review

1. Open Test & review. Resolve Finish setup items; Edit step opens the affected settings.
2. Enter values and attach files once. Later tools reuse the mapped values.
3. Run this submission. Inspect executed steps and the paths not taken.
4. If paused for review, enter reviewer identity and a decision. Rejection/clarification need a reason.
5. Generic review continues down the chosen route. Original publication review finalizes a recommendation and permits reasoned score overrides.

Changing inputs, workflow, or policy makes the old review stale. Run again. Clarification does not edit the original evidence; correct inputs and start a fresh test.

## Save, recover, and clear

Draft configuration saves automatically in this browser. Uploaded files, values, traces, decisions, and approved duplicate records do not survive reload. A saved badge is not a cloud backup.

When storage fails, follow Retry save or Download draft. An unreadable draft is protected from overwrite. Save current draft instead backs up the unreadable value under the recovery key before replacement. There is currently no import UI for downloaded configurations.

**Clear saved draft** asks for confirmation, removes the current draft and recovery backup, and reloads into an empty session. Cancel keeps the draft. Sidebar preference is retained. There is only one current draft per origin; use an isolated browser profile for examples if you want to keep an existing draft untouched.

## Add a plugin or reusable tool

Click a + on the tree, then Plugin (below Result). Choose Publication and its operation. Configure sources in the drawer. For other KPIs, choose Action and a general tool. Extract document information lets you add named typed output fields and printed labels. Use Condition to route a comparison result. Save scoring rules in Scoring policy, then select the version in Apply scoring policy.

For a document-content KPI, leave optional labelled fields empty, choose Full document text as AI input, use Add context input for topic/faculty, and provide the rubric plus system instructions. See [Content relevance KPI](CONTENT-RELEVANCE-KPI.md) for exact steps.
