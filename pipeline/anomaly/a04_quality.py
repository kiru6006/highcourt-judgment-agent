"""
Nyaya AI Reader — A04 Document Quality Anomaly Detector
Detects empty text extraction, truncated orders, and OCR failures.
"""

import re
from typing import Dict, Any, List

def check_a04_quality(doc: Dict[str, Any], detected_at: str) -> List[Dict[str, Any]]:
    anomalies: List[Dict[str, Any]] = []
    doc_id = doc.get("jid") or doc.get("case_number", "unknown")
    paragraphs: List[str] = doc.get("paragraphs") or []
    full_text = " ".join(paragraphs).strip()
    char_len = len(full_text)
    page_count = doc.get("page_count") or 1

    # 1. Empty Text Extraction
    if char_len < 150 or not paragraphs:
        anomalies.append({
            "ruleId": "A04_EMPTY_EXTRACTION",
            "severity": "high",
            "documentId": doc_id,
            "evidence": f"Extracted text has only {char_len} characters across {len(paragraphs)} paragraphs (threshold: >= 150 chars).",
            "detectedAt": detected_at,
            "reviewStatus": "pending",
            "remediation": "Re-extract from source PDF using OCR fallback pipeline.",
            "history": []
        })
        return anomalies

    # 2. Truncated Text
    if page_count >= 3 and char_len < 600:
        anomalies.append({
            "ruleId": "A04_TRUNCATED_TEXT",
            "severity": "medium",
            "documentId": doc_id,
            "evidence": f"Document claims {page_count} pages but yielded only {char_len} characters of text.",
            "detectedAt": detected_at,
            "reviewStatus": "pending",
            "remediation": "Verify PDF text layer extraction completeness across all page streams.",
            "history": []
        })

    # 3. OCR Failure / High Gibberish Density
    replacement_count = full_text.count("\ufffd")
    # Proportion of non-alphanumeric, non-standard punctuation characters
    weird_chars = len(re.findall(r"[^\w\s\.,;:\"'()\-\/]", full_text))
    noise_ratio = weird_chars / char_len if char_len > 0 else 0.0

    if replacement_count > 5 or noise_ratio > 0.15:
        anomalies.append({
            "ruleId": "A04_OCR_FAILURE",
            "severity": "high",
            "documentId": doc_id,
            "evidence": f"OCR artifact density detected: {replacement_count} replacement chars, {noise_ratio*100:.1f}% noise ratio.",
            "detectedAt": detected_at,
            "reviewStatus": "pending",
            "remediation": "Apply pre-processing de-skewing and re-run Tesseract with legal lexicon.",
            "history": []
        })

    return anomalies
