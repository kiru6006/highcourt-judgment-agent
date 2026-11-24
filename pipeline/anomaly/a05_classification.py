"""
Nyaya AI Reader — A05 Classification Anomaly Detector
Detects unmapped case-code types and severe statute-vs-domain mismatches.
"""

from typing import Dict, Any, List
from pipeline.classify.registry_data import lookup_court_code

COMMERCIAL_ACTS = {"arbitration", "trademark", "patent", "copyright", "companies act", "ibc", "insolvency"}
CRIMINAL_ACTS = {"ipc", "crpc", "bns", "bnss", "police", "prevention of corruption", "ndps", "pocso"}

def check_a05_classification(doc: Dict[str, Any], detected_at: str) -> List[Dict[str, Any]]:
    anomalies: List[Dict[str, Any]] = []
    doc_id = doc.get("jid") or doc.get("case_number", "unknown")
    court_code = (doc.get("court_code") or "").replace("~", "_").strip()
    raw_case_type = (doc.get("case_type") or doc.get("raw_case_type") or "").strip()

    # 1. Unmapped Case Code in Registry
    if raw_case_type and court_code:
        entry = lookup_court_code(court_code, raw_case_type)
        if not entry or entry.get("status") != "verified":
            anomalies.append({
                "ruleId": "A05_UNMAPPED_CASE_CODE",
                "severity": "medium",
                "documentId": doc_id,
                "evidence": f"Case type code '{raw_case_type}' is unmapped in official court registry for '{court_code}'.",
                "detectedAt": detected_at,
                "reviewStatus": "pending",
                "remediation": "Add verified case-type entry to shared/court-codes/registry.ts with official gazette source URL.",
                "history": []
            })

    # 2. Severe Statute vs Domain Mismatch
    # e.g., Stated as Criminal, but statutes solely commercial with zero criminal statutes
    stated_domain = (doc.get("classification_metadata", {}).get("statedClassification", {}).get("domainId") or "").lower()
    statutes: List[Dict[str, Any]] = doc.get("statutes", [])
    
    if statutes and stated_domain == "domain_criminal":
        acts = [str(s.get("act_code") or s.get("act", "")).lower() for s in statutes]
        has_comm = any(any(ca in a for ca in COMMERCIAL_ACTS) for a in acts)
        has_crim = any(any(cra in a for cra in CRIMINAL_ACTS) for a in acts)
        
        if has_comm and not has_crim:
            anomalies.append({
                "ruleId": "A05_STATUTE_DOMAIN_MISMATCH",
                "severity": "medium",
                "documentId": doc_id,
                "evidence": f"Stated domain is Criminal, but cited acts are strictly commercial ({', '.join(acts)}) with zero criminal provisions.",
                "detectedAt": detected_at,
                "reviewStatus": "pending",
                "remediation": "Review case classification to verify if petition was misfiled or incorrectly categorized.",
                "history": []
            })

    return anomalies
