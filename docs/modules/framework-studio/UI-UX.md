# Framework Studio — UI/UX

## Status

**Proposed design** for appraisal setup and operations. No production Framework Studio screens or workflow have been verified as implemented.

## Users and responsibilities

- **Organization administrator:** creates KPIs/KRAs and appraisal cycles, configures assignments, evidence requirements, and approved scoring rules.
- **Faculty member:** completes assigned KPI tasks, submits information/evidence, and tracks review status.
- **Supervisor/reviewer:** reviews assigned submissions, records decisions/marks according to approved policy, and releases each KPI mark to the faculty member.

## Proposed end-to-end experience

1. Administrator creates a draft appraisal cycle and configures KPI/KRA requirements.
2. Administrator validates the configuration and assigns the appropriate faculty and supervisors.
3. Faculty reviews each assigned KPI, enters the required information, attaches evidence, and submits it.
4. Faculty can track whether each item is submitted, under review, returned, or released.
5. Supervisor opens an assigned review queue, inspects evidence, records the decision and mark, and either returns the submission with feedback or releases the mark for that KPI.
6. Faculty sees the released mark and relevant feedback. Dashboards consume appraisal data according to each viewer's authorized scope.

This is a proposed flow, not a final state machine or implementation claim.

## Important interaction states

- Draft, validation issue, ready/assigned, submitted, under review, returned for correction, resubmitted, decision recorded, and mark released.
- Evidence upload pending, failed, unreadable, or requiring replacement.
- Review assignment changed, access removed, duplicate action detected, or policy unavailable.
- Clear distinction between a submitted value, evidence verification, supervisor decision, and released mark.
- Save/submit confirmation, unsaved changes, recovery after interruption, and helpful permission/error states.

The exact state names, transitions, and correction/appeal paths require institutional agreement.

## Analytics and access

The experience should support administrator views across the institution and supervisor views for assigned faculty. Faculty see their own authorized appraisal information. A mark must not be presented as released until the supervisor performs the release action.

## Known limitations and open decisions

- Official KPI/KRA definitions, rating scales, formulae, caps, eligibility and evidence rules are not confirmed here.
- Rules for delegation, co-review, overrides, amendments after release, and appeals are open.
- The release action's audit details and any notification behavior are not specified.
- Final wireframes, responsive behavior, accessibility review, and usability evidence remain to be produced.
