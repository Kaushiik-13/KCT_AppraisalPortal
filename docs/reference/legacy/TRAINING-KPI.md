# Training participation walkthrough

This example demonstrates a KPI without publication tools. It uses a simple rehearsal rule: eight or more hours earns 12 points; fewer hours earns zero; missing hours needs review. These are example rules, not institutional policy.

Use an empty draft or a separate browser profile. Do not clear a draft you want to retain; exports currently have no import UI.

## Build inputs and scoring policy

1. Set the KPI name to **Training participation**.
2. Add **Training hours**, type Decimal number. Leave it optional so the missing-value review path can be tested.
3. Open Scoring policy, choose Conditional rules, and enable **Apply this policy to workflow Results**.

| Order | Condition | Points | Multiplier | Scoring outcome |
|---|---|---|---|---|
| 1 | Final workflow outcome equals `Eligible` | 12 | 1 | Eligible |
| 2 | Final workflow outcome equals `Rejected` | 0 | 1 | Rejected |

Leave no-match behavior at Pending review. Use version `v1`, then Save policy version. The saved version should be selected. Optional maximum points applies to each submission, not the sum of a cycle.

## Build the workflow

1. Open Workflow. Click + and add a **Condition**. The submission trigger appears automatically.
2. Name the Condition **Check training hours**. Select Number, Form: Training hours, At least, and `8`.
3. On Met, add a Result named **Eligible**, with Outcome name `Eligible`. Its optional value source can remain blank.
4. On Not met, add a Result named **Rejected**, with Outcome name `Rejected`.
5. On Needs review, either add a Result named **Pending evidence**, or add terminal Human Review named **Coordinator review** when the complete package must be sent to the separate module.

Alternatively insert Action → Use form value before the Condition, select Training hours, and map the Condition to its Form value output. This explicit mapping step is useful for learning output chaining but is not required when a Condition can use the form field directly.

## Test

| Submission/action | Expected |
|---|---|
| Hours `8` | Eligible, 12 points |
| Hours `7` | Rejected, 0 points |
| Hours `0` | Rejected, 0 points; zero is not missing |
| Blank hours with Pending evidence Result | Pending evidence; score pending |
| Blank hours with Human Review | Automation ends with a package sent to the separate module |

Human Review does not approve or modify the score inside Framework Studio. It is an optional terminal boundary; see [scoring](SCORING.md).

To test versioning, copy/edit a rule, use version `v2`, and save it. Changing only the draft should not change scores under selected v1. Reload restores fields, graph, and versions, but not entered hours or earlier reviews.

## Optional certificate verification

Add Action → Extract evidence, map a PDF/PPTX/XLS/XLSX input, and choose Fields or Both. Add output Hours (number), printed label Hours, to read a line such as `Hours: 8`. Use the output in Compare evidence or in a saved scoring rule. Add Apply scoring policy and select the saved version to calculate before a Result. Extraction outputs are unverified candidates; missing labels remain unknown. Use terminal Human Review only when the package should leave automation for separate handling.
