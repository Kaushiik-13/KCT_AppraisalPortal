# AFPI web application

This workspace contains the existing Next.js proof-of-concept UI and its current Next.js route handlers. Those handlers are retained for compatibility while product API capabilities are migrated to the NestJS application under `apps/api` through agreed contracts.

## Migration map

- `app/` keeps the current Next.js pages and route handlers as the PoC web boundary.
- `src/` keeps the current React screens, workflow/scoring logic, and browser utilities. UI and API/domain ownership will be separated incrementally after contracts are agreed.
- `server/` contains current server-side adapters used by the Next.js route handlers; it is transitional and is not the target NestJS API.
- `fixtures/` contains reference and synthetic datasets used by the PoC UI and tests.
- `public/` and `scripts/` contain the web app's static assets and build/data utilities.

The current screens and route handlers are PoC behavior. They are not claims that the proposed production workflows are complete. See `apps/api/README.md` for the target API module boundaries and migration status.
