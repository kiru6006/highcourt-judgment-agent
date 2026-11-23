#!/usr/bin/env python3
"""
NyayaReader Master Manifest Builder
Scans a shard directory and generates a production-ready manifest.json
containing metadata, SHA-256 integrity hashes, byte sizes, and document counts.
"""

import os
import sys
import json
import hashlib
import glob
from pathlib import Path
from datetime import datetime, timezone

def compute_sha256(filepath: str) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def build_manifest(shards_dir: str, output_path: str):
    shards_dir_path = Path(shards_dir)
    if not shards_dir_path.exists():
        raise FileNotFoundError(f"Directory {shards_dir} does not exist.")

    manifest_files = sorted(glob.glob(str(shards_dir_path / "manifest-*.json")))
    search_files = sorted(glob.glob(str(shards_dir_path / "search-*.json.gz")))
    docs_files = sorted(glob.glob(str(shards_dir_path / "docs-*.json.gz")))

    total_docs = 0
    shards = []

    # Map by shard_id
    search_map = {}
    for sf in search_files:
        name = os.path.basename(sf)
        # e.g. search-33_10-2022.json.gz -> 33_10-2022
        shard_id = name.replace("search-", "").replace(".json.gz", "")
        search_map[shard_id] = sf

    docs_map = {}
    for df in docs_files:
        name = os.path.basename(df)
        shard_id = name.replace("docs-", "").replace(".json.gz", "")
        docs_map[shard_id] = df

    for mf in manifest_files:
        with open(mf, "r", encoding="utf-8") as f:
            frag = json.load(f)
        
        court = frag.get("court") or frag.get("court_code")
        year = frag.get("year")
        shard_id = frag.get("shard_id") or f"{court}-{year}"
        doc_count = frag.get("doc_count") or frag.get("count", 0)
        total_docs += doc_count

        search_file = search_map.get(shard_id)
        docs_file = docs_map.get(shard_id)

        search_info = None
        if search_file and os.path.exists(search_file):
            search_info = {
                "file": os.path.basename(search_file),
                "bytes": os.path.getsize(search_file),
                "sha256": compute_sha256(search_file)
            }
        elif "search_shard_url" in frag:
            search_info = {
                "file": os.path.basename(frag["search_shard_url"]),
                "bytes": frag.get("search_shard_bytes", 0),
                "sha256": frag.get("search_shard_sha256", "")
            }

        docs_info = None
        if docs_file and os.path.exists(docs_file):
            docs_info = {
                "file": os.path.basename(docs_file),
                "bytes": os.path.getsize(docs_file),
                "sha256": compute_sha256(docs_file)
            }
        elif "docs_shard_url" in frag:
            docs_info = {
                "file": os.path.basename(frag["docs_shard_url"]),
                "bytes": frag.get("docs_shard_bytes", 0),
                "sha256": frag.get("docs_shard_sha256", "")
            }

        shards.append({
            "shard_id": shard_id,
            "court": court,
            "year": year,
            "doc_count": doc_count,
            "search": search_info,
            "docs": docs_info
        })

    manifest = {
        "version": "1.0.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_shards": len(shards),
        "total_docs": total_docs,
        "shards": shards
    }

    out_p = Path(output_path)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    with open(out_p, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"Manifest written to {output_path} with {len(shards)} shards and {total_docs} docs.")
    return manifest

if __name__ == "__main__":
    src_dir = sys.argv[1] if len(sys.argv) > 1 else "data/shards"
    out_file = sys.argv[2] if len(sys.argv) > 2 else "data/shards/manifest.json"
    build_manifest(src_dir, out_file)
