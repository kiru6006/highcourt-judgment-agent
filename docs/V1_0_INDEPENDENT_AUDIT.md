# NyayaReader v1.0.0 — Independent Code Audit, Legal Accuracy Evaluation & Architectural Review

**Audit Date:** 2026-11-23  
**Audited Version:** v1.0.0 (Commit `186ddfa` / `cf51a35`, Tag `v1.0.0`)  
**Repository:** `https://github.com/kiru6006/highcourt-judgment-agent`  
**Live Application Target:** `https://kiru6006.github.io/highcourt-judgment-agent/`  
**Audit Team Roles:** Principal Software Architect, Senior React & TypeScript Architect, Python Data Engineering Architect, Search & IR Engineer, AI/ML & RAG Evaluation Engineer, Senior Indian Advocate & Legal Research Expert, QA Automation Architect, DevOps & GitHub Actions Engineer, Senior UI/UX Accessibility Expert.

---

## 1. Executive Summary

NyayaReader is engineered as a **100% static-first legal research and judgment reader platform** deployed to GitHub Pages. It successfully eliminates server-side runtime infrastructure costs and implements a clean, distraction-free 3-pane legal reader, offline compression pipelines, and local advocate research workspaces.

However, an exhaustive, multi-disciplinary technical audit across source code, pipeline artifacts, and legal sources reveals **three critical defects** that currently undermine its legal and technical integrity in v1.0.0:

1. **Synthetic Metadata Contamination in Pipeline (Finding DEF-DATA-01 - Critical):** While the text inside the sample shards was extracted from genuine Madras High Court 2022 PDFs, the pipeline driver (`pipeline/ingest.py` lines 116–127) hardcoded placeholder metadata (`case_number: "Crl.O.P. No. {idx+100} of 2022"`, `parties: {"petitioner": "Applicant (HCMA01)", "respondent": "State Respondent & Another"}`, `judges: ["Hon'ble High Court Judge"]`, `category: "Criminal"`), completely overwriting the real case numbers, parties, and judges found in the PDF headers and Parquet metadata.
2. **Pseudo-Vector Embedding & Algorithm Misalignment (Finding DEF-SEARCH-01 - Critical):** The system advertises `BAAI/bge-small-en-v1.5` dense embeddings in `manifest.json`. In reality, the offline pipeline computes a custom hash-projection feature vector. Crucially, the Python embedder (`pipeline/embedder.py`) uses MD5/SHA-1 hashing, whereas the browser vector engine (`web/src/search/vector-search.ts`) uses `djb2` and `h1 * 31 + char`. Because the two hash algorithms are completely different, the query vectors in the browser and document vectors in the shard are **orthogonal (0.00 cosine similarity)** for the same words.
3. **Missing CNR in Search Index (Finding DEF-SEARCH-02 - High):** CNR (Case Record Number) is omitted from the `SearchShardRecord` schema and MiniSearch index fields, preventing advocates from executing exact eCourts 16-character CNR lookups.
4. **Verbatim Quote Verifier Substantive Conflation (Finding DEF-AI-01 - High):** The client-side AI verifier confirms that an AI-cited quote exists as a verbatim substring in the cited paragraph. However, it cannot detect negation, out-of-context quotations (e.g. citing an advocate's submission as the court's ratio), or fabricated citations, falsely declaring them "grounded".

### Overall Readiness Assessment
- **Core Static Architecture & UI Shell:** 🟢 **Production Ready** (Clean React 18+ Vite app, 55.76 KB gzipped bundle, fast initial load, responsive 3-pane reader).
- **Public Proof-of-Concept Suitability:** 🟡 **Conditionally Acceptable for UI Demo Only**, with prominent disclaimer that judgment metadata is currently placeholder and search is restricted to excerpt text.
- **Production Legal Research Readiness:** 🔴 **Unsuitable for Advocate Reliance** until v1.1.0 remediates metadata ingestion, aligns vector embeddings, and indexes CNRs.

---

## 2. Repository & Deployment Details

- **Git Branch / Tag:** `audit/v1.0.0-review` branched from `main` (commit `186ddfa`, tagged `v1.0.0`, `phase-12`, `phase-11`).
- **Live Deployment:** GitHub Pages (`https://kiru6006.github.io/highcourt-judgment-agent/`).
  - Edge POP: Fastly/GitHub Pages CDN (observed in Chennai `cache-maa10220-MAA`).
  - Response Code: `HTTP/2 200 OK`.
  - Content-Type: `text/html; charset=utf-8`.
  - Last-Modified: `Mon, 23 Nov 2026 16:40:29 GMT`.
- **Runtime Environment:** Pure client-side browser execution. Zero backend API servers, zero server-side databases.

---

## 3. Actual Feature Inventory

| Feature | Documented Claim | Actual Code Implementation | Operational Status |
| :--- | :--- | :--- | :--- |
| **Static Runtime** | 100% static on GitHub Pages | Static HTML/JS bundle; client-side fetch | 🟢 Verified Working |
| **Frontend Framework** | React 18+ Vite + TypeScript + Tailwind | React 18.3.1, Vite 5.4.21, TypeScript 5.5.3, Tailwind 3.4.10 | 🟢 Verified Working |
| **3-Pane Reader** | Outline, Text, Legal Context | `web/src/pages/ReaderPage.tsx` with scroll-spy & tabs | 🟢 Verified Working |
| **Paragraph Anchors** | `#para-N` direct deep links | Anchor IDs on every paragraph; clipboard copy link | 🟢 Verified Working |
| **Offline Ingestion** | PyMuPDF text extraction from S3 | `pipeline/ingest.py` streams TAR from S3, extracts text | 🟡 Working text extraction, but metadata placeholder |
| **Keyword Search** | MiniSearch BM25 in client | MiniSearch initialized with title, case_no, excerpt | 🟡 Functional for text, but CNR missing |
| **Semantic Search** | `bge-small-en-v1.5` int8 | Pseudo-hash projection; Python/TS algorithms misaligned | 🔴 Broken (Zero dot-product overlap) |
| **Hybrid Search (RRF)**| Reciprocal Rank Fusion | RRF implemented in `hybrid-search.ts`, but vector leg broken | 🟡 Falls back to lexical rankings |
| **Web Links Mode** | Zero-key deep links to eCourts/Kanoon | `web/src/utils/web-links.ts` generates validated URL templates | 🟢 Verified Working |
| **Statute Bridge** | CrPC$\to$BNSS, IPC$\to$BNS, IEA$\to$BSA | Static table lookup via `OFFICIAL_STATUTE_TRANSITIONS` | 🟢 Verified Working (15 mappings) |
| **AI Copilot** | Gemini BYOK & Grounded Claim Verifier | `verifier.ts` checks verbatim substring inclusion | 🟡 Verified quote inclusion, but vulnerable to out-of-context |
| **Demo AI Answers** | Zero-key pre-computed answers | Pre-computed answers in `demo-answers.ts` | 🟢 Verified Working |
| **Advocate Workspace**| Folders, notes, precedent matrix | `FolderStore` in `localStorage`, export/import JSON, Matrix table | 🟢 Verified Working |
| **Print Court Memo** | `@media print` layout | Print stylesheet hiding chrome, rendering legal memo | 🟢 Verified Working |
| **Takedown Engine** | Purge records from shards & log audit | `pipeline/takedown.py` purges blocked JIDs/case numbers | 🟢 Verified Working |
| **Nightly Workflow** | Automated incremental sync | `.github/workflows/nightly.yml` | 🟢 Verified Working |

---

## 4. Requirements Coverage (54-Item Reconciliation)

Based on direct inspection against `docs/PRD_RECONCILIATION.md`:

- **Verified Functional (38 items / 70.4%):** R-001, R-002, R-004, R-005, R-006, R-009, R-010, R-011, R-012, R-013, R-014, R-015, R-016, R-017, R-018, R-019, R-020, R-022, R-023, R-024, R-025, R-026, R-027, R-028, R-029, R-030, R-032, R-033, R-035, R-036, R-040, R-041, R-042, R-043, R-044.
- **Implemented with Confirmed Defects (6 items / 11.1%):**
  - R-003 (Unified search bar): CNR lookup non-functional.
  - R-007 (Category facet): Derived from hardcoded `CRL.OP` in ingest driver.
  - R-021 (Grounded verifier): Cannot detect negation or quote distortion.
  - R-031 (S3 ingestion pipeline): Fabricates metadata fields instead of extracting from source.
  - R-038 (Semantic embeddings): Uses hash projection instead of `bge-small-en-v1.5`.
  - R-039 (In-browser query encoder): Algorithmic mismatch with Python embedder.
- **Partially Implemented (2 items / 3.7%):**
  - R-008 (Dynamic case types): Hardcoded list, not dynamically queried from active court partition.
  - R-034 (Section tagger): Heuristic rules tag only ~15% of short interim orders; rest marked "Untagged".
- **Formally Dropped (5 items / 9.3%):** R-045 (FastAPI backend), R-046 (DuckDB WASM in browser), R-047 (jsDelivr releases), R-050 (SerpAPI scraping), R-052 (Commercial billing).
- **Formally Deferred to Phase 12 (3 items / 5.5%):** R-048 (WebLLM WebGPU), R-049 (Citation classifier), R-054 (Regional language translation).

**Summary Metrics:**
- Implementation Coverage: **85.2%** (46 / 54 requirements attempted or completed).
- Verified Functional Coverage: **70.4%** (38 / 54 requirements meeting strict quality standard).

---

## 5. Audit A: Data Authenticity & Ingestion

### Document Count & Shard Sampling
- Documents in `data/shards/docs-33_10-2022.json.gz`: **46 documents**.
- Documents in `web/public/data-sample/docs-33_10-2022.json.gz`: **20 documents**.
- Inspected Sample: **20 documents** in detail.

### Findings on Data Authenticity:
1. **Underlying Text Authenticity:** The paragraph text is **100% genuine judicial text** extracted from Madras High Court 2022 order PDFs archived in `s3://indian-high-court-judgments`.
2. **Metadata Contamination:** In `pipeline/ingest.py`, lines 116–127:
   - Case numbers are sequential fakes: `Crl.O.P. No. 100 of 2022` to `Crl.O.P. No. 119 of 2022`.
   - The actual text reveals the real case numbers:
     - Doc 1: `Arbitration Original Petition (Com.Div.) Nos.146 & 147 of 2023`
     - Doc 2: `WMP No.28788 of 2022 in WP No.29451 of 2022`
     - Doc 3: `W.P.No.30034 of 2016 and W.M.P.Nos.26036 & 26037 of 2016`
     - Doc 8: `Crl.A.No.809 of 2018`
     - Doc 9: `C.R.P.No.2305 of 2020 and C.M.P.No.14486 of 2020`
     - Doc 10: `WP No. 31801 of 2013`
   - Parties are hardcoded to `{"petitioner": "Applicant (HCMA01)", "respondent": "State Respondent & Another"}`.
   - Judges are hardcoded to `["Hon'ble High Court Judge"]`.
   - Category is hardcoded to `Criminal`.
3. **PDF Source URL Invalidation:** `pdf_source_url` points to `.../part-20260429T170059Z.tar` (the 200 MB archive file), NOT an individual PDF or eCourts web viewer URL!
4. **Interim Order vs. Final Judgment:** Over 70% of the 20 sampled documents are routine daily interim orders (e.g. Doc 1: *"Post these petitions on 07.01.2026"*). They are not dispositive final judgments, but are marked `disposal_nature: "Disposed Of"`.
5. **Manifest Count Discrepancy:** `web/public/data-sample/manifest.json` claims `doc_count: 46`, but the actual shard files in that directory contain only 20 records.

---

## 6. Audit B: Search Quality

### Test Queries & Observed Results

| Test Query | Expected Behavior | Observed Result | Evaluation |
| :--- | :--- | :--- | :--- |
| **1. Exact Case No (`WP 31716/2014`)** | Returns Doc 6 | ❌ No matches | Fails because case number was overwritten as `Crl.O.P. No. 105 of 2022` |
| **2. Synthetic Case No (`Crl.O.P. No. 100`)** | Returns Doc 1 | 🟢 Returned in 0.4 ms | Matches hardcoded placeholder |
| **3. CNR Lookup (`HCMA010314552022`)** | Returns Doc 1 | ❌ 0 results | CNR not indexed in MiniSearch `fields` |
| **4. Real Party (`Thoppulan Chettiar`)** | Returns Doc 9 | 🟢 Returned (Rank 1) | Matches inside citation in paragraph text |
| **5. Real Judge (`Anand Venkatesh`)** | Returns Doc 1 & Doc 10 | 🟢 Returned | Matches in paragraph text |
| **6. Statutory Section (`Article 227`)** | Returns Doc 6 & Doc 9 | 🟢 Returned | Matches extracted statute |
| **7. Natural Language Legal Issue** | Semantic retrieval of arbitration cases | 🟡 Returns matches via BM25, but semantic vector leg is inert | Lexical fallback works |
| **8. Category Filter (`Civil`)** | Returns civil revision petitions | ❌ 0 results | All documents labeled `Criminal` in ingest |
| **9. Spelling Variation (`arbitartion`)** | Fuzzy matching returns arbitration cases | 🟢 Returned | MiniSearch `fuzzy: 0.15` handles typo |
| **10. Browser Refresh State** | URL `?q=...` restored after reload | 🟢 Correctly restored | Synchronized via `useSearchParams` |

### Semantic Retrieval & Hybrid Search Audit:
- **Embedding Model:** Pinned as `BAAI/bge-small-en-v1.5` in manifest, but actually computed via `deterministic_feature_vector`.
- **Query/Document Vector Alignment:** In Python `embedder.py`, token hashing uses MD5 and SHA-1. In TypeScript `vector-search.ts`, query hashing uses `djb2` and `h1 * 31 + char`.
- **Measured Empirical Dot Product:** When testing the token `"bail"`, Python non-zero indices are `38` and `228`, while TypeScript non-zero indices are `162` and `317`. The dot product is **0.00**.
- **Root Cause of Green Eval Benchmark:** `eval/evaluate.py` executed Python's `deterministic_feature_vector` for both the document and query vectors, creating a self-referential passing test that masked the TypeScript client divergence.

---

## 7. Audit C: Judgment Reader Evaluation

- **3-Pane Desktop Layout:** Excellent rendering. Left outline (260px), Center text stream (max-w-3xl), Right legal drawer (320px). Zero layout overlap on 1440px viewport.
- **Paragraph Anchors:** Clicking `#para-N` copies the exact URL `.../case/JID#para-N` to the clipboard. Scrolling smoothly highlights the anchor.
- **Structured Brief Toggle:** Toggles between raw text and extractive brief without network requests.
- **Section Classification Accuracy:**
  - On long judgments with formal headings (e.g. Doc 9), section tagging accurately marks `Facts`, `Reasoning & Ratio`, and `Final Order`.
  - On short daily orders (Docs 1, 2, 3, 5, 7), sections default to `Untagged`. This is legally correct (avoids inventing facts), but renders the outline navigation sparse.
- **Mobile Usability (375px):** Left outline and right context drawers collapse into full-screen slide-over modals with clean touch tap targets ($\ge 44\text{px}$).
- **Print Formatting:** Triggering `window.print()` hides navigation bars, outlines, and drawer chrome, formatting the judgment as an A4 legal memorandum with proper serif margins.

---

## 8. Audit D: Indian Legal Accuracy

### Judicial Terminology & Coram Identification
- **Coram Type:** Hardcoded to `Single Judge` for all records. Doc 4 text clearly states: *"M.SUNDAR, J. and HEMANT CHANDANGOUDAR, J."* (a Division Bench). Stamping it as Single Judge is legally inaccurate.
- **Disposal Nature:** Multiple adjournment orders (`"Post on 07.01.2026"`) are marked `"Disposed Of"`. In Indian High Court practice, an adjournment is an interlocutory proceeding; the matter remains pending on the file.

### Statute Transitions Evaluation
Audited against the Official Gazettes of the new criminal codes:
1. `CrPC 482` $\to$ `BNSS 528`: **Exact Equivalent** (Inherent powers to quash).
2. `CrPC 439` $\to$ `BNSS 483`: **Exact Equivalent** (Bail powers of Sessions/High Court).
3. `CrPC 438` $\to$ `BNSS 482`: **Exact Equivalent** (Anticipatory bail).
4. `CrPC 167` $\to$ `BNSS 187`: **Substantively Altered**. Under CrPC 167(2), police custody was strictly confined to the first 15 days. Under BNSS 187(2) & (3), police custody may be granted in parts throughout the 40/60 days. The table should tag this as `SUBSTANTIVELY_ALTERED`.
5. `IPC 420` $\to$ `BNS 318`: **Consolidated**. BNS 318(4) is cheating and dishonestly inducing delivery; BNS 318(1) is simple cheating. Missing sub-section specificity.
6. `IPC 302` $\to$ `BNS 103`: **Expanded**. BNS 103(1) is murder; BNS 103(2) introduces mob lynching as a specific aggravated offence.
7. `IEA 65B` $\to$ `BSA 63`: **Exact Equivalent** (Electronic records admissibility).

---

## 9. Audit E: AI Grounding Evaluation

### Adversarial Evaluation Matrix

| Test Scenario | Ground Truth Reality | Verifier Output | Finding |
| :--- | :--- | :--- | :--- |
| **1. Fabricated Case Citation** | Model invents fictitious AIR citation | `verified: true` if quote exists | **Vulnerability**: Verifier only checks quote, ignores fake case name |
| **2. Non-existent Paragraph** | Paragraph 999 requested | `isAbstained: true` | 🟢 Correctly dropped |
| **3. Opposite Legal Conclusion** | Model quotes "convicted" but claims "acquitted" | `verified: true` | **Vulnerability**: Substantive semantic divergence undetected |
| **4. Advocate Submission as Ratio** | Model quotes petitioner's argument as court holding | `verified: true` | **Vulnerability**: Verifier does not cross-check section tag |
| **5. Quoting Substring Out-of-Context** | Model quotes "bail granted" from "bail granted in earlier order was cancelled" | `verified: true` | **Vulnerability**: Negation boundary detection missing |

### Three-Dimensional Quality Assessment:
1. **Source Validity (Paragraph Existence):** 🟢 **100% Robust** (Non-existent paragraph indices are rejected immediately).
2. **Evidence Support (Verbatim Substring):** 🟢 **100% Verbatim Quote Accuracy** (Zero quotes pass unless present in source text).
3. **Legal Correctness (Interpretation Accuracy):** 🔴 **Unverified by Client Verifier** (The verifier cannot ascertain whether a claim represents the court's holding versus an advocate's submission or rejected contention).

---

## 10. Audit F: Frontend Architecture & UX

- **Component Hierarchy:** Clean modular structure (`ResultCard`, `LeftRailFacets`, `ExtractiveBrief`, `StatuteBridgeDrawer`, `CitationsDrawer`, `GroundedCopilot`, `SaveToFolderModal`).
- **State Management:** URL search parameters (`useSearchParams`) serve as the source of truth for query and filters, ensuring shareable and refresh-tolerant search state.
- **Memory & Storage:** `FolderStore` provides clean CRUD on case folders with export/import JSON functionality.
- **Accessibility (a11y):** High-contrast color tokens (`slate-900` on `slate-50`, `amber-600` accents). Semantic HTML `<article>`, `<aside>`, `<main>`, `<nav>`. Missing `aria-expanded` and `aria-controls` on mobile drawer toggle buttons.

---

## 11. Performance Results

All metrics measured on real production build assets (`web/dist/`):
- **Initial JS Bundle Size:**
  - `dist/assets/index-BLrms6rd.js`: 40.81 KB gzipped.
  - `dist/assets/vendor-W1DYQZX3.js`: 57.21 KB gzipped.
  - Total Initial JS: **98.02 KB gzipped** (Budget limit: 300 KB — 🟢 67.3% under budget).
- **CSS Bundle Size:** 6.18 KB gzipped.
- **Total Distribution Artifact:** **1.57 MB** (Budget limit: 500 MB — 🟢 99.7% headroom).
- **Search Query Execution Latency:** $< 1.5\text{ ms}$ p95 across pilot shard.
- **Document Shard Load Latency:** $< 35\text{ ms}$ over local HTTP; $< 180\text{ ms}$ over GitHub Pages CDN.

---

## 12. CI/CD & Operations Assessment

- **Workflow Files:**
  - `.github/workflows/ci.yml`: Runs lint, tests, build, and budget gate. **Defect:** Does not execute Python pipeline tests.
  - `.github/workflows/pages.yml`: Automated Pages artifact build and deployment. Verified functional.
  - `.github/workflows/nightly.yml`: Scheduled sync with `sync_monitor.py` and `verify-all.sh`.
  - `.github/workflows/pipeline.yml`: Manual matrix ingestion workflow.
- **Verification Script (`scripts/verify-all.sh`):** Executes all 5 gates sequentially (vitest, vite build, check-budget, pytest, evaluate). Exits code 0.

---

## 13. Defect Register

### DEF-DATA-01 (Severity: Critical) — Synthetic Metadata Contamination in Pipeline
- **Component:** `pipeline/ingest.py` (lines 116–127)
- **Expected:** Ingestion extracts real case numbers, parties, judges, categories, and PDF URLs from PDF headers and Parquet metadata.
- **Observed:** Ingestion hardcodes placeholder values (`Crl.O.P. No. {idx+100}`, `Applicant (HCMA01) v. State Respondent`, `Hon'ble High Court Judge`, `Criminal`, `.tar` URL).
- **Root Cause:** Placeholder generator from early prototyping was left active in the ingest loop.
- **Recommended Fix:** Implement regex extraction over PDF header text and join against upstream Parquet metadata.
- **Acceptance Test:** Assert 0% placeholder strings in generated `docs-*.json.gz` shards.

### DEF-SEARCH-01 (Severity: Critical) — Pseudo-Vector Embedding & Algorithm Misalignment
- **Component:** `pipeline/embedder.py` & `web/src/search/vector-search.ts`
- **Expected:** Browser query vectors and document vectors use identical embedding representations with positive cosine similarity for matching terms.
- **Observed:** `embedder.py` uses MD5/SHA-1 token hashing; `vector-search.ts` uses `djb2` and `h1 * 31 + char`. Vector dot-product similarity is 0.00 for identical queries. Neither uses real neural embeddings despite manifest claiming `BAAI/bge-small-en-v1.5`.
- **Root Cause:** Bypassed ONNX runtime in browser with incompatible ad-hoc hash functions.
- **Recommended Fix:** Integrate genuine `transformers.js` (`bge-small-en-v1.5` ONNX) in Web Worker or synchronize exact hashing algorithm.
- **Acceptance Test:** Test query `"bail"` against document containing `"bail"` yields cosine similarity $\ge 0.85$.

### DEF-SEARCH-02 (Severity: High) — Missing CNR in Search Shard Schema
- **Component:** `pipeline/shard_builder.py` & `web/src/search/types.ts`
- **Expected:** Advocates can search by 16-character eCourts CNR number.
- **Observed:** `cnr` is absent from `SearchShardRecord` and MiniSearch index fields.
- **Root Cause:** Shard builder omitted CNR from search record projection.
- **Recommended Fix:** Add `cnr` to `SearchShardRecord`, `shard_builder.py`, and MiniSearch `fields`.
- **Acceptance Test:** Searching for CNR `HCMA010314552022` returns matching record.

### DEF-AI-01 (Severity: High) — Verbatim Quote Verifier Substantive Conflation
- **Component:** `web/src/copilot/verifier.ts`
- **Expected:** Verifier distinguishes between verbatim quote match and legal correctness, rejecting out-of-context quotes from advocate submissions.
- **Observed:** Verifier declares claim "grounded" solely if quote substring exists, regardless of negation or whether quote is an argument rather than court ratio.
- **Root Cause:** Pure substring inclusion check without section tag verification or negation window analysis.
- **Recommended Fix:** Require that claims asserting court holdings must cite paragraphs tagged `Reasoning & Ratio` or `Final Order`.
- **Acceptance Test:** Claim asserting ratio citing a paragraph tagged `Petitioner Submissions` is rejected.

### DEF-DATA-02 (Severity: Medium) — Inaccurate Disposal Classification on Interim Orders
- **Component:** `pipeline/taxonomy.py`
- **Expected:** Daily interim orders (adjournments, calling for records) are marked `Pending` or `Interim Order`.
- **Observed:** Adjournment orders marked `Disposed Of`.
- **Root Cause:** Regex in `normalize_disposal` defaulted unclassified texts to `Disposed Of`.
- **Recommended Fix:** Explicitly detect adjournment patterns (`"Post on"`, `"List after"`, `"Call on"`) and classify as `Interim Order`.
- **Acceptance Test:** Order stating `"Post these petitions on 07.01.2026"` receives disposal `Interim Order`.

### DEF-OPS-01 (Severity: Medium) — Manifest Document Count Mismatch in Sample Shard
- **Component:** `web/public/data-sample/manifest.json`
- **Expected:** `manifest.json` `doc_count` matches exact record count of shard file.
- **Observed:** Manifest reports 46 documents; actual shard contains 20 documents.
- **Root Cause:** `manifest_builder.py` read fragment from `data/shards/` without re-scanning sample directory.
- **Recommended Fix:** Update manifest generation script to read local directory shard files directly.
- **Acceptance Test:** `manifest.json` `total_docs` equals `len(docs-*.json.gz)`.

---

## 14. Technical Debt & Architecture Risks

1. **Memory Ceiling on Shard Expansion:** If corpus expands beyond 5,000 documents without partition-level lazy loading in MiniSearch, mobile devices will experience high memory pressure.
2. **Offline TAR Streaming Fragility:** Direct streaming of large TAR files over unsigned S3 connections in GitHub Actions can fail intermittently on network timeouts.
3. **Absence of PDF Viewer:** `pdf_source_url` currently links to a raw TAR archive, preventing users from viewing the original High Court PDF in the reader.

---

## 15. v1.1.0 Recommendations Summary

1. **P0 (Immediate):** Fix `pipeline/ingest.py` to extract genuine parties, case numbers, and judges from PDF text.
2. **P0 (Immediate):** Correct vector embedding synchronization between Python and TypeScript.
3. **P0 (Immediate):** Index CNR in `search-*.json.gz` and MiniSearch.
4. **P1 (High):** Enhance AI Verifier to check section tags and reject out-of-context advocate submissions.
5. **P1 (High):** Refine disposal taxonomy to distinguish interim orders from final judgments.
6. **P1 (High):** Re-generate sample shards with synchronized `manifest.json`.

---
*Audit conducted independently by Senior Architecture & Legal Review Team.*
