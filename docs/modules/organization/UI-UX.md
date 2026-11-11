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

1. Administrator enters the institution workspace and sees setup status and next required tasks.
2. Administrator manages permitted members and assigns supervisors.
3. Administrator configures appraisal periods and opens Framework Studio to establish KPI/KRA definitions, assignments, and evidence requirements.
4. Administrator configures prediction and recommendation capabilities in their sandbox workspaces and reviews evaluation/readiness information.
5. Administrator monitors institution-level KPI, KRA, and faculty analytics.

Supervisors review assigned faculty submissions and release marks per KPI. The administrator workspace should show operational status and analytics without representing an administrator action as a supervisor release.

## Required states

- No institution setup or incomplete setup.
- No members, pending invitations, duplicate invitation, or invalid assignment.
- No active appraisal cycle, configuration draft, validation error, or published/active configuration where applicable.
- Model workspace empty, training/evaluation running, failed, or results unavailable.
- Analytics loading, empty, stale, partially available, or access denied.
- Session expired, permission removed, or institution context unavailable.

## Known limitations and open decisions

- First-release onboarding, identity verification, role assignment, and exact permission rules are not defined.
- The institution context is a product boundary; one-institution release does not equal verified multi-tenant isolation.
- Dashboard metric definitions and the administrator's detailed monitoring/operations responsibilities require stakeholder agreement.
- Final navigation, responsive layouts, accessibility evidence, and screen designs remain to be produced and reviewed.
