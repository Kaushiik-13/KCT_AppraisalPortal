# Data model

Source of truth: `draftStorage.js`, `workflowModel.js`, `scoringPolicy.js`, and `workflowEngine.js`. Examples use readable IDs; the app generates UUIDs.

## Persisted draft

Storage key: `afpi.kpi-draft.v1`.

```json
{
  "version": 1,
  "savedAt": "2026-10-04T12:00:00.000Z",
  "draft": {
    "name": "Training participation", "fields": [], "nodes": [],
    "policy": {
      "enabled": false, "activeVersion": "", "versions": [],
      "draft": {
        "version": "v1", "mode": "rules", "aggregation": "sum",
        "maxPoints": "", "fallback": "pending", "components": [], "rules": []
      }
    }
  }
}
```

Older drafts without top-level policy remain supported; the hook adds an empty one. Structural validity is separate from execution readiness: unfinished mappings and blank editable values can autosave.

## Input field

```json
{
  "id": "hours", "label": "Training hours", "type": "number",
  "required": false, "help": "Enter attended hours.", "example": "8",
  "options": "", "accept": "", "multiple": false
}
```

Types: `text`, `textarea`, `number`, `integer`, `date`, `datetime`, `email`, `url`, `select`, `multi`, `boolean`, `file`. Options are newline-separated; file filters are comma-separated extensions/MIME types. Actual File objects remain in session values.

## Node

```json
{
  "id": "check-hours", "kind": "condition", "name": "At least eight hours",
  "mappings": {"value": "field|hours"},
  "routes": {"clear": "eligible", "failed": "rejected", "uncertain": "review"},
  "config": {"valueType": "number", "operator": "gte", "expected": "8"}
}
```

Actions store a tool ID in `config.tool` and tool configuration in `config.settings`. Their own route is `next`, even if the selected specialized tool originally had branching routes. For example, the verification-decision tool inside an Action exposes a status; add a Condition to branch on it.

AI retains the internal primary-input mapping key `decision` for compatibility. It accepts `ai_context`, not only publication decisions. Optional `contextInputs`, `referenceText`, and stringified object `outputSchema` configure additional inputs, rubric, and structured output. Schema properties become top-level node outputs after validation. Old AI configurations without these fields remain valid.

## Source references

| Syntax | Meaning |
|---|---|
| `field|hours` | Submitted form value |
| `node|lookup-id|metadata` | Declared earlier output |
| `node|ai-id|response` | AI response text |
| `result|outcome` | Final outcome in standalone policy conditions |
| `node|decision-id|decision.facts.scopus` | Legacy explicit nested policy source; new Publication workflows do not produce index facts |

Ordinary workflow mappings resolve top-level declared output keys. Nested paths are supported by the standalone policy resolver, not arbitrary workflow mappings. Labels may change; IDs provide identity.

## Standalone rule

```json
{
  "id": "eligible-rule", "name": "Eligible training", "match": "all",
  "conditions": [{"source": "result|outcome", "type": "text", "operator": "eq", "expected": "Eligible"}],
  "points": "12", "multiplier": "1", "outcome": "Eligible"
}
```

Version snapshots contain `version`, `mode`, `maxPoints`, `fallback`, `rules`, and formula fields `aggregation` and `components`. A formula component is `{id,name,weight,required}`; its numeric source is mapped later by an Apply scoring policy node. A selected version is copied into each run. This is local configuration versioning, not a database audit log or cryptographic immutability.

## Runtime records

Runs may contain `status`, `trace`, `outputs`, `snapshot`, `issues`, `review`, `reviewNode`, `genericReview`, `decisions`, `result`, and `scoring`. Fields vary by status. A paused legacy routed-review run carries an execution `context` with values and handler references; it is not a portable serialized job. A new terminal review handoff does not carry a resumable context.

Trace entries include node identity, name/kind, timestamps, output, and optional error. Action trace kinds identify the executed tool. New generic Human review is terminal and produces `status: "sent-to-review"` with a package containing submission values, extraction packages, comparison findings, AI recommendations, scoring calculations, and policy versions available on the executed path. It has no workflow decision record or outgoing route. Legacy saved generic reviews and the specialized publication review remain readable.

## Other storage and exports

- `afpi.kpi-draft.v1.recovery`: unreadable draft backup created during explicit recovery replacement.
- `afpi.sidebar.collapsed`: sidebar preference.
- Workflow export: `{format: "afpi-workflow-v1", fields, nodes, policy}`.
- Recovery draft download: `{version: 1, draft}`.

Exports exclude test files/results and server keys. There is no import UI. New schema changes must preserve old drafts or supply an explicit migration.

## Synthetic prediction fixtures

The implemented prediction dataset foundation is separate from the persisted Framework Studio draft. `fixtures/prediction/kct/config/` holds versioned organization, PADS reference-policy and generation configuration. `scripts/generate-kct-prediction-data.mjs` creates immutable synthetic CSV/JSON fixtures under `fixtures/prediction/kct/generated/`.

One completed-history row represents an employee-cycle checkpoint and repeats the completed cycle's final approved score as a target-only field. Active rows contain no target. Identity, policy/framework version, cycle, role, checkpoint timing, current/previous score, evidence count, mandatory status and KRA score/cap columns are explicit. The canonical schema, feature exclusions and split rules are maintained in the [prediction data dictionary](PREDICTION-DATA-DICTIONARY.md).

These fixtures are test/demo data, not browser draft data, runtime predictions, model artifacts or real employee records.

## Prediction readiness result

`evaluatePredictionReadiness` consumes a frozen synthetic snapshot, policy contract, compatibility scope and explicit feature selection. It returns a non-persisted result with:

- `status`: `ready-rule-based`, `ready-for-training`, `fallback-only` or `blocked`.
- `scenario`: `A`, `B`, `C` or `null`.
- Row/case/cycle counts and rejected-row reason codes.
- A latest-cycle time-based split when valid.
- Separate rule-based and model-training eligibility.
- Allowed, selected and excluded feature contracts.
- Blocks, warnings and quality summaries.

The initial raw feature matrix includes only completed rows in train/test partitions, exposes `final_approved_score` as target only, keeps employee-cycle groups intact and records `preprocessingFitScope: "train-only"`. It is an in-memory training input contract, not a trained model or persisted artifact. See [Prediction readiness](PREDICTION-READINESS.md).

## Plugin and reusable configuration

Plugin nodes use kind `plugin`, with config `{plugin: "publication", tool: <operation ID>, settings: <operation config>}`. Existing legacy kinds/Action wrappers remain readable. `use_form_value` stores `fieldId` and a cached `valueType`; execution resolves the current field and emits source metadata. `extract_evidence` stores `mode` (`fields`, `content`, or `both`) and stable field entries `{id,name,type,label}`. `compare_evidence` stores one or more `{id,name,valueType,operator,ignoreCase}` pairs; each pair creates left/right mapping ports. Apply-policy stores `policyVersion` and a snapshot of formula component definitions; each component ID becomes a numeric mapping port. The runner resolves the saved policy version and records its calculation snapshot.

Choosing the complete Publication workflow creates a 10-node graph through `publicationWorkflow(fields, policy)`: submission, PDF extraction, Crossref lookup, evidence comparison, first-author check, assessment-period check, duplicate check, decision, Apply scoring policy Action, and appraiser review. Its decision node excludes the index input, and its template contains no AI node. Clear routes through the saved policy; Needs review and Ineligible bypass scoring. All three routes converge on the same review node. The active policy version is preselected when one exists; otherwise the scoring Action needs configuration. Older drafts retain their 12-node graph, required index mapping, index settings, and scoring policy and remain loadable. Publication operations are wrapped as plugin nodes; submission and scoring Action keep their specialized/generic kinds. This does not change the persisted draft schema. On a populated canvas, replacement is confirmed before the new graph is saved, and the canvas Undo stack retains the previous graph.

Extract evidence emits reserved `evidence`, `content`, and `status` outputs plus configured field IDs. The evidence package preserves format, filename, candidates, confidence, `verified:false`, warnings, and page/slide/sheet locations. Legacy `document_extract`, `compare_values`, `external_lookup`, and `read_*` shapes remain valid for restored drafts but are not offered to new workflows.
