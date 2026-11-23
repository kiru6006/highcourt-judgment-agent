import json
import gzip
import os
import glob
from pathlib import Path

def audit_corpus():
    base_dir = Path(__file__).resolve().parent.parent
    sample_dir = base_dir / "web/public/data-sample"
    shards_dir = base_dir / "data/shards"
    
    report = {
        "shards": [],
        "sample_shards": [],
        "synthetic_in_source": False,
        "metrics": {}
    }
    
    # 1. Inspect production data shards if present
    total_docs = 0
    courts = set()
    years = set()
    tagged_sections_count = 0
    total_paras = 0
    placeholder_metadata_count = 0
    
    target_files = list(shards_dir.glob("docs-*.json.gz")) or list(sample_dir.glob("docs-*.json.gz"))
    
    for f in target_files:
        size_bytes = f.stat().st_size
        size_mb = size_bytes / (1024 * 1024)
        
        with gzip.open(f, "rt", encoding="utf-8") as gz:
            data = json.load(gz)
            count = len(data) if isinstance(data, list) else len(data.get("documents", []))
            docs = data if isinstance(data, list) else data.get("documents", [])
            
            for doc in docs:
                total_docs += 1
                courts.add(doc.get("court", "Unknown"))
                years.add(doc.get("year", 0))
                
                # Check tagged sections
                sections = doc.get("sections", {})
                if sections:
                    if isinstance(sections, dict) and any(sections.values()):
                        tagged_sections_count += 1
                    elif isinstance(sections, list) and len(sections) > 0:
                        tagged_sections_count += 1
                
                paras = doc.get("paragraphs", [])
                total_paras += len(paras)
                
                # Check for synthetic/placeholder strings
                case_num = str(doc.get("caseNumber", ""))
                petitioner = str(doc.get("petitioner", ""))
                judge = str(doc.get("judge", ""))
                if "HCMA01" in case_num or "Applicant (" in petitioner or "Hon'ble High Court Judge" in judge:
                    placeholder_metadata_count += 1
                    
        report["shards"].append({
            "file": f.name,
            "size_mb": round(size_mb, 4),
            "doc_count": count,
            "within_25mb_limit": size_mb <= 25.0
        })

    # Check manifest
    manifest_file = sample_dir / "manifest.json"
    manifest_data = {}
    if manifest_file.exists():
        with open(manifest_file, "r") as mf:
            manifest_data = json.load(mf)
            
    # Check synthetic fixture reachability
    synthetic_fixture_file = base_dir / "web/src/fixtures/synthetic-judgments.ts"
    if synthetic_fixture_file.exists():
        report["synthetic_fixture_present"] = True
        with open(synthetic_fixture_file, "r") as sff:
            s_content = sff.read()
            report["synthetic_judgments_count"] = s_content.count("jid:")

    report["metrics"] = {
        "total_documents_indexed": total_docs,
        "unique_courts": list(courts),
        "unique_years": sorted(list(years)),
        "average_paragraphs_per_doc": round(total_paras / max(1, total_docs), 2),
        "docs_with_tagged_sections": tagged_sections_count,
        "tagged_sections_percentage": round((tagged_sections_count / max(1, total_docs)) * 100, 2),
        "placeholder_metadata_count": placeholder_metadata_count,
        "placeholder_metadata_percentage": round((placeholder_metadata_count / max(1, total_docs)) * 100, 2),
        "manifest_reported_docs": manifest_data.get("total_documents", "N/A"),
        "manifest_as_of": manifest_data.get("as_of", "N/A"),
        "manifest_embedding_model": manifest_data.get("embedding_model", "N/A")
    }
    
    out_file = base_dir / "audit/corpus_reality_report.json"
    with open(out_file, "w") as out:
        json.dump(report, out, indent=2)
    print(f"Corpus reality audit saved to {out_file}")

if __name__ == "__main__":
    audit_corpus()
