# AFPI web application

Next.js workspace for the new product.

**Current implementation:** a clickable, **nonfunctional** UI prototype of the Organization module (Issue #69). It has no backend, authentication, email, database or validation; all names, scores and statuses are sample data held in the browser tab. No other module has UI yet.

| Area | Routes |
|---|---|
| Account | `/signup`, `/signup/verify`, `/login`, `/forgot-password` |
| Organization onboarding (6 steps) | `/setup/organization`, `/setup/departments`, `/setup/employees`, `/setup/roles`, `/setup/configuration`, `/setup/review` |
| Invited person | `/accept-invitation`, `/accept-invitation/expired` |
| Administrator app | `/home`, `/people`, `/invitations`, `/settings` |

Shared page components live in `components/`, shadcn/ui primitives in `components/ui/`, and prototype state in `lib/`. Screens and design rules: [Organization UI prototype](../../docs/modules/organization/UI-PROTOTYPE.md). Screenshot walkthrough: [Organization UI flow](../../docs/modules/organization/UI-FLOW.md).

## Run locally

From the repository root:

```sh
npm run dev
```

The web app is available at `http://127.0.0.1:5173`. To build it as part of the workspace, run `npm run build` from the repository root. The build command also builds the API workspace.

See the [repository README](../../README.md) for full setup instructions and the [repository structure guide](../../docs/project/REPOSITORY-STRUCTURE.md) for workspace boundaries.
