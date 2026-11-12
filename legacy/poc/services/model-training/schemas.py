ALLOWED_CANDIDATES = {"ridge", "random_forest", "gradient_boosting"}


def validate_request(payload):
    errors = []
    if payload.get("operation") != "train_compare":
        errors.append("Unsupported provider operation.")

    matrix = payload.get("matrix") or {}
    schema = matrix.get("schema") or {}
    split = matrix.get("split") or {}
    train = matrix.get("train")
    test = matrix.get("test")
    options = payload.get("options") or {}

    features = schema.get("features")
    if not isinstance(features, list) or not features:
        errors.append("The feature schema must contain at least one selected feature.")
    if schema.get("target") != "final_approved_score":
        errors.append("The provider target must remain final_approved_score.")
    if not isinstance(train, list) or not train:
        errors.append("Training examples are required.")
    if not isinstance(test, list) or not test:
        errors.append("Held-out test examples are required.")
    if split.get("preprocessingFitScope") != "train-only":
        errors.append("Preprocessing must be fitted on training data only.")

    candidates = options.get("candidates")
    if not isinstance(candidates, list) or not candidates:
        errors.append("At least one candidate is required.")
    elif any(candidate not in ALLOWED_CANDIDATES for candidate in candidates):
        errors.append("The request contains an unsupported candidate.")

    seed = options.get("seed")
    if not isinstance(seed, int) or isinstance(seed, bool) or seed < 1 or seed > 2_147_483_647:
        errors.append("The seed must be a positive 32-bit integer.")

    minimum = options.get("scoreMinimum")
    maximum = options.get("scoreMaximum")
    if not isinstance(minimum, (int, float)) or not isinstance(maximum, (int, float)) or maximum <= minimum:
        errors.append("A valid score range is required.")

    if errors:
        raise ValueError(" ".join(errors))

    return matrix, options
