# Prediction data dictionary

Status: **synthetic fixture schema implemented; real-data contract not approved**

Implemented generator: `scripts/generate-kct-prediction-data.mjs`

Canonical schema: `src/prediction/syntheticGenerator.js`

KCT configuration: `fixtures/prediction/kct/config/`

Generated fixtures: `fixtures/prediction/kct/generated/`

The schema supports the first overall-score prediction prototype. Every committed fixture row is synthetic. The data must not be presented as a real KCT employee record or used to claim real institutional model accuracy.

## Dataset grain

One completed-history row represents:

```text
one organization + one synthetic employee + one appraisal cycle + one checkpoint
```

The completed cycle's `final_approved_score` is repeated as the supervised target on its retrospective checkpoint rows. It is excluded from model features. Active-cycle rows have no final target.

The canonical key is:

```text
organization_id + employee_key + cycle_id + checkpoint_index
```

## Identity, version and provenance fields

| Field | Type | Required | Model use | Meaning |
|---|---|---:|---|---|
| `record_id` | string | Yes | Excluded | Stable synthetic row identity |
| `organization_id` | string | Yes | Scope only | Organization configuration identity |
| `policy_version` | string | Yes | Compatibility only | PADS/scoring-policy version |
| `framework_version` | string | Yes | Compatibility only | Framework configuration version |
| `generator_version` | string | Yes | Excluded | Synthetic generator version |
| `generation_seed` | integer | Yes | Excluded | Reproducibility seed |
| `source_dataset` | string | Yes | Excluded | Scenario fixture identity |
| `is_synthetic` | boolean | Yes | Excluded | Must be `true` for clean fixtures |
| `fixture_case_id` | string | Invalid fixture only | Excluded | Controlled invalid-case identity |
| `injected_defect` | string | Invalid fixture only | Excluded | Expected data-quality defect |

## Employee and cycle fields

| Field | Type | Required | Model use | Meaning |
|---|---|---:|---|---|
| `employee_key` | string | Yes | Grouping only | Pseudonymous synthetic faculty key |
| `role_code` | category | Yes | Feature | Configured role and applicable KRA caps |
| `cycle_id` | string | Yes | Split/grouping only | Academic appraisal-cycle identity |
| `cycle_status` | `active` or `completed` | Yes | Readiness only | Whether a final target may exist |
| `cycle_start_date` | ISO date | Yes | Validation only | Cycle start boundary |
| `cycle_end_date` | ISO date | Yes | Validation only | Cycle close boundary |
| `checkpoint_index` | integer | Yes | Feature | Ordered checkpoint number |
| `checkpoint_date` | ISO date | Yes | Split/validation only | Date represented by the snapshot |
| `elapsed_fraction` | number `0–1` | Yes | Feature | Portion of the cycle completed |
| `remaining_days` | non-negative integer | Yes | Feature | Days from checkpoint to cycle end |

## Progress and evidence fields

| Field | Type | Required | Model use | Meaning |
|---|---|---:|---|---|
| `current_overall_score` | number | Yes for clean rows | Feature | Verified cumulative score, capped at 200 for this fixture |
| `previous_overall_score` | number or blank | No at first checkpoint | Feature | Previous checkpoint's cumulative score |
| `score_change` | number | Yes | Feature | Current score minus previous checkpoint score; first checkpoint uses current score |
| `verified_evidence_count` | integer | Yes | Feature | Synthetic count of evidence items verified by the checkpoint |
| `mandatory_status` | `pending`, `met`, `not_met` | Yes | Feature | Status of the configured mandatory criterion |
| `mandatory_route` | category | Yes | Feature candidate | Synthetic route: research publication or faculty development |
| `missing_feature_count` | integer | Yes | Readiness/confidence | Number of missing permitted feature values |

The mandatory status does not apply an invented automatic point penalty. A future current KCT policy mapping must define any official scoring effect.

## KRA score and cap fields

Each configured KRA contributes a checkpoint score and its role-specific cap:

| KRA | Score field | Cap field |
|---|---|---|
| Teaching & Learning | `kra_teaching_learning_score` | `kra_teaching_learning_cap` |
| Research & Development | `kra_research_development_score` | `kra_research_development_cap` |
| External Interface | `kra_external_interface_score` | `kra_external_interface_cap` |
| Operations | `kra_operations_score` | `kra_operations_cap` |
| Student Development | `kra_student_development_score` | `kra_student_development_cap` |
| Extra & Co-Curricular | `kra_extra_cocurricular_score` | `kra_extra_cocurricular_cap` |
| Optional Contributions | `kra_optional_contributions_score` | `kra_optional_contributions_cap` |

KRA scores are cumulative, non-negative and no greater than the applicable cap in clean fixtures. The sum is limited by the configured overall score cap.

## Target and generation metadata

| Field | Type | Required | Model use | Meaning |
|---|---|---:|---|---|
| `target_available_date` | ISO date or blank | Completed rows only | Excluded | Date the completed outcome is considered available |
| `final_approved_score` | number or blank | Completed rows only | Target only | Final cycle score, capped at 200 |
| `generation_pattern` | category | Synthetic rows only | Excluded | Generator-only progression pattern; unavailable in real inference |

`generation_pattern` must never be selected as a model feature because a real organization will not have that synthetic label.

## Implemented fixtures

| Fixture | Rows | Completed faculty-cycles | Purpose |
|---|---:|---:|---|
| `no-history-current.csv` | 40 | 0 | Active snapshots for Scenario A and sandbox inputs |
| `limited-history.csv` | 240 | 60 | Two completed cycles with four checkpoints per case |
| `sufficient-history.csv` | 960 | 240 | Four completed cycles with four checkpoints per case |
| `invalid-history.csv` | 12 | Controlled defects | Readiness and validation testing |
| `active-employee-snapshots.json` | 40 | 0 | JSON form of current sandbox/dashboard inputs |

The invalid fixture includes missing target/current score, duplicate canonical key, out-of-range score, checkpoint outside cycle, unknown role, incompatible policy, active target leakage, decreasing cumulative progress and a false synthetic flag.

## Split and leakage rules

- Train on earlier completed cycles and test on a later completed cycle.
- Keep every checkpoint for the same employee-cycle in one partition.
- Exclude active-cycle rows from supervised training.
- Exclude target, identifiers, generator metadata, fixture labels and compatibility-only fields from features.
- Fit preprocessing on the training partition only.
- Do not use future checkpoint values when creating an earlier checkpoint feature row.

For the sufficient fixture, the intended first split trains on `2022-23`, `2023-24` and `2024-25`, then tests on `2025-26`.

## Regeneration

```powershell
npm.cmd run generate:prediction-data
```

The same committed configuration and seed must produce identical clean fixture content and checksums. `generation-report.json` records counts, distributions, checksums and current limitations.

## Current limitation

The implemented fixture models KRA-level progress, PADS role-specific caps and the 200-point overall cap. It does not yet execute every detailed KPI scoring band from the workbook. The current institution-approved KCT policy must be confirmed and converted before any real-data or production use.
