from time import perf_counter
import base64
import pickle

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from schemas import validate_request


CANDIDATE_PARAMETERS = {
    "ridge": {"alpha": 1.0},
    "random_forest": {"n_estimators": 200, "max_depth": 8, "min_samples_leaf": 3},
    "gradient_boosting": {"n_estimators": 150, "learning_rate": 0.05, "max_depth": 3},
}


def _serialize_artifact(pipeline, candidate, features, minimum, maximum):
    payload = {
        "interfaceVersion": "prediction-artifact-v1",
        "candidate": candidate,
        "features": features,
        "scoreMinimum": minimum,
        "scoreMaximum": maximum,
        "pipeline": pipeline,
    }
    return {
        "format": "python-pickle-base64-v1",
        "payload": base64.b64encode(pickle.dumps(payload, protocol=pickle.HIGHEST_PROTOCOL)).decode("ascii"),
    }


def _examples_frame(examples, features):
    return pd.DataFrame([{field: example.get("features", {}).get(field) for field in features} for example in examples], columns=features)


def _targets(examples):
    return np.asarray([float(example["target"]) for example in examples], dtype=float)


def _column_types(frame, features):
    categorical = []
    numeric = []
    for field in features:
        values = frame[field].dropna()
        if any(isinstance(value, (str, bool, np.bool_)) for value in values):
            categorical.append(field)
        else:
            numeric.append(field)
    return numeric, categorical


def _preprocessor(numeric, categorical, scale_numeric):
    transformers = []
    if numeric:
        numeric_steps = [("imputer", SimpleImputer(strategy="median", add_indicator=True, keep_empty_features=True))]
        if scale_numeric:
            numeric_steps.append(("scaler", StandardScaler()))
        transformers.append(("numeric", Pipeline(numeric_steps), numeric))
    if categorical:
        transformers.append(("categorical", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]), categorical))
    return ColumnTransformer(transformers, remainder="drop", sparse_threshold=0)


def _estimator(candidate, seed):
    parameters = CANDIDATE_PARAMETERS[candidate]
    if candidate == "ridge":
        return Ridge(**parameters)
    if candidate == "random_forest":
        return RandomForestRegressor(**parameters, random_state=seed, n_jobs=1)
    return GradientBoostingRegressor(**parameters, random_state=seed)


def _metrics(actual, raw_predictions, minimum, maximum):
    raw = np.asarray(raw_predictions, dtype=float)
    predicted = np.clip(raw, minimum, maximum)
    residuals = actual - predicted
    absolute = np.abs(residuals)
    mae = float(np.mean(absolute))
    rmse = float(np.sqrt(np.mean(np.square(residuals))))
    target_variance = float(np.var(actual))
    r_squared = None if len(actual) < 2 or target_variance == 0 else float(1 - np.sum(np.square(residuals)) / np.sum(np.square(actual - np.mean(actual))))
    radius = float(np.quantile(absolute, 0.9)) if len(absolute) else 0.0
    lower = np.clip(predicted - radius, minimum, maximum)
    upper = np.clip(predicted + radius, minimum, maximum)
    coverage = float(np.mean((actual >= lower) & (actual <= upper))) if len(actual) else None
    return {
        "mae": round(mae, 6),
        "rmse": round(rmse, 6),
        "normalizedMae": round(mae / (maximum - minimum), 6),
        "rSquared": None if r_squared is None else round(r_squared, 6),
        "expectedRange": {
            "method": "held-out absolute residual 90th percentile",
            "radius": round(radius, 6),
            "empiricalCoverage": None if coverage is None else round(coverage, 6),
            "averageWidth": round(float(np.mean(upper - lower)), 6),
        },
        "rangeEvidence": {
            "minimumPrediction": round(float(np.min(predicted)), 6),
            "maximumPrediction": round(float(np.max(predicted)), 6),
            "clampedPredictions": int(np.sum(raw != predicted)),
            "allWithinConfiguredRange": bool(np.all((predicted >= minimum) & (predicted <= maximum))),
        },
    }


def _pace_predictions(examples, minimum, maximum):
    predictions = []
    for example in examples:
        features = example.get("baseline", example["features"])
        current = float(features.get("current_overall_score") or 0)
        elapsed = float(features.get("elapsed_fraction") or 0)
        predictions.append(np.clip(current / elapsed if elapsed > 0 else current, minimum, maximum))
    return np.asarray(predictions)


def _grouped_predictions(train, test):
    groups = {}
    targets = []
    for example in train:
        target = float(example["target"])
        targets.append(target)
        features = example.get("baseline", example["features"])
        key = (features.get("role_code"), features.get("checkpoint_index"))
        groups.setdefault(key, []).append(target)
    medians = {key: float(np.median(values)) for key, values in groups.items()}
    fallback = float(np.median(targets))
    return np.asarray([
        medians.get((example.get("baseline", example["features"]).get("role_code"), example.get("baseline", example["features"]).get("checkpoint_index")), fallback)
        for example in test
    ])


def train_and_compare(payload):
    matrix, options = validate_request(payload)
    features = matrix["schema"]["features"]
    train = matrix["train"]
    test = matrix["test"]
    seed = options["seed"]
    minimum = float(options["scoreMinimum"])
    maximum = float(options["scoreMaximum"])
    train_frame = _examples_frame(train, features)
    test_frame = _examples_frame(test, features)
    train_target = _targets(train)
    test_target = _targets(test)
    numeric, categorical = _column_types(train_frame, features)

    baselines = [
        {
            "id": "pace",
            "label": "Pace projection",
            "status": "succeeded",
            "parameters": {"formula": "current_overall_score / elapsed_fraction", "clamp": [minimum, maximum]},
            "metrics": _metrics(test_target, _pace_predictions(test, minimum, maximum), minimum, maximum),
        },
        {
            "id": "grouped_median",
            "label": "Role + checkpoint median",
            "status": "succeeded",
            "parameters": {"groupBy": ["role_code", "checkpoint_index"], "fallback": "global training median"},
            "metrics": _metrics(test_target, _grouped_predictions(train, test), minimum, maximum),
        },
    ]

    candidates = []
    for candidate in options["candidates"]:
        started = perf_counter()
        parameters = {**CANDIDATE_PARAMETERS[candidate], "seed": seed}
        try:
            pipeline = Pipeline([
                ("preprocessing", _preprocessor(numeric, categorical, candidate == "ridge")),
                ("regressor", _estimator(candidate, seed)),
            ])
            pipeline.fit(train_frame, train_target)
            predictions = pipeline.predict(test_frame)
            candidates.append({
                "id": candidate,
                "label": candidate.replace("_", " ").title(),
                "status": "succeeded",
                "parameters": parameters,
                "metrics": _metrics(test_target, predictions, minimum, maximum),
                "artifact": _serialize_artifact(pipeline, candidate, features, minimum, maximum),
                "durationMilliseconds": round((perf_counter() - started) * 1000, 3),
                "warnings": [],
            })
        except Exception as error:  # candidate failures are returned safely without raw data
            candidates.append({
                "id": candidate,
                "label": candidate.replace("_", " ").title(),
                "status": "failed",
                "parameters": parameters,
                "metrics": None,
                "durationMilliseconds": round((perf_counter() - started) * 1000, 3),
                "warnings": [f"Candidate failed: {type(error).__name__}."],
            })

    baseline_mae = {entry["id"]: entry["metrics"]["mae"] for entry in baselines}
    eligible = [
        candidate for candidate in candidates
        if candidate["status"] == "succeeded"
        and candidate["metrics"]["mae"] < baseline_mae["pace"]
        and candidate["metrics"]["mae"] < baseline_mae["grouped_median"]
        and candidate["metrics"]["rangeEvidence"]["allWithinConfiguredRange"]
    ]
    recommended = min(eligible, key=lambda candidate: candidate["metrics"]["mae"], default=None)

    return {
        "status": "succeeded",
        "synthetic": True,
        "provider": {
            "id": "local-scikit-learn",
            "interfaceVersion": "prediction-training-v1",
            "library": "scikit-learn",
            "seed": seed,
        },
        "target": matrix["schema"]["target"],
        "featureSchema": {
            "selected": features,
            "numeric": numeric,
            "categorical": categorical,
            "excluded": matrix["schema"].get("excluded", {}),
            "preprocessingFitScope": "train-only",
        },
        "split": {
            **matrix["split"],
            "trainRows": len(train),
            "testRows": len(test),
            "trainGroups": len({example["group"] for example in train}),
            "testGroups": len({example["group"] for example in test}),
        },
        "baselines": baselines,
        "candidates": candidates,
        "recommendation": {
            "candidateId": recommended["id"] if recommended else None,
            "gatePassed": recommended is not None,
            "reason": (
                "Lowest held-out MAE among candidates that beat both transparent baselines."
                if recommended
                else "No candidate beat both transparent baselines on held-out MAE."
            ),
            "baselineMae": baseline_mae,
        },
        "warnings": ["Synthetic demonstration evidence only—not real KCT accuracy."],
    }
