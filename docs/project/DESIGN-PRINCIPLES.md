# AFPI — Product UI/UX design principles

**Status:** Proposed product-wide principles for the new production-oriented AFPI. Tracked in [Issue #43](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/43).

**Scope:** Fundamental interaction, usability, and experience requirements. **Out of scope for this decision:** screens, wireframes, page hierarchy, app shell, color palette, spacing scale, typography tokens, and component implementation. Those will be separately reviewed later.

## Product goal
AFPI should make complex institutional performance workflows understandable, traceable, secure, and efficient for first-time and experienced users. The interface should serve real tasks and decisions rather than imitate the historical PoC UI.

## Product-wide principles

### 1. Clarity and discoverability
Each user should understand what a page is for, what information is shown, and which action matters. Use familiar language, recognizable controls, descriptive labels, and helpful empty states. Never require users to infer hidden system rules.

**Acceptance question:** Can a first-time user identify the task and next step without verbal instruction?

### 2. Consistency and predictable behavior
The same concept, label, control, and state must behave consistently across Framework Studio, Prediction, Recommendation, and Organization. Shared patterns should be reused; module variations must be justified by actual needs.

**Acceptance question:** Does a user who learns a pattern in one module recognize it elsewhere?

### 3. Task-first, progressive complexity
Prioritize the common task; reveal advanced configuration, specialist terminology, and optional inputs only when needed. Avoid overwhelming users, but do not hide information needed for informed decisions.

**Acceptance question:** Can a beginner complete the core path without navigating unnecessary settings?

### 4. Explicit system status and feedback
Every consequential action must have understandable states: ready, processing, saved, failed, pending approval, or completed. Provide actionable validation/errors and confirmation appropriate to the consequences. Do not claim success before the operation succeeds.

**Acceptance question:** Can a user tell what happened, what has not happened, and what to do next?

### 5. Recovery, reversibility, and safe actions
Prevent accidental loss, duplicate submissions, and irreversible surprises. Where appropriate provide drafts, clear unsaved-change warnings, review before submission, confirmation for destructive actions, and recovery paths. Clearly identify actions that cannot be undone.

**Acceptance question:** Can users safely correct mistakes without restarting the whole workflow?

### 6. Trust, evidence, and explainability
Separate user-entered data, extracted evidence, verified values, policy-derived scoring, predictive model outputs, and recommendations. Show provenance, applicable policy/model versions, dates, uncertainty, and known limitations when relevant. Never present a prediction as verified performance or a recommendation as a final institutional decision.

**Acceptance question:** Can users understand why a result appeared and what evidence supports it?

### 7. Accessibility and inclusive interaction
Target WCAG 2.2 AA. Design keyboard-operable journeys, visible focus, adequate contrast, semantic labels, clear error guidance, responsive behavior, non-color-only meanings, and reduced-motion support. Complex workflows require accessible alternatives to pointer-only interactions.

**Acceptance question:** Can the task be completed without a mouse or perfect vision?

### 8. Organization-aware privacy and permissions
Always make relevant organizational context understandable. Present only meaningful authorized actions; no interface control substitutes for enforced backend authentication, authorization, or tenant isolation. Prevent cross-organization data carryover and misleading access states.

**Acceptance question:** Can a user tell the context of their work without seeing data or actions beyond their permissions?

### 9. Human oversight and accountable decisions
Where reviews, scoring, model approvals, or recommendations affect people, support deliberate human judgment, review notes, actionable disagreement/appeal paths where policy requires them, and an auditable history. Avoid manipulative prompts and unexplained automated finalization.

**Acceptance question:** Can an authorized reviewer inspect, challenge, and document a consequential decision?

### 10. Purposeful information density and performance
Present the information needed for the current decision while supporting efficient search, filtering, comparison, and repeated expert tasks. Prefer legibility and responsiveness over decorative complexity; avoid blocking users on unnecessary loading.

**Acceptance question:** Can both new and experienced users complete the same task accurately and efficiently?

## Application across modules
- **Framework Studio:** discoverable configuration, validation, version awareness, evidence trails, review and recoverability.
- **Prediction:** dataset readiness, training/evaluation visibility, model provenance, explanations, uncertainty and explicit approval boundaries.
- **Recommendation:** actionable rationale, supporting evidence, limitations, follow-up tracking and human acceptance/rejection.
- **Organization:** transparent context, onboarding progress, membership and role expectations, privacy and safe administrative actions.

These are experience requirements, **not descriptions of currently implemented features**.

## Component philosophy
[shadcn/ui](https://ui.shadcn.com/) is the **selected UI component foundation** for future AFPI screens. We aim to customize reusable, accessible components and avoid inconsistent one-off styling. Selection of shadcn/ui does **not** decide final colors, layout, shell, page routes, or exact component inventory.

## How to evaluate designs later
For each significant task, review:
1. **Discoverability:** can a new user find the task?
2. **Correctness:** can they complete it without data errors or misunderstood rules?
3. **Feedback:** are changes, waiting states and errors understandable?
4. **Recovery:** can they undo, revise, or safely continue?
5. **Trust:** can they identify evidence, versions, uncertainty and responsible reviewers?
6. **Access:** are organization context and permissions clear and enforced?
7. **Accessibility:** can they complete it using keyboard and assistive technology?
8. **Efficiency:** can a returning user complete frequent work without repetitive steps?

Record findings in the relevant module's `docs/modules/<module>/audits/` register, and fix module-owned issues within their own PRs.

## Deferred decisions
- Visual identity: palette, typography, spacing, radius, motion and dark-mode specifications.
- Information architecture, navigation, application shell, page hierarchy and responsive layouts.
- Screen designs, journey-specific interactions and component implementation.
- Organization roles, onboarding contracts and tenant isolation: coordinate with [Issue #44](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/44).

## Existing project engineering principles
- Maintain separate ownership for Framework Studio, Prediction, Recommendation and Organization.
- Agree integration and data contracts before cross-module implementation.
- Distinguish proposed design from verified behavior, and keep tests/docs synchronized with implementation.
- Apply the repository's documented PR and documentation ownership rules.

**No new frontend functionality is implied by this document.**