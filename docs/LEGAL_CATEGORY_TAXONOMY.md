# Legal Category Taxonomy v2.0 Specification

**Version:** 2.0  
**Date:** 2026-11-24  
**Scope:** 13 Primary Legal Domains, Hierarchical Subcategories, and Deterministic Evidence Invariants.

---

## 1. Architectural Principles

1. **Hierarchical 2-Level Schema:** Primary Domain (`01`–`13`) $\to$ Subjects / Subcategories.
2. **Multi-Label & Overlapping Support:** A judgment addressing both constitutional validity and criminal procedure may carry labels from `03 Constitutional Law` and `02 Criminal Law`.
3. **Explicit Unclassified Safety:** If a judgment lacks sufficient textual or statutory evidence, it is classified as `00 Unknown / Unclassified`. Categories are never invented to populate empty facets.
4. **Evidence Grounding Invariant:** Rule-based subject labels require retrievable paragraph anchor indices (`#para-N`) in the extracted judgment text.

---

## 2. The 13 Primary Legal Categories & Subcategories

### 01. Civil Law (`CIVIL`)
- **Contracts**: Formation, breach, repudiation, damages, liquidated claims.
- **Money recovery**: Commercial and civil debt recovery, summary suits (Order XXXVII CPC).
- **Specific performance**: Specific Relief Act suits, readiness and willingness.
- **Injunctions**: Temporary and permanent injunctions (Order XXXIX CPC).
- **Property title**: Declaration of title, possessory remedies, boundary disputes.
- **Partition**: Coparcenary property, Hindu succession shares, preliminary/final decrees.
- **Succession**: Testamentary (Wills, Probate) and intestate succession.
- **Tenancy**: Rent control statutes, eviction petitions, lease agreements.
- **Easements**: Rights of way, light, air, and riparian rights.
- **Civil procedure**: Order VII Rule 11 rejection of plaint, res judicata, execution petitions.

### 02. Criminal Law (`CRIM`)
- **Bail**: Regular bail (Section 437/439 CrPC / BNSS 478/482).
- **Anticipatory bail**: Pre-arrest bail (Section 438 CrPC / BNSS 480).
- **FIR quashing**: Inherent powers (Section 482 CrPC / BNSS 528).
- **Criminal appeals**: Appeals against conviction or acquittal.
- **Criminal revisions**: Legality and propriety (Section 397/401 CrPC).
- **Murder**: Section 302 IPC / BNS 103, culpable homicide.
- **Assault**: Grievous hurt, simple hurt, unlawful assembly.
- **Theft**: Theft, extortion, robbery, dacoity.
- **Cheating**: Fraud and inducement (Section 420 IPC / BNS 318).
- **Criminal breach of trust**: Section 406/409 IPC misappropriation.
- **Sexual offences**: Section 376 IPC / BNS provisions.
- **NDPS**: Contraband possession, commercial quantity, Section 37 bar.
- **POCSO**: Child protection trials, statutory age presumption.
- **Cybercrime**: Identity theft, hacking, unauthorized access under IT Act.
- **Sentencing**: Probation of offenders, sentence remissions, death reference.

### 03. Constitutional Law (`CONST`)
- **Fundamental rights**: Part III constitutional guarantees.
- **Article 14**: Equality before law, protection against arbitrariness.
- **Article 19**: Free speech, association, trade, reasonable restrictions.
- **Article 21**: Right to life, personal liberty, fair procedure.
- **Article 226**: Extraordinary writ jurisdiction (Mandamus, Certiorari, Habeas Corpus).
- **Article 227**: Supervisory superintendence over subordinate courts.
- **Public interest litigation**: Pro bono publico petitions on public duty.
- **Constitutional validity**: Ultra vires challenges to statutes or subordinate rules.
- **Natural justice**: Audi alteram partem, rule against bias.

### 04. Administrative and Service Law (`SERV`)
- **Government service**: Seniority disputes, service regularisation, pay scale anomalies.
- **Recruitment**: Selection process challenges, eligibility criteria.
- **Promotion**: Departmental Promotion Committees (DPC), benchmark merit.
- **Transfer**: Administrative transfers, allegations of mala fides.
- **Disciplinary proceedings**: Inquiries, chargesheets, dismissal, removal from service.
- **Pension**: Retiral dues, gratuity, superannuation benefits.
- **Administrative decisions**: Executive discretion, reasoned orders.
- **Government orders**: Challenges to GOs, policy circulars, executive memoranda.

### 05. Corporate and Commercial Law (`COMM`)
- **Company disputes**: Oppression and mismanagement, NCLT references.
- **Insolvency**: IBC corporate insolvency resolution process (CIRP), liquidation.
- **Arbitration**: Sections 9, 11, 34, 37 of Arbitration and Conciliation Act 1996.
- **Commercial contracts**: Commercial Court disputes, bank guarantees, letters of credit.
- **Shareholder disputes**: Voting agreements, share valuation, joint ventures.
- **Banking recovery**: SARFAESI Act, DRT/DRAT proceedings, debt recovery.
- **Negotiable instruments**: Section 138 NI Act cheque dishonour proceedings.
- **Insurance**: Policy repudiation, coverage exclusions.
- **Competition**: Anti-competitive agreements, abuse of dominant position.
- **Intellectual property**: Trademarks, patents, copyright, industrial designs.

### 06. Property, Revenue and Land Law (`LAND`)
- **Land acquisition**: RFCTLARR Act 2013 acquisition, compensation claims.
- **Compensation**: Enhancement of market value, solatium, interest.
- **Revenue records**: Jamabandi, Record of Rights (RoR), revenue registers.
- **Patta**: Issuance, transfer, cancellation of revenue patta.
- **Mutation**: Revenue mutation proceedings before revenue officers.
- **Encroachment**: Eviction of illegal occupants from public land.
- **Government land**: Poramboke, Gram Sabha land, waterbody protection.
- **Registration**: Registration Act Section 17, refusal to register instruments.
- **Stamp duty**: Under-valuation, impounding of instruments, deficit stamp duty.
- **Municipal property**: Building plan sanctions, municipal taxes, demolition notices.

### 07. Family Law (`FAM`)
- **Marriage**: Conjugal rights, nullity, marriage solemnization.
- **Divorce**: Cruelty, desertion, mutual consent divorce.
- **Maintenance**: Section 125 CrPC / BNSS 144, HMA Section 24 interim maintenance.
- **Custody**: Child custody, visitation schedules, welfare of minor.
- **Adoption**: CARA guidelines, HAMA adoption deeds.
- **Domestic violence**: PWDVA protection, residence, and monetary orders.
- **Guardianship**: Guardians and Wards Act proceedings.
- **Succession**: Personal law inheritance (Hindu, Muslim, Christian personal laws).

### 08. Labour and Employment Law (`LABOUR`)
- **Industrial disputes**: Industrial Disputes Act 1947 references, tribunal awards.
- **Wrongful termination**: Retrenchment, illegal closure, back wages.
- **Wages**: Minimum Wages Act, Payment of Wages Act.
- **Trade unions**: Union registration, recognition, strike legality.
- **Employment benefits**: EPF, ESI, Payment of Gratuity Act claims.
- **Workplace rights**: POSH Act inquiries, occupational safety.

### 09. Taxation Law (`TAX`)
- **Income tax**: Assessment, Section 148 re-opening, ITAT appeals.
- **GST**: Central and State GST, Input Tax Credit (ITC) disputes.
- **Customs**: Valuation, tariff classification, seizure and confiscation.
- **Excise**: Central excise classification, CENVAT credit.
- **State taxation**: Value Added Tax (VAT), entry tax, local luxury tax.
- **Tax appeals**: Substantial questions of law before High Courts.

### 10. Cyber and Technology Law (`CYBER`)
- **Online fraud**: Phishing, identity theft, financial fraud under IT Act.
- **Banking account freeze**: Section 91/102 CrPC notices to debit freeze accounts.
- **UPI fraud**: Unauthorized transactions, payment gateway liabilities.
- **Electronic evidence**: Section 65B Evidence Act / Section 63 BSA certificates.
- **Data protection**: Privacy violations, unauthorized data processing.
- **Cybercrime**: Hacking, data tampering, transmission of explicit content.
- **Intermediary liability**: Section 79 IT Act safe harbour, notice and takedown.
- **Digital contracts**: Electronic signatures, clickwrap agreements.

### 11. Environmental and Infrastructure Law (`ENV`)
- **Forests**: Forest Conservation Act, reserve forest boundaries, tree protection.
- **Pollution**: Water Act, Air Act, State Pollution Control Board closure notices.
- **Mining**: MMDR Act, illegal sand mining, quarry lease cancellations.
- **Highways**: National Highways Act toll collection, road widening acquisition.
- **Infrastructure projects**: Metro rail, bridges, airports, thermal power projects.
- **Environmental clearances**: EIA notifications, Coastal Regulation Zone (CRZ).
- **Public works**: Public infrastructure contracts, tender conditions.
- **Land acquisition disputes**: Project-affected persons rehabilitation.

### 12. Education and Social Welfare Law (`EDU`)
- **University disputes**: Affiliation, UGC regulations, academic councils.
- **Admissions**: Entrance tests (NEET, JEE), seat allocation, counselling rules.
- **Examinations**: Paper leaks, mass copying, re-evaluation petitions.
- **Reservations**: SC/ST/OBC/EWS affirmative action, roster points.
- **Disability rights**: RPwD Act 2016 accessibility, employment reservations.
- **Welfare benefits**: Public distribution system, state scholarship schemes.
- **Public education**: Right to Education (RTE) Act compliance.

### 13. Special Statutory Matters (`SPEC`)
- **NDPS**: Narcotics control special court proceedings.
- **POCSO**: Child sexual abuse statutory trials.
- **Prevention of Corruption**: Trap cases, disproportionate assets, sanction for prosecution.
- **Electricity**: Electricity Act 2003, power theft assessments, tariff orders.
- **Cooperative societies**: Registrar powers, supersession of boards, society elections.
- **Motor vehicles**: MACT compensation claims, permit violations.
- **Consumer protection**: Consumer Protection Act 2019 commission appeals.
- **State-specific statutes**: State rent control, temple endowments, local land laws.

---

## 3. Integration & Code References
- TypeScript: `shared/taxonomy/v2.ts`
- Search Engine Facet: `category` and `subjects` fields in `web/src/search/types.ts`
- Advanced Search UI: `web/src/components/AdvancedSearchFilters.tsx`
