"""
Shard Builder & Manifest Generator for NyayaReader.
Partitions judgments into compressed court-year shards under 25 MB.
"""

import gzip
import hashlib
import json
import os
from typing import List, Dict, Any

def compute_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def build_shards_for_partition(
    court_code: str,
    year: int,
    judgments: List[Dict[str, Any]],
    output_dir: str
) -> Dict[str, Any]:
    """
    Builds:
    - search-{court}-{year}.json.gz (SearchRecord list)
    - docs-{court}-{year}.json.gz (Full JudgmentDocument list)
    Returns shard manifest entry.
    """
    os.makedirs(output_dir, exist_ok=True)
    norm_court = court_code.replace("~", "_")

    # 1. Build Search Records
    search_records = []
    for d in judgments:
        ratio_p = next((p["text"] for p in d.get("paragraphs", []) if p.get("section_tag") == "Reasoning & Ratio"), "")
        excerpt = ratio_p[:250] if ratio_p else (d.get("paragraphs", [{}])[0].get("text", "")[:250])
        search_records.append({
            "jid": d["jid"],
            "title": f"{d['parties']['petitioner']} v. {d['parties']['respondent']}",
            "case_no": d["case_number"],
            "court_code": d["court_code"],
            "bench_code": d["bench_code"],
            "year": year,
            "date": d["decision_date"],
            "category": d["category"],
            "disposal": d["disposal_nature"],
            "judges": d["judges"],
            "statutes": [f"{s['act_code']}:{s['section']}" for s in d.get("statutes", [])],
            "excerpt": excerpt,
            "has_structured_brief": any(s["tag"] == "Reasoning & Ratio" for s in d.get("sections", [])),
        })

    # 2. Serialize and Compress Search Shard
    search_json_bytes = json.dumps(search_records, ensure_ascii=False).encode("utf-8")
    search_gz = gzip.compress(search_json_bytes, compresslevel=9)
    search_filename = f"search-{norm_court}-{year}.json.gz"
    search_path = os.path.join(output_dir, search_filename)
    with open(search_path, "wb") as f:
        f.write(search_gz)

    # 3. Serialize and Compress Docs Shard
    docs_json_bytes = json.dumps(judgments, ensure_ascii=False).encode("utf-8")
    docs_gz = gzip.compress(docs_json_bytes, compresslevel=9)
    docs_filename = f"docs-{norm_court}-{year}.json.gz"
    docs_path = os.path.join(output_dir, docs_filename)
    with open(docs_path, "wb") as f:
        f.write(docs_gz)

    # 4. Manifest Fragment
    shard_meta = {
        "court_code": court_code,
        "year": year,
        "count": len(judgments),
        "search_shard_url": f"data/shards/{search_filename}",
        "search_shard_bytes": len(search_gz),
        "search_shard_sha256": compute_sha256(search_gz),
        "docs_shard_url": f"data/shards/{docs_filename}",
        "docs_shard_bytes": len(docs_gz),
        "docs_shard_sha256": compute_sha256(docs_gz),
    }

    return shard_meta
