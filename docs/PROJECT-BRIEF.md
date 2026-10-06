# Project brief

## Purpose

AFPI Framework Studio lets KPI creators define what evidence to collect, how to verify it, and how to score the findings. The PoC tests the on-paper concept in an actual application before building the wider appraisal platform.

Different organizations and institutions should be able to compose KPIs from shared capabilities. Publication verification is the first worked example, not the definition of the whole application.

## Conceptual roles

| Role | Responsibility | Current implementation |
|---|---|---|
| KPI creator | Define inputs, workflow and rules | Local creator UI |
| Submitter/faculty | Supply achievement evidence | Preview and test form |
| Appraiser/reviewer | Inspect evidence and decide | Manual name entry and session review |
| Developer | Supply tools and integrations | Code-defined catalogue and handlers |

There are no accounts, permission checks, authenticated reviewer identities, or separate role-specific applications.

## Implemented requirements

| ID | Requirement | Implementation |
|---|---|---|
| FS-01 | Creator-defined field names and supported types | Inputs |
| FS-02 | Stable identities across rename and reorder | Field/node IDs |
| FS-03 | Tree canvas with drag/drop, branches and zoom | Workflow builder |
| FS-04 | Reusable blocks and selectable tools | Blocks library |
| FS-05 | Typed sources from form values or earlier outputs | Node settings |
| FS-06 | Executable branching and review continuation | Workflow engine |
| FS-07 | Conditions, points, multipliers, caps and versions | Scoring policy |
| FS-08 | Creator-written AI instructions and input mapping | AI assistance |
| FS-09 | Evidence, calculation and review trace | Test & review |
| FS-10 | Draft recovery and confirmed reset | Browser autosave |

The form supports twelve data types. “Dynamic” does not mean an unlimited type system. No product-level field-count limit is imposed, but browser storage, memory, and usability impose practical limits.

## Scope and success criteria

Desktop, one local KPI draft per browser origin, no database, browser execution with session review pauses. Publication and training workflows demonstrate domain-specific and general-purpose composition.

Success means a creator can build, inspect, test, and revise a KPI with understandable results. It does not establish readiness to award real institutional marks.

Outside the current scope: institution-wide identity and duplicates, real indexing integrations, durable evidence and reviews, tenant isolation, reviewer assignment, notifications, deployment, mobile layouts, scheduling, parallel execution, installable plugins, import UI, and assessment-cycle aggregation.
