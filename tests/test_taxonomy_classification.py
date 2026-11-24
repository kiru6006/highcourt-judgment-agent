"""
Unit & Integration Tests for NyayaReader v1.2.0 Classification Subsystem (Levels 1 & 2)
Verifies strict grounding contract, zero-guessing fallback, and evaluation report generation.
"""

import os
import json
import pytest
from pipeline.classify.level1 import classify_level1
from pipeline.classify.level2 import classify_level2, LEVEL2_RULES
from pipeline.classify.engine import classify_document
from scripts.eval_taxonomy import run_evaluation

def test_level1_verified_court_codes():
    # Madras Crl.O.P.
    rec_madras = classify_level1("33_10", "CRL.OP")
    assert rec_madras["status"] == "verified"
    assert rec_madras["domainId"] == "domain_criminal"
    assert rec_madras["jurisdictionType"] == "Original"
    assert rec_madras["confidence"] == 1.0
    assert "hcmadras.tn.nic.in" in rec_madras["sourceUrl"]

    # Delhi Bail Appln.
    rec_delhi = classify_level1("7_26", "BAIL APPLN.")
    assert rec_delhi["status"] == "verified"
    assert rec_delhi["domainId"] == "domain_criminal"
    assert rec_delhi["jurisdictionType"] == "Original"
    assert rec_delhi["confidence"] == 1.0
    assert "delhihighcourt.nic.in" in rec_delhi["sourceUrl"]

    # Bombay ABA
    rec_bombay = classify_level1("1_1", "ABA")
    assert rec_bombay["status"] == "verified"
    assert rec_bombay["jurisdictionType"] == "Original"
    assert rec_bombay["confidence"] == 1.0

def test_level1_unknown_code_never_guesses():
    raw_code = "XYZ_UNOFFICIAL_PETITION"
    rec = classify_level1("33_10", raw_code)
    assert rec["status"] == "unknown"
    assert rec["confidence"] == 0.0
    assert rec["normalizedCaseType"] == raw_code
    assert rec["jurisdictionType"] == "Unknown"

def test_level2_evidence_requirement_contract():
    # Matching paragraph
    paras = [
        "Petitioner was arrested on 01.01.2023.",
        "The applicant seeks grant of regular bail under Section 439 of the Code of Criminal Procedure.",
        "Notice was served on the state."
    ]
    inferred = classify_level2(paras)
    assert len(inferred) >= 1
    bail_rule = next((r for r in inferred if r["ruleId"] == "RULE_CRIM_BAIL"), None)
    assert bail_rule is not None
    assert bail_rule["evidenceParagraphs"] == [1]
    assert bail_rule["confidence"] == 0.85
    assert bail_rule["domainId"] == "domain_criminal"

def test_level2_zero_evidence_yields_zero_labels():
    paras = [
        "This is an ordinary money suit for recovery of dues.",
        "The plaintiff lent Rs. 10,000 on promissory note dated 12.05.2018.",
        "The defendant failed to repay despite legal notice."
    ]
    inferred = classify_level2(paras)
    assert inferred == []

def test_classify_document_integration():
    doc = {
        "jid": "jid_test_sample",
        "court_code": "7_26",
        "case_type": "ARB.P.",
        "case_number": "Arb.P. 55/2023",
        "paragraphs": [
            "This is an application under Section 11(6) of the Arbitration and Conciliation Act 1996 for appointment of sole arbitrator.",
            "Arbitral tribunal could not be constituted as per agreement clause."
        ]
    }
    enriched = classify_document(doc)
    assert "classification_metadata" in enriched
    meta = enriched["classification_metadata"]
    assert meta["reviewStatus"] == "pending"
    assert meta["statedClassification"]["domainId"] == "domain_commercial_corporate"
    assert meta["statedClassification"]["status"] == "verified"
    
    inferred = meta["inferredClassification"]
    assert len(inferred) == 1
    assert inferred[0]["ruleId"] == "RULE_COMM_ARBITRATION"
    assert inferred[0]["evidenceParagraphs"] == [0]

def test_taxonomy_evaluation_suite():
    l1_acc, prec, rec = run_evaluation()
    assert l1_acc >= 95.0
    assert prec >= 90.0
    assert rec >= 85.0
    assert os.path.exists("docs/TAXONOMY_TEST_REPORT.md")
