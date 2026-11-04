# Synthetic prediction dataset audit

Audit ID: `AFPI-PRED-DATA-2026-10-29`

Audit date: 29 October 2026

Branch: `codex/prediction-prototype`

Base commit: `1e9d4db`

Status: **accepted for prototype development with documented limitations**

This is a technical fixture audit. It is not institutional approval of the PADS mapping, a fairness assessment or evidence of real prediction accuracy.

## Scope

The audit covers:

- KCT synthetic organization and PADS reference-policy configuration.
- Seeded synthetic-data generator.
- No-history, limited-history, sufficient-history and invalid-data fixtures.
- Active employee snapshot JSON.
- Generation metadata and file checksums.
- Automated generator tests and existing application regression tests.
- Production build compatibility.
- Review-workbook layout and sample values.
- Basic scan for names and email markers.

The audit does not cover model training, prediction accuracy, readiness UI, inference APIs or employee dashboards because those features are not implemented.

## Audited configuration

| Setting | Audited value |
|---|---|
| Organization | Kumaraguru College of Technology synthetic prototype |
| Policy version | `pads-2021-reference-v1` |
| Policy status | Reference policy pending confirmation of the current KCT policy |
| Generator version | `kct-synthetic-v1` |
| Seed | `20261029` |
| Roles | 4 |
| KRAs | 7 |
| Overall score cap | 200 |
| Checkpoints | 4 per completed cycle |
| Real employee data | None |

## Dataset inventory

| Dataset | Rows | Employees | Completed faculty-cycles | Audit purpose |
|---|---:|---:|---:|---|
| No-history current | 40 | 40 | 0 | Scenario A and active prediction inputs |
| Limited history | 240 | 30 | 60 | Sparse-history training/readiness behavior |
| Sufficient history | 960 | 60 | 240 | Time-based candidate training and testing |
| Invalid history | 12 | 3 | Controlled defects | Readiness rejection and warning cases |

The invalid fixture includes ten named defect types: missing target, missing current score, duplicate canonical key, score above the overall cap, checkpoint outside the cycle, unknown role, incompatible policy, target before cycle closure, decreasing cumulative progress and false synthetic flag.

## Verification performed

| Check | Result | Evidence |
|---|---|---|
| Generator completed | Passed | Six planned fixture/report files created |
| Seed determinism | Passed | Repeated in-memory generation produced identical datasets |
| Different-seed variation | Passed | Alternate seed preserved scenario contracts while changing current and sufficient fixture content |
| Planned scenario sizes | Passed | 40 current, 240 limited and 960 sufficient rows |
| Role/KRA cap completeness | Passed | Every configured role has a non-negative cap for all seven KRAs |
| Overall score range | Passed | Clean current and final scores remain within `0–200` |
| KRA score range | Passed | Clean KRA scores remain within applicable role caps |
| Cumulative progress | Passed | Clean checkpoint scores do not decrease |
| Active target exclusion | Passed | Active rows have no final target or target-available date |
| Canonical-key uniqueness | Passed | Clean scenario keys are unique |
| Invalid-case coverage | Passed | All ten planned defect types are present |
| Automated test suite | Passed | 109 tests passed, 0 failed |
| Production build | Passed | Next.js 16.3.8 production build completed |
| File integrity | Passed | Generated SHA-256 values match the generation report |
| Visual workbook review | Passed | Overview and all four dataset sheets inspected |
| Identity marker scan | Passed | No email or employee-name markers found in generated CSV/JSON files |
| Markdown links/whitespace | Passed | Changed documentation links resolve and whitespace check passed |

## File checksums

| File | SHA-256 |
|---|---|
| `no-history-current.csv` | `7077fa2be6d84d993ad46e7e1aca92fa9b99f3bc13e3bfd40e786aecceff7479` |
| `limited-history.csv` | `e47a90a29c65356280c2927305903071a1abcb8f052ca26c505b265d8645e7cb` |
| `sufficient-history.csv` | `4ec7f12f34f09988448f270d3fbc18ecf3762d07c247aa41a6d4951c41aa7bbd` |
| `invalid-history.csv` | `5c7c1b1978fb0727c0cdb1372bfe3b684d006fb3b3e55c70f1a0635f4085e0f6` |
| `active-employee-snapshots.json` | `ccba42121062542470929e5ebe7e84065c46171ea4320aa59a33c3ff0e16ae2c` |

Regenerating with a different configuration, seed or generator version is expected to change these checksums and requires a new generation report.

## Findings and limitations

### No blocking software defects found

The audited fixture foundation is suitable for implementing readiness validation, time-based splitting and demonstration model training.

### Current policy confirmation remains required

The fixture uses the supplied PADS reference structure. KCT must confirm that the roles, KRAs, caps, mandatory criteria and detailed KPI rules are current before the policy is treated as authoritative.

### Detailed KPI scoring is not implemented

The first fixture simulates KRA-level progress under role-specific caps and the 200-point overall cap. It does not execute every detailed KPI scoring band from the workbook.

### Synthetic metrics are not real accuracy evidence

Models trained on these fixtures may demonstrate the training/testing workflow. Their errors, confidence labels and feature importance must not be reported as real KCT performance.

### Mandatory criteria have no invented score penalty

Mandatory criteria are represented as status and route fields. The generator does not reduce or zero a score without a confirmed institutional rule.

## Audit decision

Approved uses:

- Build and test dataset-readiness rules.
- Build time-based training and test splits.
- Demonstrate established model training and comparison.
- Test prediction screens with synthetic employees.
- Demonstrate invalid-data blocking and fallback behavior.

Prohibited claims or uses:

- Real KCT prediction accuracy.
- Production employee appraisal decisions.
- Institutional fairness or compliance conclusions.
- Importing real employee data into fixture paths.
- Treating the reference PADS version as current without confirmation.

## Repository status after integration review

The dataset foundation was committed as `c97b835` and pushed to `origin/codex/prediction-prototype`. The follow-up integration review found no blocking fixture-contract defect, added an automated different-seed variation check, and confirmed that the KRA-level PADS mapping is acceptable only for this synthetic prototype. Detailed KPI scoring-band conversion and confirmation of the current institution-approved KCT policy remain required before real-data or production use.
