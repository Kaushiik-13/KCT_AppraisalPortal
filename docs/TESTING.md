# Testing and acceptance

## Run the checks

Prerequisites and Python environment setup: [SETUP.md](SETUP.md).

```bash
npm ci
npm test
npm run test:prediction-ml
npm run build
```

The Node test command covers root `src/*.test.js`, `src/prediction/*.test.js`, and `server/*.test.js`. The Python command runs unittest discovery under `ml/prediction_service/tests`. There is **no** committed full end-to-end browser automation suite or `npm run lint` script.

## Last documented baseline

The last recorded combined verification on **30 October 2026** reported **226 passing JavaScript tests**, **5 passing Python tests** and a successful Next.js build. This is a *historical result*, not a test run performed by this documentation rewrite. The full earlier logs and evolving counts are retained in [the historical testing record](archive/TESTING-HISTORY.md).

## Manual acceptance checklist

### Framework Studio

- [ ] Create/edit inputs with required, type and min/max validation.
- [ ] Create, save and select a scoring policy; map workflow outputs.
- [ ] Build and execute an Action/Condition/Result or Human review path.
- [ ] Exercise Publication Clear, Needs review and Ineligible paths.
- [ ] Verify evidence parsing and uncertainty for missing/unreadable files.
- [ ] Reload a draft; check concurrent-tab protection, import/export and reset.
- [ ] Exercise keyboard focus, responsive/narrow layout and accessibility states.

### PADS reference cases

- [ ] Run the committed 59 individual KPI fixtures and all 201 expected cases.
- [ ] Check boundaries, missing evidence and the TL-1 reference walkthrough.
- [ ] Do **not** claim full PADS scoring, five institutional rows, policy approval or all appraisal eligibility rules.

### Prediction Studio

- [ ] Generate and regenerate seeded synthetic scenarios; verify reproducible data exports.
- [ ] Test A (no history), B (limited), C (sufficient) and invalid-data blocking.
- [ ] Confirm time-held-out validation and no checkpoint/target-label leakage.
- [ ] Train and compare baseline, Ridge, Random Forest and Gradient Boosting candidates with local Python dependencies.
- [ ] Check approval/rejection, publication compatibility, supersession, and Scenario B fallback / Scenario C model requirement.
- [ ] Refresh the simulated employee result without changing an official score or retraining the active model.
- [ ] Check retraining label gates, closed-cycle eligibility and reset behavior after server restart.

## Known verification gaps

Browser-responsive and multi-tab checks need fresh independent re-verification. Model training and artifacts are **local/in-memory**; a successful Vercel build or preview does not confirm Python training and persistence there. Dataset outputs are synthetic and do not measure actual KCT predictive accuracy. Security isolation, authentication, durable records and multi-tenant enforcement remain untested because they are not implemented.

## Recording new results

In PR descriptions, record the commit SHA, environment, exact commands, pass/fail results, manual browser steps, and any skipped checks. Keep a dated report in [Change history](CHANGE-HISTORY.md) or an attached verification artifact. Do not rewrite historical counts as current results.
