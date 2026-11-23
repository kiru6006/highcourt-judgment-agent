#!/usr/bin/env python3
"""
NyayaReader Automated Judicial Takedown & Redaction Engine
Processes statutory takedowns (POCSO s.74, s.228A IPC / s.72 BNS, matrimonial anonymity,
and High Court registry orders). Purges records from search shards, full text documents,
and manifest, maintaining an immutable audit log.
"""

import os
import sys
import json
import gzip
import glob
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, Set

from pipeline.manifest_builder import build_manifest

def load_takedown_config(config_path: str) -> List[Dict[str, Any]]:
    if not os.path.exists(config_path):
        return []
    with open(config_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        if isinstance(data, dict):
            return data.get("takedowns", [])
        elif isinstance(data, list):
            return data
        return []

def purge_shards(
    takedown_list: List[Dict[str, Any]],
    shard_dir: str,
    audit_log_path: str = "takedown-audit.log"
) -> Dict[str, Any]:
    """
    Purges judgments in takedown_list from shard_dir.
    Returns summary stats.
    """
    if not os.path.exists(shard_dir):
        return {"purged_count": 0, "affected_shards": []}

    blocked_jids: Set[str] = {t["jid"] for t in takedown_list if "jid" in t}
    blocked_case_nos: Set[str] = {t["case_no"].strip().lower() for t in takedown_list if "case_no" in t}

    if not blocked_jids and not blocked_case_nos:
        return {"purged_count": 0, "affected_shards": []}

    purged_records = []
    affected_shards = set()

    # 1. Process docs-*.json.gz
    for docs_path in glob.glob(os.path.join(shard_dir, "docs-*.json.gz")):
        with gzip.open(docs_path, "rt", encoding="utf-8") as f:
            docs = json.load(f)

        orig_len = len(docs)
        retained_docs = []
        for d in docs:
            jid = d.get("jid")
            cno = d.get("case_number", "").strip().lower()
            if jid in blocked_jids or cno in blocked_case_nos:
                purged_records.append({
                    "jid": jid,
                    "case_number": d.get("case_number"),
                    "shard": os.path.basename(docs_path),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
            else:
                retained_docs.append(d)

        if len(retained_docs) < orig_len:
            affected_shards.add(os.path.basename(docs_path))
            with gzip.open(docs_path, "wt", encoding="utf-8") as f:
                json.dump(retained_docs, f, ensure_ascii=False)

    # 2. Process search-*.json.gz
    for search_path in glob.glob(os.path.join(shard_dir, "search-*.json.gz")):
        with gzip.open(search_path, "rt", encoding="utf-8") as f:
            records = json.load(f)

        orig_len = len(records)
        retained_records = []
        for r in records:
            jid = r.get("jid")
            cno = r.get("case_no", "").strip().lower()
            if jid in blocked_jids or cno in blocked_case_nos:
                pass
            else:
                retained_records.append(r)

        if len(retained_records) < orig_len:
            affected_shards.add(os.path.basename(search_path))
            with gzip.open(search_path, "wt", encoding="utf-8") as f:
                json.dump(retained_records, f, ensure_ascii=False)

    # 3. Update manifest fragment manifest-*.json if present
    for mf_path in glob.glob(os.path.join(shard_dir, "manifest-*.json")):
        with open(mf_path, "r", encoding="utf-8") as f:
            frag = json.load(f)
        shard_id = frag.get("shard_id")
        docs_file = os.path.join(shard_dir, f"docs-{shard_id}.json.gz")
        if os.path.exists(docs_file):
            with gzip.open(docs_file, "rt", encoding="utf-8") as f:
                current_docs = json.load(f)
            frag["doc_count"] = len(current_docs)
            frag["count"] = len(current_docs)
            with open(mf_path, "w", encoding="utf-8") as f:
                json.dump(frag, f, indent=2)

    # 4. Rebuild manifest.json
    manifest_out = os.path.join(shard_dir, "manifest.json")
    try:
        build_manifest(shard_dir, manifest_out)
    except Exception as e:
        print(f"Warning: Manifest rebuild failed: {e}")

    # 5. Append to Audit Log
    if purged_records:
        with open(audit_log_path, "a", encoding="utf-8") as log:
            for p in purged_records:
                log.write(f"[{p['timestamp']}] PURGED JID={p['jid']} CASE={p['case_number']} SHARD={p['shard']}\n")

    return {
        "purged_count": len(purged_records),
        "affected_shards": list(affected_shards)
    }

def main():
    config_path = "config/takedown.json"
    takedowns = load_takedown_config(config_path)
    print(f"Loaded {len(takedowns)} takedown rules from {config_path}")

    shard_dirs = ["web/public/data-sample", "data/shards"]
    for sdir in shard_dirs:
        if os.path.exists(sdir):
            res = purge_shards(takedowns, sdir)
            print(f"Directory {sdir}: {res['purged_count']} records purged across shards {res['affected_shards']}")

if __name__ == "__main__":
    main()
