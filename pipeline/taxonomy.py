"""
Deterministic Taxonomy Normalizer for NyayaReader.
Maps court codes to names, case types to categories, and extracts disposal nature.
All heuristic derivations explicitly carry `derived: true`.
"""

import re
from typing import Dict, Any, Tuple

# Mapping of High Court codes to names and default seats
COURT_CODE_MAP = {
    "33_10": {"name": "Madras High Court", "default_bench": "Principal Seat at Madras"},
    "33~10": {"name": "Madras High Court", "default_bench": "Principal Seat at Madras"},
    "29_3": {"name": "Karnataka High Court", "default_bench": "Principal Bench at Bengaluru"},
    "29~3": {"name": "Karnataka High Court", "default_bench": "Principal Bench at Bengaluru"},
    "7_26": {"name": "Delhi High Court", "default_bench": "Principal Seat at New Delhi"},
    "7~26": {"name": "Delhi High Court", "default_bench": "Principal Seat at New Delhi"},
    "1_1": {"name": "Bombay High Court", "default_bench": "Principal Seat at Mumbai"},
    "1~1": {"name": "Bombay High Court", "default_bench": "Principal Seat at Mumbai"},
}

# Prefix to Category mapping
CATEGORY_PREFIX_MAP = {
    # Criminal
    "CRL": "Criminal",
    "CRL.P": "Criminal",
    "CRL.OP": "Criminal",
    "CRL.A": "Criminal",
    "BAIL": "Criminal",
    # Civil & Commercial
    "CS": "Commercial",
    "CS(COMM)": "Commercial",
    "ARB": "Commercial",
    "ARB.P": "Commercial",
    "ARB.O.P.": "Commercial",
    "RFA": "Civil",
    "MFA": "Civil",
    "RSA": "Civil",
    "OS": "Civil",
    # Writ
    "WP": "Writ",
    "W.P.": "Writ",
    "WA": "Service",  # Intra-court appeal frequently service/writ
    "W.A.": "Service",
    # Tax
    "ITA": "Tax",
    "TC": "Tax",
    "TCA": "Tax",
    "W.P.(T)": "Tax",
    # Matrimonial
    "MAT.APP": "Matrimonial",
    "FCA": "Matrimonial",
}

def normalize_court(court_code: str, bench: str = "") -> Tuple[str, str]:
    """Returns (court_name, bench_name)."""
    norm_code = court_code.replace("~", "_")
    entry = COURT_CODE_MAP.get(norm_code, {"name": f"High Court ({court_code})", "default_bench": bench or "Principal Bench"})
    return entry["name"], entry["default_bench"]

def derive_category(case_type: str, title: str = "", acts: str = "") -> Tuple[str, bool]:
    """
    Derives case category deterministically from case type prefix and text keywords.
    Returns (category, is_derived).
    """
    blob = f"{title} {acts}".lower()
    
    # Specific subject-matter checks in acts/title take precedence over generic Writ/Appeal prefixes
    if any(k in blob for k in ["income tax", "gst", "excise", "vat", "sales tax"]):
        return "Tax", True
    if any(k in blob for k in ["divorce", "matrimonial", "maintenance", "hindu marriage"]):
        return "Matrimonial", True
    if any(k in blob for k in ["arbitration and conciliation", "trademark", "patent", "commercial dispute"]):
        return "Commercial", True

    clean_type = re.sub(r"[^A-Za-z\.]", "", (case_type or "").upper())
    
    # Prefix check
    for prefix, cat in CATEGORY_PREFIX_MAP.items():
        if clean_type.startswith(prefix.upper()):
            return cat, True

    # General keyword check in acts or title
    if any(k in blob for k in ["fir", "ipc", "crpc", "bns", "bnss", "police", "bail"]):
        return "Criminal", True
    if any(k in blob for k in ["article 226", "writ petition"]):
        return "Writ", True

    return "Other", True

def normalize_disposal(disposal_raw: str, order_text: str = "") -> str:
    """Normalizes disposal status into canonical strings."""
    blob = f"{disposal_raw} {order_text}".lower()
    if "partly allowed" in blob:
        return "Partly Allowed"
    if "allowed" in blob or "quashed" in blob:
        return "Allowed"
    if "dismissed" in blob or "rejected" in blob:
        return "Dismissed"
    if "disposed" in blob:
        return "Disposed Of"
    return (disposal_raw or "Disposed Of").strip().title()
