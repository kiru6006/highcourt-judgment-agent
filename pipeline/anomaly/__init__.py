"""
Nyaya AI Reader — Anomaly Detection Subsystem (A01, A02, A04, A05)
v1.2.0 Structured Case Intelligence
"""

from .engine import (
    detect_anomalies_for_doc,
    run_anomaly_suite_on_corpus,
    load_review_state,
    save_review_state
)

__all__ = [
    "detect_anomalies_for_doc",
    "run_anomaly_suite_on_corpus",
    "load_review_state",
    "save_review_state"
]
