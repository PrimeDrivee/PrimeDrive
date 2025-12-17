#!/usr/bin/env python3
"""
Reads a ZAP JSON report and exits non-zero when alert counts exceed configured thresholds.
Thresholds are provided via ZAP_MAX_HIGH_ALERTS and ZAP_MAX_MEDIUM_ALERTS environment variables.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path


def load_report(report_path: Path) -> dict:
    if not report_path.exists():
        raise FileNotFoundError(f"Report not found: {report_path}")
    with report_path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def severity_from_risk(risk_desc: str) -> str:
    # riskdesc values look like "High (3)"; we only need the severity label
    return (risk_desc or "").split(" ")[0].strip() or "Unknown"


def collect_counts(report: dict) -> dict:
    counts = {"High": 0, "Medium": 0, "Low": 0, "Informational": 0, "Unknown": 0}
    for site in report.get("site", []):
        for alert in site.get("alerts", []):
            severity = severity_from_risk(alert.get("riskdesc", ""))
            if severity not in counts:
                counts["Unknown"] += 1
            else:
                counts[severity] += 1
    return counts


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: zap_evaluate.py <report.json>", file=sys.stderr)
        return 2

    report_path = Path(sys.argv[1])
    try:
        report = load_report(report_path)
    except FileNotFoundError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    counts = collect_counts(report)

    allowed_high = int(os.getenv("ZAP_MAX_HIGH_ALERTS", "0"))
    allowed_medium = int(os.getenv("ZAP_MAX_MEDIUM_ALERTS", "0"))

    print(
        "ZAP findings summary: High={High}, Medium={Medium}, Low={Low}, Info={Informational}, Unknown={Unknown}".format(
            **counts
        )
    )
    violations = []
    if counts["High"] > allowed_high:
        violations.append(
            f"High findings {counts['High']} exceed threshold {allowed_high}."
        )
    if counts["Medium"] > allowed_medium:
        violations.append(
            f"Medium findings {counts['Medium']} exceed threshold {allowed_medium}."
        )

    if violations:
        print("\n".join(violations), file=sys.stderr)
        return 1

    print("Alert counts are within configured thresholds.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
