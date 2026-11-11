# Shared database schema and ER diagram

## Status

**Not designed or approved.** No production database, schema, persistence model, or tenant-isolation mechanism has been verified. The earlier PoC data model is historical reference only and must not be carried forward as a production contract.

## Conceptual data areas to consider

The confirmed first-release workflows imply that future design work will need to consider these information areas. These are not approved entity names, tables, relationships, or a complete data inventory.

- Institution setup, members, roles, and supervisor-to-faculty assignments.
- Appraisal cycles, KPI/KRA definitions, evidence requirements, and approved scoring configuration.
- Faculty KPI submissions, evidence-file references, reviewer decisions, feedback, and per-KPI mark-release history.
- Prediction and recommendation datasets, sandbox experiments, training/evaluation jobs, model versions, and approved outputs.
- Dashboard metric definitions, source provenance, and role-scoped analytics views.
- Security-relevant audit events, retention requirements, and operational records.

## Design questions

- Which module owns each record and is authoritative for updates?
- Which records contain sensitive faculty or evidence data, and what are their access/retention requirements?
- How are released marks and later corrections represented and audited?
- How are model datasets, jobs, artifacts, and outputs versioned and protected?
- What database and object-storage choices fit the approved availability, backup, cost, and privacy requirements?
- How can institution ownership be explicit in the first release while allowing future multi-organization isolation to be designed and tested?

Do not add an ER diagram or physical schema until the ownership, policy, and persistence decisions are reviewed. Any future design must distinguish the one-institution first-release target from later multi-tenant capability.
