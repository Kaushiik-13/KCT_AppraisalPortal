# Generated KCT prediction fixtures

These files contain synthetic data only. They do not contain real KCT faculty records and cannot establish real prediction accuracy.

Run `npm.cmd run generate:prediction-data` from the repository root to regenerate the files with the committed configuration and seed.

| File | Purpose |
|---|---|
| `no-history-current.csv` | Forty active synthetic faculty snapshots without final targets |
| `limited-history.csv` | Sixty completed faculty-cycles across two cycles and four checkpoints |
| `sufficient-history.csv` | Two hundred forty completed faculty-cycles across four cycles and four checkpoints |
| `invalid-history.csv` | Named controlled defects for readiness testing |
| `active-employee-snapshots.json` | Sandbox/dashboard input records |
| `generation-report.json` | Configuration summary, counts, checksums and limitations |

Expected Scenario A/B/C, split and invalid-block outcomes are recorded separately in `../expected/readiness-cases.json`. The readiness implementation is documented in `docs/PREDICTION-READINESS.md`.

The first fixture operates at KRA level using PADS role-specific caps and a 200-point overall cap. Detailed KPI scoring bands remain pending confirmation and conversion of the current institution-approved policy.
