# AFPI design principles

## Agreed project principles
- Maintain clear module boundaries for Framework Studio, Prediction, Recommendation and Organization, while supporting future modules.
- Define shared API/data contracts before implementing cross-module dependencies.
- Keep canonical project-level contracts and shared schemas in `docs/project/`; module docs own module-specific details.
- Keep documentation synchronized with implementation and tests, distinguishing current behavior from proposals.
- Prefer reproducible, reviewable changes and verifiable evidence.
- Treat role-based scope, data access, privacy and future multi-tenant design as explicit design and verification concerns, never as assumed implementation.

## UI/UX
Product-wide UI/UX principles, design system, information architecture and user journeys are maintained in the [single UI/UX specification](UI-UX.md). That file separates agreed principles, proposed structures and unresolved implementation dependencies.

## Proposed technical architecture
<!-- Deliberately left for a separately authorized architecture decision and verified implementation details. -->
