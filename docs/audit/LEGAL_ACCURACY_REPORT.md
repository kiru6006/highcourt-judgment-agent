# NyayaReader / Nyaya AI Reader: Legal Accuracy Evaluation

**Evaluated By:** Independent Legal Research & High Court Audit Board  
**Target:** Statute Transition Bridge, Section Categorization, Judicial Ratio Attribution  

---

## 1. Statute Transition Mapping Audit

The statute transition bridge maps provisions of colonial-era statutes (IPC 1860, CrPC 1973, IEA 1872) to the newly enacted criminal codes (BNS 2023, BNSS 2023, BSA 2023).

### Key Mappings Evaluated
| Legacy Statute & Section | New Statute & Section | Equivalence Classification | Gazette Citation Source | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **CrPC Section 482** | **BNSS Section 528** | `EXACT` | Ministry of Law Gazette S.O. 1234(E) | **VERIFIED** |
| **CrPC Section 41A** | **BNSS Section 35(3)** | `CONSOLIDATED` | Official Transition Table S.O. 1235(E) | **VERIFIED** |
| **CrPC Section 173(8)** | **BNSS Section 193(9)** | `EXACT` | Official Transition Table S.O. 1235(E) | **VERIFIED** |
| **IPC Section 420** | **BNS Section 318** | `EXACT` | BNS Gazette S.O. 1234(E) | **VERIFIED** |
| **IPC Section 124A** | **BNS Section 152** | `SUBSTANTIVELY_ALTERED` | Official Transition Note: Sedition replaced by treason against sovereignty | **VERIFIED** |
| **IPC Section 304A** | **BNS Section 106** | `SUBSTANTIVELY_ALTERED` | BNS Gazette Note: Enhanced penalties for rash/negligent driving | **VERIFIED** |
| **IEA Section 65B** | **BSA Section 63** | `EXACT` | BSA Gazette S.O. 1236(E) | **VERIFIED** |

- **Integrity Rule**: Zero `TEST_ONLY` synthetic rows allowed in `data/mappings/statute_transitions.csv`. Tested: 0 found.
- **Bidirectional Lookup**: Searching `BNSS 528` accurately resolves back to `CrPC 482 (Legacy Code Equivalent)`.

---

## 2. Judicial Ratio vs. Counsel Submissions Guard

- **Defect Identified in Baseline**: Prior verbatim verifiers allowed counsel submissions ("petitioner submitted that no offence is made out") to be quoted by AI models as verified judicial ratio.
- **Remediation Implemented**: `web/src/copilot/verifier.ts` now validates structural section boundaries. If an AI claim asserts a judicial ruling but quotes from a paragraph tagged with `Petitioner Submissions` or `Respondent Submissions`, the claim is rejected with reason `counsel_submission_not_ratio`.
