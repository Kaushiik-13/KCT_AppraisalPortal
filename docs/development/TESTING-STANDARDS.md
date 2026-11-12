# Testing standards

## Current commands and coverage

- `npm run build` builds both the Next.js web workspace and the NestJS API workspace.
- The new `apps/web` and `apps/api` packages do not currently define test scripts. The root package also has no `npm test` command.
- `npm run test:poc:ml` runs Python unit tests for the archived synthetic model-training PoC under `legacy/poc/services/model-training/`. It does not test the new application or the reserved `services/model-training/` workspace.
- No GitHub Actions workflows are currently defined under `.github/workflows/`; this document describes policy and does not mean the checks are automatically enforced in CI.

## Change-aware verification policy

- Every PR: verify branch/module documentation ownership and PR metadata.
- Application code changes: run the production build with `npm run build` and run relevant tests provided by the affected workspace. Until a workspace test script exists, do not report an application test command as run or passing. Add/enable the appropriate test command and CI coverage as part of the issue that introduces the application behavior.
- Changes to the legacy synthetic model-training PoC: run `npm run test:poc:ml` when relevant and clearly label results as historical PoC coverage.
- New model-training service changes: define Python environment, test command, and CI coverage in the implementation issue before treating them as enforced.
- Documentation-only changes: validate applicable Markdown links and structure; no unneeded application build.
- Cross-module changes: verify approved contracts and run affected integration tests.
- Before merge: verify the final integrated state, not only each stacked PR in isolation.
- If a check does not apply, provide an explicit successful not-applicable outcome rather than a permanently pending required status.

## Evidence

PRs must list exact commands run, their actual results, skipped checks and reasons, known limitations, and remaining integration risks. Do not claim a test or build passed unless it was run successfully.

## Enforcement status

This file defines the agreed policy. CI workflows, test scripts for the new application, status-check names, and repository rulesets require separate implementation and configuration before the policy is technically enforced. Do not treat the legacy PoC test command as a substitute for those checks.

Historical test evidence is preserved in [legacy TESTING.md](../reference/legacy/TESTING.md). Old results do not verify the new application.
