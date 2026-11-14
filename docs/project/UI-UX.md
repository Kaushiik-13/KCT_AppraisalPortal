# AFPI — Product UI/UX specification

**Scope:** Platform-wide experience standards for the production-oriented AFPI SaaS, across all current **and future** modules.  
**Status:** Topics 01 design principles **agreed**; Topics 02–04 **consolidated design proposals for product review**, not implemented code. Topics 05–06 deferred.  
**Tracking:** [UI foundation #43](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/43) · [Tenant architecture #44](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/44) · [Role and access boundaries #57](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/57).
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

### 2.4.1 Mandatory shadcn/ui component policy — approved

**Decision:** AFPI adopts **shadcn/ui as the mandatory default UI component system** for all future Organization, Employee, Supervisor and Developer interfaces. This is a design and code-review requirement, not a claim that the existing JSX/CSS PoC has been migrated. Navigation taxonomy and detailed page layouts are deliberately deferred until feature implementation; this decision governs their eventual implementation.

- **Standard stack:** shadcn/ui components, Tailwind CSS, centralized semantic CSS-variable tokens, and Lucide React icons in the React/Next.js codebase.
- **Component-first:** Use the official shadcn/ui component for common controls (Button, Input, Select, Checkbox, Radio, Switch, Textarea, Tabs, Dialog, AlertDialog, Sheet, DropdownMenu, Popover, Tooltip, Card, Badge, Table, Skeleton, Sidebar, Breadcrumb, etc.) where a suitable component exists. Do not hand-roll duplicate primitives.
- **Shared ownership:** Install/adapt shared primitives in the app's central UI directory (conventionally `components/ui` or `src/components/ui`, according to the app structure). Composite controls and patterns live in shared feature-agnostic components where reused; modules compose them rather than copy and fork.
- **No competing general-purpose UI kits:** Do not add Material UI, Ant Design, Chakra UI, Mantine or similar parallel component libraries without an explicitly documented and reviewed platform exception.
- **Specialized libraries permitted:** Workflow graph/node canvas, code editor, charts, drag-and-drop, virtualized tables, document viewers and similar domain capabilities may use focused purpose-built libraries when shadcn/ui does not provide the underlying feature. Their surrounding controls, inputs, dialogs, labels, theme and status treatment must use the common design system.
- **shadcn foundations:** shadcn/ui supports both **Base UI** and **Radix** primitives; choose a single foundation when initializing the production component library, and do not mix implementations casually. As of the July 2026 official changelog, Base UI is the new-project default and Radix remains supported. This is **not** a mandate to migrate an already-functioning Radix setup solely for parity.
- **Theme consistency:** Use official shadcn token conventions and CSS variables; support light/dark themes and accessible semantic states. The exact base palette and font remain intentionally unselected.
- **No accidental bypasses:** Plain Tailwind layout classes and custom application logic are fine; independently styled button/input/dialog implementations and ad hoc colors are not.
- **PR enforcement:** Every new frontend PR must state which shared shadcn/ui primitives it uses, justify any non-shadcn UI dependency or custom primitive, and verify responsive layout, keyboard/focus access, labels, error/loading states and light/dark rendering. Exceptions must be explicit, reviewed and documented before merging.
- **Migration posture:** Apply these rules to new UI work; migrate old PoC UI incrementally rather than asserting the existing repo already complies. No automatic dependency changes, full rewrite or navigation decisions are implied.

**Source of truth:** [shadcn/ui documentation](https://ui.shadcn.com/), [theming](https://ui.shadcn.com/docs/theming), [components.json](https://ui.shadcn.com/docs/components-json), [July 2026 Base UI default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default).

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

**Status:** The first-release product direction has three core institution-facing roles: Organization Administrator, Faculty Member, and Supervisor/Reviewer. A Supervisor may also have their own faculty experience. A separate Platform Developer audience may support AFPI platform operations, but it is outside the core institution appraisal workflow described here. Detailed page hierarchy, menu labels, route definitions and navigation layout remain **proposed/deferred**; role scopes and exact permissions/URLs are not an authorization contract. This does not establish a production codebase, navigation shell, or security implementation.

### 3.1 Primary users and workspace model — agreed

AFPI's entry-point information architecture is **persona/workspace-first**, not one identical module menu for everyone:

1. **Organization Administrators:** Builders and facilitators of the institution's appraisal operations. They set up people and assignments; create KPIs/KRAs and appraisal cycles; configure prediction and recommendation workspaces, including sandbox evaluation; and view institution-level KPI, KRA, and faculty analytics. In the agreed workflow, administrators do not perform supervisor reviews or release KPI marks.
2. **Faculty Members:** Complete assigned KPIs, submit required information and evidence, track review progress, and see their own KPI marks after a supervisor releases them, plus other outputs explicitly permitted by institutional policy.
3. **Supervisors/Reviewers:** Perform operational reviews for assigned faculty, review submitted evidence, decide and release marks for each KPI, provide feedback, and view analytics limited to their authorized faculty. A supervisor may also be a faculty member and retain their own faculty experience.

These role responsibilities describe the agreed product direction, not a deployed access-control implementation. Exact assignment, role, review, and visibility rules still require design.

The three institution-facing roles are the **core first-release audiences**, not a permanent limitation; new user types may be added as the product grows. A user may hold multiple explicitly authorized responsibilities, but access must come from the approved role/scope model, not the UI alone.

### 3.2 Separation of workspaces and reusable modules

```text
AFPI Platform — common identity, access checks and reusable capabilities
├── Organization Administrator Workspace
│   ├── Institution setup, members, roles and supervisor assignments
│   ├── KPI/KRA and appraisal-cycle configuration
│   ├── Evidence requirements and approved scoring configuration
│   ├── Prediction/recommendation workspaces and sandbox evaluation
│   └── Institution-level KPI, KRA and faculty analytics
├── Faculty Workspace
│   ├── Assigned KPI / appraisal tasks
│   ├── KPI information and evidence submission
│   ├── Submission and review status
│   ├── KPI marks after supervisor release
│   ├── Authorized predictions, recommendations and follow-up
│   └── Clarification / review requests where offered
├── Supervisor / Reviewer Workspace
│   ├── Assigned faculty review queues and evidence inspection
│   ├── Per-KPI mark decisions, release and feedback
│   └── Analytics for authorized faculty
├── Platform Developer Workspace (platform capability development, isolated)
│   ├── Node / tool / plugin library and authoring
│   ├── Developer playground (isolated test runs, inputs and outputs)
│   ├── Validation, tests, versions and publishing / availability controls
│   ├── Platform integrations and tooling administration
│   └── Platform monitoring, release health and technical diagnostics
└── Underlying reusable capabilities (not separate views by default)
    ├── Framework Studio
    ├── Prediction
    ├── Recommendation
    ├── Organization management
    └── Additional capabilities as the platform expands
```

**Key distinction:** A *module* supplies capabilities; a *workspace* exposes only the tasks and outputs appropriate to the current user. Organization Administrators configure the appraisal operation, create KPIs/KRAs, configure model workspaces, and review institution-level analytics. Faculty submit assigned evidence. Supervisors review assigned submissions and release marks per KPI. A submitted value is not automatically verified, and an internal calculation is not a released mark. Platform Developers, if included in the eventual product, author and maintain platform capabilities; this does not grant access to institutional faculty data by default.

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

| Capability | Organization Admin | Faculty Member | Supervisor / Reviewer | Platform Developer |
|---|---|---|---|---|
| Organization onboarding and settings | Configure institution where authorized | Complete own onboarding as approved | No institution-wide admin authority by default | No institutional admin authority by default |
| Members and assignments | Manage permitted members and supervisor assignments | View own permitted profile and tasks | View assigned faculty context | No broad employee-record access |
| KPIs, KRAs and appraisal setup | Create/configure KPI/KRA, cycles, evidence requirements and assignments | Submit evidence for assigned KPIs; view own released marks | Review assigned KPI submissions | No automatic institutional policy authority |
| Review and mark release | Facilitate operations; does not release marks in the agreed role split | View own marks after release | Review assigned faculty, decide and release per-KPI marks, provide feedback | No automatic review authority |
| Prediction | Configure/build and evaluate models in an institution sandbox; view institution-level analytics | View only outputs permitted by policy | View scoped analytics/outputs when permitted | Maintain platform runtime; no automatic data access |
| Recommendation | Configure/build and evaluate capabilities in an institution sandbox | View only outputs permitted by policy | View scoped analytics/outputs when permitted | Maintain platform runtime; no automatic personal-data access |
| Institution analytics | View KPI, KRA and faculty analytics across institution | View own authorized results | View analytics for authorized faculty | No institutional analytics access by default |
| Node/tool/plugin authoring and playground | Consume approved capabilities, not platform-authoring privileges by default | No | No | Build, test, version and publish reusable platform nodes according to approvals |
| Platform deployment/diagnostics | No platform-operator privilege by default | No | No | Authorized operational tasks only |
| Audit history | Relevant organization activity as permitted | Own decision history if permitted | Relevant assigned review history | Platform operational audit; protected institutional audit only by explicit scoped support approval |

This matrix is **UX intent**, not a claim about implemented authorization. Exact permissions, supervisor assignments, model approval duties, and output visibility remain to be defined. The first release is intended for one institution; future cross-organization access requires a separate isolation design.

### 3.5 Context, multi-workspace users and exceptions

- If a person has multiple authorized responsibilities, provide clear context and deliberate switching without silently combining confidential scopes.
- An organization administrator may also be an employee; this must not merge admin-wide data into the personal view.
- Developers' operational access and any emergency institutional support access must be separated, time-bounded, explicitly approved and auditable if support access is ever permitted.
- If multi-organization support is added later, switching organizations or workspaces must isolate cached sensitive information and re-evaluate authorization.
- Design for users without an assigned organization, invited-but-unapproved users, revoked users and read-only experiences.

### 3.6 Shared page patterns, not final screens

| Pattern | Potential workspace use | Required states |
|---|---|---|
| Task overview | Admin work queues; employee actions; platform incidents | empty, pending, failed, denied |
| Directory/list | People, policies, datasets, assignments, logs (scoped) | filtered, empty, no results, partial data |
| Details/review | KPI submissions, evidence, released marks, model versions, recommendations | draft, submitted, under review, returned, decided, released, historical |
| Guided onboarding | Organization setup; employee joining | incomplete, saved, expired invitation, completed |
| Workflow configuration | Admin framework/policy/model setup | invalid, unsaved, running, version conflict |
| Personal insights | Employee results/recommendations | unavailable, limited confidence, stale, disputed |
| Platform operations | Developer monitoring and maintenance | alert, degraded, resolved, restricted |

### 3.7 IA validation gates before wireframes

1. Validate the three audiences' actual tasks and the difference between institutional and operational authority.
2. Confirm whether the first release supports faculty only or additional staff categories; define institution-specific subroles without changing the three-role core.
3. Tree-test 6+ representative tasks **per relevant workspace** and measure discoverability/comprehension.
4. Under Issue #44, approve a role/action/organization-scope matrix and test user-to-workspace resolution, switch behavior, tenant isolation and developer support boundaries.
5. Review actual workflows before finalizing page names, final navigation placement and URLs.
6. Verify extensibility when adding a future module and, if appropriate, a new audience.

## 04. User Journeys

**Status:** Core journeys are **proposed UX flows** grounded in the three agreed audiences; actual business policies, actor privileges, technical integration and availability require further validation. They are not claims about deployed AFPI capabilities. The separation of institutional administrator and platform developer responsibilities is mandatory.

### 4.1 Journey template

For each journey document **actor and authorization context → trigger → preconditions → actions → successful outcome → failure/recovery → explanation/audit → usability/security checks**. The UI must not assume authorization from group label alone.

### 4.2 Organization Administrator — onboard institution

**Actor:** Authorized institutional setup administrator. **Trigger:** Set up or enter the initial institution workspace.
**Flow:** Verify identity/eligibility → enter institution name, type, official contact and locale → create and verify the first administrator account → optionally add organizational units → inspect setup and policy requirements → correct validation errors → confirm authorized setup → receive the institution workspace and clear next tasks. Employee invitations and role/supervisor assignments follow as a separate guided step, with an import option for larger institutions. Do not request or store an organization's shared email password.
**Alternatives:** Duplicate organization, expired invitation, lost connectivity, no privilege, session expiry, partially completed setup; recover permitted drafts without leaking any institutional data.  
**Outcome:** Confirmed organizational workspace with auditable consequential setup actions.  
**Test:** Admin completes setup without hidden instructions; users outside scope cannot create or inspect the institution.

### 4.3 Organization Administrator — manage employees and governance

**Actor:** Authorized organization administrator, subject to narrower responsibilities under #44.  
**Flow:** Select active organization → view permitted members → invite employees individually or import a validated roster → assign faculty or supervisor responsibilities and supervisor-to-faculty scopes → review the assignment summary and sensitive changes → confirm → see invitation/assignment status and relevant audit event. Keep organization access, appraisal responsibilities, and supervisor scope understandable as distinct concepts.
**Alternatives:** Invalid or duplicate employee, malformed import row, unresolved supervisor assignment, unauthorized change, conflicting update or revoked access. Allow correction and retry without losing valid rows.
**Outcome:** Employees have the appropriate authorized entry path, and institutional changes are accountable.  
**Test:** No privilege escalation, double submission or cross-organization information leak.

### 4.4 Organization Administrator — configure appraisal and model workspaces

**Actor:** Organization administrator responsible for institutional setup and facilitation.
**Flow:** Enter the institution workspace → create an appraisal cycle → configure KPIs/KRAs, evidence requirements, approved scoring rules and assignments → validate and preview the cycle → build, train, and evaluate prediction and recommendation models in a sandbox → inspect model results and limitations → view authorized institution-level KPI, KRA, faculty performance and level analytics. Operational evidence review and per-KPI mark release belong to assigned supervisors.
**Alternatives:** Invalid KPI configuration, missing evidence rule, unsuitable dataset, failed training/evaluation, stale model, or unauthorized configuration. Preserve drafts and show actual system status.
**Outcome:** Faculty can complete assigned appraisals, supervisors can review them, and administrators can understand institution-level performance and model readiness.
**Test:** Administrators can distinguish configuration, evaluation, review, and release states and do not see a mark as released before the supervisor releases it.

### 4.5 Employee — join and access personal workspace

**Actor:** Employee of a participating organization (faculty where applicable).  
**Flow:** Accept permitted invitation/identity verification → confirm active organization and personal context → complete only necessary onboarding/profile inputs → see authorized tasks, progress and available capabilities.  
**Alternatives:** No organization, pending invitation, missing consent/required records, revoked access, stale session. Do not display administrator controls or unrelated employees' information.  
**Outcome:** Employee has an understandable, permission-limited personal workspace.  
**Test:** Employee correctly identifies their context and finds the next legitimate task.

### 4.6 Faculty Member — view released KPI marks and permitted outputs

**Actor:** Authorized employee of a participating institution.  
**Flow:** Open personal workspace → review KPI submission and status → view marks for each KPI after the assigned supervisor releases them → distinguish marks from predictions and recommendations → inspect relevant explanation and evidence where authorized → take a permitted follow-up action or request clarification.
**Alternatives:** Pending review, returned evidence, mark not yet released, prediction not enabled, unavailable/stale model output, disputed result, or access change. Label model outputs as estimates with their cycle/model context; never present them as official marks or imply they changed a released mark. An unreleased result must not appear final.
**Outcome:** Faculty understand their own released KPI marks and any other results made available under policy.
**Test:** Representative faculty can tell whether a KPI is submitted, under review, returned, or released, and can find the explanation for a released mark.

### 4.7 Faculty Member — submit assigned KPI evidence for review

**Actor:** Faculty member assigned institutional KPIs and evidence requirements.
**Flow:** Open assigned KPI → read required information and verification criteria → enter KPI input(s) and attach supporting evidence → review entered vs extracted values where relevant → validate → save draft or explicitly **submit for verification** → track submitted, under review, returned for correction, verified and scored/released states as applicable.  
**Alternatives:** Missing document, unreadable evidence, conflicting extracted values, network failure, unsaved changes, denied access or return for correction.  
**Outcome:** Auditable submission and transparent review state, followed by a mark visible to faculty only after supervisor release.
**Test:** Faculty can submit and correct evidence without editing KPI/scoring definitions and without accessing other faculty members' results.

### 4.8 Supervisor/Reviewer — review submissions and release KPI marks

**Actor:** Supervisor/reviewer assigned to the faculty member and appraisal period.
**Flow:** Open assigned review queue → inspect an assigned faculty member's KPI submission and evidence → record the review decision and mark under approved institutional rules → return the submission with feedback when correction is needed, or release the mark for that KPI → review analytics for assigned faculty. A supervisor who is also a faculty member can access personal tasks separately and must not review or release their own submissions.
**Alternatives:** Missing or unreadable evidence, conflicting values, duplicate action, self-review conflict, reassignment, unavailable policy, or revoked access. Block prohibited actions and show a clear status and auditable recovery path.
**Outcome:** Faculty receive KPI marks and feedback only after the responsible supervisor releases them; review actions remain traceable.
**Test:** Supervisors act only on assigned faculty, distinguish returned/under-review/released items, and confirm which KPI marks are visible to the faculty member.

### 4.9 Role visibility and result meaning

The following is a **proposed UX/access boundary** for design review, not a deployed authorization contract:

| Capability or result | Organization administrator | Supervisor/reviewer | Faculty member |
|---|---|---|---|
| Organization setup, memberships and role/scope assignment | Configure within approved institutional authority | No access unless separately authorized | No access |
| KPI/KRA and cycle configuration | Configure and validate | View the active requirements for assigned reviews | View assigned requirements |
| Evidence submission | No operational review by virtue of admin role | Review assigned submissions | Create and submit own evidence |
| Human decisions and released marks | Institution analytics as permitted; does not release | Decide/release per KPI for assigned faculty | View own released marks |
| Analytics | Institution-wide, subject to approved duties | Assigned faculty only | Personal results only |
| Prediction/recommendation models | Build/evaluate in controlled workspace | View only outputs authorized for review context | View own enabled outputs, clearly labeled as estimates |

Use separate labels and visual treatment for **submitted evidence**, **supervisor decision/released mark**, and **model prediction/recommendation**. Show missing, stale, unavailable, or low-confidence model output as such. Never infer finality from a model score. Exact visibility, model approval, and data-use policy remain open for institutional approval.

### 4.10 Platform Developer — create, test and publish nodes/tools/plugins

**Actor:** Authorized AFPI platform developer, not an organization administrator.  
**Trigger:** Build or revise a reusable capability for institutional workflows.  
**Flow:** Open developer workspace → create or modify a typed node/tool/plugin with declared inputs, outputs, configuration and permissions → test in an **isolated playground** using synthetic/redacted fixtures → inspect execution traces and validation errors → revise and rerun → version and validate the node → request approval where required → publish it into a controlled reusable catalog for permitted organization configuration. Platform maintenance and operational diagnostics remain separate permitted developer tasks.  
**Alternatives:** Invalid node contract, failed execution, plugin permission failure, incompatible version, unsafe side effects, untrusted integration, missing approval or denied release. Fail safely, avoid exposing secrets and do not run against real employee data without separately granted authorization.  
**Outcome:** Versioned, validated node/tool/plugin available to authorized institutional builders, without granting developers access to confidential organization records.  
**Test:** A developer can author, sandbox-run, inspect errors, revise and version a node; unauthorized execution and data access are blocked, and publication states remain explicit.

**Developer operational journey:** Authenticate into approved platform context → inspect service health, release status and permitted diagnostics → perform authorized maintenance → verify outcome and record audit trail. This operational responsibility does not confer tenant-data access.

### 4.11 Cross-persona capability flow

```text
Organization Admin: create KPIs/KRAs, set cycles/assignments, configure models and view institution analytics
           ↓ faculty tasks and supervisor assignments are established
Faculty: submit assigned KPI information and evidence
           ↓ assigned supervisor reviews evidence and decides per-KPI marks
Supervisor: release marks for each KPI and view authorized faculty analytics
           ↓ released results become visible to the faculty member
Faculty: view own released marks and other outputs permitted by policy

Platform Developer: build/version/test reusable nodes, tools and plugins in sandbox
           ↓ approved capabilities made available to Organization Admins
Platform Developer: separately maintain engines and deployment infrastructure
           ↳ no implicit access to institution data
```

Different users interact with the **same capabilities**, but through responsibilities and views appropriate to their scope. A faculty member should never need institutional KPI-design or model-training controls to submit evidence or view an authorized mark or prediction. A developer should not need faculty-level visibility to develop or playground-test a node, nor to maintain the prediction service.

### 4.12 Journey review and phased implementation

- Confirm policy ownership, required approvals, who is allowed to train/publish models, and visibility of faculty predictions with institutional stakeholders.
- Approve role/scopes and any support-access exception under #44 before protected routes are coded.
- The first release is intended to include the complete core journeys for organization administrators, faculty members, and supervisors/reviewers described in 4.2–4.8. Detailed requirements and implementation remain to be designed and verified.
- Include keyboard/screen-reader, responsive, draft recovery, session-expiry, in-progress job, revoked-access and data provenance variants in relevant test scenarios.
- Measure task success, critical errors, completion time and comprehension separately for each persona.
- Detailed module journeys and screens belong to their owning `docs/modules/<module>/UI-UX.md` and module-owned PRs.

## 05. Wireframes — deferred

Pending review of Sections 02–04 and actual user/role requirements. Do not interpret content hierarchy or journeys above as finalized wireframes.

## 06. UI Implementation Guidelines — deferred

Pending production architecture and UX approvals. Build a new production UI from the approved design. Treat the PoC frontend as historical reference rather than a migration base; verify component-library dependencies and supported versions before implementation.

## Implementation and decision boundaries

1. **Decided in product discussions:** Topics 1.1–1.8; Topic 2.1 semantic approach and light/dark/accessibility commitments; shadcn/ui as shared component foundation.
2. **Proposed for review:** Specific typography, dimensions, component inventory, conceptual content taxonomy and user journeys.
3. **Open:** Official base palette, exact primary values and custom color swatches, visual tokens, detailed permissions and assignments, organization context, module routes, KPI/KRA scoring policy, model lifecycle, and dashboard metric definitions.
4. **Not implemented:** No UI screen, auth/tenant enforcement, route or component is considered production-ready merely because it appears in this file.
