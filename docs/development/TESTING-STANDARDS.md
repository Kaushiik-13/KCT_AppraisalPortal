# Testing standards

## Change-aware CI policy
- Every PR: verify branch/module documentation ownership and PR metadata.
- Application code changes: run relevant JavaScript tests (`npm test`) and production build (`npm run build`).
- Prediction ML changes: run relevant Python tests (`npm run test:prediction-ml`).
- Documentation-only changes: validate applicable Markdown links and structure; no unneeded application build.
- Cross-module changes: verify contracts and run affected integration tests.
- Before merge: verify the **final integrated state**, not only each stacked PR in isolation.
- If a check does not apply, provide an explicit successful not-applicable outcome rather than a permanently pending required status.

## Evidence
PRs must list exact commands run, their actual results, skipped checks and reasons, known limitations and any remaining integration risks. No claim of testing without execution evidence.

## Enforcement status
This file defines the agreed policy. GitHub Actions/workflow jobs, status-check names and repository rulesets require separate implementation and configuration before the policy is technically enforced.

Historical test evidence is preserved in [legacy TESTING.md](../reference/legacy/TESTING.md). Do not assume old results verify new changes.
