# AFPI design principles

## Agreed project principles
- Maintain clear module boundaries for Framework Studio, Prediction, Recommendation and Organization.
- Define shared API/data contracts before implementing cross-module dependencies.
- Keep canonical project-level contracts and shared schemas in `docs/project/`; module docs own module-specific details.
- Keep documentation synchronized with implementation and tests, while distinguishing current behavior from proposals.
- Prefer reproducible, reviewable changes and verifiable evidence.
- Treat role-based scope, data access, privacy and any future multi-tenant design as explicit design and verification concerns, not assumed implemented features.

## Proposed technical architecture
<!-- Deliberately left for a separately authorized architecture decision and verified implementation details. -->
