import csv
import json
from pathlib import Path

def audit_statute_bridge():
    base_dir = Path(__file__).resolve().parent.parent
    csv_path = base_dir / "data/mappings/statute_transitions.csv"
    
    rows = []
    test_only_count = 0
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)
            if "TEST_ONLY" in str(r.values()):
                test_only_count += 1
                
    # 20 key statutory transition provisions requiring human gazette verification:
    spot_check_provisions = [
        {"old_act": "CrPC", "old_section": "482", "new_act": "BNSS", "new_section": "528", "subject": "Inherent powers of High Court"},
        {"old_act": "CrPC", "old_section": "438", "new_act": "BNSS", "new_section": "482", "subject": "Anticipatory bail"},
        {"old_act": "CrPC", "old_section": "439", "new_act": "BNSS", "new_section": "483", "subject": "Special powers of High Court/Sessions regarding bail"},
        {"old_act": "CrPC", "old_section": "167", "new_act": "BNSS", "new_section": "187", "subject": "Remand & Police Custody duration (substantive alteration)"},
        {"old_act": "CrPC", "old_section": "154", "new_act": "BNSS", "new_section": "173", "subject": "First Information Report (FIR) / e-FIR"},
        {"old_act": "CrPC", "old_section": "313", "new_act": "BNSS", "new_section": "351", "subject": "Examination of accused"},
        {"old_act": "CrPC", "old_section": "173(8)", "new_act": "BNSS", "new_section": "193(9)", "subject": "Further investigation"},
        {"old_act": "CrPC", "old_section": "41A", "new_act": "BNSS", "new_section": "35(3)", "subject": "Notice of appearance before police officer"},
        {"old_act": "IPC", "old_section": "420", "new_act": "BNS", "new_section": "318(4)", "subject": "Cheating and dishonestly inducing delivery"},
        {"old_act": "IPC", "old_section": "406", "new_act": "BNS", "new_section": "316(2)", "subject": "Criminal breach of trust"},
        {"old_act": "IPC", "old_section": "302", "new_act": "BNS", "new_section": "103(1)", "subject": "Punishment for murder"},
        {"old_act": "IPC", "old_section": "307", "new_act": "BNS", "new_section": "109", "subject": "Attempt to murder"},
        {"old_act": "IPC", "old_section": "376", "new_act": "BNS", "new_section": "64", "subject": "Punishment for rape"},
        {"old_act": "IPC", "old_section": "498A", "new_act": "BNS", "new_section": "85", "subject": "Cruelty by husband or relatives"},
        {"old_act": "IPC", "old_section": "120B", "new_act": "BNS", "new_section": "61(2)", "subject": "Criminal conspiracy"},
        {"old_act": "IPC", "old_section": "124A", "new_act": "BNS", "new_section": "152", "subject": "Endangering sovereignty, unity and integrity (Sedition replaced)"},
        {"old_act": "IPC", "old_section": "304A", "new_act": "BNS", "new_section": "106", "subject": "Causing death by negligence (hit & run)"},
        {"old_act": "IEA", "old_section": "65B", "new_act": "BSA", "new_section": "63", "subject": "Admissibility of electronic records"},
        {"old_act": "IEA", "old_section": "27", "new_act": "BSA", "new_section": "23", "subject": "Discovery of facts based on information received from accused"},
        {"old_act": "IEA", "old_section": "114A", "new_act": "BSA", "new_section": "119", "subject": "Presumption as to absence of consent in certain rape prosecutions"}
    ]
    
    report = {
        "source_file": "data/mappings/statute_transitions.csv",
        "current_indexed_mappings_count": len(rows),
        "test_only_guard_passed": test_only_count == 0,
        "test_only_rows_found": test_only_count,
        "current_rows": rows,
        "spot_check_candidates": spot_check_provisions
    }
    
    out_file = base_dir / "audit/statute_bridge_report.json"
    with open(out_file, "w") as f:
        json.dump(report, f, indent=2)
    print(f"Statute bridge audit saved to {out_file}")

if __name__ == "__main__":
    audit_statute_bridge()
