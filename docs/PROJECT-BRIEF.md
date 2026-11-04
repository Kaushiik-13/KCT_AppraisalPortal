# Project brief — AFPI

## Objective

**Adaptive Faculty Performance Intelligence (AFPI)** explores how configurable KPI/evidence workflows and advisory prediction can support faculty appraisal processes. The goal is to prototype and evaluate the approach with repeatable cases, **not** to replace institutional scoring policies, faculty reviewers, or human decisions.

## Implemented modules

| Module | Current proof of concept | Not yet delivered |
|---|---|---|
| **Framework Studio** | Configure KPI inputs, scoring rules/policies and workflow steps; extract and compare evidence; execute a test submission and inspect review handoffs | Authenticated institutional workflows, durable submissions and reviewer assignment, institution-approved full scoring |
| **Prediction Studio** | Generate synthetic KCT/PADS-style scenarios; validate readiness; compare local ML models; simulate approval/publication; show advisory employee predictions and retraining-readiness conditions | Production model service, verified real-world accuracy, durable registry, background retraining and validated fairness |
| **Recommendation** | Conceptual next-stage module | Implemented recommendation engine |
| **Organization administration** | Architecture/onboarding work is tracked separately | Production organization accounts, tenant isolation and permissions |

## Actors and responsibilities

- **KPI creator:** Defines inputs, rules, verification and workflow configuration in a local creator UI.
- **Faculty/submitter:** Supplies evidence in a test form; there is no authenticated faculty account.
- **Reviewer/appraiser:** Reviews workflow evidence packages; handoff is represented in the PoC rather than a complete institutional review system.
- **Prediction operator/reviewer:** Uses simulated model evaluation, approval and publishing controls; identity is not authenticated.
- **Developer:** Adds adapters, validation, tests, and integrations.

## Research and verification scope

Framework Studio can demonstrate publication verification and PADS-derived individual KPI policies. The committed PADS reference fixture covers **59 individual KPI configurations and 201 test cases**; it does not implement the complete institutional appraisal calculation, the five excluded institutional rows, or independent policy approval.

Prediction Studio uses **synthetic data only** and separates current verified progress from final-score labels to reduce leakage. It tests no-history, limited-history, sufficient-history and blocked-invalid scenarios. Any displayed estimate or accuracy metric is a prototype demonstration, not an inference about real faculty members.

The PoC runs on a Next.js application. Framework drafts use browser storage. Prediction training uses a local Python/scikit-learn process and the model registry lives in server memory; restarts lose in-process artifacts.

## Non-goals and open questions

This version does not implement authentication, role-based enforcement, cross-tenant isolation, durable evidence persistence, full institution-approved PADS aggregation, real indexing verification, production ML operation or clinical/administrative decision authority. Multi-tenant architecture is an **open proposal** ([Issue #44](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/44)), organization onboarding and final UI/UX are tracked separately ([Issue #43](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/43)), and review-paper topic selection is tracked in [Issue #45](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/45).

See the [architecture](ARCHITECTURE.md), [security boundaries](SECURITY-AND-DATA.md), and [current roadmap](ROADMAP.md) for implementation detail and future work.
