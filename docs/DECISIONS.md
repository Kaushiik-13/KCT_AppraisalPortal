# Design decisions and open questions

These records summarize accepted conversation choices and implemented behavior; they are not signed institutional approvals.

| ID | Decision | Reason / consequence |
|---|---|---|
| D-01 | Build Framework Studio first | Test workflow creation before the full appraisal platform |
| D-02 | Use no persistent database in the PoC | Faster experimentation; browser draft only, session reviews |
| D-03 | Support dynamic forms and reusable blocks | Allow different institutions/KPIs to compose workflows |
| D-04 | Use a tree/DAG canvas with simple insertion | Clear hierarchy, shared later steps, no cycles |
| D-05 | Keep the publication example optional | Complex reference case without forcing every KPI into it |
| D-06 | Limit publication auto-scoring to first-listed author | Other-author and corresponding-author rules need agreement |
| D-07 | Mock index verification initially | Demonstrate workflow without claiming provider integration |
| D-08 | Use OpenRouter free routing for live AI | User-selected provider; no paid fallback configured |
| D-09 | Let creators configure AI purpose per node | Summary on clear paths and analysis on uncertain paths |
| D-10 | Keep deterministic scoring and recorded review separate from AI generation | AI text does not directly mutate marks or evidence |
| D-11 | Save named standalone policy versions | Draft edits must not alter earlier test snapshots |
| D-12 | Keep two scoring paths temporarily | Preserve existing publication behavior while generalizing the builder |
| D-13 | Desktop first, compact canvas | Mobile excluded; collapsible navigation and reduced chrome |
| D-16 | Use Next.js App Router for deployment readiness | Preserve the browser workflow engine behind a client-only boundary; expose AI through Node route handlers and keep secrets server-side |

## Unresolved domain questions

- The reported workbook co-author rule conflict: all co-authors at 50% versus second at 50% and third at 25%.
- Corresponding author versus list-position precedence and evidence requirements.
- SAE meaning/treatment in the institutional KPI, including whether it is a publication category rather than an index.
- Publication date precedence: online, print, issued, accepted; treatment of conflicting dates.
- Whether indexing evidence must be paper-level, journal-level, or both, and at which date.
- Eligibility of specific publication/document types, including the methodology guideline used as the fixture.
- Cycle-level score caps, repeat submissions across cycles, and legitimate co-author submissions.

## Unresolved product/technical decisions

Canonical durable final-score records; policy release governance; reviewer permissions; evidence trust levels; multi-tenant model; durable review/job infrastructure; integration provider contracts; import/migration behavior; plugin installation/security.

Resolve these with the project owner and institutional stakeholders before presenting the PoC's defaults as policy authority.

## AI response allowance — 5 October 2026

Use 4,096 completion tokens and low reasoning effort on the free router. Exclude reasoning text, reject length-limited answers, and retain safe response metadata. Keep existing timeouts and manual retry; no paid fallback. This addresses a reproduced successful HTTP response with no final answer at the earlier 900-token limit.

## D-14 — Built-in plugins and reusable actions

Publication is offered through a Plugin block/modal; legacy IDs stay compatible. General actions expose configurable typed outputs and verification checks. The initial generic extractor is deterministic label-based extraction, not an AI/OCR promise. Public external lookup runs in the browser; authenticated integration/installation remains planned. An explicit scoring step uses saved policy versions before final outcome.

## D-15 — Full document text and explicit evaluation context

Expose extracted PDF text and pages without requiring labelled fields. Preserve page/coverage warnings; all-unreadable PDFs yield null text. Support named additional AI inputs and separate creator reference material. Replace the 2,000-character string clipping with a 100,000-character combined budget and refuse truncated evaluation. Chunking/OCR and web-search integration remain separate work.

## D-16 — Next.js migration and Vercel boundary

Use Next.js 16 App Router as the application host. Keep the existing Framework Studio, workflow engine, PDF processing and autosave in a client-only boundary because they depend on browser APIs and browser-owned state. Use Node route handlers for AI status and provider calls. Copy the PDF.js worker into `public/` during development/build instead of relying on a bundler URL import. This establishes deployment compatibility; it does not add a database, authentication, distributed rate limiting or a production deployment.

## D-17 — Evidence-first Framework Studio vocabulary

Replace the four creator-facing typed Read actions with one `use_form_value` mapping action. Replace the PDF-only generic extractor and single-pair comparator with `extract_evidence` and `compare_evidence`; preserve legacy IDs only for saved-draft compatibility. Remove generic External lookup from the new catalogue until a connector/MCP contract can own authentication, secrets, permissions, schemas, retries and timeouts.

Extraction produces candidates, not verification. Common evidence output carries format-specific page/slide/sheet locations, warnings, confidence and `verified:false`. Missing comparison operands produce `unknown`, not `mismatch`. AI is named evaluation, accepts multiple inputs plus rubric, and may expose validated JSON-schema fields. It remains advisory. Generic human review receives the executed submission/evidence/comparison/AI/scoring/policy package and can approve, reject, clarify, or record a reasoned score override; the policy calculation remains preserved separately.
