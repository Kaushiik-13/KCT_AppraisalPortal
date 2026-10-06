# Phase 6 verification

Desktop PoC checked on 4 October 2026. Tests used isolated browser sessions, leaving the user's saved KPI untouched.

## Usability changes

- Test & review checks workflow and policy setup before enabling a run. Named step issues offer an Edit step shortcut to the relevant settings drawer.
- Condition paths and test results use Met, Not met, and Needs review. Number comparisons say At least / At most; dates use On or after / On or before.
- Condition and Human review settings can connect to existing steps, allowing shared results or reviews. Loop prevention still applies.
- Cards flag missing next connections, and publication Actions flag missing DOI/URL mappings or assessment dates.
- Completed outcomes use neutral styling; pending scoring remains visibly marked as pending.
- A failure in a tool after human review preserves the decision already recorded.

## Browser checks

| Workflow | Check | Observed result |
|---|---|---|
| Publication | Local sample PDF, live Crossref metadata, mock indexing | 24 provisional points, paused for appraiser |
| Publication | Approve with appraiser identity | 24 approved points; one session record |
| Publication | Repeat same paper and faculty | Duplicate candidate; score pending; ordinary approval disabled |
| Training | Missing comparison configuration | Preflight issue shown; Edit step opened the Condition settings |
| Training | Set threshold to 8 and reload | Configuration and saved scoring version restored |
| Training | Submit 8 hours | Eligible, 12 points under v1 |
| Training | Submit 7 hours | Rejected, 0 points under v1 |
| Training | Leave optional hours blank | Paused for coordinator review |
| Training | Change inputs during pending review | Old review disabled until rerun |
| Training | Request clarification with a reason | Clarification branch completed; scoring remained pending |

No browser console errors were reported during these checks. Browser fixtures were seeded with the application's model constructors; configuration correction, submission, approval, clarification, and scoring were exercised through the UI. Existing unit tests also cover drag/drop graph operations, all reviewer branches, policy immutability, missing evidence, and autosave.

Validation: 67 automated tests passed; production build passed.

## PoC boundaries

Indexing is simulated. The live browser check verified Crossref lookup, not Scopus/WOS membership. Live AI was not tested in this phase; simulated assistance was selected for uncertain publication cases. Drafts and policy versions persist in browser storage; submissions, files, decisions, and duplicate records are session-only. The separate policy runs at Result endings; the original publication example retains its policy before appraiser review. Mobile layouts were outside scope.
