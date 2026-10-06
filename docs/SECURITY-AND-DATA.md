# Security and data handling

## Current data locations

| Data | Location / transfer |
|---|---|
| KPI fields, graph, policies, AI instructions | Browser localStorage |
| Uploaded PDFs and parsed text | Browser session memory |
| Submitted values, traces, reviews | Browser session memory |
| Approved duplicate records | Current workflow session |
| DOI | Browser to Crossref for lookup |
| Selected AI input excerpts and instructions | Browser to same-origin Next.js route, then OpenRouter in live mode |
| OpenRouter key | Server environment / ignored `.env.local` |

The PDF binary is not uploaded by the app's AI path, but selected extracted text may be sent externally. A local draft is not encrypted storage, a cloud backup, or an audit log. Saved policies/instructions can contain personal text if the creator enters it.

## Implemented protections

- Keys remain server-side and are not included in draft exports or status responses.
- The AI POST endpoint requires a same-origin host/protocol in production, including forwarded Vercel headers; it also bounds requests and has timeouts/concurrency control.
- Context is bounded and evidence is separated from system instructions.
- PDF extraction disables PDF.js eval support and enforces size/page limits.
- Models do not directly mutate evidence or approve scores; deterministic engine/review actions own those operations.
- Corrupt drafts are protected against automatic overwrite; clearing requires confirmation.

Do not interpret these as production security guarantees. Origin validation is not user authentication and the in-memory concurrency guard is not a distributed rate limit. Browser state can be modified locally. Reviewer names are not authenticated. Arbitrary creator policies may consume AI response text as a condition source; the PoC has no trust-level enforcement for evidence.

## Retention and deletion

Reload drops submission values, files, runs, reviews, and approved duplicate records. It preserves draft configuration and saved policy versions. Clear saved draft removes the draft and recovery backup, then reloads; the sidebar preference remains. Already downloaded exports and any external-provider records are not deleted by this action.

Storage is scoped to one profile/origin. Another tab can write the same draft key; cross-tab coordination, locking, and conflict resolution are not implemented.

## Before production

Plan authentication, tenant-scoped authorization, trustworthy faculty/reviewer identity, encrypted evidence storage, malware/file controls, provider-data agreements, retention/deletion policy, audit durability, rate limits, secret rotation, observability, and tested backup/restore. Determine which evidence may leave the institution and who can authorize it. These are design tasks, not compliance certifications supplied by this PoC.

## Sample material

The included PRISMA paper retains its original attribution and license notice; see [sample notes](../public/samples/README.txt). Mock index coverage is test data and must not be presented as verified indexing. This repository currently does not define a separate project-wide software license.

AI adapter diagnostic logs include only selected model, finish reason and answer-presence boolean. They do not log instructions, evidence, keys or internal reasoning.

General External lookup sends the selected lookup value to the creator-configured HTTPS public API from the browser, without cookies. CORS must permit it. URLs/settings are saved in the draft: never include credentials or keys. JSON responses are limited to 1 MB after reading; timeout is 18 seconds. Generic PDF extraction is local and produces unverified candidates.

When Full document text is selected for live AI, the extracted text (plus selected context and creator reference material) is sent to OpenRouter. The binary PDF remains local. The AI text budget is 100,000 characters; oversize/structurally truncated inputs are rejected without provider calls. Reference material is saved in browser draft configuration, so do not paste secrets into it.
