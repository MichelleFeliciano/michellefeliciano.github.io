#!/usr/bin/env python3
"""Fail if any Lighthouse JSON report in a folder scores below the thresholds."""
import json
import sys
from pathlib import Path

THRESHOLDS = {
    "performance": 0.90,  # a little slack: shared CI runners are noisy
    "accessibility": 0.95,
    "best-practices": 0.95,
    "seo": 0.95,
}


def main(folder):
    reports = sorted(Path(folder).glob("*.json"))
    if not reports:
        print(f"FAIL no Lighthouse reports found in {folder}")
        return 1
    failed = False
    for report in reports:
        data = json.loads(report.read_text(encoding="utf-8"))
        scores = {k: round(v["score"] * 100) for k, v in data["categories"].items()}
        line = "  ".join(f"{k}={scores[k]}" for k in THRESHOLDS)
        print(f"{data['finalDisplayedUrl']}\n  {line}")
        for category, minimum in THRESHOLDS.items():
            if scores[category] < minimum * 100:
                print(f"FAIL {report.name}: {category} {scores[category]} is below {round(minimum * 100)}")
                failed = True
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "lighthouse-reports"))
