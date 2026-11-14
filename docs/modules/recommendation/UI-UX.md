# Recommendation — UI/UX

## Status

**Proposed design** for institution administrator configuration and evaluation. No production recommendation workspace is verified as implemented.

## User and purpose

Organization administrators need a workspace to build and evaluate recommendation capabilities in a sandbox and understand their readiness and limitations. Faculty members may receive recommendations only when the institution has approved their use and visibility.

## Proposed journey

1. Administrator opens the institution's recommendation workspace.
2. Selects data permitted for the stated recommendation purpose and configures a model or rule set.
3. Tests the configuration in a sandbox; label sample outputs as test results and prevent them from appearing as live faculty or supervisor recommendations.
4. Reviews evaluation status, intended audience, provenance, version, limitations, and any required approval.
5. Enables the approved capability for named workflows and audiences only if institutional policy allows it.
6. An authorized faculty member sees only recommendations intended for them, with a plain-language reason, source/model or rule version, date, limitations, and whether a follow-up action is optional or required.
7. A supervisor sees recommendations only when explicitly permitted for assigned faculty and relevant tasks; recommendations do not replace evidence review or determine/release a KPI mark.
8. An administrator reviews institution-level recommendation performance only within approved analytics access.

## Required states

- Draft configuration, validation issue, sandbox run, no results, failure, or stale evaluation.
- Awaiting approval or unavailable where an approval process is adopted.
- Recommendation with explanation, provenance, version, uncertainty/limitations, intended audience, and permitted follow-up.
- No recommendation available, policy not enabled, output expired/stale, audience mismatch, or access denied.

These are design considerations, not a final product workflow.

### Role-specific information

- **Administrator:** configure and evaluate recommendation capabilities in a controlled workspace; inspect readiness, intended audience, evaluation, provenance, version, limitations, and approved institution analytics.
- **Supervisor/reviewer:** access a recommendation only if policy explicitly allows it for assigned faculty and the review task. Keep it separate from evidence and the supervisor's human decision.
- **Faculty member:** receive only their own enabled recommendation. Explain why it appears, distinguish it from a prediction and an official appraisal mark, and state whether any suggested follow-up is optional or required.

Do not expose sandbox examples as live recommendations, expose one faculty member's recommendations to another, or imply a recommendation is mandatory unless approved policy says so. Do not let a recommendation silently modify a score or released result.

## Known limitations and open decisions

- Recommendation goals, policy/model approach, evaluation, fairness, approval, publication, and monitoring are undecided.
- Whether recommendations are shown to faculty, supervisors, administrators, or more than one audience requires institutional agreement.
- Recommendation explanation standards, freshness/expiry rules, and whether follow-up actions are optional or required need institutional approval.
- No final screen design, accessibility review, or usability evidence exists yet.
