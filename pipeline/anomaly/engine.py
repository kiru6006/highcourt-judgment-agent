"""
Nyaya AI Reader — Anomaly Detection Coordinator
Executes A01, A02, A04, A05 anomaly inspection suite across judgment documents.
Persists human review state in version-controlled YAML (data/anomaly-review/review-state.yaml).
Generates static data/anomaly-summary.json for the read-only client Data Quality dashboard.
"""

import os
import json
import yaml
from datetime import datetime, timezone
from typing import Dict, Any, List, Set, Optional

from .a01_source import check_a01_source
from .a02_identity import check_a02_identity
from .a04_quality import check_a04_quality
from .a05_classification import check_a05_classification

DEFAULT_REVIEW_STATE_PATH = "data/anomaly-review/review-state.yaml"
DEFAULT_SUMMARY_JSON_PATH = "data/anomaly-summary.json"

def get_current_timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def load_review_state(path: str = DEFAULT_REVIEW_STATE_PATH) -> Dict[str, Any]:
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
        return data or {}

def save_review_state(state: Dict[str, Any], path: str = DEFAULT_REVIEW_STATE_PATH):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        yaml.safe_dump(state, f, default_flow_style=False, sort_keys=True)

def detect_anomalies_for_doc(
    doc: Dict[str, Any],
    detected_at: Optional[str] = None,
    seen_checksums: Optional[Set[str]] = None,
    review_state: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    ts = detected_at or get_current_timestamp()
    anomalies: List[Dict[str, Any]] = []

    # Run individual detectors
    anomalies.extend(check_a01_source(doc, ts))
    anomalies.extend(check_a02_identity(doc, ts, seen_checksums))
    anomalies.extend(check_a04_quality(doc, ts))
    anomalies.extend(check_a05_classification(doc, ts))

    # Merge version-controlled human review state
    if review_state:
        doc_id = doc.get("jid") or doc.get("case_number", "unknown")
        doc_reviews = review_state.get(doc_id, {})
        for a in anomalies:
            rule_id = a["ruleId"]
            if rule_id in doc_reviews:
                rev = doc_reviews[rule_id]
                a["reviewStatus"] = rev.get("status", a["reviewStatus"])
                if "history" in rev:
                    a["history"] = rev["history"]

    return anomalies

def run_anomaly_suite_on_corpus(
    corpus: List[Dict[str, Any]],
    review_state_path: str = DEFAULT_REVIEW_STATE_PATH,
    summary_output_path: str = DEFAULT_SUMMARY_JSON_PATH
) -> Dict[str, Any]:
    review_state = load_review_state(review_state_path)
    seen_checksums: Set[str] = set()
    all_anomalies: List[Dict[str, Any]] = []
    rule_counts: Dict[str, int] = {}
    severity_counts: Dict[str, int] = {"high": 0, "medium": 0, "low": 0}
    status_counts: Dict[str, int] = {"pending": 0, "reviewed": 0, "suppressed": 0}

    ts = get_current_timestamp()

    for doc in corpus:
        doc_anomalies = detect_anomalies_for_doc(
            doc,
            detected_at=ts,
            seen_checksums=seen_checksums,
            review_state=review_state
        )
        for a in doc_anomalies:
            all_anomalies.append(a)
            rid = a["ruleId"]
            rule_counts[rid] = rule_counts.get(rid, 0) + 1
            sev = a.get("severity", "medium")
            severity_counts[sev] = severity_counts.get(sev, 0) + 1
            st = a.get("reviewStatus", "pending")
            status_counts[st] = status_counts.get(st, 0) + 1

    summary = {
        "generatedAt": ts,
        "totalDocumentsScanned": len(corpus),
        "totalAnomaliesDetected": len(all_anomalies),
        "severityCounts": severity_counts,
        "statusCounts": status_counts,
        "ruleCounts": rule_counts,
        "anomalies": all_anomalies
    }

    os.makedirs(os.path.dirname(summary_output_path), exist_ok=True)
    with open(summary_output_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    return summary
