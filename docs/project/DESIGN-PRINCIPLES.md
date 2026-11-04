# AFPI design principles

## Agreed project principles
- Maintain clear module boundaries for Framework Studio, Prediction, Recommendation and Organization.
- Define shared API/data contracts before implementing cross-module dependencies.
- Keep canonical project-level contracts and shared schemas in `docs/project/`; module docs own module-specific details.
- Keep documentation synchronized with implementation and tests, while distinguishing current behavior from proposals.
- Prefer reproducible, reviewable changes and verifiable evidence.
- Treat role-based scope, data access, privacy and any future multi-tenant design as explicit design and verification concerns, not assumed implemented features.

## UI/UX design principles — production-oriented target
Modern Enterprise SaaS visual direction with **shadcn/ui** as the standard component foundation. The eight governing principles are:
1. Clarity before decoration.
2. Reusable, consistent components and interaction rules.
3. Progressive disclosure of advanced features.
4. Recoverable and guided complex workflows.
5. Explainable user input, verification, scoring, model predictions and recommendations.
6. Explicit organization/permission context, with backend-enforced authorization.
7. Accessibility by default, targeting WCAG 2.2 AA.
8. Purposeful information density and usable responsive layouts.

Read the [shared UI design system](UI-DESIGN-SYSTEM.md) for component and theme tokens, and [information architecture](INFORMATION-ARCHITECTURE.md) for the proposed app shell, navigation and journeys.

**Implementation status:** These are agreed design targets, not implemented components. The current repository still contains the legacy PoC frontend.

## Proposed technical architecture
<!-- Deliberately left for a separately authorized architecture decision and verified implementation details. -->
