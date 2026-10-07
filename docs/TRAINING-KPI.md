# Training participation walkthrough

This example demonstrates a KPI without publication tools. It uses a simple rehearsal rule: eight or more hours earns 12 points; fewer hours earns zero; missing hours needs review. These are example rules, not institutional policy.

Use an empty draft or a separate browser profile. Do not clear a draft you want to retain; exports currently have no import UI.

## Build inputs and checks

1. Set the KPI name to **Training participation**.
2. Add **Training hours**, type Decimal number. Leave it optional so the missing-value review path can be tested.
3. Open Workflow. Click + and add a **Condition**. The submission trigger appears automatically.
4. Name the Condition **Check training hours**. Select Number, Form: Training hours, At least, and `8`.
5. On Met, add a Result named **Eligible**, with Outcome name `Eligible`. Its optional value source can remain blank.
6. On Not met, add a Result named **Rejected**, with Outcome name `Rejected`.
7. On Needs review, add Human review named **Coordinator review**. Set role to Training coordinator and instructions to inspect attendance evidence.
8. In its Connect to existing steps section, send Approved to Eligible and Rejected to Rejected.
9. On Clarification, add a Result named **Pending clarification**, with the same Outcome name.

Alternatively insert Action → Use form value before the Condition, select Training hours, and map the Condition to its Form value output. This explicit mapping step is useful for learning output chaining but is not required when a Condition can use the form field directly.

## Build the scoring policy

Open Scoring policy and enable **Apply this policy to workflow Results**.

| Order | Condition | Points | Multiplier | Scoring outcome |
|---|---|---|---|---|
| 1 | Final workflow outcome equals `Eligible` | 12 | 1 | Eligible |
| 2 | Final workflow outcome equals `Rejected` | 0 | 1 | Rejected |

Leave no-match behavior at Pending review. Use version `v1`, then Save policy version. The saved version should be selected. Optional maximum points applies to each submission, not the sum of a cycle.

## Test

| Submission/action | Expected |
|---|---|
| Hours `8` | Eligible, 12 points |
| Hours `7` | Rejected, 0 points |
| Hours `0` | Rejected, 0 points; zero is not missing |
| Blank hours | Pauses for coordinator |
| Coordinator approves | Continues to Eligible and evaluates policy |
| Coordinator requests clarification with a reason | Pending clarification; score pending |
| Change input while review is open | Old review disabled; rerun required |

The reviewer in this generic flow acts before standalone Result scoring. The form does not yet approve a computed numeric recommendation; see [scoring](SCORING.md).

To test versioning, copy/edit a rule, use version `v2`, and save it. Changing only the draft should not change scores under selected v1. Reload restores fields, graph, and versions, but not entered hours or earlier reviews.

## Optional certificate verification

Add Action → Extract evidence, map a PDF/PPTX/XLS/XLSX input, and choose Fields or Both. Add output Hours (number), printed label Hours, to read a line such as `Hours: 8`. Use the output in Compare evidence or in a saved scoring rule. Add Apply scoring policy and select the saved version to calculate before a Result. Extraction outputs are unverified candidates; missing labels remain unknown. Use Human review where evidence requires confirmation.
