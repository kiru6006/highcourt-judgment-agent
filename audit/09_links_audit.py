import json
from pathlib import Path

def audit_links():
    base_dir = Path(__file__).resolve().parent.parent
    links_file = base_dir / "config/links.json"
    
    with open(links_file) as f:
        data = json.load(f)
        
    portals = data.get("portals", {})
    courts = portals.get("courts", {})
    
    results = []
    
    # Check top-level portals
    for k in ["ecourts_cnr", "ecourts_search", "indian_kanoon", "google_scholar"]:
        p = portals.get(k, {})
        tmpl = p.get("template", "")
        results.append({
            "target": k,
            "template": tmpl,
            "status": "VALID" if "{" in tmpl else "SUSPICIOUS",
            "notes": p.get("description", "")
        })
        
    # Check court portals
    for ccode, cinfo in courts.items():
        portal_url = cinfo.get("portal_url", "")
        judis_url = cinfo.get("judis_search_url", "")
        
        # Spot typographical errors
        is_typo = "hihecourt" in portal_url or "hihecourt" in judis_url
        
        results.append({
            "target": f"court_{ccode}_{cinfo.get('name')}",
            "portal_url": portal_url,
            "judis_url": judis_url,
            "status": "TYPO_FOUND" if is_typo else "VALID_SYNTAX",
            "notes": "Typo in domain 'karnatakahihecourt.kar.nic.in' instead of 'karnatakahighcourt.kar.nic.in'" if is_typo else "OK"
        })
        
    out = {
        "version": data.get("version"),
        "last_verified": data.get("last_verified"),
        "links_checked": len(results),
        "defects": [r for r in results if r["status"] == "TYPO_FOUND"],
        "all_results": results
    }
    
    out_file = base_dir / "audit/links_audit_report.json"
    with open(out_file, "w") as f:
        json.dump(out, f, indent=2)
    print(f"Links audit report saved to {out_file}")

if __name__ == "__main__":
    audit_links()
