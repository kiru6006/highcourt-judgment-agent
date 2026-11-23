#!/usr/bin/env python3
"""
Size and Budget Projection Probe for NyayaReader
Calculates empirical size model and budget forecast for GitHub Pages artifact limits.
"""

import json
import os

def compute_size_model():
    print("=== Computing Empirical Size Model ===")
    
    # Load measured extraction figures
    with open("config/extraction.discovered.json") as f:
        ext = json.load(f)

    avg_chars_per_doc = ext["avg_pages_per_doc"] * ext["avg_chars_per_page"]
    avg_tokens_per_doc = ext["avg_tokens_per_doc"]

    # Model parameters
    chunk_token_size = 300
    avg_chunks_per_doc = max(1.0, round(avg_tokens_per_doc / chunk_token_size, 2))
    
    # 1. Full text shard bytes (JSON)
    raw_text_bytes_doc = avg_chars_per_doc
    doc_json_bytes_doc = raw_text_bytes_doc + 600  # including paragraph arrays, section tags
    doc_json_gz_bytes_doc = doc_json_bytes_doc / 3.8  # standard ~3.8x gzip ratio on legal text

    # 2. Search record shard bytes (BM25 search document)
    search_json_bytes_doc = 650
    search_json_gz_bytes_doc = search_json_bytes_doc / 3.2

    # 3. Vector embeddings (.bin)
    # 384 dims int8 (384 bytes) + 4 bytes float32 scale = 388 bytes per chunk
    vec_bytes_per_chunk = 388
    vec_bytes_doc = avg_chunks_per_doc * vec_bytes_per_chunk

    # Total per document
    total_bytes_per_doc = doc_json_gz_bytes_doc + search_json_gz_bytes_doc + vec_bytes_doc
    total_kb_per_doc = total_bytes_per_doc / 1024

    # Budget forecasts
    PAGES_BUDGET_MB = 500
    SHARD_MAX_MB = 25

    max_docs_under_budget = int((PAGES_BUDGET_MB * 1024 * 1024) / total_bytes_per_doc)
    docs_per_25mb_shard = int((SHARD_MAX_MB * 1024 * 1024) / (doc_json_bytes_doc + search_json_bytes_doc))

    # Pilot corpus scenarios
    scenarios = {
        "pilot_conservative_10k": 10000,
        "pilot_standard_30k": 30000,
        "pilot_extended_50k": 50000,
    }

    projections = {}
    for name, count in scenarios.items():
        mb_total = (count * total_bytes_per_doc) / (1024 * 1024)
        projections[name] = {
            "document_count": count,
            "projected_total_mb": round(mb_total, 2),
            "pct_of_500mb_budget": round((mb_total / PAGES_BUDGET_MB) * 100, 1)
        }

    results = {
        "measured_inputs": {
            "avg_pages_per_doc": round(ext["avg_pages_per_doc"], 2),
            "avg_chars_per_doc": round(avg_chars_per_doc, 0),
            "avg_tokens_per_doc": round(avg_tokens_per_doc, 0),
            "avg_chunks_per_doc": avg_chunks_per_doc,
        },
        "per_document_footprint": {
            "doc_text_json_gz_bytes": round(doc_json_gz_bytes_doc, 0),
            "search_index_json_gz_bytes": round(search_json_gz_bytes_doc, 0),
            "int8_vectors_bin_bytes": round(vec_bytes_doc, 0),
            "total_bytes_per_judgment": round(total_bytes_per_doc, 0),
            "total_kb_per_judgment": round(total_kb_per_doc, 2)
        },
        "limits": {
            "pages_budget_mb": PAGES_BUDGET_MB,
            "max_judgments_under_pages_budget": max_docs_under_budget,
            "max_judgments_per_25mb_shard": docs_per_25mb_shard
        },
        "scenarios": projections
    }

    print(f"Per-Document Footprint: {total_kb_per_doc:.2f} KB / doc")
    print(f"  - Document JSON gz  : {doc_json_gz_bytes_doc:.0f} B")
    print(f"  - Search JSON gz    : {search_json_gz_bytes_doc:.0f} B")
    print(f"  - Int8 Vectors (.bin): {vec_bytes_doc:.0f} B")
    print(f"\nMax Judgments under 500 MB budget: {max_docs_under_budget:,} documents")
    print("\nPilot Scenario Forecasts:")
    for name, sc in projections.items():
        print(f"  - {name:<22}: {sc['document_count']:,} docs -> {sc['projected_total_mb']} MB ({sc['pct_of_500mb_budget']}% of Pages budget)")

    with open("config/size_model.discovered.json", "w") as f:
        json.dump(results, f, indent=2)
    print("\nSaved config/size_model.discovered.json!")

if __name__ == "__main__":
    compute_size_model()
