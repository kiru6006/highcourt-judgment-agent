# Legal Case Taxonomy & Court-Code Registry (v1.2.0)

## 1. Overview
NyayaReader v1.2.0 introduces a standardized, versioned 8-domain legal hierarchy (`taxonomyVersion: "1.0"`) and an official Court-Code Registry across five pilot High Courts.

Every classification adheres to strict verification invariants:
- **Zero Fabrication:** If a court code cannot be matched to an official court registry entry, it is marked `status: "unknown"` and the raw code string is preserved verbatim.
- **Evidence Retrievability:** Rule-based subject labels require retrievable paragraph anchor evidence.
- **Visual Separation:** Stated metadata, rule inferences, and unmapped raw codes are never conflated in the UI.

---

## 2. Eight-Domain Legal Hierarchy

Defined in `shared/taxonomy/v1.ts`:

| Domain ID | Domain Label | Description | Key Subjects |
| :--- | :--- | :--- | :--- |
| `domain_constitutional` | Constitutional Law | Fundamental rights, writs under Art. 226/227, legislative competence, PIL. | Habeas Corpus, Mandamus, Quo Warranto, Certiorari, Prohibition, PIL |
| `domain_criminal` | Criminal Law | Substantive offenses, criminal procedure, bail, FIR quashing, appeals. | Regular Bail, Anticipatory Bail, Quashing (Sec 482 / 528), NDPS, POCSO, Negotiable Instruments |
| `domain_civil` | Civil Law | Property rights, contracts, specific performance, injunctions, torts. | Title Suits, Injunctions, Specific Performance, Land Acquisition, Rent Control |
| `domain_commercial` | Commercial & Corporate | High-value commercial disputes, arbitration, insolvency, company law. | Commercial Suits, Section 9 Arbitration, Section 34 Set-Aside, Section 11 Appointment, IBC |
| `domain_service` | Service & Employment | Public employment, disciplinary proceedings, promotions, pensions. | Disciplinary Action, Promotion & Seniority, Pension & Retiral, Compassionate Appointment |
| `domain_taxation` | Direct & Indirect Taxation | Income Tax, GST, Customs, Central Excise, Sales Tax appeals. | Income Tax Appeals, GST & Value Added Tax, Customs & Central Excise |
| `domain_family` | Family & Matrimonial | Matrimonial disputes, divorce, child custody, domestic violence. | Divorce & Annulment, Maintenance & Alimony, Child Custody & Guardianship, DV Act |
| `domain_special` | Special & Regulatory | Environmental protection, consumer disputes, IPR, admiralty. | National Green Tribunal Appeals, Patents & Trademarks, Copyright, Consumer Protection |

---

## 3. High Court Case-Code Registry

Defined in `shared/court-codes/registry.ts`. Every entry includes court code, official description, normalized type, jurisdiction type, and official portal source URL:

### 3.1 Madras High Court (`33_10`)
Official Gazette & Portal: `https://www.hcmadras.tn.nic.in/case_status.php`
- `WP`: Writ Petition (Original / Special Jurisdiction)
- `WMP`: Writ Miscellaneous Petition (Interlocutory)
- `WA`: Writ Appeal (Appellate Jurisdiction)
- `CRL OP`: Criminal Original Petition (Original Jurisdiction - Bail/Quash)
- `CRL A`: Criminal Appeal (Appellate Jurisdiction)
- `CRL RC`: Criminal Revision Case (Revisional Jurisdiction)
- `OSA`: Original Side Appeal (Appellate Jurisdiction)
- `TOS`: Testamentary Original Suit (Original Side)
- `CMA`: Civil Miscellaneous Appeal (Appellate Jurisdiction)
- `CRP`: Civil Revision Petition (Revisional Jurisdiction)
- `EP`: Election Petition (Original Jurisdiction)
- `COMP.A`: Company Application (Company Jurisdiction)

### 3.2 High Court of Karnataka (`29_3`)
Official Portal: `https://karnatakahi ghcourt.kar.nic.in/case_status.php`
- `WP`: Writ Petition
- `WA`: Writ Appeal
- `CRL.P`: Criminal Petition (Sec 482/Bail)
- `CRL.A`: Criminal Appeal
- `CRL.RP`: Criminal Revision Petition
- `MFA`: Miscellaneous First Appeal
- `RFA`: Regular First Appeal
- `RSA`: Regular Second Appeal
- `CMP`: Civil Miscellaneous Petition (Arbitration Sec 11)
- `CCC`: Commercial Court Contempt / Contempt of Court

### 3.3 High Court of Kerala (`32_1`)
Official Portal: `https://hckerala.gov.in/case_status.php`
- `WP(C)`: Writ Petition (Civil)
- `WA`: Writ Appeal
- `BA`: Bail Application (Sec 439 / 438)
- `Crl.MC`: Criminal Miscellaneous Case (Sec 482 CrPC)
- `Crl.A`: Criminal Appeal
- `Crl.Rev.Pet`: Criminal Revision Petition
- `MACA`: Motor Accidents Claims Appeal
- `Mat.A`: Matrimonial Appeal
- `Arb.A`: Arbitration Appeal

### 3.4 High Court of Delhi (`7_26`)
Official Portal: `https://delhihighcourt.nic.in/case_status.asp`
- `W.P.(C)`: Writ Petition (Civil)
- `W.P.(CRL)`: Writ Petition (Criminal)
- `LPA`: Letters Patent Appeal
- `BAIL APPLN.`: Bail Application
- `CRL.M.C.`: Criminal Miscellaneous Main (Sec 482)
- `CRL.A.`: Criminal Appeal
- `CS(COMM)`: Commercial Civil Suit
- `ARB.P.`: Arbitration Petition (Sec 11)
- `O.M.P. (COMM)`: Original Miscellaneous Petition (Arbitration Sec 34)
- `CO.APPL.`: Company Application

### 3.5 High Court of Bombay (`1_1`)
Official Portal: `https://bombayhighcourt.nic.in/case_query.php`
- `WP`: Writ Petition
- `APP`: Appeal (Appellate Side)
- `ABA`: Anticipatory Bail Application
- `BA`: Bail Application
- `APL`: Criminal Application (Sec 482)
- `APEAL`: Criminal Appeal
- `FA`: First Appeal
- `COMSS`: Commercial Summary Suit
- `CARBAP`: Commercial Arbitration Application
- `CARBP`: Commercial Arbitration Petition (Sec 34)

---

## 4. Verification & Extension Invariants
1. **Never Hallucinate Codes:** Unknown codes MUST remain `status: "unknown"` with `officialDescription: "Unverified Case Type Code"`.
2. **Official Source URLs:** Every verified code points to an authentic High Court registry portal.
3. **No Database Dependencies:** Registry is compiled as a static TypeScript module loaded in Web Workers and UI components with zero network latency.
