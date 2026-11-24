# Nyaya AI Reader — Search Filter Coverage Report

**Release:** NyayaReader v1.2.0 Milestone M6  
**Audited Documents:** 50  
**Compliance Contract:** Filters with non-null coverage $< 5\%$ must be placed behind an Advanced toggle.

---

## 1. Surfaced Core Filters ($\ge 5\%$ Non-Null Coverage)

| Field | Filter UI Label | Non-Null Count | Coverage (%) | UI State |
| :--- | :--- | :---: | :---: | :---: |
| `court_code` | High Court | 50/50 | 100.0% | 🟢 Surfaced (>= 5%) |
| `case_type` | Case Type Prefix | 50/50 | 100.0% | 🟢 Surfaced (>= 5%) |

---

## 2. Advanced / Low-Coverage Filters ($< 5\%$ Coverage)

| `bench_code` | Bench / Seat | 0/50 | 0.0% | 🟡 Hidden (< 5%) |
| `decision_date` | Decision Year / Date | 0/50 | 0.0% | 🟡 Hidden (< 5%) |
| `category` | Subject Category | 0/50 | 0.0% | 🟡 Hidden (< 5%) |
| `disposal_nature` | Disposal Status | 0/50 | 0.0% | 🟡 Hidden (< 5%) |
| `coram_type` | Bench Strength (Coram) | 0/50 | 0.0% | 🟡 Hidden (< 5%) |
| `statutes` | Statutory Provisions | 0/50 | 0.0% | 🟡 Hidden (< 5%) |
| `citations` | Cited Precedents | 0/50 | 0.0% | 🟡 Hidden (< 5%) |
| `classification_metadata` | Classification Metadata | 0/50 | 0.0% | 🟡 Hidden (< 5%) |

---

## 3. UI Implementation Rule
1. Core filters (`court_code`, `decision_date`, `category`, `disposal_nature`, `case_type`, `coram_type`) display live non-null count and percentage badge.
2. Low-coverage attributes are hidden by default behind the **Advanced Filters** toggle in `LeftRailFacets.tsx`.
