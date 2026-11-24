"""
Unit & Integration Tests for NyayaReader v1.2.0 Anomaly Detection Subsystem (A01, A02, A04, A05)
Verifies evidence attachment, remediation clarity, false-positive resistance, and review persistence.
"""

import os
import json
import pytest
from pipeline.anomaly.a01_source import check_a01_source
from pipeline.anomaly.a02_identity import check_a02_identity
from pipeline.anomaly.a04_quality import check_a04_quality
from pipeline.anomaly.a05_classification import check_a05_classification
from pipeline.anomaly.engine import (
    detect_anomalies_for_doc,
    run_anomaly_suite_on_corpus,
    load_review_state,
    save_review_state
)

def test_a01_source_anomalies():
    # 1. Missing source
    anoms_missing = check_a01_source({"jid": "doc_a01_01", "source_url": ""}, "2026-11-24T00:00:00Z")
    assert len(anoms_missing) == 1
    assert anoms_missing[0]["ruleId"] == "A01_MISSING_SOURCE_URL"
    assert anoms_missing[0]["severity"] == "high"
    assert "missing" in anoms_missing[0]["evidence"].lower()
    assert anoms_missing[0]["remediation"]

    # 2. Insecure HTTP link
    anoms_http = check_a01_source({"jid": "doc_a01_02", "source_url": "http://delhihighcourt.nic.in/order.pdf"}, "2026-11-24T00:00:00Z")
    assert any(a["ruleId"] == "A01_INSECURE_HTTP_LINK" for a in anoms_http)

    # 3. Unverified domain
    anoms_domain = check_a01_source({"jid": "doc_a01_03", "source_url": "https://random-unverified-blog.com/case.pdf"}, "2026-11-24T00:00:00Z")
    assert any(a["ruleId"] == "A01_UNVERIFIED_DOMAIN" for a in anoms_domain)

def test_a02_identity_anomalies():
    seen = set()
    doc1 = {"jid": "doc_a02_01", "content_hash": "hash_abc_123", "court_code": "33_10", "bench": "Principal Seat at Madras"}
    doc2 = {"jid": "doc_a02_02", "content_hash": "hash_abc_123", "court_code": "33_10", "bench": "Principal Seat at Madras"}

    check_a02_identity(doc1, "2026-11-24T00:00:00Z", seen)
    anoms_dupe = check_a02_identity(doc2, "2026-11-24T00:00:00Z", seen)
    assert len(anoms_dupe) == 1
    assert anoms_dupe[0]["ruleId"] == "A02_DUPLICATE_CHECKSUM"
    assert "fabricated" in anoms_dupe[0]["evidence"].lower()  # Spec requires 'fabricated' only on A02 dupes

    # CNR court mismatch
    doc_cnr = {"jid": "doc_a02_03", "cnr": "HCMA010012342023", "court_code": "7_26"}  # HCMA is Madras, court is Delhi
    anoms_cnr = check_a02_identity(doc_cnr, "2026-11-24T00:00:00Z")
    assert any(a["ruleId"] == "A02_CNR_COURT_MISMATCH" for a in anoms_cnr)

def test_a04_quality_anomalies():
    # Empty extraction
    anoms_empty = check_a04_quality({"jid": "doc_a04_01", "paragraphs": ["Short"]}, "2026-11-24T00:00:00Z")
    assert any(a["ruleId"] == "A04_EMPTY_EXTRACTION" for a in anoms_empty)

    # Truncated (more than 150 chars to avoid empty extraction, but less than 600 for 5 pages)
    anoms_trunc = check_a04_quality({
        "jid": "doc_a04_02",
        "page_count": 5,
        "paragraphs": [
            "This is paragraph one with sufficient length to exceed the minimum extraction threshold of one hundred and fifty characters.",
            "This is paragraph two providing additional legal text so that the overall document character length is approximately three hundred characters."
        ]
    }, "2026-11-24T00:00:00Z")
    assert any(a["ruleId"] == "A04_TRUNCATED_TEXT" for a in anoms_trunc)

    # OCR noise
    anoms_ocr = check_a04_quality({
        "jid": "doc_a04_03",
        "paragraphs": ["Order \ufffd\ufffd\ufffd\ufffd\ufffd\ufffd %$#@!*&^~ text completely corrupted by scanner."] * 5
    }, "2026-11-24T00:00:00Z")
    assert any(a["ruleId"] == "A04_OCR_FAILURE" for a in anoms_ocr)

def test_a05_classification_anomalies():
    # Unmapped case code
    anoms_unmapped = check_a05_classification({
        "jid": "doc_a05_01",
        "court_code": "33_10",
        "case_type": "UNKNOWN_STRANGE_PETITION"
    }, "2026-11-24T00:00:00Z")
    assert any(a["ruleId"] == "A05_UNMAPPED_CASE_CODE" for a in anoms_unmapped)

    # Statute domain mismatch
    anoms_mismatch = check_a05_classification({
        "jid": "doc_a05_02",
        "court_code": "33_10",
        "classification_metadata": {
            "statedClassification": {"domainId": "domain_criminal"}
        },
        "statutes": [{"act_code": "Arbitration and Conciliation Act", "section": "11(6)"}]
    }, "2026-11-24T00:00:00Z")
    assert any(a["ruleId"] == "A05_STATUTE_DOMAIN_MISMATCH" for a in anoms_mismatch)

def test_clean_document_produces_zero_anomalies():
    clean_doc = {
        "jid": "doc_clean_001",
        "case_number": "Crl.O.P. 500/2023",
        "court_code": "33_10",
        "bench": "Principal Seat at Madras",
        "cnr": "HCMA010055552023",
        "source_url": "https://www.hcmadras.tn.nic.in/order_view.php?id=123",
        "content_hash": "sha256_unique_999",
        "page_count": 2,
        "case_type": "CRL.OP",
        "classification_metadata": {
            "statedClassification": {"domainId": "domain_criminal"}
        },
        "statutes": [{"act_code": "CrPC", "section": "439"}],
        "paragraphs": [
            "This criminal original petition is filed under Section 439 of the Code of Criminal Procedure seeking bail.",
            "Heard the learned counsel appearing for the petitioner and the learned Additional Public Prosecutor for the respondent state.",
            "Considering the submissions and the facts of the case, the petitioner is granted regular bail on executing bond."
        ]
    }
    anomalies = detect_anomalies_for_doc(clean_doc)
    assert anomalies == [], f"Expected 0 anomalies on clean document, got: {anomalies}"

def test_corpus_anomaly_suite_and_summary_generation(tmp_path):
    corpus = [
        {
            "jid": "sample_reviewed_doc_001",
            "court_code": "33_10",
            "case_type": "HISTORIC_WRIT_OLD",
            "source_url": "https://www.hcmadras.tn.nic.in/order.pdf",
            "paragraphs": ["Clean paragraph with sufficient length to pass extraction quality tests easily."] * 3
        },
        {
            "jid": "bad_doc_002",
            "source_url": "",
            "paragraphs": []
        }
    ]
    summary_path = str(tmp_path / "anomaly-summary.json")
    summary = run_anomaly_suite_on_corpus(corpus, summary_output_path=summary_path)

    assert summary["totalDocumentsScanned"] == 2
    assert summary["totalAnomaliesDetected"] >= 2
    assert os.path.exists(summary_path)

    # Check that sample_reviewed_doc_001 has status 'reviewed' merged from review-state.yaml
    reviewed_item = next((a for a in summary["anomalies"] if a["documentId"] == "sample_reviewed_doc_001"), None)
    assert reviewed_item is not None
    assert reviewed_item["reviewStatus"] == "reviewed"
