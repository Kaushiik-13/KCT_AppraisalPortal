# Organization — UI/UX

## Status

**Proposed design** for the first-release institution administrator workspace. No production organization UI, onboarding, or authorization has been verified as implemented.

## User and purpose

The organization administrator builds and facilitates the institution's appraisal operation. The workspace should make setup and institution-level analysis clear without taking over the supervisor's operational review and mark-release role.

## Proposed workspace areas

- Institution profile and administrative setup.
- Member and supervisor assignment management.
- Appraisal-cycle setup and links to KPI/KRA configuration in Framework Studio.
- Entry points to prediction and recommendation model workspaces and sandbox evaluation.
- Institution-level dashboards for KPI, KRA, and faculty analytics.

These are information areas, not approved routes or a final navigation layout. Domain-specific configuration remains owned by its relevant module.

## Primary journey

1. Administrator starts institution setup and enters the institution name, type, official contact email, country, and time zone.
2. The first administrator creates and verifies their personal account; do not ask for or store a shared organization email password.
3. Administrator optionally adds departments, schools, or other organizational units, with a way to skip or complete this later.
4. Administrator invites employees individually or imports a roster from a validated template; review detected duplicates and invalid rows before sending invitations.
5. Administrator assigns faculty and supervisor responsibilities, maps supervisors to the faculty they review, and checks the assignment summary before confirming.
6. Administrator sees setup progress and can resume unfinished steps, then configures an appraisal cycle and opens Framework Studio for KPI/KRA, evidence, and scoring setup.
7. Administrator opens the Prediction and Recommendation workspaces when ready to configure and evaluate models.
8. Administrator monitors institution-level KPI, KRA, faculty performance, and setup readiness analytics according to approved access.

Supervisors review assigned faculty submissions and release marks per KPI. The administrator workspace should show operational status and analytics without representing an administrator action as a supervisor release.

### Onboarding screens and responsibilities

| Screen | What the administrator does | Why it is needed |
|---|---|---|
| Institution profile | Enter institution identity and locale details. | Establishes the institution context and communication settings. |
| Administrator account | Verify the first administrator's personal work email and identity. | Gives the institution a traceable account owner without using shared credentials. |
| Organization structure | Optionally add departments or units. | Supports assignment and reporting organization while allowing a simple institution to skip this step. |
| Employee invitations/import | Invite employees or preview a roster import; fix invalid or duplicate rows. | Supports both small teams and larger institutions without silently accepting bad records. |
| Roles and supervisor assignments | Assign faculty/supervisor responsibilities and map review scopes. | Establishes who submits and who may review each faculty member. |
| Review and finish | Confirm institution details, units, invitations, roles, and supervisor mappings. | Catches setup errors before the administrator proceeds to appraisal configuration. |

Treat invitation, organization membership, appraisal role, and supervisor-to-faculty assignment as related but separately understandable concepts. A person with supervisor and faculty responsibilities can use both workspaces, but cannot review or release their own submission. Apply only approved permissions; the screens do not themselves define the server authorization contract.

## Required states

- No institution setup or incomplete setup.
- Email verification pending, setup saved for later, or first-admin access unavailable.
- No organizational units, no members, pending invitations, expired invitation, duplicate employee, invalid import row, or invitation failure.
- Missing supervisor mapping, conflicting assignment, self-review conflict, or assignment changed during setup.
- No active appraisal cycle, configuration draft, validation error, or published/active configuration where applicable.
- Model workspace empty, training/evaluation running, failed, or results unavailable.
- Analytics loading, empty, stale, partially available, or access denied.
- Session expired, permission removed, or institution context unavailable.

## Known limitations and open decisions

- First-release onboarding, identity verification, role assignment, and exact permission rules are not defined.
- The institution context is a product boundary; one-institution release does not equal verified multi-tenant isolation.
- Dashboard metric definitions and the administrator's detailed monitoring/operations responsibilities require stakeholder agreement.
- Final navigation, responsive layouts, accessibility evidence, and screen designs remain to be produced and reviewed.
