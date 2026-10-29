# Local prediction training provider

This isolated Python provider trains and evaluates established scikit-learn regressors for the synthetic review prototype. The Next.js server sends a checkpoint-safe train/test matrix over standard input and receives one JSON result over standard output.

It is a local prototype boundary, not a hosted production service. It does not read repository datasets, persist model binaries, accept real employee records, or expose an independent network port.

## Interface

```powershell
python ml/prediction_service/app.py < request.json
```

The request operation is `train_compare`. It contains the frozen matrix, selected registered candidates, seed and score range. The response contains transparent baseline metrics, candidate metrics, expected-range evidence and a recommendation only when a candidate beats both baselines on held-out MAE.

## Verify

```powershell
python -m unittest discover -s ml/prediction_service/tests -p "test_*.py"
```

Install the versions allowed by `requirements.txt` in an isolated environment when they are not already available.
