# AFPI — Information architecture and application shell v1.0

**Status:** Proposed navigation and route taxonomy for the production-oriented rebuild. Issue: [#43](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/43). Not currently implemented. Related tenant/auth decisions: [#44](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/44).

## App shell
- Persistent desktop left sidebar; collapses to icons and becomes a keyboard-accessible Sheet/drawer on smaller screens.
- Sidebar header: AFPI product identity plus organization context/switcher **only when authorized**.
- Sidebar body: Overview, Framework Studio, Prediction, Recommendation and Organization groups; hide/disallow routes according to server-verified permissions, not client hints alone.
- Sidebar footer: help/documentation entry, account/profile menu and sign-out (when authentication exists).
- Workspace header: SidebarTrigger, breadcrumbs, selected organization context, contextual primary action, and account controls. Do not duplicate controls just for decoration.
- Workspace content: title, short purpose/description, optional page-level actions, then tabs/filters/workspace. Use consistent max-width for forms, flexible width for data tables, full canvas for workflow editor.

## Proposed navigation structure (not implemented)
```text
AFPI
├── Overview
├── Framework Studio
│   ├── Frameworks
│   ├── KPI / Policy Library
│   ├── Workflow Builder
│   └── Reviews & Evidence
├── Prediction
│   ├── Overview
│   ├── Datasets & Readiness
│   ├── Model Training & Evaluation
│   ├── Model Registry / Approval
│   └── Predictions
├── Recommendation
│   ├── Overview
│   ├── Recommendations
│   └── Review & Follow-up
└── Organization
    ├── Organization Profile
    ├── Members & Roles
    ├── Settings
    └── Audit Activity
```

All named destinations are **candidate information areas**, not confirmed backend features or approved screens. Module owners may regroup areas during journey mapping. Keep global navigation shallow; use page-level tabs for secondary detail.

## Route taxonomy — proposals only
| Navigation area | Candidate route | Primary intent |
|---|---|---|
| Overview | `/app` | Organization-aware workspace entry |
| Framework Studio | `/app/frameworks` | Browse/manage frameworks |
| Framework Studio | `/app/frameworks/[frameworkId]/builder` | Configure/version a workflow |
| Framework Studio | `/app/reviews` | Human review/evidence queue |
| Prediction | `/app/prediction` | Prediction workspace |
| Prediction | `/app/prediction/datasets` | Readiness and dataset versions |
| Prediction | `/app/prediction/models` | Training, evaluation, approval |
| Prediction | `/app/prediction/results` | Results and explanation |
| Recommendation | `/app/recommendations` | Review recommendation cases |
| Organization | `/app/organization` | Profile/configuration |
| Organization | `/app/organization/members` | Membership/roles |
| Organization | `/app/organization/audit` | Audit events |
| Onboarding | `/onboarding` | Permission-scoped organization setup |

Routes are design examples, **not promises that these endpoints exist**. Tenant routing strategy (path vs session vs subdomain), invitation flow and auth redirects remain blocked by #44.

## Navigation behavior
- Active section and page are obvious via semantics, contrast and icon + text (not color alone).
- Remember desktop sidebar collapse preference if appropriate; do not treat local storage as authoritative organization selection.
- Breadcrumbs reflect real navigation hierarchy; deep links survive refresh.
- Responsive sidebar: drawer closes on selection and restores focus; all actions keyboard accessible.
- Error/boundary states: no organization, multiple organizations, invitation pending, access revoked, insufficient permission, missing resource, offline/network error and empty workspace.
- Org-switching must invalidate/refresh tenant-scoped caches and never display prior-tenant protected data. Design requirement only until backend contract exists.

## Page-level layout patterns
- **Index/list:** title and CTA, search, filters, sortable table/cards, bulk actions only if authorized, empty/loading/error states.
- **Details:** breadcrumb, entity name/status/version, actions, overview + tabs, audit history.
- **Wizard:** explicit steps, validation, progress, save-and-exit, cancel/restore rules, confirmation.
- **Builder:** large canvas with secondary inspector, undo/redo/version status, keyboard alternative to drag interaction.
- **Analytics/results:** context and timeframe, filters, explanation, provenance, visuals plus accessible table/summary.
- **Admin/settings:** permission-sensitive forms, validation, change history and explicit destructive-action confirmation.

## User journeys to design before wireframes
1. Organization admin: create/select organization, complete setup, invite members, configure access (dependent on #44).
2. Framework author: create framework, configure KPI, build workflow, test with evidence, submit version for review.
3. Reviewer: receive review assignment, inspect evidence/scoring provenance, accept/request changes with audit trail.
4. Prediction operator: register dataset, inspect readiness, configure training, compare models, request approval.
5. Faculty/manager: view authorized results, interpret prediction/recommendation and record follow-up.
6. Org admin: manage membership/permissions and inspect audit events.

## Non-negotiable dependencies and boundaries
- Organization permissions, actual roles, invite flow, persistence and isolation **must** be agreed under #44 before implementation; this document is not a security architecture.
- Module routes and page content must reflect implemented backend capabilities; do not ship nonfunctional navigation as live.
- Each detailed screen specification belongs in its module's `UI-UX.md`; this document defines only the shared shell and IA.
- Existing PoC routes `/` and `/prediction` are **not** considered the final route plan and remain untouched.

## Follow-up acceptance checks
- [ ] Map each user role and authorized navigation item after #44.
- [ ] Run first-time-user tree test for discoverability.
- [ ] Review responsive sidebar behavior and focus lifecycle.
- [ ] Create module-owned route/screen design Issues and PRs after the shared IA is accepted.
