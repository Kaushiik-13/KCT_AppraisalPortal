# Roadmap — current priorities

This page is for **what to do next**, not an accumulation of dated feature and test reports. [The prior detailed roadmap](archive/ROADMAP-HISTORY.md) remains available as historical evidence. Consult [testing](TESTING.md) for reproduction steps and limitations.

## Implemented prototype baseline (October 2026)

- **Framework Studio:** Browser-local KPI authoring, typed inputs, conditional/formula scoring, workflow graph and reusable Actions/Conditions, evidence extraction/comparison, AI evaluation, review handoff, trace output, import/export and local draft management.
- **PADS verification:** 59 committed individual KPI policy fixtures and 201 expected scoring cases. This is **not** full PADS or institution-approved aggregation.
- **Prediction Studio:** Screens 1–10 for synthetic generation, readiness, time-based splits, local model training/comparison, simulated governance, advisory prediction and retraining-readiness settings.
- **Verification baseline:** Historical 30 October 2026 run reported 226 Node tests, 5 Python tests and a production build. Rerun locally or in CI before claiming a current green status.

## Open work

| Issue | Deliverable | Definition of done |
|---|---|---|
| [#42](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/42) | Documentation cleanup | Concise primary guides, accurate cross-links and historical detail retained |
| [#43](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/43) | UI/UX and organization onboarding | Consistent end-to-end PoC onboarding, responsive and accessible flows, tested without regressions |
| [#44](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/44) | Multi-tenant architecture **proposal** | Isolation and authorization design, data model, decisions and phased adoption plan |
| [#45](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/45) | Review-paper topic selection | Topic comparison, research questions, literature search and advisor feedback |
| [#20](https://github.com/Kaushiik-13/KCT_AppraisalPortal/issues/20) | Remaining institutional PADS rules | Five institutional rows and unresolved aggregation/eligibility policies, subject to approved reference |

## Requirements before a production claim

Authentication and authorization; secure organization isolation; durable database, evidence storage and model registry; institution-approved appraisal policy; reproducible real-data evaluation with permissions; audit controls; background training, monitoring and deployment; security and accessibility testing.

These are **planned requirements**, not delivered capabilities. The prediction Python provider and memory registry are not deployed as a durable Vercel service.

## Maintenance rules

- Use GitHub Issues and PRs as the live task/change tracker.
- Update this roadmap when a feature is delivered or scoped differently.
- Keep dated acceptance evidence in [Testing](TESTING.md), [Change history](CHANGE-HISTORY.md) or the historical archive, rather than re-adding daily sections here.
