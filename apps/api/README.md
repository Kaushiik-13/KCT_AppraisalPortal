# AFPI API

NestJS application scaffold for the first-release API, structured as a modular monolith. Empty feature modules reserve the agreed internal boundaries: identity/access, organization, framework-studio, prediction, recommendation, and analytics.

## Migration status

- Current Next.js route handlers and their server adapters remain under `apps/web/app/api/` and `apps/web/server/` as PoC behavior.
- The Python training provider is under `services/model-training/`; it is currently a local standard-input/standard-output process, not a network service or durable job worker.
- `packages/contracts/` is reserved for agreed API schemas and shared types; no product contract has been approved or published yet.
- Feature module folders are architectural placeholders. No authentication, appraisal, analytics, persistence, or model-orchestration workflow is implemented in this API scaffold.

The health endpoint only confirms that the scaffold starts; it does not indicate production readiness.
