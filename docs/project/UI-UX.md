# AFPI — Product UI/UX specification

**Scope:** Platform-wide experience standards for the production-oriented AFPI SaaS, across all current **and future** modules.  
**Status:** Topics 01 design principles **agreed**; Topics 02–04 **consolidated design proposals for product review**, not implemented code. Topics 05–06 deferred.  
**Tracking:** [UI foundation #43](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/43) · [Tenant architecture #44](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/44).  
**Source of truth:** This file covers shared UI/UX. Module-specific designs belong in `docs/modules/<module>/UI-UX.md`. Backend contracts, privacy rules, RBAC and tenant enforcement belong in the architecture and security specifications.

## Document roadmap

| Stage | Scope | Status |
|---|---|---|
| 01 Design Principles | Global behavioral and usability rules | Agreed in discussion |
| 02 Design System | Visual foundations, accessible components, theme rules | Proposed baseline; palette and visual review pending |
| 03 Information Architecture | Navigation and content hierarchy | Proposed; validation/permissions pending |
| 04 User Journeys | Task-oriented flows and critical states | Proposed; role contracts and research pending |
| 05 Wireframes | Screen structures | Deferred |
| 06 UI Implementation Guidelines | Actual integration, tests and code | Deferred |

## 01. Design Principles

These eight principles are product-wide rules, not claims that the current PoC has implemented them. Measurable targets are initial quality gates to test with representative users and refine after a baseline.

### 1.1 Usability & Simplicity

**Principle:** AFPI must offer an adaptive, intuitive and task-focused experience balancing learnability, accuracy and speed. Provide essential capabilities first, expose advanced settings progressively, offer optional contextual guidance and support limited meaningful personalization.

**Decisions:** Adaptive beginner/expert experience; progressive complexity; optional help/examples; limited saved views/filters/preferences; balanced task completion, correctness and efficiency.

**Application:** Framework Studio makes KPI/workflow basics available before advanced policy controls. Prediction presents readiness and key results before specialist model metrics. Recommendation foregrounds actionable recommendations before deep explanation. Organization prioritizes common account/member tasks before advanced administration. Future modules follow the same patterns.

**Acceptance:** Target >=90% unaided completion of representative core tasks; >=90% first-time users locate the primary action; no forced advanced configuration during basic tasks; optional help dismissible; saved preferences cannot override access permissions; test frequent-task efficiency and mistake recovery.

### 1.2 Consistency & Predictability

**Principle:** Use shared terminology, interaction patterns and feedback across the platform while allowing documented module-specific exceptions justified by specialist workflows. Do not assume AFPI will always contain only its four currently named modules.

**Decisions:** Shared experience with specialized workflows; standardized domain vocabulary; common semantics for Save/Edit/Delete/Cancel/Submit/Review; standard lifecycle statuses; justified and documented exceptions.

**Application:** Shared action semantics apply to Framework Studio drafts, Prediction runs and approvals, Recommendation review and Organization administration. Specialized canvas or training behaviors are exceptions, not a separate UI language. All future modules inherit shared rules.

**Acceptance:** All common actions follow documented behavior unless a reviewed exception exists; zero conflicting labels for the same platform concept; state feedback standardized; >=90% correct anticipation of familiar controls in cross-module usability tests.

### 1.3 Navigation & Discoverability

**Principle:** Provide a scalable hybrid navigation model: modules organize work, while important tasks remain easy to find and enter contextually. Make the active page, module, organization and relevant scope clear without designing the precise shell prematurely.

**Decisions:** Hybrid module/task navigation; structured navigation plus contextual actions and relevant suggestions; persistent context; show relevant authorized destinations and explain restrictions when appropriate; balanced hierarchy; platform-wide search planned later.

**Application:** Framework Studio allows users to reach framework, evidence and review tasks; Prediction exposes dataset/model/result work; Recommendation exposes review/follow-up tasks; Organization exposes authorized administration. New modules can be added without redesigning the conceptual navigation pattern.

**Acceptance:** >=90% find common tasks unaided; >=95% identify relevant module and organization; >=90% correctly anticipate common task location; protected actions enforce backend permissions; restricted-access feedback is understandable; global search is **not** a prerequisite for initial delivery.

### 1.4 User Feedback & System States

**Principle:** Every meaningful operation communicates contextual, accurate and actionable state. Show actual status and useful progress stages; never claim success before acknowledgement. Important completions, failures and approval tasks should surface without notification overload.

**Decisions:** Contextual feedback; meaningful progress when available; subtle routine success and stronger consequential confirmation; failures explain impact and recovery; persistent tracking for supported long jobs; notifications limited to important events.

**Application:** Framework Studio shows save/verification/review states; Prediction shows dataset/training/evaluation states; Recommendation shows generation/review/follow-up; Organization shows membership/permission/invitation progress. Future modules reuse state conventions.

**Acceptance:** Every consequential asynchronous action displays idle/queued/running/succeeded/failed and additional states as applicable; no fabricated progress percentages; no premature completion messages; all user-actionable failures provide recovery guidance; background-capable jobs remain trackable across navigation; duplicate submissions are safely handled; assistive technology receives meaningful status updates.

### 1.5 Error Prevention & Recovery

**Principle:** Prevent avoidable mistakes, protect unfinished work and enable safe recovery. Use contextual validation with final server validation, risk-proportionate safeguards and explicit consequential submissions.

**Decisions:** Hybrid validation; risk-based deletion/approval protection; selective draft autosave; undo/restore/version history where appropriate; automatic retry only for safely repeatable operations; warn on leaving unsaved work and offer Save/Discard/Continue.

**Application:** Framework Studio validates KPI links/policy drafts and supports eligible version recovery. Prediction validates schema/configuration and avoids duplicate jobs. Recommendation preserves reviewer progress and protects decisions. Organization safeguards permissions and membership changes. Future modules define their own risk classifications.

**Acceptance:** All required fields/business rules validated before commitment; understandable correction guidance; all high-risk changes guarded; supported drafts recoverable; unsaved-change navigation addressed; retries do not duplicate consequential transactions; >=90% simulated common-error recovery in usability sessions.

### 1.6 Accessibility & Responsiveness

**Principle:** Target WCAG 2.2 AA, keyboard and screen-reader operability for all essential tasks, responsive use across desktop/tablet/mobile, scalable readable content and alternatives to visual-only interactions. Optimize complex workspaces for desktop **without making the product desktop-only**.

**Decisions:** WCAG 2.2 AA; desktop-first responsiveness; full core-workflow keyboard/assistive-technology support; accessible contrast and labels; equivalent non-drag interactions; respect system accessibility preferences.

**Application:** Framework Studio provides alternatives to drag-only workflow edits; Prediction provides chart tables or meaningful textual explanations; Recommendation is understandable without color; Organization supports accessible administrative controls; future modules must inherit these practices.

**Acceptance:** Applicable WCAG 2.2 AA criteria; keyboard-operable essential actions; tested screen-reader labels/focus; applicable normal text contrast >=4.5:1, large text >=3:1, non-text >=3:1; 200% text resize and applicable 320-CSS-pixel-equivalent reflow; no color-only meaning; reduced-motion support; manual testing in addition to automated scans.

### 1.7 Trust, Transparency & Explainability

**Principle:** Consequential results must be transparent and traceable, with simple explanations first and deeper evidence on demand. Distinguish entered values, extracted evidence, verified information, policy-derived scores, predictions and recommendations. Surface valid uncertainty and support appropriate human review.

**Decisions:** Layered explanations; full provenance to source/evidence/policy/model versions where appropriate; meaningful *valid* uncertainty, never invented confidence; explicit result types; auditable decision history; policy-governed clarification/challenge paths.

**Application:** Framework Studio shows scoring inputs/rules and evidence; Prediction shows dataset/model provenance and limitations; Recommendation gives rationale and review path; Organization shows context and history for consequential administration. New modules apply these standards to consequential automated decisions.

**Acceptance:** All consequential scores/predictions/recommendations have understandable explanations; evidence-backed results link to authorized source/version information; uncertainty shown where valid and limitations disclosed; required approvals/rejections audited; >=90% of representative users correctly interpret outcome meaning/limits; no confidential data exposed through explanation details.

### 1.8 Security, Privacy & User Control

**Principle:** UI must communicate active organization and relevant role/scope, expose only necessary authorized information, and support authorized control over consequential actions. Actual protection belongs to backend enforcement, not merely hidden buttons.

**Decisions:** Least privilege; explicit organizational/role context; contextual sensitive-data masking; authorized approval/rejection/override; secure session expiry and reauthentication, with safe draft recovery where possible; consequential audit visibility by authorization; data minimization.

**Application:** Framework Studio scopes evidence and policy approvals; Prediction scopes faculty data and model access; Recommendation scopes suggestions and review; Organization scopes membership, role changes and audit views. Every future module inherits these rules.

**Acceptance:** Server-side authorization for all protected operations; zero unauthorized tenant crossover in defined isolation tests; >=95% of users correctly identify organization and relevant role/scope; consequential operations require authorization and produce protected audit records; revoked sessions cannot access protected data; every sensitive field has a legitimate data-use purpose.

## 02. Design System

**Design direction:** Modern enterprise SaaS. Use [shadcn/ui](https://ui.shadcn.com/) as the shared React component foundation, composed with Next.js/React/TypeScript, Tailwind CSS and Lucide. The current repository uses older JSX/CSS PoC assets; this is a **future migration target**, not an installed dependency claim.

### 2.1 Color System & Theming

**Agreed:** Start from an official shadcn/ui base theme, keep its primary accent initially, use consistent success/warning/error/information semantics, permit complementary custom colors only through controlled shared tokens, support both light/dark themes, and meet WCAG 2.2 AA contrast requirements.

**Still open:** Actual base palette selection (official current choices include Neutral, Stone, Zinc, Mauve, Olive, Mist, Taupe), exact preset/primary values, final complementary color values and visual accessibility verification. User initially selected Neutral but explicitly reconsidered and requested comparison of official options. **Do not treat Neutral or any other palette as locked.**

**Token policy:**
- Use shadcn's semantic pairs: `background/foreground`, `card/card-foreground`, `popover/popover-foreground`, `primary/primary-foreground`, `secondary/secondary-foreground`, `muted/muted-foreground`, `accent/accent-foreground`.
- Maintain `destructive`, `border`, `input`, `ring`, `chart-1…5`, and the full `sidebar-*` token family as supported by the selected preset.
- Add optional `success/success-foreground`, `warning/warning-foreground`, `info/info-foreground` with documented semantics and values in both `:root` and `.dark`; map custom tokens into Tailwind consistently.
- Never assign arbitrary permanent color meanings to modules; distinguish states semantically. Do not interpret green as proof that an AI prediction is correct.
- Support chart palette extensibility but require captions, legends, values and accessible alternatives.

**Decision gate:** Compare official presets via [shadcn/create](https://ui.shadcn.com/create), assess typography/contrast with real components in light and dark modes, and select one before initializing the CLI. Confirm preset migration guidance if changing afterward.

### 2.2 Typography

**Proposed baseline:** Consistent readable sans-serif font using the selected shadcn preset's defaults; Inter or Geist are candidates, **not selected yet**. Define semantic levels for page title, section title, body, label, caption and numeric/table values. Preserve text resizing, readable line lengths and locale-safe text overflow. No hardcoded per-module font families or tiny text for essential labels.

**Acceptance:** Document text hierarchy and font tokens; validate 200% text resizing, truncation affordances and numeric alignment for dense tables.

### 2.3 Spacing, density, elevation and shape

**Proposed baseline:** Consistent spacing based on a 4px rhythm; reusable compact/comfortable density where justified; one semantic radius scale based on shadcn `--radius`; consistent borders/shadows. Favor purposeful density over decorative containers. Exact radius, spacing and size values are to be visually evaluated, not yet finalized.

**Acceptance:** No arbitrary control dimensions in module code; forms/tables have predictable spacing; compact views do not sacrifice accessible targets or labels.

### 2.4 Components and interaction standards

**Proposed inventory:** Shared Button, Input, Textarea, Field/Form, Select, Checkbox, Radio, Switch, Dialog/AlertDialog, Sheet, DropdownMenu, Sidebar, Breadcrumb, Tabs, Card, Badge, Table/DataTable, Pagination, Tooltip, Skeleton, Alert, Toast/Sonner, and Chart patterns where appropriate. Check current shadcn docs and component availability at implementation time.

**Rules:** Components use semantic tokens, visible focus, meaningful disabled/loading/empty/error states, consistent labels and expected keyboard behavior. Avoid duplicating shadcn primitives in every module. Specialized editors, model comparison tools and evidence viewers are module-owned compositions, not excuses to bypass platform accessibility.

**Acceptance:** Shared inventory and usage guide published before module UI rollout; each new component reviewed for keyboard/focus/status/error semantics.

### 2.5 Iconography, language and content

**Proposed baseline:** Lucide icon family for consistency; icons accompany labels when the action is not universally recognizable; no color-only or icon-only indication of high-risk consequences. Use concise plain-language copy and consistent terms for draft, submitted, approved, rejected, verified, predicted and recommended. All dates/percentages/metrics require explicit units and context.

**Acceptance:** Zero contradictory terms for shared concepts; icon-only buttons have accessible names; important statuses include text.

### 2.6 Theme and responsive behavior

**Agreed:** Light + dark themes; desktop-first responsive design; respect OS reduced-motion and relevant theme preferences. Layout patterns must work with narrow screens, accessible overflow strategies for inherently two-dimensional workspaces and persistent state meaning.

**Proposed:** Theme provider and control placement to be decided during implementation; avoid flash of incorrect theme and avoid permission state stored as a purely visual preference.

**Acceptance:** Contrast/legibility audited in both modes; manual keyboard/screen-reader checks; consistent status semantics after theme switch.

### 2.7 Design-system governance

**Proposed:** Shared UI components and tokens have centralized ownership and documentation; module teams contribute through review. Custom colors and deviations require design rationale and accessibility tests. Revisit the design system periodically but do not accept ad hoc module visual forks.

**Official reference:** [Theming](https://ui.shadcn.com/docs/theming), [components.json](https://ui.shadcn.com/docs/components-json), [colors](https://ui.shadcn.com/colors).

## 03. Information Architecture

**Status:** Three primary user groups and distinct workspaces are an **agreed current product direction**. Detailed page hierarchies and the exact permissions/URL model are **proposals requiring validation**. This does not establish the production codebase, navigation shell or security implementation.

### 3.1 Primary users and workspace model — agreed

AFPI's entry-point information architecture is **persona/workspace-first**, not one identical module menu for everyone:

1. **Organization Administrators:** Institutional builders and supervisors of the evaluation system. They onboard and supervise employees, **create KPIs and scoring frameworks, establish policies/regulations, develop and configure institution-specific prediction and recommendation models, and manage permitted system configurations and approvals**. Their privileges remain subject to institutional authorization.
2. **Employees:** End users of their organization's evaluation system (including faculty as applicable). They **complete assigned KPI inputs, submit supporting information/evidence for verification, track verification status and view authorized resulting scores**, as well as applicable predictions and recommendations. They do not create institutional KPIs, scoring rules or train models by default. Employee subroles and score-release policies are not yet finalized.
3. **Platform Developers:** The team building, operating and maintaining AFPI **itself**. This is **Option A only at present**. They are **not** organization developers and are not automatically institutional administrators or entitled to access institution data.

The three groups are **current primary audiences**, not a permanent limitation; new user types may be added as the product grows. A user may hold multiple explicitly authorized responsibilities, but access must come from the approved role/scope model, not the UI alone.

### 3.2 Separation of workspaces and reusable modules

```text
AFPI Platform — common identity, access checks and reusable capabilities
├── Organization Administrator Workspace
│   ├── Organization setup / onboarding
│   ├── Employee onboarding, supervision and membership
│   ├── Policies, regulations and organization configuration
│   ├── KPI creation, scoring frameworks and verification rules
│   ├── Model development, evaluation and permitted approvals
│   ├── Recommendation development / configuration / publication
│   └── Verification oversight, analytics and relevant audit activity
├── Employee Workspace
│   ├── Assigned KPI / appraisal tasks
│   ├── KPI inputs and evidence submission for verification
│   ├── Submission and verification status
│   ├── Authorized verified/approved scores and explanations
│   ├── Authorized predictions, recommendations and follow-up
│   └── Clarification / review requests where offered
├── Platform Developer Workspace (operational, isolated)
│   ├── Platform build/release health and deployment status
│   ├── System monitoring and technical diagnostics
│   ├── Platform integrations / tooling administration
│   └── Access-controlled incidents, configuration and operations
└── Underlying reusable capabilities (not separate views by default)
    ├── Framework Studio
    ├── Prediction
    ├── Recommendation
    ├── Organization management
    └── Additional capabilities as the platform expands
```

**Key distinction:** A *module* supplies capabilities; a *workspace* exposes only the tasks and outputs appropriate to the current user. For example, Organization Administrators create KPIs, define scoring policies, develop/configure models and supervise verification, while Employees submit assigned KPI evidence and consume authorized scores, predictions and recommendations. A submitted value is not automatically verified, and a calculated score is not automatically an approved/released score. Platform Developers operate platform infrastructure rather than automatically gaining privileged HR or faculty data access.

Labels above are candidate content areas, not confirmed screens or available routes. The operational Developer Workspace may in practice be a separate tool or application; a common visual shell is **not** a requirement, and neither deployment architecture nor production UI has been chosen.

### 3.3 Navigation principles — agreed behavior, proposed placement

- **Workspace-first:** Determine the relevant authorized user experience after authentication; do not expose all institutional configurations to Employees by default.
- **Hybrid discovery inside a workspace:** stable functional groups plus contextual task entry points, consistent with Topic 1.3.
- **Persistent context:** show relevant active organization, current workspace/responsibility and page/task; platform developers see platform operational context rather than an automatically selected institution.
- **Least privilege:** only authorized operations are actionable; direct URLs and APIs are independently checked server-side. A missing/denied resource must not leak its existence or details.
- **Scalable:** future modules may add capabilities to one or more workspaces without creating a separate, incompatible navigation system.
- **Global search:** future capability; not required for the first production release.
- **No premature layout decision:** sidebar, header, mobile navigation, URL scheme and workspace switcher are deferred to IA validation and wireframes.

### 3.4 Workspace capability matrix — proposed, not an authorization contract

| Capability | Organization Admin | Employee | Platform Developer |
|---|---|---|---|
| Organization onboarding and settings | Configure where authorized | Personal onboarding/profile only as approved | No institutional admin authority by default |
| Employee/member management | Authorized management | Own permitted profile | No broad employee-record access |
| Framework policies and KPI workflows | Create KPIs, scoring/verification rules and supervise evaluation under policy | Submit evidence for assigned KPIs and view permitted scores | Maintain software; no automatic institutional policy authority |
| Prediction | Develop/configure institution-specific models, train/evaluate and approve publication as authorized | View own permitted predictions and explanations | Maintain runtime/model infrastructure; institutional datasets only with explicit access |
| Recommendation | Develop/configure recommendation logic/models and publish as authorized | View relevant recommendations and record permitted follow-up | Maintain services; no automatic access to personal recommendations |
| Platform deployment/diagnostics | No platform-operator privilege by default | No | Authorized operational tasks only |
| Audit history | Relevant organization audit | Relevant own decision history if permitted | Platform operational audit; protected institutional audit only by explicit scoped support approval |

This matrix is **UX intent**, not a claim about implemented authorization. Specific duties (e.g. evaluation reviewers, model approvers and employee managers) may become separate institution-defined roles beneath these groups. Decide exact permissions, cross-tenant support access and the organization scope model under [Issue #44](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/44).

### 3.5 Context, multi-workspace users and exceptions

- If a person has multiple authorized responsibilities, provide clear context and deliberate switching without silently combining confidential scopes.
- An organization administrator may also be an employee; this must not merge admin-wide data into the personal view.
- Developers' operational access and any emergency institutional support access must be separated, time-bounded, explicitly approved and auditable if support access is ever permitted.
- Switching organizations or workspaces requires isolation of cached sensitive information and authorization re-evaluation.
- Design for users without an assigned organization, invited-but-unapproved users, revoked users and read-only experiences.

### 3.6 Shared page patterns, not final screens

| Pattern | Potential workspace use | Required states |
|---|---|---|
| Task overview | Admin work queues; employee actions; platform incidents | empty, pending, failed, denied |
| Directory/list | People, policies, datasets, assignments, logs (scoped) | filtered, empty, no results, partial data |
| Details/review | Appraisals, model versions, recommendations, incidents | draft, locked, awaiting decision, historical |
| Guided onboarding | Organization setup; employee joining | incomplete, saved, expired invitation, completed |
| Workflow configuration | Admin framework/policy/model setup | invalid, unsaved, running, version conflict |
| Personal insights | Employee results/recommendations | unavailable, limited confidence, stale, disputed |
| Platform operations | Developer monitoring and maintenance | alert, degraded, resolved, restricted |

### 3.7 IA validation gates before wireframes

1. Validate the three audiences' actual tasks and the difference between institutional and operational authority.
2. Confirm whether Employee includes faculty only or additional staff categories; define institution-specific subroles without changing the three-audience baseline.
3. Tree-test 6+ representative tasks **per relevant workspace** and measure discoverability/comprehension.
4. Under Issue #44, approve a role/action/organization-scope matrix and test user-to-workspace resolution, switch behavior, tenant isolation and developer support boundaries.
5. Review actual workflows before finalizing page names, final navigation placement and URLs.
6. Verify extensibility when adding a future module and, if appropriate, a new audience.

## 04. User Journeys

**Status:** Core journeys are **proposed UX flows** grounded in the three agreed audiences; actual business policies, actor privileges, technical integration and availability require further validation. They are not claims about deployed AFPI capabilities. The separation of institutional administrator and platform developer responsibilities is mandatory.

### 4.1 Journey template

For each journey document **actor and authorization context → trigger → preconditions → actions → successful outcome → failure/recovery → explanation/audit → usability/security checks**. The UI must not assume authorization from group label alone.

### 4.2 Organization Administrator — onboard institution

**Actor:** Authorized institutional setup administrator. **Trigger:** Establish or join an institution on AFPI.  
**Flow:** Verify identity/eligibility → enter permitted organization data → inspect setup and policy requirements → correct validation errors → confirm authorized setup → receive organization-specific workspace and clear next tasks.  
**Alternatives:** Duplicate organization, expired invitation, lost connectivity, no privilege, session expiry, partially completed setup; recover permitted drafts without leaking any institutional data.  
**Outcome:** Confirmed organizational workspace with auditable consequential setup actions.  
**Test:** Admin completes setup without hidden instructions; users outside scope cannot create or inspect the institution.

### 4.3 Organization Administrator — manage employees and governance

**Actor:** Authorized organization administrator, subject to narrower responsibilities under #44.  
**Flow:** Select active organization → view only permitted members → invite/onboard employees → configure approved rules, policies/regulations and access assignments → review sensitive changes → submit → see authoritative status and relevant audit event.  
**Alternatives:** Invalid assignment, duplicate invitation, unauthorized change, conflicting update or revoked access.  
**Outcome:** Employees have the appropriate authorized entry path, and institutional changes are accountable.  
**Test:** No privilege escalation, double submission or cross-organization information leak.

### 4.4 Organization Administrator — create KPIs, develop models and supervise evaluation

**Actor:** Institutionally authorized policy author, model operator, supervisor or approver; do not assume every admin receives all privileges.  
**Flow:** Enter active organization → **create KPIs** and configure scoring policies/weights and verification rules → validate/test the workflow → **develop/configure prediction and recommendation models** using authorized datasets and evaluation tools → review performance, limitations and versions → obtain required approvals and activate permitted capabilities → **supervise employee KPI submissions, verification status and scoring outputs**.  
**Alternatives:** Invalid KPI policy, inconsistent scoring, unreadable evidence, unsuitable dataset, failed training, unauthorized publication, reviewer conflict, stale configuration. Preserve drafts and report real system state.  
**Outcome:** Institution-controlled evaluation and modeling capabilities available for authorized employee submissions and released results.  
**Test:** Administrator can distinguish draft/active policies, verified vs unverified inputs, calculated vs released scores and model outputs; admin cannot bypass necessary approvals.

### 4.5 Employee — join and access personal workspace

**Actor:** Employee of a participating organization (faculty where applicable).  
**Flow:** Accept permitted invitation/identity verification → confirm active organization and personal context → complete only necessary onboarding/profile inputs → see authorized tasks, progress and available capabilities.  
**Alternatives:** No organization, pending invitation, missing consent/required records, revoked access, stale session. Do not display administrator controls or unrelated employees' information.  
**Outcome:** Employee has an understandable, permission-limited personal workspace.  
**Test:** Employee correctly identifies their context and finds the next legitimate task.

### 4.6 Employee — view verified scores, predictions and recommendations

**Actor:** Authorized employee of a participating institution.  
**Flow:** Open personal workspace → review KPI submission and verification status → view **authorized scores resulting from organization-defined KPIs and scoring rules**, when released under institutional policy → distinguish calculated/verified score, prediction and recommendation → inspect explanation, evidence, model/policy version and limitations → take a permitted follow-up action or request clarification.  
**Alternatives:** Pending verification, returned evidence, score not yet approved/released, no prediction, stale model, disputed result or access change. An unreleased or unverified result must never appear final.  
**Outcome:** Employee understands their own authorized evaluation result and any relevant development guidance.  
**Test:** >=90% of representative employees distinguish submitted, verified, scored and approved/released stages and can locate the reason for their score.

### 4.7 Employee — submit assigned KPI evidence for verification

**Actor:** Employee assigned institutional KPIs and evidence requirements.  
**Flow:** Open assigned KPI → read required information and verification criteria → enter KPI input(s) and attach supporting evidence → review entered vs extracted values where relevant → validate → save draft or explicitly **submit for verification** → track submitted, under review, returned for correction, verified and scored/released states as applicable.  
**Alternatives:** Missing document, unreadable evidence, conflicting extracted values, network failure, unsaved changes, denied access or return for correction.  
**Outcome:** Auditable submission and transparent verification state, followed by the authorized score when calculation and release prerequisites are met.  
**Test:** Employee can submit and correct evidence without editing KPI/scoring definitions and without accessing other employees' results.

### 4.8 Platform Developer — operate and maintain AFPI

**Actor:** Authorized AFPI platform engineer/operator. **This is a platform responsibility, not an organization admin role.**  
**Flow:** Authenticate to approved operational environment → select permitted deployment/service → inspect service health, non-sensitive observability, release status or alerts → perform an authorized diagnostic or maintenance operation → validate outcome → record audit/incident evidence.  
**Alternatives:** Insufficient operator privileges, outage, secret exposure risk, deployment failure, sensitive log data, support request requiring scoped approval. Default to synthetic/redacted information, minimum privilege and no institutional record access.  
**Outcome:** Reliable platform operations without bypassing organizational data isolation.  
**Test:** Operator can diagnose supported failure scenarios, while tests confirm they cannot browse institution/employee records without separately authorized support access.

### 4.9 Cross-persona capability flow

```text
Organization Admin: create KPIs, scoring/verification rules and develop/configure models
           ↓ authorized publication and employee assignments
Employee: submit assigned KPI inputs and evidence
           ↓ authorized verification/review and scoring computation
AFPI engines: verified score and permitted prediction/recommendation outputs
           ↓ approval/release where institutional policy requires
Employee: view own authorized scores, explanations, predictions and recommendations

Platform Developer: maintain those engines and deployment infrastructure
           ↳ operational privileges only; no implicit access to institution data
```

Different users interact with the **same capabilities**, but through responsibilities and views appropriate to their scope. An employee should never need institutional KPI-design or model-training controls to submit evidence or view an authorized score or prediction. A developer should not need faculty-level visibility to maintain the prediction service.

### 4.10 Journey review and phased implementation

- Confirm policy ownership, required approvals, who is allowed to train/publish models, and visibility of faculty predictions with institutional stakeholders.
- Approve role/scopes and any support-access exception under #44 before protected routes are coded.
- Select the initial release journeys from 4.2–4.8 based on user research and operational priority; none are promised as shipped.
- Include keyboard/screen-reader, responsive, draft recovery, session-expiry, in-progress job, revoked-access and data provenance variants in relevant test scenarios.
- Measure task success, critical errors, completion time and comprehension separately for each persona.
- Detailed module journeys and screens belong to their owning `docs/modules/<module>/UI-UX.md` and module-owned PRs.

## 05. Wireframes — deferred

Pending review of Sections 02–04 and actual user/role requirements. Do not interpret content hierarchy or journeys above as finalized wireframes.

## 06. UI Implementation Guidelines — deferred

Pending production architecture and UX approvals. Install/configure shadcn/ui and migrate the PoC frontend only in separately scoped implementation PRs; verify actual dependencies and supported versions first.

## Implementation and decision boundaries

1. **Decided in product discussions:** Topics 1.1–1.8; Topic 2.1 semantic approach and light/dark/accessibility commitments; shadcn/ui as shared component foundation.
2. **Proposed for review:** Specific typography, dimensions, component inventory, conceptual content taxonomy and user journeys.
3. **Open:** Official base palette, exact primary values and custom color swatches, visual tokens, final users/roles, organization/tenant contracts, module route structures and release scope.
4. **Not implemented:** No UI screen, auth/tenant enforcement, route or component is considered production-ready merely because it appears in this file.
