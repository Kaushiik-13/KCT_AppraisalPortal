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

**Status:** Proposed taxonomy to validate with user roles and task research. Not a committed route map, implementation architecture, or choice of sidebar placement. **Permissions and tenant identification are blocked on #44.**

### 3.1 Information architecture principles

- Hybrid organization: modules provide stable context; important tasks have short entry paths.
- Global patterns are shared; each module can group specialized functions locally.
- Active organization, workspace/module, resource, current action, status and access scope are clear where applicable.
- Authorized choices are prioritized; insufficient access handled without revealing protected records.
- Keep global hierarchy shallow, and expose secondary details contextually.
- Support deep links and recoverable navigation to eligible authorized resources.
- Plan global search as **future**, not a current-release requirement.

### 3.2 Conceptual content map

```text
AFPI Workspace (organization- and permission-scoped)
├── Overview / My Work
│   ├── Assigned actions / pending reviews
│   └── Recent permitted activity / summaries
├── Framework Studio
│   ├── Frameworks and versions
│   ├── KPI / policy configuration
│   ├── Workflow design and testing
│   └── Evidence and reviews
├── Prediction
│   ├── Dataset registration and readiness
│   ├── Training and evaluation
│   ├── Model approvals / publication (subject to contracts)
│   └── Prediction results and explanations
├── Recommendation
│   ├── Recommendations and rationale
│   ├── Review / decisions
│   └── Follow-up
├── Organization
│   ├── Profile and setup
│   ├── Membership and roles
│   ├── Settings and policies
│   └── Authorized audit activity
└── Future modules (added under shared platform conventions)
```

This is a **candidate content hierarchy**. Labels and pages will be tested; none of these destinations are being claimed as working production pages. Global search, cross-module notifications and self-service account preferences remain optional future platform capabilities.

### 3.3 Navigation and access model

**Proposed behavior:** Stable global entry to authorized modules and active tasks; within-module navigation for detailed work; contextual actions and breadcrumbs/history where needed. Do not expose confidential items in unauthorized search/navigation. Restricted deep links must show an appropriate access state rather than leaking item details. Switching organizations must invalidate tenant-scoped UI caches and prevent stale data display.

**Unresolved:** Exact role definitions, organization enrollment, authorization matrix, tenant-routing strategy (URL/session/subdomain), cross-module landing behavior and mobile navigation form. These must not be guessed from the old PoC.

### 3.4 Page archetypes (structure only, no wireframes)

| Pattern | Purpose | Mandatory states |
|---|---|---|
| Overview / task queue | Resume tasks, see owned work | empty, loading, unauthorized, error |
| List / directory | Find entities, filter, sort and open details | empty, no results, partial data, denied |
| Detail / review | Inspect record, status, evidence and permitted actions | draft, pending, locked, historical |
| Guided setup | Multi-step creation with validation | incomplete, saved draft, failed, completed |
| Workflow workspace | Create/test/review structured policy workflow | unsaved, validation failed, running, conflict |
| Analytics / explanation | Interpret data, confidence/limits and lineage | unavailable, stale, partial, no data |
| Admin / settings | Perform controlled changes | insufficient permission, pending approval, conflict |

### 3.5 Proposed information-architecture validation

- Tree-test the location of at least six common tasks with representative users.
- Validate the names and relationships of content areas against actual domain language.
- Test no-organization, multiple-organization, revoked-access and pending-invitation cases.
- Prove new module registration does not require changing the conceptual global taxonomy.
- Run permissions review before routes are implemented.
- Avoid final URLs or shell layout commitments until the architecture and journey review is complete.

## 04. User Journeys

**Status:** End-to-end *candidate* journeys, not implemented features or approved institutional policy. Actors below describe responsibilities, not finalized RBAC roles. The exact actors and permissions require validation under #44 and with institutional stakeholders.

### 4.1 Common journey structure

Each journey records **actor, trigger, prerequisites, main steps, alternatives/errors, outcome, evidence/traceability**, and a measurable task-completion test. Cross-module navigation must preserve context only when authorized.

### 4.2 Organization setup and onboarding

**Actor:** Authorized organization setup administrator.  
**Trigger:** Organization is created or an invitation accepted.  
**Preconditions:** Verified identity, lawful permission to create/join organization, available organization contract.  
**Steps:** Start setup → review organization context and required information → validate fields → configure permitted setup choices → review and confirm → see active context and next recommended task.  
**Alternatives:** invitation expired, already belongs to organization, duplicate organization, missing permission, network failure, incomplete step, session expired. Save permitted draft values and never expose data from another organization.  
**Outcome:** Confirmed authorized organization context; auditable consequential changes.  
**Test:** Representative authorized actor can complete setup without hidden instructions; unauthorized actor cannot perform setup.

### 4.3 Member invitation and permission administration

**Actor:** Authorized membership administrator.  
**Trigger:** Invite, alter, or remove member access.  
**Steps:** Select correct org → inspect permitted member list → choose change → validate target and scope → review high-risk impact → confirm → show authoritative result and permitted audit record.  
**Alternatives:** invitation duplicate/expired, conflicting permission, revoked own access, stale change, failure after submission. Prevent unintended escalations or repeated transactions.  
**Outcome:** Updated access with accountable audit event; no data crossover.  
**Test:** Authorized actor correctly predicts the outcome and can inspect it; forbidden changes rejected server-side.

### 4.4 Framework authoring and evidence verification

**Actor:** Authorized framework author or reviewer (responsibilities may be distinct).  
**Trigger:** Create or revise a faculty evaluation framework.  
**Steps:** Create/open version → define permitted KPI/policy inputs → configure workflow → validate structure → test with permitted evidence → inspect source vs extracted/verified values → save draft → submit for approval/review when authorized.  
**Alternatives:** evidence unreadable, scoring conflict, validation failure, missing dataset, unsaved changes, duplicate version, reviewer disagrees. Provide drafts and traceable differences; do not conflate extracted `score` with policy scoring outputs.  
**Outcome:** Reviewable version with explicit provenance and separation of entered/extracted/verified/calculated data.  
**Test:** Users identify which values were verified and can recover from a simulated invalid workflow.

### 4.5 Review and approval of evaluation

**Actor:** Authorized faculty appraisal reviewer.  
**Trigger:** Review assigned for evidence/score verification.  
**Steps:** Open assigned item → understand scope/policy/version → inspect evidence, discrepancies, rationale and calculation → approve/request clarification/reject only as authorized → record reason → receive final state.  
**Alternatives:** unclear evidence, insufficient access, superseded framework, conflicting decision, policy-required escalation or appeal.  
**Outcome:** Attributable auditable decision with accessible explanation; never silently auto-finalized.  
**Test:** Reviewer explains why the result was produced and can locate required supporting evidence.

### 4.6 Dataset readiness and model evaluation

**Actor:** Authorized Prediction operator/evaluator.  
**Trigger:** Prepare a dataset and assess a candidate model.  
**Steps:** Register permitted dataset → validate schema, privacy and readiness → inspect errors/quality → configure training → submit job → monitor real progress → compare allowed evaluation metrics and limitations → request model approval/publication if workflow supports it.  
**Alternatives:** invalid schema, missing values, job failure, uncalibrated confidence, unauthorized dataset, version mismatch, cancellation.  
**Outcome:** Traceable model artifact/evaluation and clear approval state; model claims must not outrun evidence.  
**Test:** User identifies dataset/model version and accurately interprets model performance limitations.

### 4.7 Viewing predictions and recommendations

**Actor:** Authorized faculty, manager or reviewer (subject to access contract).  
**Trigger:** Inspect permitted faculty performance results or next actions.  
**Steps:** Open permitted context → identify result as verified fact, policy score, prediction or recommendation → see plain-language rationale → expand evidence, data/model version and limitations → request clarification/review or record follow-up where authorized.  
**Alternatives:** missing evidence, stale model, low-quality data, conflicting recommendation, disputed result, access changed.  
**Outcome:** Informed human action rather than treating AI advice as an automatic institutional judgment.  
**Test:** >=90% of representative users correctly distinguish prediction from verified evaluation in a comprehension task.

### 4.8 Cross-cutting journey safeguards

Every journey must design for first use, returning expert, empty data, pending processing, save/retry conflicts, revoked permissions, session expiration, assistive technology, narrow viewport and failure recovery. Where a journey has consequences for an individual's appraisal or access, record who acted, when, under which policy and version, and what was decided (subject to governing institutional retention rules).

### 4.9 Validation before wireframes

- Confirm real personas, tasks, institutional authority and sensitive data handling with stakeholders.
- Establish a role/action/tenant matrix under Issue #44 before implementing protected routes.
- Prioritize 3–5 critical journeys for initial release; the others can be phased.
- Measure task success, error rates, time on task, comprehension and assistive-technology operability.
- Author module-specific detailed journeys and screens within each module's `UI-UX.md` via module-owned PRs.

## 05. Wireframes — deferred

Pending review of Sections 02–04 and actual user/role requirements. Do not interpret content hierarchy or journeys above as finalized wireframes.

## 06. UI Implementation Guidelines — deferred

Pending production architecture and UX approvals. Install/configure shadcn/ui and migrate the PoC frontend only in separately scoped implementation PRs; verify actual dependencies and supported versions first.

## Implementation and decision boundaries

1. **Decided in product discussions:** Topics 1.1–1.8; Topic 2.1 semantic approach and light/dark/accessibility commitments; shadcn/ui as shared component foundation.
2. **Proposed for review:** Specific typography, dimensions, component inventory, conceptual content taxonomy and user journeys.
3. **Open:** Official base palette, exact primary values and custom color swatches, visual tokens, final users/roles, organization/tenant contracts, module route structures and release scope.
4. **Not implemented:** No UI screen, auth/tenant enforcement, route or component is considered production-ready merely because it appears in this file.
