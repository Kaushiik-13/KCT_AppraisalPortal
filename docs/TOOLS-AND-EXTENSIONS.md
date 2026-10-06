# Tools and extensions

Blocks describe workflow structure. Tools describe an Action's capability. The catalogue is defined in code. The Plugin block opens a modal containing the built-in Publication plugin. There is no installable marketplace or runtime MCP connection layer yet.

## Current tools

| Tool ID | Input | Output | Notes |
|---|---|---|---|
| `read_text` / `read_number` / `read_date` / `read_boolean` | Compatible value | `value` | Typed value selection |
| `extract` | One PDF file field | `paper`, `doi` | Local PDF.js; candidates with evidence |
| `lookup` | DOI, optional claimed DOI and URL | `metadata` | Crossref; DOI conflicts block lookup |
| `compare` | Paper and metadata | `comparison` | Conservative agreement/conflict checks |
| `author` | Faculty name, metadata | `author` | Unique normalized first-author match |
| `period` | Metadata, configured dates | `period` | Complete selected date, inclusive boundaries |
| `index` | Metadata, registry | `index` | Mock paper-level coverage, never live indexing |
| `duplicate` | Metadata, faculty, seed/session records | `duplicate` | DOI plus normalized faculty name |
| `decision` | Five publication findings | `decision`, `status` | Domain aggregation |
| `ai` | Selected `ai_context`, instructions | `assistance`, `response` | Any path; bounded text/structured input |
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
| Extract document information | Optional named, typed outputs and printed labels | Always emits full document text and text by page; optional `Label: value` candidates; missing text and conflicting fields stay uncertain |
| Compare values | Two sources, type, operator, text case handling | Match/difference/uncertainty plus nullable boolean |
| Check date range | Date source and inclusive boundaries | Eligible/ineligible/uncertain |
| Find duplicates | Identifier and owner sources; test records | Checks both fields; scope is configured records only |
| External lookup | HTTPS GET URL with `{value}`; named typed JSON paths | Public browser API call with credentials omitted; requires CORS; failures stay unknown |
| Apply scoring policy | Saved version | Provisional points from input/earlier-output rules; no final-outcome dependencies |

Extraction supports text, number, ISO date and boolean outputs. It does not provide OCR or general semantic extraction. Custom output IDs remain stable on rename. Lookup paths use dot notation (including numeric array indices). Do not put API keys in configuration; authenticated API adapters remain future work. General duplicate checks do not automatically capture approvals or provide organization-wide history. Condition supplies branching; Human review and Result remain reusable blocks.
