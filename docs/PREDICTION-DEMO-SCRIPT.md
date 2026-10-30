# Prediction prototype review script

Use this short path for the Saturday review. Every value and person shown is synthetic.

## Main journey

1. Open **Prediction framework** and show the final overall score target.
2. Configure and generate the synthetic datasets.
3. Open **Sufficient history** and show the ready status plus time-based train/test split.
4. Configure Ridge, Random Forest and Gradient Boosting; train and compare them with both transparent baselines.
5. Evaluate the recommended candidate, enter the prototype reviewer/note, approve and publish it.
6. Run Scenario C in the sandbox and open the employee view.
7. Show current score, predicted final score/range, KRA progress, time remaining and the advisory warning.
8. Load newer verified progress. Point out that the prediction refreshes but the active model/run and official score do not change.
9. Open Retraining. Close the synthetic cycle, approve final outcomes, meet the thresholds and run the readiness check.
10. Explain that this only permits a future candidate training run; the current model remains active until evaluation, approval and publication.

## Required edge cases

- **Scenario A:** no history; transparent rule-based estimate and no model call.
- **Scenario B:** limited history; low confidence and safe model/fallback behavior.
- **Scenario C:** sufficient history; compatible published model required.
- **Invalid data:** prediction and training blocked with reasons.
- **Unapproved outcomes:** closed-cycle rows still cannot become labels.

## Statements to use

- “This predicts where the final score may end; it does not change the official score.”
- “New verified progress refreshes inference; it does not retrain the model.”
- “Only closed cycles with finally approved outcomes can become training labels.”
- “A candidate cannot replace the active model until evaluation, approval and publication.”
