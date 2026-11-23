import json
import re
from pathlib import Path

def audit_restricted_content():
    base_dir = Path(__file__).resolve().parent.parent
    cfg_file = base_dir / "config/restricted.json"
    
    with open(cfg_file) as f:
        config = json.load(f)
        
    rules = config.get("restricted_rules", [])
    
    # Test cases representing sensitive legal scenarios
    fixtures = [
        {
            "id": "FIXTURE-POCSO-01",
            "category": "POCSO in Header",
            "text": "Bail application under Section 439 Cr.P.C. in Crime No. 12/2022 for offences under Section 6 of POCSO Act.",
            "in_first_3_paras": True,
            "expected_quarantine": True
        },
        {
            "id": "FIXTURE-POCSO-02-LATE",
            "category": "POCSO Mentioned in Para 8 Only",
            "text": "The victim minor child was subjected to offences under POCSO Act as per medical testimony.",
            "in_first_3_paras": False, # Paragraph 8
            "expected_quarantine": True
        },
        {
            "id": "FIXTURE-JUVENILE-01",
            "category": "Juvenile Conflict with Law",
            "text": "Revision petition under Juvenile Justice Act against refusal of bail to child in conflict with law.",
            "in_first_3_paras": True,
            "expected_quarantine": True
        },
        {
            "id": "FIXTURE-RAPE-NAME-01",
            "category": "Section 376 IPC with Victim Identity (No 228A mention)",
            "text": "Prosecution under Section 376 IPC. The prosecutrix Kumari Sunita Devi, daughter of Ram Lal...",
            "in_first_3_paras": True,
            "expected_quarantine": True
        },
        {
            "id": "FIXTURE-IN-CAMERA-01",
            "category": "In-Camera / Prohibited Publication Marker",
            "text": "Proceedings directed to be conducted in-camera. Publication of evidence strictly prohibited.",
            "in_first_3_paras": True,
            "expected_quarantine": True
        },
        {
            "id": "FIXTURE-MATRIMONIAL-SEALED-01",
            "category": "Matrimonial Custody Sealed Cover",
            "text": "Custody dispute under Guardians and Wards Act. Record submitted in sealed cover.",
            "in_first_3_paras": True,
            "expected_quarantine": True
        }
    ]
    
    results = []
    for fix in fixtures:
        matched = False
        matched_rule = None
        
        # Test against current regexes
        for r in rules:
            if re.search(r["pattern"], fix["text"], re.IGNORECASE):
                matched = True
                matched_rule = r["rule_id"]
                break
                
        # Also note the 3-paragraph inspection limitation
        leaks_due_to_late_mention = matched and not fix["in_first_3_paras"]
        
        status = "QUARANTINED" if (matched and not leaks_due_to_late_mention) else "LEAKED"
        
        results.append({
            "fixture_id": fix["id"],
            "category": fix["category"],
            "status": status,
            "matched_rule": matched_rule,
            "leaks_into_production": status == "LEAKED",
            "root_cause": (
                "Only first 3 paragraphs inspected in pipeline/quarantine.py line 56" if leaks_due_to_late_mention
                else ("Missing regex pattern in config/restricted.json" if not matched else "None")
            )
        })
        
    out = {
        "active_rules_count": len(rules),
        "active_rules": [r["rule_id"] for r in rules],
        "test_results": results,
        "vulnerabilities": [
            "DEF-SEC-01: pipeline/quarantine.py only checks paragraphs[:3], leaking sensitive content in subsequent paragraphs.",
            "DEF-SEC-02: No rule for in-camera / prohibited publication / sealed cover markers.",
            "DEF-SEC-03: No rule for Section 376 IPC / sexual assault victim names unless Section 228A is explicitly cited."
        ]
    }
    
    out_file = base_dir / "audit/restricted_content_report.json"
    with open(out_file, "w") as f:
        json.dump(out, f, indent=2)
    print(f"Restricted content report saved to {out_file}")

if __name__ == "__main__":
    audit_restricted_content()
