import json
import sys

from training import train_and_compare
from inference import predict_with_artifact


def main():
    try:
        payload = json.load(sys.stdin)
        operation = payload.get("operation")
        if operation == "train_compare":
            result = train_and_compare(payload)
        elif operation == "predict":
            result = predict_with_artifact(payload)
        else:
            raise ValueError("Unsupported provider operation.")
        json.dump(result, sys.stdout, separators=(",", ":"), allow_nan=False)
        sys.stdout.write("\n")
    except Exception as error:
        json.dump({
            "status": "failed",
            "error": str(error),
            "errorType": type(error).__name__,
        }, sys.stdout, separators=(",", ":"))
        sys.stdout.write("\n")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
