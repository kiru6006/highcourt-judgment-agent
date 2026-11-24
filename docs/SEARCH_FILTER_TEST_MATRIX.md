# Search Filter Test Matrix & Acceptance Verification (v1.3.0)

**Date:** 2026-11-24  
**Scope:** Test scenarios, edge cases, and expected outputs across all 11 filter groups.

---

## 1. Filter Execution Test Matrix

| Test ID | Filter Group(s) Tested | Input Condition | Expected Behavioral Invariant | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Group A: Basic Search | `q = "quash charge sheet"` | Returns judgments containing terms in title/excerpt, BM25 scored $> 0$. | PASS |
| **TC-02** | Group A: Exact Case No | `caseNumber = "1234/2022"` | Matches `Crl.O.P. No. 1234 of 2022` ignoring spaces and punctuation. | PASS |
| **TC-03** | Group B: Court Multi-Select | `courts = ["33_10", "7_26"]` | Returns union of Madras and Delhi HC judgments (**OR** within facet). | PASS |
| **TC-04** | Group B: Dependent Benches | Select `Madras High Court` | Bench filter choices dynamically display `Principal Seat at Chennai` and `Madurai Bench`. | PASS |
| **TC-05** | Group C: 5-Year Date Range | `yearFrom = 2022, yearTo = 2026` | Judgments filtered to date boundaries $\ge 2022\text{-}01\text{-}01$ and $\le 2026\text{-}11\text{-}24$. | PASS |
| **TC-06** | Group C: Quick Shortcut | `dateShortcut = "30d"` | Dynamically computes 30-day lookback from cutoff date (`2026-11-24`). | PASS |
| **TC-07** | Group D: Case Type | `caseTypes = ["FIR Quashing Petition"]` | Filters judgments matching normalized type or raw code `CRL.OP`. | PASS |
| **TC-08** | Group E: 13 Domains | `categories = ["Criminal Law", "Constitutional Law"]` | Multi-label evaluation matching either domain. | PASS |
| **TC-09** | Group F: Statute Act | `statuteActs = ["CrPC", "BNSS"]` | Returns judgments citing either CrPC or BNSS sections. | PASS |
| **TC-10** | Group H: Outcome | `outcomes = ["Allowed"]` | Matches records with `disposal = "Allowed"`. | PASS |
| **TC-11** | Cross-Facet Conjunction | `Court: 33_10` **AND** `Category: Criminal` **AND** `Year: 2022` | Strict **AND** logic: only returns Madras HC Criminal cases from 2022. | PASS |
| **TC-12** | Empty Search Behavior | `q = ""` with no filters | Returns all indexed judgments ordered by date descending. | PASS |
| **TC-13** | Sorting Invariants | `sortBy = "date_desc"` vs `"date_asc"` | Correct chronological ordering verification. | PASS |
| **TC-14** | URL Serialization | Any filter change | URL parameters updated via `useSearchParams` for replayability. | PASS |

---

## 2. Test Implementation
- Unit & Integration Test Suite: `web/src/search/search-engine.test.ts`
- Query Parser Tests: `web/src/search/query-parser.test.ts`
- Case Intelligence Panel Tests: `web/src/components/CaseIntelligencePanel.test.tsx`
