import base64
import pickle

import numpy as np
import pandas as pd


def predict_with_artifact(payload):
    artifact = payload.get("artifact") or {}
    if artifact.get("format") != "python-pickle-base64-v1" or not isinstance(artifact.get("payload"), str):
        raise ValueError("A supported server-owned model artifact is required.")
    try:
        stored = pickle.loads(base64.b64decode(artifact["payload"], validate=True))
    except Exception as error:
        raise ValueError("The model artifact could not be loaded safely.") from error

    if stored.get("interfaceVersion") != "prediction-artifact-v1":
        raise ValueError("The model artifact interface is incompatible.")
    features = stored.get("features")
    values = payload.get("features")
    if not isinstance(features, list) or not features or not isinstance(values, dict):
        raise ValueError("Checkpoint-safe inference features are required.")

    frame = pd.DataFrame([{field: values.get(field) for field in features}], columns=features)
    raw_prediction = float(stored["pipeline"].predict(frame)[0])
    if not np.isfinite(raw_prediction):
        raise ValueError("The model produced a non-finite prediction.")
    minimum = float(stored["scoreMinimum"])
    maximum = float(stored["scoreMaximum"])
    prediction = float(np.clip(raw_prediction, minimum, maximum))
    return {
        "status": "succeeded",
        "provider": {
            "id": "local-scikit-learn",
            "interfaceVersion": "prediction-inference-v1",
        },
        "candidate": stored["candidate"],
        "predictedScore": round(prediction, 6),
        "clamped": raw_prediction != prediction,
    }
