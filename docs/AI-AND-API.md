# AI instructions and API

## Configure an AI step

Add Action → AI assistance on any path. Choose AI input from a supported form value or earlier output. Binary file fields and the whole submission record are excluded; use extracted document text instead. Enter System instructions, up to 6,000 characters, and choose the next step.

Each instance has independent instructions. A clear-path node can summarize accepted findings; an uncertain-path node can ask for discrepancies. Outputs are `assistance` (details) and `response` (text). The trace shows instructions used, provider/model when available, and response. AI does not automatically modify recorded facts, marks, or approvals.

| Mode | Behavior |
|---|---|
| `openrouter` | Live request via the local server |
| `simulated` | Explicit simulation; instructions are not executed |
| `disabled` | Explicit no-connection result; no model request |

Older configurations without instructions use `DEFAULT_AI_INSTRUCTIONS`. The internal input key remains `decision` for compatibility, but its accepted type is now `ai_context`.

## Provider adapter

Implementation: `server/ai.js`; middleware registered for both dev and preview in `vite.config.js`. The server requests OpenRouter chat completions using `openrouter/free`, temperature 0.1, and `max_tokens: 4096` with `reasoning: { effort: "low", exclude: true }`. There is no paid fallback. Actual model selection can vary.

Messages separate the application-level constraints, creator-written system instructions, and user-role evidence JSON. Evidence commands are not intended to become instructions. This prompt separation is a mitigation, not a guarantee against model mistakes or prompt injection.

Server timeout is 45 seconds; browser timeout is 50 seconds. Returned content is limited to 12,000 characters. Length-limited responses (including partial text) are rejected with a response-limit message. Provider failure, missing key, rate limiting, or empty output produces an explicit non-success status instead of fabricated advice. The engine then follows the configured next route; failure does not automatically create a human-review branch.

## Input bounds

`prepareAIInput` permits 100,000 text characters across selected inputs (no separate 2,000-character string cutoff), arrays up to 200 entries, 40 keys per object, and eight levels of nesting. Serialized context is capped at 180,000 characters. Inputs exceeding any limit are rejected before provider execution on both client and server; truncated material is never evaluated as a complete document. Binary Blob/File content is omitted. The endpoint accepts at most 650,000 bytes, allowing Unicode JSON and system instructions. Automatic chunking and OCR are not implemented.

Publication decision inputs with checks/facts are summarized on the server, including duplicate counts rather than full duplicate record bodies. Arbitrary selected input types can still contain personal data; creators choose what to send.

## Endpoint access

Endpoints accept loopback peers only. A supplied Origin must match `http://` plus the request Host. This is a local PoC restriction, not an authenticated multi-user security model. Responses use JSON and `Cache-Control: no-store`.

### `GET /api/ai-status`

```json
{"configured": true, "model": "openrouter/free"}
```

Configured means a non-empty key is present. No key content is returned and no model availability test is performed.

### `POST /api/ai-assistance`

Header: `Content-Type: application/json`.

```json
{
  "input": {
    "data": {"status": "clear", "finding": "Simulated primary-author match"},
    "truncated": false
  },
  "instructions": "Summarize these findings for the appraiser. Label simulated evidence."
}
```

Legacy `{ "decision": { ... } }` requests remain accepted; they no longer require `status: uncertain`. If instructions are omitted, the default is used. Empty/null input and blank/oversized instructions are rejected.

Example successful response shape (illustrative):

```json
{
  "status": "advisory", "summary": "A generated summary.",
  "model": "provider-selected-model", "provider": "OpenRouter",
  "inputTruncated": false, "simulated": false, "questions": [],
  "receivedAt": "2026-10-04T12:00:00.000Z"
}
```

`not-connected` and `unavailable` responses generally include summary, questions, and null model. Provider failures can return HTTP 200 with a non-success body status; check both HTTP and JSON status.

| HTTP status | Meaning |
|---|---|
| 400 | Invalid JSON/input/instructions |
| 403 | Non-local peer or mismatching Origin |
| 405 | Unsupported method |
| 413 | Request body exceeds 650,000 bytes |
| 415 | Not JSON |
| 429 | Another AI request is active in this server instance |
| 500 | Local middleware failed |

The concurrency guard is one active request per middleware instance, not per account. There is no authentication, provider failover, paid fallback, queue, or public hosting contract.

Response diagnostics retain the selected model and finish reason for empty or length-limited output. Server logs contain only model, finish reason and whether answer text exists; no evidence, instructions, credentials or reasoning text. There is no automatic retry. Free models can still time out or exhaust the allowance.

## Document evaluation inputs

Generic extraction always exposes Full document text and Text by page. Select one as AI input. Add context inputs (up to eight) for Topic Name, Faculty Name or an earlier reference extraction. Name each context and map its source. Missing configured context stops AI generation.

Rubric / reference material accepts up to 12,000 characters saved with the node. System instructions (6,000 characters) specify how to evaluate. The combined user-role payload contains primaryInput, additionalInputs (name/value pairs), and referenceMaterial. Existing single-input nodes retain their original payload. Context selection/rubric autosave; uploaded documents and test values do not.

This supports alignment with supplied requirements. No web search is performed; instructions cannot establish current market demand without dated external evidence. See [content relevance walkthrough](CONTENT-RELEVANCE-KPI.md).
