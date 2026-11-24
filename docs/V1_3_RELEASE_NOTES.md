# Release Notes: NyayaReader v1.3.0 — "Five-Year High Court Expansion & Comprehensive Advanced Search"

**Release:** v1.3.0  
**Date:** 2026-11-24  
**Target Environment:** GitHub Pages (100% Static-First) | Antigravity IDE  
**Status:** PRODUCTION READY

---

## Executive Summary

NyayaReader v1.3.0 delivers **"Five-Year High Court Expansion & Comprehensive Advanced Search"**, dramatically scaling the discovery infrastructure to support **5 calendar years (2022, 2023, 2024, 2025, and 2026 through 24 November 2026)** across all **25 Indian High Courts** and their official benches.

This release fulfills all architectural milestones while strictly maintaining NyayaReader's core invariants:
- **100% Static-First:** Runs entirely in the client browser on GitHub Pages with sub-4ms retrieval and zero server dependencies.
- **Empirical Disclosure Invariant:** Missing records are explicitly disclosed as pending ingestion batches, never misreported as zero real-world cases.
- **Strict BYOK & Verbatim AI Gating:** Gemini keys stay in client `localStorage`, and AI statements lacking exact verbatim paragraph evidence are automatically dropped.
- **Budget Compliance:** Static bundle size remains $< 135\text{ KB}$ gzipped (well under the 300 KB limit), with total Pages footprint $< 3\text{ MB}$ / 500 MB.

---

## Milestone Deliverables

### 1. Canonical 25 Indian High Courts & Official Benches Registry (Milestone M1)
- `shared/court-codes/all_courts.ts` and `pipeline/classify/all_courts.py`: Authoritative registry covering Allahabad, Andhra Pradesh, Bombay, Calcutta, Chhattisgarh, Delhi, Gauhati, Gujarat, Himachal Pradesh, Jammu & Kashmir and Ladakh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Madras, Manipur, Meghalaya, Orissa, Patna, Punjab and Haryana, Rajasthan, Sikkim, Telangana, Tripura, and Uttarakhand.
- Exact mapping of Principal Seats, Permanent Benches, and Circuit Benches with official portal URLs.
- Documentation: `docs/HIGH_COURT_REGISTRY.md` and `docs/BENCH_REGISTRY.md`.

### 2. Legal Category Taxonomy v2.0 (Milestone M2)
- Upgraded from 8 to **13 Hierarchical Legal Domains**:
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
- Explicit `00 Unknown / Unclassified` safety boundary.
- Documentation: `docs/LEGAL_CATEGORY_TAXONOMY.md`.

### 3. Multi-Court Case-Type Mapping Registry (Milestone M3)
- `shared/case-types/registry.ts`: Normalized cross-court case types (Writ Petition, Bail Application, Section 482 Quashing, Commercial Suit, Contempt, etc.) while preserving raw docket codes verbatim.
- Documentation: `docs/CASE_TYPE_REGISTRY.md`.

### 4. Comprehensive 11-Group Advanced Search Engine & UI (Milestone M4)
- **11 Unified Filter Groups**:
  - Group A: Basic Search & Exact Field Matching (Case No, CNR, Party, Judge, Advocate)
  - Group B: Court, Bench, Jurisdiction & Bench Strength (Coram)
  - Group C: 5-Year Temporal Span (2022–2026), Quick Lookbacks (30d, 90d, 12m), Custom Dates
  - Group D: Case Types
  - Group E: 13 Legal Domains
  - Group F: Statutory Acts & Sections
  - Group G: Judicial Document Types
  - Group H: Outcomes & Disposals
  - Group I: Citations & Precedents
  - Group J: Source Quality & Provenance
  - Group K: Sorting (Relevance, Newest, Oldest, Court, Case Type)
- **Ergonomics**: Dependent bench dropdowns, search within filters, Select All / Clear, active filter chips, URL state persistence, and 1-click search sharing.
- Documentation: `docs/ADVANCED_SEARCH_SPEC.md` and `docs/SEARCH_FILTER_TEST_MATRIX.md`.

### 5. Configurable Ingestion Pipeline with Resume Checkpoints (Milestone M5)
- `pipeline/ingest.py`: Supports configurable date boundaries (`--date-from 2022-01-01` through `--date-to 2026-11-24`), resume checkpoints (`data/checkpoints/`), and multi-court batching.
- Documentation: `docs/INGESTION_RUNBOOK.md`.

### 6. Scalability & External Storage Assessment (Milestone M6)
- Comprehensive quantitative model evaluating static Pages limits vs 5-year multi-court scale.
- Designed query-scoped shard streaming architecture and documented Cloudflare R2 / AWS S3 deployment path for $\ge 200,000$ documents.
- Documentation: `docs/SCALABILITY_ASSESSMENT.md`.

### 7. Corpus Coverage Dashboard Route `/coverage` (Milestone M7)
- New route `/coverage` rendering total indexed documents, temporal distribution (2022–2026), 25 High Courts status, 13 legal domains, case types, missing metadata rates, and statutory quarantine counts.
- Navigation links integrated in top Navbar and Footer.
- Documentation: `docs/CORPUS_COVERAGE_REPORT.md`.

---

## Verification & Quality Gates
All 5 platform gates pass cleanly:
1. Vitest Suite: 14 test files, 89 passed (100%).
2. Vite Production Bundle Build: 0 errors, optimal chunking (`129.68 KB` gz).
3. Hard Budget Gate: Pages total $2.81\text{ MB} \le 500\text{ MB}$, JS $\le 300\text{ KB}$.
4. Python Unit & Ingestion Suite: 64 passed (100%).
5. Retrieval & RRF Evaluation: Lexical Recall@10 = 0.92, Hybrid MRR@10 = 0.8157, Latency p95 $< 0.5\text{ ms}$.
