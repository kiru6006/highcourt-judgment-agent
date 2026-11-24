"""
Nyaya AI Reader — A02 Identity Anomaly Detector
Detects duplicate checksums, conflicting CNR/Court identifiers, and bench mismatches.
SPEC RULE: The word 'fabricated' is used only for A02 checksum-level dupes — never for inferred legal issues.
"""

from typing import Dict, Any, List, Set, Optional

COURT_BENCH_MAP = {
    "33_10": ["Principal Seat at Madras", "Madurai Bench", "Madras"],
    "29_3": ["Principal Bench at Bengaluru", "Dharwad Bench", "Kalaburagi Bench", "Bengaluru"],
    "32_1": ["Principal Seat at Ernakulam", "Ernakulam", "Kochi"],
    "7_26": ["Principal Seat at New Delhi", "New Delhi", "Delhi"],
    "1_1": ["Principal Seat at Mumbai", "Nagpur Bench", "Aurangabad Bench", "Goa Bench", "Mumbai"]
}

# CNR 2-letter state code to Court mapping
CNR_STATE_PREFIX_MAP = {
    "HCMA": "33_10",
    "HCKA": "29_3",
    "HCKL": "32_1",
    "HCDH": "7_26",
    "HCBM": "1_1"
}

def check_a02_identity(
    doc: Dict[str, Any],
    detected_at: str,
    seen_checksums: Optional[Set[str]] = None
) -> List[Dict[str, Any]]:
    anomalies: List[Dict[str, Any]] = []
    doc_id = doc.get("jid") or doc.get("case_number", "unknown")
    court_code = (doc.get("court_code") or "").replace("~", "_").strip()
    bench = doc.get("bench_name") or doc.get("bench") or ""
    cnr = (doc.get("cnr") or "").strip()
    checksum = doc.get("content_hash") or doc.get("sha256") or ""

    # 1. Exact Duplicate Checksum
    if seen_checksums is not None and checksum:
        if checksum in seen_checksums:
            anomalies.append({
                "ruleId": "A02_DUPLICATE_CHECKSUM",
                "severity": "high",
                "documentId": doc_id,
                "evidence": f"Exact collision with existing content checksum: {checksum}. Suspected fabricated or duplicate ingestion record.",
                "detectedAt": detected_at,
                "reviewStatus": "pending",
                "remediation": "Quarantine duplicate document and deduplicate JID in shard builder.",
                "history": []
            })
        else:
            seen_checksums.add(checksum)

    # 2. Conflicting CNR Court Identifier
    if cnr and len(cnr) >= 4:
        cnr_prefix = cnr[:4].upper()
        expected_court = CNR_STATE_PREFIX_MAP.get(cnr_prefix)
        if expected_court and court_code and expected_court != court_code:
            anomalies.append({
                "ruleId": "A02_CNR_COURT_MISMATCH",
                "severity": "high",
                "documentId": doc_id,
                "evidence": f"CNR prefix '{cnr_prefix}' indicates court {expected_court}, but document court_code is '{court_code}'.",
                "detectedAt": detected_at,
                "reviewStatus": "pending",
                "remediation": "Audit filing record metadata to resolve true court jurisdiction.",
                "history": []
            })

    # 3. Court / Bench Mismatch
    if court_code in COURT_BENCH_MAP and bench:
        valid_benches = COURT_BENCH_MAP[court_code]
        bench_clean = bench.lower()
        if not any(vb.lower() in bench_clean or bench_clean in vb.lower() for vb in valid_benches):
            anomalies.append({
                "ruleId": "A02_BENCH_MISMATCH",
                "severity": "medium",
                "documentId": doc_id,
                "evidence": f"Bench '{bench}' is not a recognized seat or circuit bench for High Court code '{court_code}'.",
                "detectedAt": detected_at,
                "reviewStatus": "pending",
                "remediation": "Standardize bench name or correct court_code partition assignment.",
                "history": []
            })

    return anomalies
