# Workflow engine

Primary implementation: `src/workflowEngine.js`. Graph editing/layout: `src/treeModel.js`.

## Execution lifecycle

1. `validateRunConfiguration` checks the graph and, when enabled, the selected standalone scoring version.
2. A snapshot of the nodes and active scoring version is captured.
3. Execution starts at exactly one submission trigger; it validates actual form values.
4. Each step resolves mapped form values or outputs, invokes its handler, and records a trace entry.
5. The route selects the next step. Unselected paths do not execute.
6. A new generic Human Review sends a terminal package, a Result completes, and an error stops the run with an issue. Only legacy routed reviews pause for continuation.

Preflight can succeed with an empty test form; required values are checked at submission execution. Missing optional form values can flow into a Condition as unknown. An unavailable required node-output dependency is an execution error.

## Validation

Checks include known kinds/tools, names, required mappings, compatible earlier sources, all declared route targets, date settings, policies, mock records, reachability, cycles, and required dependencies along every path reaching a step. A source earlier in the node array is not necessarily executed on every branch; path validation checks that distinction. Optional inputs may be absent on a path.

The same preflight feeds Test & review's Finish setup list and the runner. Named issues can open a node's settings. Removing/changing fields or tools may make mappings invalid; the engine does not silently fabricate replacement evidence.

## Branch behavior

| Node | Route keys | Behavior |
|---|---|---|
| Submission / ordinary Action | `next` | Continue |
| Generic Condition | `clear`, `failed`, `uncertain` | UI: Met, Not met, Needs review |
| Original publication decision | `clear`, `uncertain`, `ineligible` | Domain findings select route |
| Generic Human review | None | Terminal handoff to the separate Human Review module with the complete evidence and score package |
| Result | None | Complete and optionally score |
| Original Appraiser review | None | Pause for terminal score decision |

Generic types are text, number, date, and boolean. Operators are equality/inequality, plus inclusive greater/less comparisons for number/date. Zero and false are valid values. Invalid or missing values become uncertain rather than a failed condition. Text comparison is exact, not fuzzy.

When the publication decision tool is placed inside a generic Action, that Action still follows `next`; use its status output in a separate Condition.

## Review and resumption

New Human review nodes end execution with `sent-to-review`. They contain the original submission, extracted evidence, comparisons, AI recommendations, scoring calculations, and policy versions produced on the executed path. Framework Studio does not collect approve/reject/clarification actions or resume from this handoff. `resumeWorkflow` remains only for compatibility with older saved generic review nodes that still have routes.

`finalizeReview` handles the original publication review: approve, reject, clarify, or override. Ordinary approval requires a resolved score. Overrides require a reason and a non-negative score; the original recommendation is preserved. The UI prevents duplicate recording and stale review decisions.

These protections are local UI/runtime behavior, not durable or authenticated server guarantees.

## Editing and layout

Insertion preserves a continuation when the inserted block has a suitable next/clear route. Terminal insertion cannot silently sever an existing chain. Moving a supported linear node reconnects its old and new positions and rejects loops. Shared/branch/terminal nodes have restricted drag movement. Deleting a branch keeps descendants as unconnected work. Topological ordering supports source suggestions, and layout places shared nodes once.

No parallel execution, retry scheduler, durable pause, looping clarification route, or background job queue is implemented. Corrected evidence starts a fresh test.

## Reusable execution and plugin wrappers

Plugin nodes unwrap `config.tool` and `config.settings` for execution and retain the operation routes. Publication decision and terminal review use their existing execution semantics. General Actions call `reusableTools.js`; format adapters are dispatched by `documentReader.js`. Dynamic extraction/comparison/schema ports use stable IDs. Formula policy components also become stable numeric input ports on Apply scoring policy; the creator manually maps them to earlier workflow outputs. Required missing components remain pending. Conditional policy preflight rejects final-outcome and later-output dependencies.

Extraction returns candidates and locations, never verified facts. Compare evidence converts missing or unparsable values to `unknown`; it only returns `mismatch` when two usable values disagree. AI schema outputs are parsed and validated before entering the output map. This keeps Conditions and scoring tied to structured values rather than raw model prose.
