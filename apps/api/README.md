# AFPI API

NestJS scaffold for the first-release API, structured as a modular monolith. Root workspace commands and prerequisites are documented in the [repository README](../../README.md).

## Run locally

From the repository root, start the API in development mode:

```sh
npm run dev:api
```

The API binds to `127.0.0.1:4000` by default. Its health endpoint is `http://127.0.0.1:4000/api/health`; set `PORT` to use a different port.

To build both the web and API workspaces, run `npm run build` at the repository root. After building, start the API with:

```sh
npm run start --workspace @afpi/api
```

## Current implementation

- The API currently exposes only the health endpoint. It confirms the scaffold starts; it is not a readiness or product-workflow endpoint.
- Empty module folders reserve the agreed internal boundaries: identity/access, organization, framework-studio, prediction, recommendation, and analytics.
- No authentication, appraisal, analytics, persistence, or model-orchestration workflow is implemented in this API scaffold.
- The previous Next.js routes and server adapters are preserved under `legacy/poc/web/app/api/` and `legacy/poc/web/server/` as reference-only PoC code.
- The former synthetic Python training provider is under `legacy/poc/services/model-training/`. The new `services/model-training/` directory contains a README only; no production worker or service is implemented.
- `packages/contracts/` is reserved for agreed API schemas and shared types; no product contract has been approved or published yet.

See the [proposed product architecture](../../docs/project/ARCHITECTURE.md) and [repository structure guide](../../docs/project/REPOSITORY-STRUCTURE.md) before adding behavior. Do not treat PoC behavior as a production requirement without an approved decision.
