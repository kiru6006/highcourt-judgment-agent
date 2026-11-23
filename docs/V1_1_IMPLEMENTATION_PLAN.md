# Nyaya AI Reader v1.1.0 Implementation Plan & Engineering Backlog

## Executive Summary
This document specifies the prioritized remediation and feature backlog for **Nyaya AI Reader v1.1.0**, transitioning the repository from a mock-metadata pilot to a production-grade static legal research platform. All items directly resolve verified findings from `docs/V1_0_INDEPENDENT_AUDIT.md`.

---

## Priority Taxonomy
- **P0 (Critical / Release Blocker)**: Data integrity, retrieval algorithm synchronization, core legal identifiers (CNR). Zero tolerance for simulated data or algorithmic divergence.
- **P1 (High Priority)**: Grounding verification robustness, order taxonomy accuracy, manifest and cache consistency.
- **P2 (Medium Priority / Quality & Polish)**: Legal transition taxonomy expansion, responsive UX / accessibility, direct source PDF linking.
- **P3 (Low Priority / Next-Gen Enhancements)**: Multi-court scaling, in-browser small SLM execution, automated citation graph analysis.

---

## 1. P0 Backlog: Integrity & Algorithmic Correctness

### ITEM-P0-01: End-to-End Extraction of Genuine Court Metadata
- **Defect ID**: `DEF-DATA-01`
- **Component**: `pipeline/ingest.py`, `pipeline/extract.py`
- **Description & Root Cause**: `pipeline/ingest.py` (lines 116–127) hardcoded placeholder values (`Crl.O.P. No. {idx+100}`, `Applicant (HCMA01) v. State Respondent`, `Hon'ble High Court Judge`, `Criminal`) instead of extracting metadata from judgment header text or upstream Parquet datasets.
- **Severity / Priority**: Critical / P0
- **Implementation Strategy**:
  1. Update `pipeline/extract.py` with regex and NLP header extraction patterns calibrated for Madras HC order headers:
     - Case Type & Number: `r"([A-Z][A-Za-z\.\s]+)\s*(?:No\.?|NUMBER)\s*(\d+)\s*(?:OF|of|\/)\s*(\d{4})"`
     - Coram / Judge: `r"(?:THE\s+HON['’]BLE\s+(?:MR\.|MS\.|JUSTICE|MRS\.)\s+([A-Z\.\s]+?))\s*(?:\n|DATED)"`
     - Parties: Parse `"BETWEEN ... Petitioner/Appellant ... AND ... Respondent"` blocks.
  2. Fallback to AWS Open Data Parquet row metadata (`case_number`, `petitioner`, `respondent`, `judge_name`) if regex confidence is below 0.85.
  3. Fail the pipeline build if metadata fields match regex `r"HCMA01|State Respondent|Applicant \("`.
- **Acceptance Criteria**:
  - 100% of documents in `data/shards/` contain verified party names, genuine bench judge names, and exact case numbers matching source text.
  - Test `tests/test_ingest_metadata.py` asserts zero synthetic placeholder strings in all output shards.
- **Estimated Effort**: 16 Engineering Hours (3 SP)
- **Dependencies**: None.

---

### ITEM-P0-02: Search Vector Algorithm Synchronization (Python & TypeScript)
- **Defect ID**: `DEF-SEARCH-01`
- **Component**: `pipeline/embedder.py`, `web/src/search/vector-search.ts`, `data/shards/`
- **Description & Root Cause**: `pipeline/embedder.py` used MD5/SHA-1 384-dimensional sparse projection, while `web/src/search/vector-search.ts` used `djb2` and character rolling hashes. Cosine similarity between query and document vectors was 0.00.
- **Severity / Priority**: Critical / P0
- **Implementation Strategy**:
  1. Standardize on deterministic MurmurHash3 or FNV-1a 384-dimension projection across both Python (`mmh3` or pure-Python implementation) and TypeScript (`murmurhash3js` or self-contained function in `vector-search.ts`).
  2. Implement identical L2 normalization and `int8` quantization formulas:
     $$v_{norm} = \frac{v}{\|v\|_2}, \quad v_{quant} = \text{round}(v_{norm} \times 127)$$
  3. Alternatively, compile lightweight ONNX Runtime Web / Transformers.js running genuine `bge-small-en-v1.5` in browser worker with fallback to the synchronized MurmurHash3 embedding.
  4. Regenerate all vector shards in `data/shards/` and `web/public/data-sample/`.
- **Acceptance Criteria**:
  - Python test `tests/test_embedder_alignment.py` and Vitest `web/src/search/vector-search.test.ts` execute identical test strings (`"anticipatory bail under section 438"`, `"quash criminal proceedings under 482"`) and produce identical 384-dim arrays with cosine similarity $\ge 0.999$.
  - End-to-end Vitest verifies RRF correctly ranks semantically relevant cases above non-relevant cases.
- **Estimated Effort**: 20 Engineering Hours (5 SP)
- **Dependencies**: ITEM-P0-01.

---

### ITEM-P0-03: CNR Indexing & Exact Lookup in MiniSearch
- **Defect ID**: `DEF-SEARCH-02`
- **Component**: `web/src/search/search-client.ts`, `web/src/types/judgment.ts`, `pipeline/build_search_index.py`
- **Description & Root Cause**: `cnr` was absent from `SearchShardRecord` interface and excluded from MiniSearch fields (`searchFields: ['title', 'summary', 'statutes', 'judge', 'court', 'caseNumber']`). 16-character eCourts CNR lookups failed.
- **Severity / Priority**: Critical / P0
- **Implementation Strategy**:
  1. Add `cnr: string;` to `SearchShardRecord` in `web/src/types/judgment.ts`.
  2. Update `pipeline/build_search_index.py` to extract and serialize `cnr` into search index shards.
  3. Add `cnr` to MiniSearch `fields` and `searchFields` with high boost weighting (`boost: { cnr: 10, caseNumber: 6, title: 4, ... }`).
  4. Add exact CNR regex routing in `search-client.ts` (`/^[A-Z]{4}\d{12}$/`) to trigger direct target document retrieval.
- **Acceptance Criteria**:
  - Querying any 16-character CNR (e.g. `HCMA010001012022`) returns the exact target document as rank #1 with score > 10.
  - Unit test in `search-client.test.ts` covers valid and malformed CNR queries.
- **Estimated Effort**: 8 Engineering Hours (2 SP)
- **Dependencies**: ITEM-P0-01.

---

## 2. P1 Backlog: Legal Grounding & Pipeline Integrity

### ITEM-P1-01: Context-Aware AI Grounding & Submissions/Ratio Boundary Enforcement
- **Defect ID**: `DEF-AI-01`
- **Component**: `web/src/copilot/verifier.ts`, `web/src/copilot/gemini-client.ts`
- **Description & Root Cause**: `verifier.ts` performed pure string substring matching. If an AI cited an advocate submission as a court finding, or omitted a crucial "not" / negation, the verification passed as `verified: true`.
- **Severity / Priority**: High / P1
- **Implementation Strategy**:
  1. Enhance `QuoteVerificationResult` to return structured classification:
     - `quoteFound: boolean`
     - `section: 'facts' | 'submissions' | 'reasoning' | 'order' | 'unknown'`
     - `isOperativeRatio: boolean` (true only if in `reasoning` or `order`)
     - `negationDetected: boolean`
  2. Reject or display warning badge when AI answer presents quotes from `submissions` as judicial conclusions.
  3. Add prompt guardrails in `gemini-client.ts` instructing Gemini to explicitly distinguish counsel arguments from court rulings.
- **Acceptance Criteria**:
  - Adversarial test cases in `web/src/copilot/verifier.test.ts` confirm:
    - Quote from `submissions` section labeled with `warning: 'Cites counsel argument, not judicial ratio'`.
    - Quote with altered polarity or non-existent paragraph fails verification.
- **Estimated Effort**: 16 Engineering Hours (3 SP)
- **Dependencies**: None.

---

### ITEM-P1-02: Accurate Order Taxonomy (Interim Order vs Disposed Judgment)
- **Defect ID**: `DEF-DATA-02`
- **Component**: `pipeline/extract.py`, `pipeline/clean.py`, `web/src/types/judgment.ts`
- **Description & Root Cause**: Routine call-work and adjournment orders were labeled `disposed: true` and `Disposed Of` because classification logic checked for any presence of date or standard closure words.
- **Severity / Priority**: High / P1
- **Implementation Strategy**:
  1. Implement classifier rule:
     - If text contains `Post on`, `List after`, `Call on`, `Interim stay extended`, or `Notice returnable` without words of final adjudication (`petition is allowed`, `dismissed`, `quashed`), classify as `disposition: 'Interim Order'` and `disposed: false`.
  2. Expose `isInterim` badge in judgment header UI (`web/src/components/reader/JudgmentHeader.tsx`).
- **Acceptance Criteria**:
  - Sample corpus re-extracted: 0 adjournment orders marked as `Disposed Of`.
  - Regression test `tests/test_order_classification.py` validates 50 sample texts against human advocate ground truth.
- **Estimated Effort**: 12 Engineering Hours (2 SP)
- **Dependencies**: ITEM-P0-01.

---

### ITEM-P1-03: Shard Manifest & Sample Cache Synchronization
- **Defect ID**: `DEF-OPS-01`
- **Component**: `pipeline/export_shards.py`, `scripts/build.sh`, `web/public/data-sample/`
- **Description & Root Cause**: `web/public/data-sample/manifest.json` reported 46 judgments in `docs-33_10-2022.json.gz`, but the sample file contained only 20 records.
- **Severity / Priority**: High / P1
- **Implementation Strategy**:
  1. Add pre-commit / build validation step `pipeline/validate_shards.py` that verifies:
     $$\text{len}(\text{shard.records}) == \text{manifest.shards}[i].\text{recordCount}$$
  2. Ensure GitHub Pages build script automatically generates `manifest.json` matching the exact files bundled into `dist/`.
- **Acceptance Criteria**:
  - Build fails with exit code 1 if any shard manifest record count deviates from the actual gzipped record count.
  - `npm run build` generates perfectly synchronized manifest and shard files.
- **Estimated Effort**: 6 Engineering Hours (1 SP)
- **Dependencies**: None.

---

## 3. P2 Backlog: Quality, Polish & Legal Completeness

### ITEM-P2-01: Granular Statute Transition Taxonomy (IPC/BNS & CrPC/BNSS)
- **Defect ID**: `ENH-LEGAL-01`
- **Component**: `data/mappings/statute_transitions.csv`, `web/src/components/reader/StatuteTransitions.tsx`
- **Description & Root Cause**: Current mapping CSV only supports 1-to-1 linear correspondence. Sections like CrPC § 167 vs BNSS § 187 involve substantive police custody alteration (15 days across 40/60 days vs initial 15 days), requiring nuanced legal categorization.
- **Severity / Priority**: Medium / P2
- **Implementation Strategy**:
  1. Expand `statute_transitions.csv` schema with columns:
     `old_statute,old_section,new_statute,new_section,equivalence_type,scope_change_notes`
     - `equivalence_type`: `EXACT`, `PARTIAL`, `EXPANDED`, `SUBSTANTIVELY_ALTERED`
  2. Render visual indicator pill in `StatuteTransitions.tsx` explaining scope alteration when clicked.
- **Acceptance Criteria**:
  - Advocates reviewing CrPC 167 see clear warning pill: `Substantively Altered: 15-day custody period modified under BNSS 187`.
  - Vitest validates rendering for all 4 equivalence types.
- **Estimated Effort**: 12 Engineering Hours (3 SP)
- **Dependencies**: None.

---

### ITEM-P2-02: Accessibility (a11y) & Mobile Reader Drawers
- **Defect ID**: `ENH-UI-01`
- **Component**: `web/src/components/reader/`, `web/src/components/search/`
- **Description & Root Cause**: Mobile 375px view truncates three-pane reader into stacked views without accessible ARIA drawer controls or skip links.
- **Severity / Priority**: Medium / P2
- **Implementation Strategy**:
  1. Implement slide-over drawer with `role="dialog"`, `aria-modal="true"`, focus trapping (`focus-trap-react`), and accessible toggle buttons for Outline and Legal Insights panes.
  2. Add `"Skip to judgment text"` accessible skip link (`sr-only focus:not-sr-only`).
  3. Verify color contrast ratios for statute chips to exceed WCAG AA 4.5:1.
- **Acceptance Criteria**:
  - Zero Axe-core / Lighthouse a11y violations across mobile, tablet, and desktop viewports.
  - Full keyboard navigation supported without focus traps.
- **Estimated Effort**: 14 Engineering Hours (3 SP)
- **Dependencies**: None.

---

### ITEM-P2-03: Direct Madras High Court Source PDF Linking
- **Defect ID**: `ENH-DATA-01`
- **Component**: `web/src/components/reader/JudgmentHeader.tsx`, `pipeline/ingest.py`
- **Description & Root Cause**: `pdf_url` points to generic court portal landing rather than direct authenticated or archived PDF permalink.
- **Severity / Priority**: Medium / P2
- **Implementation Strategy**:
  1. Construct canonical judgment URLs using Madras HC / eCourts CNR permalink pattern:
     `https://hcservices.ecourts.gov.in/ecourtindiaHC/cases/display_pdf.php?filename=...`
  2. Provide fallback to AWS Open Data S3 public PDF bucket mirror.
  3. Include copyable citation and verified source download button in `JudgmentHeader.tsx`.
- **Acceptance Criteria**:
  - Clicking "View Source PDF" opens authentic judicial PDF or AWS S3 archived PDF in new tab.
- **Estimated Effort**: 8 Engineering Hours (2 SP)
- **Dependencies**: ITEM-P0-01.

---

## 4. P3 Backlog: Scaling & Advanced Capabilities

### ITEM-P3-01: Corpus Expansion to 1,000+ Madras HC Judgments
- **Defect ID**: `ENH-SCALE-01`
- **Component**: `pipeline/`, GitHub Actions `nightly-sync.yml`
- **Description & Root Cause**: Corpus currently constrained to pilot 46 judgments.
- **Severity / Priority**: Low / P3
- **Implementation Strategy**:
  1. Scale ingestion pipeline to process 1,000 judgments across 2020–2024.
  2. Implement shard partitioning by year-month (`docs-33_10-2022-01.json.gz`).
  3. Benchmark client memory and search latency at 1,000 documents.
- **Estimated Effort**: 24 Engineering Hours (5 SP)
- **Dependencies**: ITEM-P0-01, ITEM-P0-02, ITEM-P0-03.

---

### ITEM-P3-02: Client-Side Small Language Model Integration (WebLLM)
- **Defect ID**: `ENH-AI-01`
- **Component**: `web/src/copilot/webllm-client.ts`
- **Description & Root Cause**: Complete zero-server privacy without requiring BYOK Gemini API keys.
- **Implementation Strategy**:
  1. Integrate optional `@mlc-ai/web-llm` running `Qwen2.5-0.5B-Instruct` or `SmolLM2-360M` via WebGPU.
  2. Implement progressive download with storage in CacheAPI / IndexedDB.
- **Estimated Effort**: 40 Engineering Hours (8 SP)
- **Dependencies**: ITEM-P1-01.

---

## 5. Milestone Schedule & Release Criteria

| Milestone | Target Scope | Duration | Quality Gate |
| :--- | :--- | :--- | :--- |
| **v1.1.0-alpha** | P0 Items (DEF-DATA-01, DEF-SEARCH-01, DEF-SEARCH-02) | 5 Days | Dot product > 0.99; genuine metadata; 100% CNR search accuracy. |
| **v1.1.0-beta** | P1 Items (DEF-AI-01, DEF-DATA-02, DEF-OPS-01) | 4 Days | Zero ungrounded AI ratios; accurate interim order taxonomy. |
| **v1.1.0-rc** | P2 Items (ENH-LEGAL-01, ENH-UI-01, ENH-DATA-01) | 3 Days | WCAG AA compliant; expanded statute mapping; live PDF links. |
| **v1.1.0-final** | Performance regression, docs, deployment | 2 Days | `scripts/verify-all.sh` green; live GitHub Pages deployed. |

---

## 6. Verification & Sign-Off Checklist
- [ ] No placeholder strings (`HCMA01`, `State Respondent`, `Hon'ble High Court Judge`) in data pipeline.
- [ ] Vitest and Python embedding test suites assert identical vector quantization.
- [ ] Search benchmark demonstrates Recall@10 $\ge 0.85$ and MRR@10 $\ge 0.80$ on evaluation queries.
- [ ] Adversarial AI test suite passes all 10 legal grounding traps.
- [ ] Bundle size remains under 2.5 MB gzipped (excluding ONNX/WebLLM optional weights).
