# AFPI documentation

Use this page as the **single documentation index**. Read the short guides first; use the detailed contracts only for the feature being worked on. Current implementation refers to the merged October 2026 PoC, not a production release.

## Essential reading

| Document | Purpose |
|---|---|
| [Project brief](PROJECT-BRIEF.md) | Goal, modules, role assumptions and limitations |
| [Setup](SETUP.md) | Run Framework Studio and local Prediction training |
| [User guide](USER-GUIDE.md) | Create/test a KPI; run Prediction Studio |
| [Architecture](ARCHITECTURE.md) | Runtime boundaries, code map and model lifecycle |
| [Testing](TESTING.md) | Reproducible verification and test gaps |
| [Roadmap](ROADMAP.md) | Open priorities, not historical daily notes |
| [Security and data](SECURITY-AND-DATA.md) | Data handling and production gaps |
| [Contributing](../CONTRIBUTING.md) | Branches, PRs and documentation changes |

## Framework Studio references

- [Data model](DATA-MODEL.md) — field, graph, draft and runtime contracts.
- [Workflow engine](WORKFLOW-ENGINE.md) — validation, execution and review behavior.
- [Tools and extensions](TOOLS-AND-EXTENSIONS.md) — reusable tool catalogue and boundaries.
- [Scoring](SCORING.md) — conditional/formula policies and scoring-result precedence.
- [AI and API](AI-AND-API.md) — provider integration, limits and routes.

**Examples and acceptance evidence:** [Publication KPI](PUBLICATION-KPI.md), [Training KPI](TRAINING-KPI.md), [Content relevance KPI](CONTENT-RELEVANCE-KPI.md), [PADS TL-1 walkthrough](PADS-TL1-WALKTHROUGH.md), [PADS individual KPI verification](PADS-INDIVIDUAL-KPIS.md), and [Creator walkthrough](CREATOR-WALKTHROUGH.md).

## Prediction Studio references

- [Synthetic data dictionary](PREDICTION-DATA-DICTIONARY.md) — dataset fields, scenario contracts and exclusions.
- [Readiness and leakage safety](PREDICTION-READINESS.md) — scenarios, split and API contract.
- [Model training and comparison](PREDICTION-TRAINING.md) — local Python provider, candidates and evaluation.
- [Governance and inference](PREDICTION-GOVERNANCE-AND-INFERENCE.md) — simulated model lifecycle and inference.
- [Employee view and retraining](PREDICTION-EMPLOYEE-AND-RETRAINING.md) — advisory refresh and eligibility safeguards.
- [Demo script](PREDICTION-DEMO-SCRIPT.md) — end-to-end review journey.

The original [framework implementation plan](PREDICTION-FRAMEWORK-IMPLEMENTATION-PLAN.md) and [prototype delivery plan](PREDICTION-PROTOTYPE-IMPLEMENTATION-PLAN.md) remain **historical planning references**, not the source of truth for current feature status. The [synthetic dataset audit](PREDICTION-DATASET-AUDIT-2026-10-29.md) records a dated fixture verification.

## Historical records and support

- [Decisions](DECISIONS.md) — design decision log, including unresolved items.
- [Change history](CHANGE-HISTORY.md) — chronological engineering record.
- [Archived roadmap](archive/ROADMAP-HISTORY.md) and [archived testing record](archive/TESTING-HISTORY.md) — dated checkpoints preserved before the concise rewrite.
- [Troubleshooting](TROUBLESHOOTING.md) — local recovery notes.
- [Previous Phase 6 verification](../PHASE-6-VERIFICATION.md) — historical test report.
- [Workflow guide entry point](../WORKFLOW-GUIDE.md) — legacy shortcut to tutorials.

Historical verification counts and plans do **not** imply current CI success, a release, institutional authorization, or a deployed Python/model service.
