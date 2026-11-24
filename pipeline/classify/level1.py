"""
Nyaya AI Reader — Level 1 Metadata & Registry Classifier
Maps court codes and case types to official taxonomy and jurisdiction strictly via registry.
Never guesses; unverified cases retain raw string with unknown status.
"""

from typing import Dict, Any, Optional
from .registry_data import lookup_court_code

TAXONOMY_VERSION = "1.0"

def classify_level1(court_code: str, raw_case_type: str, bench: str = "") -> Dict[str, Any]:
    """
    Performs Level 1 deterministic classification using verified court-code registry.
    Returns standard ClassificationRecord dictionary.
    """
    clean_type = (raw_case_type or "").strip()
    entry = lookup_court_code(court_code, clean_type) if clean_type else None
    
    if entry and entry.get("status") == "verified":
        return {
            "method": "registry",
            "taxonomyVersion": TAXONOMY_VERSION,
            "domainId": entry["domainId"],
            "domainLabel": entry["domainLabel"],
            "subjectIds": [],
            "jurisdictionType": entry["jurisdiction"],
            "normalizedCaseType": entry["normalizedType"],
            "officialDescription": entry["officialDescription"],
            "confidence": 1.0,
            "evidenceParagraphs": [],
            "reviewStatus": "pending",
            "sourceUrl": entry["sourceUrl"],
            "status": "verified"
        }
    
    # Fallback when code is not in verified registry
    # Preserves raw string exactly as received, confidence 0.0, never fabricates
    return {
        "method": "registry",
        "taxonomyVersion": TAXONOMY_VERSION,
        "domainId": "domain_unknown",
        "domainLabel": "Unknown / Unclassified",
        "subjectIds": [],
        "jurisdictionType": "Unknown",
        "normalizedCaseType": clean_type or "Unknown",
        "officialDescription": f"Unverified case type code: {clean_type}",
        "confidence": 0.0,
        "evidenceParagraphs": [],
        "reviewStatus": "pending",
        "status": "unknown"
    }
