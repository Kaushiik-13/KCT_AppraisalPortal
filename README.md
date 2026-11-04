# AFPI — Adaptive Faculty Performance Intelligence

AFPI is a **research-oriented proof of concept** for configurable faculty appraisal workflows and advisory performance prediction. The two working areas are **Framework Studio** (configure, verify and score KPI evidence) and **Prediction Studio** (explore synthetic data readiness, model comparison and advisory scores).

This repository is **not** an institution-approved appraisal system or a production multi-tenant platform. The current prototype does not provide user authentication, persistent organization records, secure tenant isolation, or durable model storage.

## Quick start

Prerequisite: Node.js 20.9+.

```bash
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/** for Framework Studio, or **http://127.0.0.1:5173/prediction** for Prediction Studio.

```bash
npm test
npm run build
```

Local Prediction training additionally requires Python and the dependencies in `ml/prediction_service/requirements.txt`. See [setup](docs/SETUP.md); run `npm run test:prediction-ml` to verify the provider. Windows PowerShell users with restricted `npm.ps1` execution can use `npm.cmd` instead of `npm`.

## Current capabilities

**Framework Studio**
- Configure typed KPI inputs, saved scoring rules and formula policies, and a branching workflow of reusable Actions, Conditions, and review/result steps.
- Extract text/data from PDF, PPTX, XLS and XLSX evidence; compare mapped values; optionally run AI evaluations.
- Test workflows, inspect execution traces and review packages, and keep local browser drafts. Import/export supports validated draft and workflow formats.
- Use Publication and PADS examples as **demonstrations**, not automatically institution-approved scoring.

**Prediction Studio**
- Generate deterministic synthetic appraisal data and inspect no-history, limited-history, sufficient-history and invalid-data scenarios.
- Validate readiness and data leakage boundaries, evaluate baseline and scikit-learn candidates on time-held-out data, and simulate approval/publication.
- Explore advisory sandbox and employee predictions and retraining readiness. Model artifacts and registry are **in-process**, and the Python training provider runs locally.

## Documentation

| Start here | Reference |
|---|---|
| Project goals and boundaries | [Project brief](docs/PROJECT-BRIEF.md) |
| Local install and configuration | [Setup](docs/SETUP.md) |
| UI walkthroughs and demonstrations | [User guide](docs/USER-GUIDE.md) |
| Runtime, modules and data boundaries | [Architecture](docs/ARCHITECTURE.md) |
| Tests and known gaps | [Testing](docs/TESTING.md) |
| Next development priorities | [Roadmap](docs/ROADMAP.md) |
| All specialized guides and reference contracts | [Documentation index](docs/README.md) |
| Contributing and PR workflow | [Contributing](CONTRIBUTING.md) |

## Research and safety boundaries

The PADS reference fixture covers 59 individual KPI rules and 201 expected scoring cases; full PADS aggregation, institutional approval, and some eligibility/scoring nuances are **not** implemented. Prediction outputs are synthetic demonstrations, not validated estimates of real faculty performance. AI and document parsers are not substitutes for authorized evidence review, security controls, or human decisions.

Evidence extraction is browser-oriented; live AI requests can transmit selected extracted text to the configured provider. Never use actual sensitive faculty data or secrets in this PoC. See [security and data](docs/SECURITY-AND-DATA.md).

The [repository documentation index](docs/README.md) retains detailed technical contracts, walkthroughs, and dated verification evidence without duplicating those records here.
