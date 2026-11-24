# High Court Case-Type Mapping Registry (v1.3.0)

**Date:** 2026-11-24  
**Scope:** Court-specific case-type abbreviations, normalized procedural classifications, and jurisdictional mapping across Indian High Courts.

---

## 1. Governance Principles

1. **Raw Code Preservation:** The exact source case-type string from court dockets (e.g., `CRL.OP`, `W.P.(MD)`, `Crl.M.C.`, `BAIL APPLN.`) is preserved verbatim in `raw_case_type`.
2. **Normalized Taxonomy:** Codes map to a consistent 21-type normalized taxonomy:
   - Writ Petition
   - Writ Appeal
   - Original Suit
   - Original Petition
   - Civil Appeal
   - Criminal Appeal
   - Civil Revision
   - Criminal Revision
   - Bail Application
   - Anticipatory Bail
   - FIR Quashing Petition
   - Review Petition
   - Contempt Petition
   - Arbitration Petition
   - Company Petition
   - Tax Appeal
   - Matrimonial Appeal
   - Second Appeal
   - Miscellaneous Appeal
   - Public Interest Litigation
   - Other Official Case Type
3. **No Coercion:** If an official case type cannot be mapped with certainty, it is assigned `Other Official Case Type` with `jurisdiction: "Unknown"`. Case types are never forced into an incorrect category.

---

## 2. Multi-Court Case-Type Normalization Table

| Court | Raw Code | Official Court Description | Normalized Category | Jurisdiction |
| :--- | :--- | :--- | :--- | :--- |
| **Madras HC** | `WP` | Writ Petition | **Writ Petition** | Writ |
| **Madras HC** | `WA` | Writ Appeal | **Writ Appeal** | Appellate |
| **Madras HC** | `CRL.OP` | Criminal Original Petition | **FIR Quashing Petition** | Original |
| **Madras HC** | `CRL.A` | Criminal Appeal | **Criminal Appeal** | Appellate |
| **Madras HC** | `CRL.RC` | Criminal Revision Case | **Criminal Revision** | Revisional |
| **Madras HC** | `CRL.MP` | Criminal Miscellaneous Petition | **Bail Application** | Original |
| **Madras HC** | `AS` | Appeal Suit (First Appeal) | **Civil Appeal** | Appellate |
| **Madras HC** | `SA` | Second Appeal | **Second Appeal** | Appellate |
| **Madras HC** | `CMA` | Civil Miscellaneous Appeal | **Miscellaneous Appeal** | Appellate |
| **Madras HC** | `CRP` | Civil Revision Petition | **Civil Revision** | Revisional |
| **Madras HC** | `CONT.P`| Contempt Petition | **Contempt Petition** | Special |
| **Madras HC** | `ARB.OP` | Arbitration Original Petition | **Arbitration Petition** | Original |
| **Madras HC** | `TCA` | Tax Case Appeal | **Tax Appeal** | Appellate |
| **Madras HC** | `CS` | Civil Suit (Original Side) | **Original Suit** | Original |
| **Karnataka HC** | `WP` | Writ Petition | **Writ Petition** | Writ |
| **Karnataka HC** | `WA` | Writ Appeal | **Writ Appeal** | Appellate |
| **Karnataka HC** | `CRL.P` | Criminal Petition (482 / Bail) | **FIR Quashing Petition** | Original |
| **Karnataka HC** | `CRL.A` | Criminal Appeal | **Criminal Appeal** | Appellate |
| **Karnataka HC** | `CRL.RP` | Criminal Revision Petition | **Criminal Revision** | Revisional |
| **Karnataka HC** | `RFA` | Regular First Appeal | **Civil Appeal** | Appellate |
| **Karnataka HC** | `RSA` | Regular Second Appeal | **Second Appeal** | Appellate |
| **Karnataka HC** | `MFA` | Miscellaneous First Appeal | **Miscellaneous Appeal** | Appellate |
| **Karnataka HC** | `CCC` | Civil Contempt Case | **Contempt Petition** | Special |
| **Karnataka HC** | `CMP` | Civil Miscellaneous Petition (Arbitration) | **Arbitration Petition** | Original |
| **Karnataka HC** | `PIL` | Public Interest Litigation | **Public Interest Litigation** | Writ |
| **Delhi HC** | `W.P.(C)` | Writ Petition (Civil) | **Writ Petition** | Writ |
| **Delhi HC** | `W.P.(CRL)` | Writ Petition (Criminal) | **Writ Petition** | Writ |
| **Delhi HC** | `LPA` | Letters Patent Appeal | **Writ Appeal** | Appellate |
| **Delhi HC** | `CRL.M.C.` | Criminal Miscellaneous Main (482) | **FIR Quashing Petition** | Original |
| **Delhi HC** | `BAIL APPLN.` | Bail Application | **Bail Application** | Original |
| **Delhi HC** | `CRL.A.` | Criminal Appeal | **Criminal Appeal** | Appellate |
| **Delhi HC** | `CS(COMM)` | Commercial Civil Suit | **Original Suit** | Original |
| **Delhi HC** | `ARB.P.` | Arbitration Petition | **Arbitration Petition** | Original |
| **Delhi HC** | `MAT.APP.(F.C.)`| Matrimonial Appeal | **Matrimonial Appeal** | Appellate |
| **Bombay HC** | `APL` | Criminal Application (Sec 482) | **FIR Quashing Petition** | Original |
| **Bombay HC** | `BA` | Bail Application | **Bail Application** | Original |
| **Bombay HC** | `ABA` | Anticipatory Bail Application | **Anticipatory Bail** | Original |
| **Bombay HC** | `CARBAP` | Commercial Arbitration Application | **Arbitration Petition** | Original |
| **Calcutta HC** | `CRM` | Criminal Miscellaneous (Bail) | **Bail Application** | Original |
| **Calcutta HC** | `CRR` | Criminal Revision | **Criminal Revision** | Revisional |
| **Allahabad HC** | `WRIC` | Writ - C (Civil) | **Writ Petition** | Writ |
| **Allahabad HC** | `WRIA` | Writ - A (Service) | **Writ Petition** | Writ |
| **Allahabad HC** | `A482` | Application Under Section 482 CrPC | **FIR Quashing Petition** | Original |

---

## 3. Implementation References
- TypeScript: `shared/case-types/registry.ts:normalizeCourtCaseType(court, rawCode)`
- Canonical Schema: `shared/schema.ts:ExtendedJudgmentDocument.raw_case_type`
