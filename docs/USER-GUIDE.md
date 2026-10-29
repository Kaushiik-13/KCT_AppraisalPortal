# User guide

## Navigate

The three creation stages are **Inputs**, **Scoring policy**, and **Workflow**. Define the evidence shape first, then define what must be scored, and finally build the workflow that supplies those score components. The top-left icon hides or restores the sidebar; that preference survives reload. Workflow uses a compact header and toolbar to maximize canvas space.

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
5. Add Human review only when automation must stop and send the complete package to the separate review module. It is terminal and has no approval/rejection branches.
6. End automated paths with a named Result, or with the optional Human review handoff.

Click a card to configure it. Only compatible earlier sources appear. Automatic suggestions are a starting point, not proof that the intended evidence is mapped.

To create the publication flow, choose Plugin → Publication workflow. The complete 10-step workflow is added at once. It checks DOI/Crossref, compares the PDF, checks first authorship, assessment dates, and local duplicate candidates. Clear findings go through the selected saved scoring policy. Needs review and Ineligible skip scoring. All three paths converge on the same Appraiser review node, with their outcomes preserved. There is no AI or Scopus/Web of Science step in this template. If no saved policy is selected, choose one on the Apply scoring policy step before running. If steps already exist, confirm replacement; the previous canvas can be restored with Undo. On an empty canvas, the same workflow is available from **Add full Publication workflow**.

Use **Connect to existing steps** in Condition settings to share a later node. Old saved Human Review nodes may also retain this control for compatibility. Cycles are rejected. Single-route, non-shared actions can be moved using the grip; click the grip and then a + as an alternative to dragging. Removing a linear step bypasses it. Removing a branch leaves child work visible as unconnected rather than deleting it.

## Configure scoring and AI

Create the scoring policy before the workflow. Choose **Combine score components** when several numeric evaluations must become one score. Add any number of organization-defined components, mark required inputs, choose weighted sum, simple average, or weighted average, set an optional cap, and save a version. In Workflow, add Action → Apply scoring policy, select that version, and map each component to an earlier numeric output. Conditional rule policies remain available for threshold/outcome scoring. Draft edits alone do not change test scoring.

AI evaluation is an Action tool usable on any path. Select a primary input and up to eight named additional inputs, supply a rubric and system instructions, and optionally define an object JSON schema. Validated schema fields become typed outputs that Conditions can use. Live mode generates a recommendation; simulated mode does not execute instructions. AI never records approval or a score by itself. See [AI and API](AI-AND-API.md).

## Test and review

1. Open Test & review. Resolve Finish setup items; Edit step opens the affected settings.
2. Enter values and attach files once. Later tools reuse the mapped values.
3. Run this submission. Inspect executed steps and the paths not taken.
4. If the run ends at Human review, inspect the package sent to the separate module. Framework Studio does not ask for approve, reject, or clarification decisions.
5. The original publication Appraiser review remains a legacy specialized flow for compatibility; new generic workflows use the terminal handoff.

For the original publication or an old routed-review draft, changing inputs, workflow, or policy makes an open review stale. Run again. Clarification does not edit the original evidence; correct inputs and start a fresh test.

## Save, recover, and clear

Draft configuration saves automatically in this browser. Uploaded files, values, traces, decisions, and approved duplicate records do not survive reload. A saved badge is not a cloud backup.

When storage fails, follow Retry save or Download draft. An unreadable draft is protected from overwrite. Save current draft instead backs up the unreadable value under the recovery key before replacement. There is currently no import UI for downloaded configurations.

**Clear saved draft** asks for confirmation, removes the current draft and recovery backup, and reloads into an empty session. Cancel keeps the draft. Sidebar preference is retained. There is only one current draft per origin; use an isolated browser profile for examples if you want to keep an existing draft untouched.

## Add a plugin or reusable tool

Click a + on the tree, then Plugin (below Result), then Publication workflow. The complete publication flow is added automatically; you no longer need to add its operations one by one. Create and save the institution's scoring policy, then select the version on the Apply scoring policy Action. Only Clear findings run that step. Clear, Needs review, and Ineligible all end at Appraiser review, where the decision and any score are visible. If the chart already has steps, the picker asks before replacing them. Use the workflow Undo control to restore the previous chart. Existing publication operation nodes can still be edited individually in their settings. For other KPIs, choose Action and a general tool.

Use **Use form value** when an explicit mapping step helps the workflow remain readable. Choose the field; its type is inherited automatically. Use **Extract evidence** for selected `Label: value` fields, full content, or both. Use **Compare evidence** for one or more submitted-versus-extracted pairs. Missing evidence becomes `unknown`, never `mismatch`. Route its status with a Condition. Save scoring rules in Scoring policy, then select the version in Apply scoring policy.

For a document-content KPI, choose Full content or Both in Extract evidence, map its Full content object to AI evaluation, add named topic/faculty inputs, and provide the rubric plus system instructions. See [Content relevance KPI](CONTENT-RELEVANCE-KPI.md) for exact steps.

## Use the Prediction Framework prototype

Open **Prediction framework** from the Framework Studio sidebar, or visit `/prediction`. The current prototype covers synthetic data preparation, readiness, model configuration, local training, held-out comparison, simulated approval/publication, and a read-only prediction sandbox. All records and metrics are synthetic.

### Overview

The Overview shows the target, generated-dataset status, latest readiness result and next action. **Configure synthetic data** opens the setup screen. The synthetic-only notice means no real employee records are loaded or saved.

### Dataset setup

Review the eight decisions, then choose **Generate datasets**:

1. **Prediction target:** final approved overall score from 0 to 200. It is never an input feature.
2. **Data unit:** one employee, cycle and checkpoint per row.
3. **Input fields:** only checkpoint-available role, time, score, evidence, mandatory-status and KRA values.
4. **Performance patterns:** relative weights for steady, fast, improving, stalled, irregular, consistently high/low and delayed-evidence behavior. They are mix weights, not score percentages.
5. **History scenarios:** no history, limited history, sufficient history and a separate invalid-data case.
6. **Dataset size and timing:** the seed makes generation repeatable; cycle year, progress, checkpoints, employee counts and cycle counts control dataset size.
7. **Data-quality cases:** include controlled broken rows when demonstrating readiness blocks.
8. **Train/test structure:** earlier completed cycles train; the latest completed cycle is held out for testing. Employee-cycle groups are never divided.

Changing the seed or another setting marks the current snapshot as changed. Generate again to replace the in-memory preview. Nothing is added to browser draft storage or a database.

### Dataset preview and filters

Choose a scenario tab to rerun readiness for the complete selected dataset. The filters change only the visible table:

- **Search synthetic employee:** matches the pseudonymous employee key.
- **All roles:** limits the preview to one configured role.
- **All cycles:** limits the preview to one appraisal cycle.
- **All checkpoints:** limits the preview to one checkpoint number.

The table shows at most 25 matching rows. **Download CSV** exports the complete selected scenario, not just filtered rows. **Metadata** exports generation settings, checksums and summaries for all scenarios. **Regenerate** returns to setup.

### Readiness result

- **Scenario A — No historical data:** rule-based estimate available; model training blocked.
- **Scenario B — Limited historical data:** low-confidence training gate; evaluation is still required.
- **Scenario C — Sufficient historical data:** training eligible with the latest completed cycle held out.
- **Blocked:** invalid rows or unsafe features prevent both training and a misleading fallback.

Warnings describe limitations that do not invalidate all rows. Blocking findings show the code, explanation and affected-row count. A readiness result permits a later action; it does not approve a model or claim real KCT accuracy.

### Model configuration

For an eligible Scenario B or C dataset, choose **Configure model**. The target remains locked to `final_approved_score` in the configured 0–200 range. Review the earlier training cycles and latest held-out test cycle, then:

- Select one or more permitted checkpoint-safe features. Target, identity, split, active-target and generator-only fields remain excluded.
- Select Ridge regression, Random Forest and/or Gradient Boosting. These are established scikit-learn candidates, not AFPI-created algorithms.
- Keep or change the reproducibility seed.
- Review the always-included pace and role-plus-checkpoint median baselines.

Choose **Train and compare**. The server reruns readiness and reconstructs the feature matrix; browser controls cannot bypass the leakage and split rules.

### Training comparison

The comparison shows MAE, RMSE, normalized MAE, R², a held-out residual range, parameters, row counts and seed. Lower MAE/RMSE/nMAE is better; higher R² is better. A candidate is recommended only when its held-out MAE beats both transparent baselines and its final predictions remain inside the configured range.

**Change configuration** returns to feature/model choices. **Run again** repeats the same frozen snapshot and settings. Choose **Evaluate candidate** only for the recommended candidate that passed both baseline gates.

### Evaluation and approval

Screen 6 shows the candidate metrics, immutable run/snapshot/checksum metadata, selected feature scope, compatibility versions, and limitations. Enter a reviewer and decision note, then choose **Approve candidate** or **Reject candidate**. This is simulated model governance, not the KPI Human Review module. A final decision cannot be changed for that candidate, and approval alone does not activate it.

### Publication

Screen 7 checks the comparison gate, recorded approval, exact organization/target/policy/framework scope, and read-only inference boundary. Choose **Publish model** to activate the approved candidate for that exact scope. A later compatible publication receives the next version and supersedes the earlier record without deleting it. The local registry is process memory only; restarting the server clears it.

### Prediction sandbox

Screen 8 selects a synthetic active checkpoint and one history scenario, then **Predict final score**:

- **Scenario A:** always uses a transparent pace projection and labels it rule-based rather than a trained-model prediction.
- **Scenario B:** uses the compatible published model with low confidence; without one it safely falls back to the transparent projection.
- **Scenario C:** requires the compatible approved and published organization model.
- **Invalid history:** is blocked and lists the readiness findings.

The result shows a score within 0–200, an expected range, method/confidence, checkpoint factors, policy/framework/model versions, timestamp, and warnings. Changing the employee or scenario clears the old result. The sandbox is advisory and explicitly reports that the official verified score was not changed.
