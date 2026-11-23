import os
import json
import gzip
import tempfile
import pytest
from pipeline.takedown import purge_shards
from pipeline.shard_builder import build_shards_for_partition

def test_takedown_purge_workflow():
    with tempfile.TemporaryDirectory() as tmpdir:
        # Create dummy judgments
        sample_judgments = [
            {
                "jid": "keep-001",
                "case_number": "WP 100/2022",
                "court_code": "33_10",
                "bench_code": "01",
                "decision_date": "2022-01-01",
                "parties": {"petitioner": "Alpha Corp", "respondent": "State"},
                "category": "Civil",
                "disposal_nature": "Dismissed",
                "judges": ["Honble Judge A"],
                "statutes": [{"act_code": "CPC", "section": "11"}],
                "paragraphs": [{"index": 1, "text": "This is a civil petition."}],
                "sections": []
            },
            {
                "jid": "takedown-target-002",
                "case_number": "Crl.OP 200/2022",
                "court_code": "33_10",
                "bench_code": "01",
                "decision_date": "2022-01-02",
                "parties": {"petitioner": "Confidential", "respondent": "State"},
                "category": "Criminal",
                "disposal_nature": "Allowed",
                "judges": ["Honble Judge B"],
                "statutes": [{"act_code": "CrPC", "section": "482"}],
                "paragraphs": [{"index": 1, "text": "Sensitive matter subject to takedown."}],
                "sections": []
            }
        ]

        # Build initial shards
        build_shards_for_partition("33_10", 2022, sample_judgments, tmpdir)
        
        # Verify both records exist
        docs_file = os.path.join(tmpdir, "docs-33_10-2022.json.gz")
        search_file = os.path.join(tmpdir, "search-33_10-2022.json.gz")
        with gzip.open(docs_file, "rt", encoding="utf-8") as f:
            docs = json.load(f)
        assert len(docs) == 2

        # Run takedown purge
        takedown_rules = [
            {
                "jid": "takedown-target-002",
                "case_no": "Crl.OP 200/2022",
                "reason": "Court redaction order",
                "requested_by": "High Court Registry",
                "date_added": "2026-01-15",
                "court_order_ref": "ORDER-99"
            }
        ]
        audit_log = os.path.join(tmpdir, "audit.log")
        res = purge_shards(takedown_rules, tmpdir, audit_log_path=audit_log)

        assert res["purged_count"] == 1
        assert "docs-33_10-2022.json.gz" in res["affected_shards"]

        # Verify target is removed from docs
        with gzip.open(docs_file, "rt", encoding="utf-8") as f:
            docs_after = json.load(f)
        assert len(docs_after) == 1
        assert docs_after[0]["jid"] == "keep-001"

        # Verify target is removed from search
        with gzip.open(search_file, "rt", encoding="utf-8") as f:
            search_after = json.load(f)
        assert len(search_after) == 1
        assert search_after[0]["jid"] == "keep-001"

        # Verify audit log exists
        assert os.path.exists(audit_log)
        with open(audit_log, "r", encoding="utf-8") as f:
            content = f.read()
        assert "takedown-target-002" in content
