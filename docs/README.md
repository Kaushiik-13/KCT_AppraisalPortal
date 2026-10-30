# Documentation index

Application baseline: **7 October 2026**. Prediction Framework planning was added on **27 October 2026**. These documents distinguish planned features from the implemented Next.js PoC.

## Product and user guides

- [Project brief](PROJECT-BRIEF.md): purpose, roles, requirements, and scope.
- [User guide](USER-GUIDE.md): policy-first navigation, forms, workflows, review handoffs, saving, and clearing.
- [Publication KPI](PUBLICATION-KPI.md): complete example and unresolved scoring decisions.
- [Training KPI](TRAINING-KPI.md): build a generic workflow and scoring policy.
- [PADS TL-1 walkthrough](PADS-TL1-WALKTHROUGH.md): reference-only end-to-end verification of one PADS KPI, with source mapping, expected scores, screenshots, and limits.
- [PADS individual KPI verification](PADS-INDIVIDUAL-KPIS.md): all 59 individual PADS rows — committed fixtures, the 201-case automated suite, the workbook row map, and what remains out of scope.

## Technical references

- [Setup](SETUP.md): local commands, environment, production start, and Vercel readiness.
- [Architecture](ARCHITECTURE.md): components, execution boundaries, and source map.
- [Data model](DATA-MODEL.md): persisted schemas, mappings, and runtime records.
- [Workflow engine](WORKFLOW-ENGINE.md): validation, branches, review, and failure behavior.
- [Tools and extensions](TOOLS-AND-EXTENSIONS.md): tool catalogue and developer extension points.
- [Scoring](SCORING.md): formula and conditional models, versions, mappings, and review boundaries.
- [AI and API](AI-AND-API.md): instructions, provider adapter, endpoints, and limits.
- [Security and data](SECURITY-AND-DATA.md): storage, external transfers, and production gaps.
- [Prediction Framework implementation plan](PREDICTION-FRAMEWORK-IMPLEMENTATION-PLAN.md): planned organization-specific final-score prediction, synthetic KCT data, three readiness scenarios, screens, architecture, and delivery phases.
- [Prediction prototype implementation plan](PREDICTION-PROTOTYPE-IMPLEMENTATION-PLAN.md): implementation-ready KCT review slice covering the eight dataset decisions, generation method, ML service, screens, project structure, delivery order, verification, and demo flow.
- [Prediction data dictionary](PREDICTION-DATA-DICTIONARY.md): implemented synthetic fixture grain, fields, KRA columns, scenarios, leakage exclusions, regeneration and current limitations.
- [Synthetic prediction dataset audit — 29 October 2026](PREDICTION-DATASET-AUDIT-2026-10-29.md): fixture inventory, verification evidence, checksums, findings, approved prototype uses and deferred Git status.

## Engineering and planning

- [Testing](TESTING.md): automated coverage and manual acceptance checklist.
- [Troubleshooting](TROUBLESHOOTING.md): symptoms and recovery steps.
- [Roadmap](ROADMAP.md): completed phases and remaining work.
- [Decisions](DECISIONS.md): design choices and unresolved questions.
- [Change history](CHANGE-HISTORY.md): feature history, not a Git release log.
- [Contributing](../CONTRIBUTING.md): change workflow and documentation maintenance.

## Reading paths

**KPI creator:** User guide → Training KPI → Publication KPI → Scoring → AI and API.

**Developer:** Setup → Architecture → Data model → Workflow engine → Tools and extensions → Prediction Framework plan → Prediction prototype plan → Testing.

**Project reviewer:** Project brief → Decisions → Security and data → Roadmap.

The [workflow-guide entry point](../WORKFLOW-GUIDE.md) links to the maintained walkthroughs. [Phase 6 verification](../PHASE-6-VERIFICATION.md) is a historical checkpoint; later AI and navigation changes are described here. The original Notion hierarchy and appraisal workbook were not independently re-audited for this documentation task.

- [Content relevance KPI](CONTENT-RELEVANCE-KPI.md): full PDF text, topic/context, rubric and AI review.
