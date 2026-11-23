import json
from pathlib import Path

def audit_ops():
    base_dir = Path(__file__).resolve().parent.parent
    nightly_file = base_dir / ".github/workflows/nightly.yml"
    ops_doc = base_dir / "docs/ops.md"
    
    with open(nightly_file) as f:
        workflow_text = f.read()
        
    ops_content = ""
    if ops_doc.exists():
        with open(ops_doc) as f:
            ops_content = f.read()
            
    findings = [
        {
            "id": "DEF-OPS-02",
            "severity": "Medium",
            "component": ".github/workflows/nightly.yml",
            "issue": "Unpinned pip dependencies (pip install pymupdf duckdb boto3 jsonschema pytest sentence-transformers) in CI workflow. Vulnerable to upstream breaking changes.",
            "expected": "Dependencies pinned in requirements.lock or requirements-ci.txt."
        },
        {
            "id": "DEF-OPS-03",
            "severity": "High",
            "component": "pipeline/sync_monitor.py",
            "issue": "Nightly sync workflow runs sync_monitor.py which only computes telemetry over existing local shards. It does not execute live incremental delta extraction from AWS S3.",
            "expected": "Incremental crawler queries S3 for new dates, runs PyMuPDF extraction, and emits new delta shards."
        }
    ]
    
    out = {
        "workflow": "nightly.yml",
        "cron_schedule": "0 2 * * *",
        "ops_doc_present": ops_doc.exists(),
        "findings": findings
    }
    
    out_file = base_dir / "audit/ops_audit_report.json"
    with open(out_file, "w") as f:
        json.dump(out, f, indent=2)
    print(f"Ops audit report saved to {out_file}")

if __name__ == "__main__":
    audit_ops()
