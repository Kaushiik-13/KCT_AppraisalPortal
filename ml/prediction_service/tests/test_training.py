import os
import sys
import unittest

SERVICE_ROOT = os.path.dirname(os.path.dirname(__file__))
if SERVICE_ROOT not in sys.path:
    sys.path.insert(0, SERVICE_ROOT)

from training import train_and_compare  # noqa: E402


def example(employee, cycle, checkpoint, final_score):
    elapsed = checkpoint / 4
    role = "professor" if employee % 2 else "assistant_professor"
    return {
        "recordId": f"row-{cycle}-{employee}-{checkpoint}",
        "group": f"kct|employee-{employee}|{cycle}",
        "cycleId": cycle,
        "features": {
            "role_code": role,
            "checkpoint_index": checkpoint,
            "elapsed_fraction": elapsed,
            "current_overall_score": round(final_score * elapsed, 2),
        },
        "baseline": {
            "role_code": role,
            "checkpoint_index": checkpoint,
            "elapsed_fraction": elapsed,
            "current_overall_score": round(final_score * elapsed, 2),
        },
        "target": final_score,
    }


def payload(seed=42):
    train = []
    test = []
    for cycle in ["2023-24", "2024-25"]:
        for employee in range(1, 9):
            final_score = 80 + employee * 8 + (4 if cycle == "2024-25" else 0)
            for checkpoint in range(1, 5):
                example_row = example(employee, cycle, checkpoint, final_score)
                (train if cycle == "2023-24" else test).append(example_row)
    return {
        "operation": "train_compare",
        "matrix": {
            "schema": {
                "features": ["role_code", "checkpoint_index", "elapsed_fraction", "current_overall_score"],
                "target": "final_approved_score",
                "excluded": {"generation_pattern": "generator metadata"},
            },
            "split": {
                "strategy": "time-based-cycle-holdout",
                "trainCycleIds": ["2023-24"],
                "testCycleIds": ["2024-25"],
                "preprocessingFitScope": "train-only",
            },
            "train": train,
            "test": test,
        },
        "options": {
            "candidates": ["ridge", "random_forest", "gradient_boosting"],
            "seed": seed,
            "scoreMinimum": 0,
            "scoreMaximum": 200,
        },
    }


class TrainingProviderTests(unittest.TestCase):
    def test_models_and_baselines_return_held_out_metrics(self):
        result = train_and_compare(payload())
        self.assertEqual(result["status"], "succeeded")
        self.assertEqual([baseline["id"] for baseline in result["baselines"]], ["pace", "grouped_median"])
        self.assertEqual(len(result["candidates"]), 3)
        self.assertEqual(result["split"]["trainCycleIds"], ["2023-24"])
        self.assertEqual(result["split"]["testCycleIds"], ["2024-25"])
        self.assertEqual(result["featureSchema"]["preprocessingFitScope"], "train-only")
        for candidate in result["candidates"]:
            self.assertEqual(candidate["status"], "succeeded")
            self.assertGreaterEqual(candidate["metrics"]["mae"], 0)
            self.assertTrue(candidate["metrics"]["rangeEvidence"]["allWithinConfiguredRange"])

    def test_same_data_and_seed_reproduce_metrics(self):
        first = train_and_compare(payload(77))
        second = train_and_compare(payload(77))
        first_metrics = {entry["id"]: entry["metrics"] for entry in first["candidates"]}
        second_metrics = {entry["id"]: entry["metrics"] for entry in second["candidates"]}
        self.assertEqual(first_metrics, second_metrics)
        self.assertEqual(first["recommendation"], second["recommendation"])

    def test_unknown_candidate_fails_before_training(self):
        invalid = payload()
        invalid["options"]["candidates"] = ["custom_math"]
        with self.assertRaisesRegex(ValueError, "unsupported candidate"):
            train_and_compare(invalid)

    def test_baselines_do_not_depend_on_candidate_feature_selection(self):
        request = payload()
        request["matrix"]["schema"]["features"] = ["checkpoint_index"]
        result = train_and_compare(request)
        self.assertEqual(result["baselines"][0]["metrics"]["mae"], 0)
        self.assertGreater(result["baselines"][1]["metrics"]["mae"], 0)


if __name__ == "__main__":
    unittest.main()
