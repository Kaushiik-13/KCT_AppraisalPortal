import json
import sys

from training import train_and_compare


def main():
    try:
        payload = json.load(sys.stdin)
        result = train_and_compare(payload)
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
