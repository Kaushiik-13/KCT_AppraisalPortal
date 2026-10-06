# Troubleshooting

| Symptom | Check / action |
|---|---|
| App cannot connect | Run `npm.cmd run dev` from the project root; open `http://127.0.0.1:5173/` |
| PowerShell blocks npm script | Use `npm.cmd`, not `npm.ps1` |
| Port 5173 already used | Stop the existing project server; strict-port mode will not silently choose another |
| Draft seems missing | Check exact origin and browser profile; localhost and 127.0.0.1 differ |
| Could not save | Check storage availability/quota; retry or download the draft |
| Saved draft cannot restore | Original remains protected; download current state if needed; replacement creates recovery backup |
| Source not in dropdown | Check compatible type, earlier node order, and whether the field/node was removed |
| Run button disabled | Open Test & review and resolve Finish setup issues |
| Required output unavailable on route | Source may only run on a different branch; move it earlier or use an appropriate optional input |
| Cannot insert final block between steps | Terminal Result/review cannot preserve an existing continuation; place it at a path end |
| PDF cannot open | Use a non-empty unlocked PDF within 20 MiB and 100 pages; scanned PDFs have no OCR support |
| Extracted author/date looks wrong | Candidates need evidence checking; PDF metadata and first-page heuristics are not proof |
| Crossref unknown | Check a unique valid DOI and connection; arbitrary URLs without a DOI are unsupported |
| DOI conflict | Reconcile submitted DOI, extracted DOI, and DOI in URL |
| Index unknown | Mock record or coverage date is missing; this is not a live index lookup |
| Review has no score | Findings are unresolved, an unsupported author case occurred, or policy did not match |
| Duplicate after approval | Expected within the current session for the same DOI and normalized faculty name |
| Draft rule changes do not affect marks | Save a new standalone version and select it; existing saved versions cannot be overwritten |
| Standalone policy rejects publication template | Leave it off for legacy Appraiser review; edit Existing publication policies instead |
| AI says simulated | Select OpenRouter mode for actual generation |
| AI key missing/rejected | Configure server `.env.local`; status only checks non-empty presence, not validity |
| AI response limit / no answer | The key may be valid: a reasoning model can use its output allowance before answering. The adapter now allows 4,096 tokens with low reasoning effort. Run the test again; free-model selection can vary. |
| AI input exceeds supported size | No model was called. Reduce combined input below 100,000 text characters and structure limits; evaluate smaller sections explicitly. Automatic chunking is not implemented. |
| AI unavailable/rate-limited | Retry later or use the configured review path; no paid fallback is configured |
| AI not following expected task | Check saved instructions, selected input, mode, trace, and context limits |
| Review disabled after an edit | Run a fresh test with current configuration/values |
| Whiteboard feels cramped | Hide sidebar; close block library/settings; use zoom and Fit tree width |
| Export cannot be reopened | Import UI is not implemented; export is a configuration artifact for reference |

Do not clear browser storage as a routine recovery step: it removes the only local draft. Clear saved draft is intentional reset, not repair. Never paste a secret key into logs or bug reports.

For PDF content evaluation, select Full document text rather than a single labelled field. Optional labelled fields can be empty. If all pages have no extractable text, AI does not run; supply a text PDF or use manual review.
