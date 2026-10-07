# Tools and extensions

Blocks describe workflow structure. Tools describe an Action's capability. The catalogue is defined in code. The Plugin block opens a modal containing the built-in Publication plugin. There is no installable marketplace or runtime MCP connection layer yet.

## Current tools

| Tool ID | Input | Output | Notes |
|---|---|---|---|
| `use_form_value` | Selected form field | `value`, `source` | Type follows the form definition; mapping only, no verification |
| `extract_evidence` | One PDF/PPTX/XLS/XLSX file | Evidence package, content, configured fields, status | Local adapters; candidate values with page/slide/sheet references |
| `compare_evidence` | One or more typed source pairs | `comparison`, `status` | Per-pair `match`, `mismatch`, or `unknown` |
| `extract` | One PDF file field | `paper`, `doi` | Local PDF.js; candidates with evidence |
| `lookup` | DOI, optional claimed DOI and URL | `metadata` | Crossref; DOI conflicts block lookup |
| `compare` | Paper and metadata | `comparison` | Conservative agreement/conflict checks |
| `author` | Faculty name, metadata | `author` | Unique normalized first-author match |
| `period` | Metadata, configured dates | `period` | Complete selected date, inclusive boundaries |
| `index` | Metadata, registry | `index` | Mock paper-level coverage, never live indexing |
| `duplicate` | Metadata, faculty, seed/session records | `duplicate` | DOI plus normalized faculty name |
| `decision` | Five publication findings | `decision`, `status` | Domain aggregation |
| `ai` | Primary and additional inputs, rubric, instructions, optional schema | `assistance`, `response`, configured structured fields | Advisory evaluation; schema output is validated before exposure |
| `score` | Publication decision and policy | `score`, `points` | Existing primary-author scoring |

Submission and original Appraiser review are specialized template nodes rather than selectable Action tools. Generic Human review and Result are separate blocks.

## Developer extension checklist

1. Add a stable tool ID, label, description, typed input/output ports, and defaults in `workflowModel.js`. Keep IDs stable once persisted.
2. Add its execution handler in `executeNode`. Return declared output keys; use explicit missing/unknown/error states.
3. Add configuration controls and preflight checks. Extend `validDraft` for new configuration shapes while preserving incomplete editable drafts.
4. Add meaningful handler, mapping, failure, and integration tests. Use injected adapters for network behavior.
5. Add readable output presentation in `ResultSummary` or `WorkflowTest`.
6. If useful for policy, expose appropriate scalar outputs or add explicit policy source paths. Nested workflow paths are not automatically supported.
7. Document data transfers and update this catalogue.

`exampleWorkflow` constructs the twelve-step publication template from the legacy `tools` array and uses positional routing. Do not casually append an unrelated tool there: update the template builder or place general capabilities in the separate catalogue. Verify the twelve-step example after catalogue changes.

## Contract guidance

Separate a claim from verification. A provider timeout is unknown, not a negative finding. Preserve source, retrieval time, scope, coverage, and simulated flags where relevant. Avoid passing binary files or credentials through JSON ports. Treat model output as generated text, not automatically trusted evidence.

Installable third-party plugin support still needs a manifest/schema, adapter registration, permissions, secret management, versions, compatibility checks, and failure behavior. The built-in Publication picker does not provide third-party installation or credentials.

## Reusable Actions and Publication plugin — 5 October 2026

Action now lists general tools only; existing publication Actions remain editable for compatibility. Add **Plugin** (below Result), choose **Publication**, then choose a tool. One plugin step invokes one operation. Publication decision steps retain three routes; Appraiser review remains terminal. AI is a general Action.

| General tool | Creator settings | Behavior |
|---|---|---|
| Use form value | Existing form field | Passes its value and source metadata; type follows the field automatically |
| Extract evidence | Mode (fields/content/both), named typed fields and printed labels | PDF/PPTX/XLS/XLSX adapters; unverified candidates, full content, warnings and source locations |
| Compare evidence | One or more source pairs, type, operator, text case handling | Overall and field-level match/mismatch/unknown results; missing evidence is unknown |
| Check date range | Date source and inclusive boundaries | Eligible/ineligible/uncertain |
| Find duplicates | Identifier and owner sources; test records | Checks both fields; scope is configured records only |
| Apply scoring policy | Saved version | Provisional points from input/earlier-output rules; no final-outcome dependencies |
| AI evaluation | Primary/additional inputs, rubric, system instructions and optional object JSON schema | Advisory response plus validated top-level schema fields for conditions |

Extraction supports text, number, ISO date and boolean fields. PDF pages, PPTX slides and spreadsheet sheet/range locations are retained. Legacy binary PPT is not supported; `.ppt` must be saved as `.pptx`. The extractor does not provide OCR or semantic inference, and it never marks candidates verified. Custom output IDs remain stable on rename. General duplicate checks do not automatically capture approvals or provide organization-wide history. Condition supplies branching; Human review and Result remain reusable blocks.

The four legacy Read tools, generic External lookup, old PDF extractor and single-pair comparator remain loadable only so existing saved drafts do not break. They are hidden from the new Action catalogue. A future Connector/MCP layer must define authentication, secret storage, permissions, response schemas, retries and timeouts before arbitrary external services return to the creator UI.
