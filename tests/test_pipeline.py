"""
Unit Test Suite for NyayaReader Offline Pipeline.
Verifies JID stability, deduplication, section tagger, taxonomy,
statute & citation regexes (>=30 test cases), quarantine, and shard outputs.
"""

import os
import pytest
from pipeline.identity import generate_jid, normalize_text, compute_exact_hash, is_near_duplicate
from pipeline.structure import split_into_paragraphs, classify_sections
from pipeline.extractors.statutes import extract_statutes_from_text
from pipeline.extractors.citations import extract_citations_from_text
from pipeline.taxonomy import normalize_court, derive_category, normalize_disposal
from pipeline.quarantine import is_quarantined
from pipeline.shard_builder import build_shards_for_partition

# ==========================================
# 1. JID Stability & Collision Resistance Tests
# ==========================================
def test_jid_deterministic():
    jid1 = generate_jid(cnr="MCHC010123452022", decision_date="2022-08-14", order_number="1")
    jid2 = generate_jid(cnr="MCHC010123452022", decision_date="2022-08-14", order_number="1")
    assert jid1 == jid2, "Identical CNR, date, and order must produce identical JID"
    assert len(jid1) == 40, "SHA-1 hex digest must be 40 characters"

def test_jid_different_dates():
    jid1 = generate_jid(cnr="MCHC010123452022", decision_date="2022-08-14", order_number="1")
    jid2 = generate_jid(cnr="MCHC010123452022", decision_date="2022-08-15", order_number="1")
    assert jid1 != jid2, "Different decision dates must produce distinct JIDs"

def test_jid_fallback():
    jid_fallback = generate_jid(court="33_10", year="2022", filename="sample_order.pdf")
    assert len(jid_fallback) == 40
    assert jid_fallback == generate_jid(court="33_10", year="2022", filename="sample_order.pdf")

# ==========================================
# 2. Text Normalization & Deduplication Tests
# ==========================================
def test_text_normalization():
    raw = "  This   is a ‘quoted’   and “double-quoted” string...  \n\n  "
    norm = normalize_text(raw)
    assert norm == "this is a quoted and double quoted string"

def test_exact_dedupe():
    t1 = "The High Court hereby quashes the First Information Report."
    t2 = "the high court hereby quashes the first information report   "
    assert compute_exact_hash(t1) == compute_exact_hash(t2)

def test_near_duplicate():
    t1 = "The petitioner seeks quashing of FIR No 42 of 2021 registered at police station."
    t2 = "The petitioner seeks quashing of FIR No 42 of 2021 registered at local police station."
    assert is_near_duplicate(t1, t2, threshold=0.75) is True

    different = "Arbitration petition under Section 11 of the Arbitration and Conciliation Act."
    assert is_near_duplicate(t1, different, threshold=0.75) is False

# ==========================================
# 3. Section Tagger & Untagged Fallback Tests
# ==========================================
def test_section_tagging_facts_ratio_order():
    paras = [
        {"index": 1, "text": "Brief facts of the case are that the dispute arose from an invoice."},
        {"index": 2, "text": "Points for determination are whether commercial default amounts to cheating."},
        {"index": 3, "text": "Learned counsel for the petitioner contended that no dishonest intention exists."},
        {"index": 4, "text": "Learned Additional Public Prosecutor opposed the grant of any relief."},
        {"index": 5, "text": "In our considered opinion, as laid down by the Hon'ble Supreme Court, breach is civil."},
        {"index": 6, "text": "In the result, the criminal original petition is allowed and FIR is quashed."},
    ]
    sections = classify_sections(paras)
    tags = [s["tag"] for s in sections]
    assert "Facts" in tags
    assert "Issues" in tags
    assert "Petitioner Submissions" in tags
    assert "Respondent Submissions" in tags
    assert "Reasoning & Ratio" in tags
    assert "Final Order" in tags

def test_untagged_fallback():
    paras = [
        {"index": 1, "text": "Call on 14.09.2023 for further proceedings."},
        {"index": 2, "text": "Counter affidavit to be filed within two weeks."},
    ]
    sections = classify_sections(paras)
    assert len(sections) == 1
    assert sections[0]["tag"] == "Untagged"
    assert paras[0]["section_tag"] == "Untagged"

# ==========================================
# 4. Statute Regex Tests (>= 15 Test Strings)
# ==========================================
STATUTE_TEST_CASES = [
    ("Application under Section 482 of the Cr.P.C. for quashing.", "CrPC", "482"),
    ("Petition filed under Sec. 439 of CrPC seeking regular bail.", "CrPC", "439"),
    ("Invoking Section 438 of the Code of Criminal Procedure.", "CrPC", "438"),
    ("Accused charged under Section 420 of the Indian Penal Code.", "IPC", "420"),
    ("Offence punishable under Section 302 of IPC.", "IPC", "302"),
    ("Charge sheet filed under Section 498A IPC.", "IPC", "498A"),
    ("Cheating and criminal conspiracy under Section 120B of IPC.", "IPC", "120B"),
    ("Writ petition under Article 226 of the Constitution of India.", "Const", "226"),
    ("Violation of fundamental rights under Article 14 of the Constitution.", "Const", "14"),
    ("Arbitration petition under Section 11(6) of Arbitration and Conciliation Act.", "Other", "11(6)"),
    ("Proceedings initiated under Section 138 of the Negotiable Instruments Act.", "Other", "138"),
    ("Offence under Section 138 of N.I. Act.", "Other", "138"),
    ("Injunction under Order XXXIX Rule 1 of the C.P.C.", "CPC", "Order XXXIX Rule 1"),
    ("Notice issued under Section 148 of the Income Tax Act.", "Other", "148"),
    ("Show cause under Section 148A of the Income Tax Act.", "Other", "148A"),
    ("Infringement under Section 29 of the Trade Marks Act.", "Other", "29"),
    ("New petition under Section 528 of the Bharatiya Nagarik Suraksha Sanhita.", "BNSS", "528"),
    ("Offence under Section 318 of Bharatiya Nyaya Sanhita.", "BNS", "318"),
]

@pytest.mark.parametrize("input_text,expected_act_code,expected_section", STATUTE_TEST_CASES)
def test_statute_extraction(input_text, expected_act_code, expected_section):
    results = extract_statutes_from_text(input_text, para_index=1)
    assert len(results) > 0, f"Failed to extract statute from: '{input_text}'"
    found = any(r["act_code"] == expected_act_code for r in results)
    assert found is True, f"Expected act_code '{expected_act_code}' in {results}"

# ==========================================
# 5. Citation Regex Tests (>= 15 Test Strings)
# ==========================================
CITATION_TEST_CASES = [
    "As held in AIR 2020 SC 1234 by the Apex Court.",
    "Reported in AIR 1992 SC 604 (Bhajan Lal case).",
    "Principles laid down in (2020) 4 SCC 1.",
    "Refer to decision in 2018 (3) SCC 450.",
    "Authority cited: (1992) Supp (1) SCC 335.",
    "Precedent in (2015) 2 SCR 500.",
    "Judgment in ILR 2018 2 Mad 120.",
    "Followed in AIR 2015 Cal 89.",
    "State of Haryana v. Bhajan Lal is the leading authority.",
    "Arnesh Kumar v. State of Bihar lays down arrest guidelines.",
    "Lalita Kumari v. Govt. of U.P. on mandatory registration of FIR.",
    "Satender Kumar Antil v. CBI regarding bail guidelines.",
    "Asian Resurfacing v. CBI concerning stay orders.",
    "Vidya Drolia v. Durga Trading Corpn on arbitrability.",
    "Perused the dictum in D.K. Basu v. State of West Bengal.",
]

@pytest.mark.parametrize("citation_text", CITATION_TEST_CASES)
def test_citation_extraction(citation_text):
    results = extract_citations_from_text(citation_text, para_index=1)
    assert len(results) > 0, f"Failed to extract citation from: '{citation_text}'"

# ==========================================
# 6. Taxonomy Normalizer Tests
# ==========================================
def test_court_normalization():
    name, bench = normalize_court("33_10")
    assert name == "Madras High Court"
    assert "Madras" in bench

    name_k, bench_k = normalize_court("29_3")
    assert name_k == "Karnataka High Court"
    assert "Bengaluru" in bench_k

def test_category_derivation():
    cat1, is_der1 = derive_category("CRL.OP")
    assert cat1 == "Criminal"
    assert is_der1 is True

    cat2, _ = derive_category("CS(COMM)")
    assert cat2 == "Commercial"

    cat3, _ = derive_category("WP", acts="Income Tax Act")
    assert cat3 == "Tax"

def test_disposal_normalization():
    assert normalize_disposal("ALLOWED") == "Allowed"
    assert normalize_disposal("DISMISSED") == "Dismissed"
    assert normalize_disposal("partly allowed") == "Partly Allowed"

# ==========================================
# 7. Quarantine Tests
# ==========================================
def test_quarantine_pocso():
    doc = {
        "cnr": "TESTCNR123",
        "jid": "testjid123",
        "parties": {"petitioner": "Accused", "respondent": "State"},
        "statutes": [{"act": "POCSO Act", "section": "6"}],
        "paragraphs": [{"text": "Offences alleged under POCSO Act."}]
    }
    quar, reason = is_quarantined(doc)
    assert quar is True
    assert "pocso" in reason.lower()

def test_non_quarantine_commercial():
    doc = {
        "cnr": "COMM01012022",
        "jid": "commjid001",
        "parties": {"petitioner": "Apex Ltd", "respondent": "Ports Trust"},
        "statutes": [{"act": "Arbitration Act", "section": "11"}],
        "paragraphs": [{"text": "Commercial dispute arising out of lease agreement."}]
    }
    quar, _ = is_quarantined(doc)
    assert quar is False

def test_quarantine_late_paragraph_pocso():
    # Verify that POCSO appearing beyond paragraph 3 is caught by full-paragraph scan
    doc = {
        "cnr": "TESTCNR999",
        "jid": "latepocso01",
        "parties": {"petitioner": "Petitioner A", "respondent": "State"},
        "statutes": [],
        "paragraphs": [
            {"text": "Introductory facts of the case."},
            {"text": "Counsel appeared for parties."},
            {"text": "Submissions were heard at length."},
            {"text": "Case records perused."},
            {"text": "Charges framed under the POCSO Act for trial."}
        ]
    }
    quar, reason = is_quarantined(doc)
    assert quar is True
    assert "pocso" in reason.lower()

def test_quarantine_in_camera_and_sealed_cover():
    doc = {
        "cnr": "SEALED001",
        "jid": "sealed01",
        "parties": {"petitioner": "Petitioner X", "respondent": "Respondent Y"},
        "paragraphs": [{"text": "Proceedings ordered in-camera; documents kept under sealed cover."}]
    }
    quar, reason = is_quarantined(doc)
    assert quar is True

# ==========================================
# 8. Shard Builder & Packaging Tests
# ==========================================
def test_shard_builder(tmp_path):
    sample_docs = [
        {
            "jid": "jid_test_001",
            "case_number": "WP 100/2022",
            "court_code": "33_10",
            "bench_code": "01",
            "decision_date": "2022-05-10",
            "category": "Writ",
            "disposal_nature": "Allowed",
            "judges": ["Hon'ble Judge A"],
            "parties": {"petitioner": "Alpha Corp", "respondent": "State of Tamil Nadu"},
            "statutes": [{"act_code": "Const", "section": "Article 226"}],
            "sections": [{"tag": "Reasoning & Ratio"}],
            "paragraphs": [{"index": 1, "text": "Paragraph 1 text content."}]
        }
    ]
    meta = build_shards_for_partition("33_10", 2022, sample_docs, str(tmp_path))
    assert meta["court_code"] == "33_10"
    assert meta["year"] == 2022
    assert meta["count"] == 1
    assert os.path.exists(os.path.join(str(tmp_path), "search-33_10-2022.json.gz"))
    assert os.path.exists(os.path.join(str(tmp_path), "docs-33_10-2022.json.gz"))
    assert meta["search_shard_bytes"] > 0
    assert meta["docs_shard_bytes"] > 0
