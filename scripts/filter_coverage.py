#!/usr/bin/env python3
"""
Nyaya AI Reader — Filter Coverage Analyzer (v1.2.0 M6)
Calculates non-null coverage for all search filters across corpus.
Generates docs/FILTER_COVERAGE_REPORT.md programmatically.
Filters with < 5% coverage are flagged to be hidden behind the Advanced toggle.
"""

import os
import sys
import json
from typing import Dict, Any, List

def calculate_filter_coverage(corpus: List[Dict[str, Any]]) -> Dict[str, Any]:
    total_docs = len(corpus)
    if total_docs == 0:
        return {}

    attributes = {
        "court_code": "High Court",
        "bench_code": "Bench / Seat",
        "decision_date": "Decision Year / Date",
        "category": "Subject Category",
        "disposal_nature": "Disposal Status",
        "coram_type": "Bench Strength (Coram)",
        "case_type": "Case Type Prefix",
        "statutes": "Statutory Provisions",
        "citations": "Cited Precedents",
        "classification_metadata": "Classification Metadata"
    }

    coverage_data = {}

    for attr, label in attributes.items():
        non_null_count = 0
        for doc in corpus:
            val = doc.get(attr)
            if val is not None and val != "" and val != []:
                non_null_count += 1

        percentage = (non_null_count / total_docs) * 100.0
        is_advanced = percentage < 5.0

        coverage_data[attr] = {
            "label": label,
            "nonNullCount": non_null_count,
            "totalCount": total_docs,
            "percentage": percentage,
            "isAdvanced": is_advanced
        }

    return coverage_data

def run_filter_coverage_report(
    corpus_files: List[str] = ["eval/eval_taxonomy_50.json", "data/shards/doc_shard_0.json"],
    output_path: str = "docs/FILTER_COVERAGE_REPORT.md"
):
    corpus: List[Dict[str, Any]] = []

    for fpath in corpus_files:
        if os.path.exists(fpath):
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    corpus.extend(data)
                elif isinstance(data, dict):
                    if "documents" in data:
                        corpus.extend(data["documents"])
                    else:
                        corpus.append(data)

    if not corpus:
        # Fallback to evaluation set
        with open("eval/eval_taxonomy_50.json", "r", encoding="utf-8") as f:
            corpus = json.load(f)

    stats = calculate_filter_coverage(corpus)

    rows = []
    advanced_rows = []

    for attr, info in stats.items():
        status_badge = "🟡 Hidden (< 5%)" if info["isAdvanced"] else "🟢 Surfaced (>= 5%)"
        row_str = f"| `{attr}` | {info['label']} | {info['nonNullCount']}/{info['totalCount']} | {info['percentage']:.1f}% | {status_badge} |"
        if info["isAdvanced"]:
            advanced_rows.append(row_str)
        else:
            rows.append(row_str)

    report_md = f"""# Nyaya AI Reader — Search Filter Coverage Report

**Release:** NyayaReader v1.2.0 Milestone M6  
**Audited Documents:** {len(corpus)}  
**Compliance Contract:** Filters with non-null coverage $< 5\\%$ must be placed behind an Advanced toggle.

---

## 1. Surfaced Core Filters ($\\ge 5\\%$ Non-Null Coverage)

| Field | Filter UI Label | Non-Null Count | Coverage (%) | UI State |
| :--- | :--- | :---: | :---: | :---: |
{chr(10).join(rows)}

---

## 2. Advanced / Low-Coverage Filters ($< 5\\%$ Coverage)

{chr(10).join(advanced_rows) if advanced_rows else "*None. All evaluated primary filters possess >= 5% non-null coverage.*"}

---

## 3. UI Implementation Rule
1. Core filters (`court_code`, `decision_date`, `category`, `disposal_nature`, `case_type`, `coram_type`) display live non-null count and percentage badge.
2. Low-coverage attributes are hidden by default behind the **Advanced Filters** toggle in `LeftRailFacets.tsx`.
"""

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report_md)

    print(f"Filter coverage report generated at {output_path}")

if __name__ == "__main__":
    run_filter_coverage_report()
