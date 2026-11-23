import os
import tempfile
import pytest
from pipeline.sync_monitor import load_corpus_config, inspect_shards, generate_ops_report
from pipeline.shard_builder import build_shards_for_partition

def test_load_corpus_config():
    cfg = load_corpus_config("config/corpus.json")
    assert "pilot_corpus" in cfg
    courts = cfg["pilot_corpus"]["courts"]
    assert len(courts) >= 3
    assert any(c["court_code"] == "33_10" for c in courts)

def test_inspect_shards_and_report_generation():
    with tempfile.TemporaryDirectory() as tmpdir:
        sample_judgments = [
            {
                "jid": "test-sync-1",
                "case_number": "WP 555/2022",
                "court_code": "33_10",
                "bench_code": "01",
                "decision_date": "2022-05-01",
                "parties": {"petitioner": "Petitioner A", "respondent": "Respondent B"},
                "category": "Civil",
                "disposal_nature": "Disposed",
                "judges": ["Honble Judge C"],
                "statutes": [],
                "paragraphs": [{"index": 1, "text": "Sample judgment paragraph text."}],
                "sections": []
            }
        ]
        build_shards_for_partition("33_10", 2022, sample_judgments, tmpdir)

        shards = inspect_shards(tmpdir)
        assert len(shards) == 1
        assert shards[0]["court_code"] == "33_10"
        assert shards[0]["year"] == "2022"
        assert shards[0]["doc_count"] == 1
        assert shards[0]["docs_bytes"] > 0
        assert shards[0]["search_bytes"] > 0

        # Generate report
        cfg = {"pilot_corpus": {"courts": [{"court_code": "33_10", "name": "Madras High Court", "benches": ["mas"], "max_docs": 1000}], "pages_budget_mb": 500}}
        rep_path = os.path.join(tmpdir, "ops_test.md")
        content = generate_ops_report(cfg, shards, rep_path)

        assert "NyayaReader Fleet Operations" in content
        assert "33_10" in content
        assert "Madras High Court" in content
        assert os.path.exists(rep_path)
