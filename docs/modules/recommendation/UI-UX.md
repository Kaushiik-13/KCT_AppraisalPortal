# Recommendation — UI/UX

## Status

**Proposed design** for institution administrator configuration and evaluation. No production recommendation workspace is verified as implemented.

## User and purpose

Organization administrators need a workspace to build and evaluate recommendation capabilities in a sandbox and understand their readiness and limitations. Faculty members may receive recommendations only when the institution has approved their use and visibility.

## Proposed journey

1. Administrator opens the institution's recommendation workspace.
2. Selects permitted data and builds/configures a recommendation model or rule set.
3. Tests it in a sandbox and inspects sample outputs without presenting them as live recommendations.
4. Reviews evaluation, intended audience, provenance, limitations, and any required approval.
5. Makes an approved capability available to authorized workflows, if the eventual policy allows it.
6. If faculty-facing recommendations are enabled, faculty can understand why an item is shown and what action is optional or expected.

## Required states

- Draft configuration, validation issue, sandbox run, no results, failure, or stale evaluation.
- Awaiting approval or unavailable where an approval process is adopted.
- Recommendation with explanation, provenance, version, uncertainty/limitations, and permitted follow-up.
- No recommendation available, access denied, or policy not enabled.

These are design considerations, not a final product workflow.

## Known limitations and open decisions

- Recommendation goals, policy/model approach, evaluation, fairness, approval, publication, and monitoring are undecided.
- Whether recommendations are shown to faculty, supervisors, administrators, or more than one audience requires institutional agreement.
- No final screen design, accessibility review, or usability evidence exists yet.
