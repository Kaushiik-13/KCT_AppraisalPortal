# Framework Studio — Architecture

## Status

**Proposed logical responsibility.** No production implementation or technical stack is verified by this document.

## Current implementation

No production-oriented Framework Studio implementation has been verified. The previous PoC is historical reference only.

## Proposed responsibility

Framework Studio owns appraisal configuration and the core submission/review lifecycle:

- KPI/KRA definitions, appraisal cycles, assignments and evidence requirements.
- Faculty KPI information/evidence submissions and their progress states.
- Supervisor review of assigned faculty submissions, decisions, feedback, and release of marks per KPI.
- Approved scoring configuration and the appraisal information needed by analytics.

Organization administration supplies institution/member/assignment context. Prediction and Recommendation own their model workspaces and outputs. Analytics consumes appropriate appraisal data but must honor viewer permissions.

## Proposed logical flow

`configure cycle → assign faculty and supervisors → submit evidence → supervisor review → release mark per KPI → update authorized views`

The flow does not specify a final state machine, API, database model, or separately deployed service. Cross-module contracts are tracked in the project [integration document](../../project/INTEGRATION.md).

## Known limitations

Institutionally approved scoring rules, evidence policies, eligibility, exception handling, and change/appeal behavior remain unresolved. No mark calculation or release policy should be inferred from historical PoC code or fixtures.
