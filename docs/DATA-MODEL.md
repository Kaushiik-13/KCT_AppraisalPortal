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
      "draft": {"version": "v1", "maxPoints": "", "fallback": "pending", "rules": []}
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
| `node|decision-id|decision.facts.scopus` | Explicit nested policy source |

Ordinary workflow mappings resolve top-level declared output keys. Nested paths are supported by the standalone policy resolver, not arbitrary workflow mappings. Labels may change; IDs provide identity.

## Standalone rule

```json
{
  "id": "eligible-rule", "name": "Eligible training", "match": "all",
  "conditions": [{"source": "result|outcome", "type": "text", "operator": "eq", "expected": "Eligible"}],
  "points": "12", "multiplier": "1", "outcome": "Eligible"
}
```

Version snapshots contain `version`, `maxPoints`, `fallback`, and `rules`. A selected version is copied into each run. This is local configuration versioning, not a database audit log or cryptographic immutability.

## Runtime records

Runs may contain `status`, `trace`, `outputs`, `snapshot`, `issues`, `review`, `reviewNode`, `genericReview`, `decisions`, `result`, and `scoring`. Fields vary by status. A paused generic run carries an execution `context` with values and handler references; it is not a portable serialized job.

Trace entries include node identity, name/kind, timestamps, output, and optional error. Action trace kinds identify the executed tool. Generic review packages contain the submission values, extraction packages, comparison findings, AI recommendations, scoring calculations, and policy versions available on the executed path. Decisions record action, reviewer, reason, final status, optional override score, package snapshot, and time. Publication decisions also record original/final scores, run identity, and mock-evidence status.

## Other storage and exports

- `afpi.kpi-draft.v1.recovery`: unreadable draft backup created during explicit recovery replacement.
- `afpi.sidebar.collapsed`: sidebar preference.
- Workflow export: `{format: "afpi-workflow-v1", fields, nodes, policy}`.
- Recovery draft download: `{version: 1, draft}`.

Exports exclude test files/results and server keys. There is no import UI. New schema changes must preserve old drafts or supply an explicit migration.

## Plugin and reusable configuration

Plugin nodes use kind `plugin`, with config `{plugin: "publication", tool: <operation ID>, settings: <operation config>}`. Existing legacy kinds/Action wrappers remain readable. `use_form_value` stores `fieldId` and a cached `valueType`; execution resolves the current field and emits source metadata. `extract_evidence` stores `mode` (`fields`, `content`, or `both`) and stable field entries `{id,name,type,label}`. `compare_evidence` stores one or more `{id,name,valueType,operator,ignoreCase}` pairs; each pair creates left/right mapping ports. Apply-policy stores `policyVersion`; the runner snapshots saved versions for review continuation.

Extract evidence emits reserved `evidence`, `content`, and `status` outputs plus configured field IDs. The evidence package preserves format, filename, candidates, confidence, `verified:false`, warnings, and page/slide/sheet locations. Legacy `document_extract`, `compare_values`, `external_lookup`, and `read_*` shapes remain valid for restored drafts but are not offered to new workflows.
