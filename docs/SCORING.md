# Scoring and approval

Generic scoring supports two reusable policy styles, plus the legacy publication policy.

| Path | Configuration | Executes | Review behavior |
|---|---|---|---|
| Original publication policy | Calculate marks or Existing publication policies | Before original Appraiser review | Reviewer approves/rejects/overrides recommendation |
| Formula policy | Named numeric components, weights, aggregation, cap | Explicit Apply scoring policy Action | Produces a traceable combined score before Result or optional review handoff |
| Conditional rule policy | Ordered conditions, fixed points and multipliers | At Result or explicit Apply scoring policy Action | Missing facts remain pending |

Formula policies are intentionally source-independent when drafted: organizations define the score components first, then manually connect workflow outputs after saving the version. They are not automatically applied at Result because their component mappings belong to the workflow. Conditional policies can still be enabled for automatic Result scoring.

## Formula policy

Each component has a stable ID, organization-defined name, weight, and required/optional status. Components can represent any numeric measure: evidence relevance, impact, completion, quality, timeliness, compliance, or an AI schema score. The framework does not assume a particular KPI or number of evidence items.

- **Weighted sum:** add `value × weight` for every available component.
- **Simple average:** average available component values; weights are ignored.
- **Weighted average:** divide the weighted total by the total available weight.
- **Maximum points:** optionally cap the calculated result.

A missing required component makes scoring pending. A missing optional component is omitted. Apply scoring policy preserves every supplied value, weight, aggregation method, cap, policy version, and calculation trace.

## Conditional rule policy

Enable the policy, create ordered rules, save a unique version, and select it. Each rule has a name, all/any conditions, non-negative points and multiplier, and scoring outcome. A cap is optional and applies **per submission**, not across a cycle.

Conditions can use supported scalar form values, declared tool outputs, selected nested findings, legacy reviewer actions, or `result|outcome`. New terminal Human Review nodes do not produce an in-studio decision. The source type is recorded; removing or retyping the source blocks execution until corrected. Numeric/date operators are inclusive. Text equality is exact.

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

New generic Human review is a terminal handoff and does not modify scoring. The separate review module receives the available calculation, policy version, evidence and AI recommendation. Durable persistence and a canonical production final-score/review record remain pending, along with institution-authorized rule resolution, assessment-cycle caps, policy activation dates, and permissions.

## Explicit scoring step

Action → Apply scoring policy selects a saved version independently of automatic Result scoring. Formula versions expose one numeric input per component for manual mapping. Conditional versions evaluate their configured submission/earlier-output conditions; rules depending on final outcomes or later steps fail preflight. The step emits calculation details, points and status. Marks remain provisional; it does not implicitly approve them.
