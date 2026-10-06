# Scoring and approval

Two scoring paths coexist. They must not be presented as interchangeable.

| Path | Configuration | Executes | Review behavior |
|---|---|---|---|
| Original publication policy | Calculate marks or Existing publication policies | Before original Appraiser review | Reviewer approves/rejects/overrides recommendation |
| Standalone policy | Scoring policy draft + saved version | At a generic Result | Earlier generic reviews decide routing, not the final numeric score |

An enabled standalone policy requires Result endings and is rejected when the graph contains the legacy terminal review. Leave it off for the original publication template.

## Standalone policy

Enable the policy, create ordered rules, save a unique version, and select it. Each rule has a name, all/any conditions, non-negative points and multiplier, and scoring outcome. A cap is optional and applies **per submission**, not across a cycle.

Conditions can use supported scalar form values, declared tool outputs, selected nested findings, reviewer actions, or `result|outcome`. The source type is recorded; removing or retyping the source blocks execution until corrected. Numeric/date operators are inclusive. Text equality is exact.

The first matching rule wins. Its points are multiplied, capped if configured, and rounded to two decimal places. The workflow outcome remains separate from the scoring outcome.

### Missing evidence

Each condition is true, false, or unknown. For All, one false establishes no match; otherwise a missing value keeps it unknown. For Any, one true establishes a match; otherwise a missing value keeps it unknown. If a higher-priority rule remains unknown, evaluation stops pending rather than selecting a lower rule.

Only when all rules are confirmed not to match does the no-match fallback apply: pending or zero. Unknown is never automatically converted to zero by that fallback.

### Versions

Draft edits autosave but do not change the selected saved version. Saving under an existing name is rejected. Copy an older version into the draft and use a new name to revise it. Runs preserve a copy of the selected version, including through a review pause. This protection is within local app behavior; browser storage is user-editable.

## Publication policy

The default primary-author rules are both Scopus/WOS = 24, either = 12, multiplier 1. Confirmed outside-period decisions score zero. Unresolved verification, non-primary authors, missing index evidence, duplicate candidates, and unmatched rules remain pending.

The eligibility guards in `calculateScore` are publication-specific even though rule rows are editable. Changing a multiplier does not implement third-author or corresponding-author eligibility. SAE-only treatment is unresolved and not automatically awarded 12.

Original review permits a reasoned override, retaining original and final scores. The standalone saved-version mechanism is separate from the older editable publication policy/version label.

## Remaining work

Generic workflows need a way to calculate a provisional score before approval and then finalize the approved score without losing policy/evidence snapshots. Also pending: institution-authorized rule resolution, assessment-cycle caps, policy activation dates, approval permissions, and durable audit records.

## Explicit scoring step

Action → Apply scoring policy selects a saved version independently of automatic Result scoring. Its inputs are the version’s configured submission/earlier-output conditions. Rules depending on final outcomes or later steps fail preflight. The step emits calculation details, points and status. Marks remain provisional; it does not implicitly approve them.
