# NyayaReader / Nyaya AI Reader: Data Quality Report

**Corpus Analyzed:** Madras High Court Pilot Shard (`docs-33_10-2022.json.gz`)  
**Total Documents:** 46  
**Total Shard Size:** 49.2 KB (compressed)  

---

## 1. Corpus Consistency Metrics

| Metric | Measured Value | Standard Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Total Real Judgments** | 46 | >= 40 | **PASS** |
| **Missing Case Numbers** | 0 (0.0%) | 0.0% | **PASS** |
| **Missing Decision Dates** | 0 (0.0%) | < 2.0% | **PASS** |
| **Missing Court Identifiers** | 0 (0.0%) | 0.0% | **PASS** |
| **Empty Text Orders (< 150 chars)**| 0 (0.0%) | < 5.0% | **PASS** |
| **Average Paragraphs per Case** | 12.4 | >= 4.0 | **PASS** |
| **Synthetic Fixture Segregation** | Clean (`web/src/fixtures/`) | 100% segregated | **PASS** |

---

## 2. Statutory Quarantine Verification

- **Quarantine Engine**: `pipeline/quarantine.py`
- **Active Regex Rules**: POCSO Act, Section 228A IPC (rape victim identity), Juvenile Justice Act, In-Camera proceedings, Matrimonial privacy.
- **Audit Result**: Zero quarantined cases exist in the public `data/shards/` repository. Test fixtures in `audit/06_restricted_audit.py` successfully trigger quarantine rejection.
