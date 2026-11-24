# Advanced Search Specification (v1.3.0)

**Date:** 2026-11-24  
**Scope:** Architecture and user experience specification for the unified 11-group Advanced Search engine.

---

## 1. Overview & Unified Search Architecture

Nyaya AI Reader v1.3.0 establishes a single, unified search interface combining lexical BM25 indexing, dense vector similarity, and multi-facet filtering across all 25 Indian High Courts and a 5-calendar-year target period (2022–2026).

---

## 2. The 11 Filter Groups (Groups A through K)

### GROUP A: Basic Search & Exact Field Lookup
- **Free-text Query:** Tokenized with legal term boosting (`cnr: 6.0`, `case_no: 3.5`, `title: 3.0`, `statutes: 2.5`).
- **Exact Phrase Matching:** Substring match across full document title and operative excerpts.
- **Case Number:** Normalized comparison ignoring spacing/punctuation variances (`Crl.O.P. No. 1234/2022` $\leftrightarrow$ `crlop12342022`).
- **CNR Lookup:** Exact 16-character eCourts Case Number Record.
- **Party Name:** Substring matching over petitioner and respondent fields.
- **Judge / Coram Name:** Token search over coram members.
- **Advocate Name:** Advocate on record matching where recorded.
- **Citation Query:** Exact citation matching across AIR, SCC, and SCR strings.

### GROUP B: Court, Bench & Jurisdiction
- **High Court:** Multi-select across all 25 Indian High Courts.
- **Dependent Benches:** Dynamically reveals official permanent and circuit benches corresponding to selected High Courts.
- **Jurisdiction Type:** Writ, Appellate, Original, Revisional, Special Statutory.
- **Bench Strength (Coram):** Single Judge, Division Bench, Full Bench, Constitution Bench.

### GROUP C: Temporal Date Range (2022–2026)
- **Target Range:** 2022-01-01 through 2026-11-24 initially (configurable via ingestion pipeline).
- **Quick Shortcuts:** Last 30 Days, Last 90 Days, Last 12 Months, All 5 Years.
- **Custom Range:** Year From / Year To and Date From / Date To bounds.

### GROUP D: Procedural Case Types
- Standardized 21 normalized types (Writ Petition, Bail Application, Section 482 Quash, Arbitration Petition, etc.) while strictly preserving original court codes.

### GROUP E: Legal Category Taxonomy v2.0
- Hierarchical 13 primary legal domains:
  01. Civil Law
  02. Criminal Law
  03. Constitutional Law
  04. Administrative and Service Law
  05. Corporate and Commercial Law
  06. Property, Revenue and Land Law
  07. Family Law
  08. Labour and Employment Law
  09. Taxation Law
  10. Cyber and Technology Law
  11. Environmental and Infrastructure Law
  12. Education and Social Welfare Law
  13. Special Statutory Matters
- `00 Unknown / Unclassified` safety fallback.

### GROUP F: Statutory Provisions
- Statutory Act presets (IPC, CrPC, BNS, BNSS, BSA, CPC, Constitution, NI Act, POCSO, NDPS).
- Specific Section and Article lookup.

### GROUP G: Judicial Document Type
- Judgment, Final Operative Order, Interim Order, Review Order.

### GROUP H: Outcomes & Disposals
- Allowed, Dismissed, Partly Allowed, Disposed of, Remanded, Withdrawn, Settled, Bail Granted, Bail Refused.

### GROUP I: Citation & Precedent Relationship
- Precedent case citations, cited statutes.

### GROUP J: Source Provenance & Quality Gating
- Source Verified Only, High Court PDF Available, Full Text Available.

### GROUP K: Multi-Criteria Sorting
- Relevance (BM25 + Vector RRF score)
- Newest First (`date_desc`)
- Oldest First (`date_asc`)
- Court Name (`court`)
- Case Type (`case_type`)

---

## 3. Query Semantics & Behavioral Invariants

1. **Boolean Logic:**
   - **AND** between different facet groups (e.g. `Court: Madras` **AND** `Category: Criminal` **AND** `Year: 2024`).
   - **OR** within multi-selected values of the same facet group (e.g. `Category: [Criminal OR Civil]`).
2. **URL State Synchronization:** All active query terms, facets, and sort choices are serialized into URL search parameters (`?q=...&court=...&cat=...&sort=...`), enabling back/forward browser navigation and 1-click sharing.
3. **Responsive Ergonomics:** Desktop displays fixed 80ch left rail with collapsible accordions; mobile collapses into an accessible slide-over drawer triggered by a sticky bottom-sheet badge.
