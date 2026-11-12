# Adaptive Faculty Performance Intelligence (AFPI)

AFPI is a faculty appraisal and analytics product being rebuilt for a complete first-release workflow at one institution. The longer-term direction may support multiple organizations; that is not part of the first release.

## Current implementation

The repository has a clean Next.js web workspace, a NestJS modular API scaffold, reserved locations for model training and shared contracts, and the former proof of concept preserved under `legacy/poc/`. The new web app is a starter shell and the API currently exposes a health endpoint. Product workflows, authentication, persistence, analytics, and model training are not implemented in the new application.

See the [repository structure and status guide](docs/project/REPOSITORY-STRUCTURE.md) for what belongs in each workspace and what remains planned.

## Local development

### Requirements

- Node.js 20.9 or newer, as specified by the root `package.json`.
- npm, which is included with Node.js.

### Install and run

From the repository root:

```sh
npm install
```

Run the web app and API in separate terminals:

```sh
npm run dev
```

```sh
npm run dev:api
```

The web shell is at `http://127.0.0.1:5173`. The API health endpoint is at `http://127.0.0.1:4000/api/health`; it confirms that the scaffold starts, not that product workflows are ready.

### Build and start

Build both workspaces from the repository root:

```sh
npm run build
```

After building, `npm start` starts the web app. To start the API, run:

```sh
npm run start --workspace @afpi/api
```

The API uses port `4000` by default and can be configured with `PORT`.

### Tests and environment variables

The new web and API workspaces do not currently define test scripts, and there is no root `npm test` command. The only root test command, `npm run test:poc:ml`, exercises the archived synthetic model-training proof of concept; it is not coverage for the new application. See the [testing standards](docs/development/TESTING-STANDARDS.md) for current coverage and future expectations.

The current web shell and API health endpoint do not require environment variables. `OPENROUTER_API_KEY` in `.env.example` is used by the archived PoC only.

## Product and development documentation

- [Product overview and roles](docs/project/OVERVIEW.md)
- [Proposed product architecture](docs/project/ARCHITECTURE.md)
- [Repository structure and current status](docs/project/REPOSITORY-STRUCTURE.md)
- [Organization module](docs/modules/organization/README.md)
- [Framework Studio](docs/modules/framework-studio/README.md)
- [Prediction](docs/modules/prediction/README.md)
- [Recommendation](docs/modules/recommendation/README.md)
- [Contributing guide](CONTRIBUTING.md)
- [Branch and pull request rules](docs/development/BRANCHING-AND-PRS.md)
- [Testing standards](docs/development/TESTING-STANDARDS.md)
- [Documentation rules](docs/development/DOCUMENTATION-RULES.md)
- [Historical PoC archive](docs/reference/legacy/README.md)
