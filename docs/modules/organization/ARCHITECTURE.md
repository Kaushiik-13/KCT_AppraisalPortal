# Organization — Architecture

## Status

**Proposed logical responsibility.** This is not a verified production module or a technology/deployment decision.

## Current implementation

No implementation of the production-oriented Organization module has been verified. Earlier PoC behavior is historical reference only.

## Proposed responsibility

The Organization capability represents the first-release institution context and the administrative setup needed to facilitate appraisal work. Its proposed responsibilities are:

- Maintain institution setup and permitted membership/role assignments.
- Establish which supervisors are responsible for which faculty and appraisal periods, subject to the approved policy.
- Provide institution context to other capabilities so configuration and analytics are associated with the correct institution.
- Present administrative entry points to framework setup, model workspaces, and institution-level analytics.

KPI/KRA rules and appraisal scoring belong to Framework Studio. Prediction and recommendation workspaces belong to their respective modules. Supervisors perform review and release KPI marks through Framework Studio; Organization does not own that operational decision.

## Proposed dependencies

- Framework Studio consumes institution, member, and assignment context.
- Prediction and Recommendation consume approved institution configuration and authorized data under future contracts.
- Analytics combines approved information from the relevant modules and applies the approved viewer scope.

These are conceptual dependencies. APIs, data ownership, database boundaries, event flows, and service deployment are open.

## Known limitations

- Authentication, authorization, membership lifecycle, and supervisor assignment semantics are not defined.
- The first release targets one institution. Future shared multi-organization isolation requires a separate design and verification effort.
- No production persistence model, API, or security enforcement is claimed.
