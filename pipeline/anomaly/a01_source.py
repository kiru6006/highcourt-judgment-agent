"""
Nyaya AI Reader — A01 Source Link Anomaly Detector
Detects missing source URLs, non-HTTPS links, and unverified source domains.
"""

from typing import Dict, Any, List, Optional
from urllib.parse import urlparse

VERIFIED_COURT_DOMAINS = {
    "hcmadras.tn.nic.in",
    "karnatakahi.courtrecords.gov.in",
    "hckerala.gov.in",
    "delhihighcourt.nic.in",
    "bombayhighcourt.nic.in",
    "ecourts.gov.in",
    "judgments.ecourts.gov.in",
    "main.sci.gov.in",
    "sci.gov.in",
    "indiankanoon.org"
}

def check_a01_source(doc: Dict[str, Any], detected_at: str) -> List[Dict[str, Any]]:
    anomalies: List[Dict[str, Any]] = []
    doc_id = doc.get("jid") or doc.get("case_number", "unknown")
    source_url = doc.get("source_url") or doc.get("sourceUrl") or ""

    # 1. Missing source URL
    if not source_url or not str(source_url).strip():
        anomalies.append({
            "ruleId": "A01_MISSING_SOURCE_URL",
            "severity": "high",
            "documentId": doc_id,
            "evidence": "Document record is missing mandatory source_url field.",
            "detectedAt": detected_at,
            "reviewStatus": "pending",
            "remediation": "Populate authentic official High Court judgment portal URL or eCourts record link.",
            "history": []
        })
        return anomalies

    url_str = str(source_url).strip()
    parsed = urlparse(url_str)

    # 2. Insecure HTTP link
    if parsed.scheme == "http":
        anomalies.append({
            "ruleId": "A01_INSECURE_HTTP_LINK",
            "severity": "medium",
            "documentId": doc_id,
            "evidence": f"source_url uses plaintext HTTP scheme: {url_str}",
            "detectedAt": detected_at,
            "reviewStatus": "pending",
            "remediation": "Upgrade link protocol to HTTPS to prevent MITM tampering.",
            "history": []
        })

    # 3. Unverified domain
    domain = (parsed.netloc or "").lower().split(":")[0]
    if domain and domain not in VERIFIED_COURT_DOMAINS and not domain.endswith(".gov.in") and not domain.endswith(".nic.in"):
        anomalies.append({
            "ruleId": "A01_UNVERIFIED_DOMAIN",
            "severity": "medium",
            "documentId": doc_id,
            "evidence": f"source_url points to unverified host domain: {domain}",
            "detectedAt": detected_at,
            "reviewStatus": "pending",
            "remediation": "Verify that domain is an authorized government judiciary repository or whitelist domain.",
            "history": []
        })

    return anomalies
