# Prediction employee view and retraining

Status: **implemented for the local synthetic prototype**

## Purpose and boundary

Screens 9–10 complete the review journey after a compatible model is published. Screen 9 shows one simulated employee a read-only estimate from their latest verified checkpoint. Screen 10 lets an administrator demonstrate when a future candidate may be trained. Neither screen changes an official score, retrains during prediction, or automatically replaces the active model.

All records, people, outcomes and model evidence are synthetic. The page has no production authentication or employee-record authorization.

## Employee prediction view

The view is scoped to the synthetic employee selected in the sandbox. It displays:

- current verified score and appraisal progress;
- predicted final score, labelled range, method and confidence;
- time remaining and policy-labelled KRA progress;
- plain-language contributing factors;
- model, policy, framework and training-run versions;
- calculation time, synthetic/advisory warnings and confirmation that the official score is unchanged.

**Load newer verified progress** creates a later synthetic checkpoint for that same employee and calls the normal prediction endpoint again. It does not call the training endpoint. The published model and training-run identity stay unchanged while the current verified inputs, prediction and calculation time refresh.

The prototype starts from the sandbox selection because it has no real login identity. Production must obtain the employee identity and authorized current snapshot on the server; it must never allow an employee to select or query another employee.

## Retraining settings

The demonstration supports three eligibility triggers:

- **Manual:** an administrator explicitly starts a future review.
- **Cycle close:** eligibility is checked when an appraisal cycle closes.
- **Periodic:** eligibility is checked after the configured number of days.

A trigger is only a check. A future candidate becomes training-eligible only when all configured data thresholds also pass. The prototype settings include minimum newly approved completed cases and minimum newly completed cycles.

Current-cycle checkpoints never become training labels. A row is counted only after both cycle closure and final score approval. The screen exposes those two conditions separately so the unsafe intermediate state is visible.

The following safeguards are fixed in the prototype:

- the current published model remains active while a candidate is trained and evaluated;
- the new candidate must be evaluated before replacement;
- explicit approval is required before publication;
- a readiness check cannot train or publish a model.

The settings and simulated cycle state live only in the current browser session. They do not create a schedule, background job, durable audit event or new model.

## State and data flow

```text
Published compatible model + selected active checkpoint
  -> POST /api/prediction/predict
  -> advisory employee result
  -> newer verified checkpoint
  -> POST /api/prediction/predict again (same model, no refit)

Retraining trigger + completed-case thresholds
  -> label gate: cycle closed AND final outcomes approved
  -> readiness status only
  -> future training/configuration flow
  -> evaluation and explicit approval
  -> publication replaces active model
```

The browser owns the simulated employee context, latest result, retraining settings and demonstration counters. The inference route continues to own readiness revalidation, compatible-model selection and score/range construction. The retraining helper owns eligibility calculations but performs no network or training action.

## End-to-end review script

1. Open `/prediction` and configure the eight synthetic-data decisions.
2. Generate all scenarios and open sufficient history.
3. Review readiness, configure the fixed final-score target and train the established candidates.
4. Compare the held-out metrics, evaluate the recommended candidate, approve it and publish it.
5. In the sandbox, run Scenario C and open the employee view.
6. Record the current score, prediction, model version and training-run ID.
7. Choose **Load newer verified progress**. Confirm the current score and prediction refresh while the model version/run stay the same and the official score remains unchanged.
8. Open Retraining. Simulate cycle closure without approving final outcomes and confirm labels remain unavailable.
9. Approve the synthetic final outcomes, meet the case/cycle thresholds and run the readiness check. Confirm it reports candidate-training eligibility only.
10. Return to the sandbox and exercise Scenario A, Scenario B and invalid history. Confirm transparent fallback labels and invalid-data blocking.

## Prototype limitations

- No real authentication, tenant authorization or employee-level access control.
- No durable settings, scheduler, event listener, monitoring or drift calculation.
- No production label pipeline or final-outcome import.
- No automatic training, approval, publication or rollback.
- No fairness, calibration or real-organization performance claim.
- A page reload loses screen state; a server restart loses published prototype artifacts.
