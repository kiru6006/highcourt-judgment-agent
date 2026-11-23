"""
Quarantine & Restricted Content Filter for NyayaReader.
Excludes sensitive judgments (POCSO, sexual offenses, judicial takedowns)
and appends them to review-queue.csv.
"""

import csv
import json
import os
import re
from typing import Dict, Any, Tuple

REVIEW_QUEUE_PATH = "review-queue.csv"

def load_restricted_rules() -> list:
    cfg_path = "config/restricted.json"
    if os.path.exists(cfg_path):
        with open(cfg_path) as f:
            data = json.load(f)
            return data.get("restricted_rules", [])
    return []

def load_takedowns() -> set:
    takedown_path = "config/takedown.json"
    if os.path.exists(takedown_path):
        with open(takedown_path) as f:
            data = json.load(f)
            takedowns = set()
            for item in data.get("takedowns", []):
                if "cnr" in item:
                    takedowns.add(item["cnr"].strip().upper())
                if "jid" in item:
                    takedowns.add(item["jid"].strip())
            return takedowns
    return set()

def is_quarantined(doc: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Checks if a judgment matches restricted patterns or takedown ledger.
    Returns (is_quarantined, reason).
    """
    cnr = doc.get("cnr", "").strip().upper()
    jid = doc.get("jid", "").strip()

    # 1. Check takedown ledger
    takedowns = load_takedowns()
    if cnr in takedowns or jid in takedowns:
        return True, "Explicit entry in config/takedown.json"

    # 2. Check restricted regex rules
    rules = load_restricted_rules()
    title = doc.get("parties", {}).get("petitioner", "") + " " + doc.get("parties", {}).get("respondent", "")
    acts = " ".join([s.get("act", "") + " " + s.get("section", "") for s in doc.get("statutes", [])])
    text_sample = " ".join([p.get("text", "") for p in doc.get("paragraphs", [])[:3]])
    blob = f"{title} {acts} {text_sample}"

    for r in rules:
        if re.search(r["pattern"], blob, re.IGNORECASE):
            return True, f"Rule matched: {r['rule_id']} ({r['description']})"

    return False, ""

def log_to_review_queue(doc: Dict[str, Any], reason: str):
    """Logs quarantined document to review-queue.csv."""
    file_exists = os.path.exists(REVIEW_QUEUE_PATH)
    with open(REVIEW_QUEUE_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["jid", "cnr", "court_code", "case_number", "decision_date", "reason"])
        writer.writerow([
            doc.get("jid"),
            doc.get("cnr"),
            doc.get("court_code"),
            doc.get("case_number"),
            doc.get("decision_date"),
            reason
        ])
