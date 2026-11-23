# NyayaReader v1.0.0 — Independent Code Audit & Defect Register

**Audit Timestamp**: 2026-11-23T23:20:00+05:30  
**Audit Branch**: `audit/phase-13`  
**Target Repository**: `https://github.com/kiru6006/highcourt-judgment-agent`  
**Live Site**: `https://kiru6006.github.io/highcourt-judgment-agent/`  
**Methodology**: Read-only, evidence-based verification against actual source code, production builds, headless browser audits, and standalone mathematical parity benchmarks. Zero source code modifications made under `web/` or `pipeline/`.

---

## 1. Reproducibility & Build Verification

### Execution Command:
```bash
bash scripts/verify-all.sh
```

### Measured Output:
```
========================================================
   NyayaReader: Full Platform Verification Suite
========================================================

--- 1. Client Unit & Integration Tests (vitest) ---
 Test Files  8 passed (8)
      Tests  42 passed (42)
   Duration  1.70s

--- 2. Client Production Bundle Build (vite) ---
dist/index.html                   2.08 kB │ gzip:  1.05 kB
dist/assets/index-C1vTXG1C.css   33.21 kB │ gzip:  6.18 kB
dist/assets/index-BLrms6rd.js   158.02 kB │ gzip: 40.81 kB
dist/assets/vendor-W1DYQZX3.js  182.88 kB │ gzip: 57.21 kB
✓ built in 4.04s

--- 3. Static Performance & Hard Budget Gate ---
=== NyayaReader: Performance & Size Budget Enforcement Gate ===
-> Total Pages Artifact Size: 1.57 MB (Limit: 500 MB)
   Asset: index-BLrms6rd.js -> 39.82 KB (gzip)
   Asset: vendor-W1DYQZX3.js -> 55.76 KB (gzip)
-> Largest JavaScript Asset: 55.76 KB gzipped (Limit: 300 KB)
-> Git sample data: 0.05 MB (Limit: 5 MB)
SUCCESS: All size and performance budgets passed!

--- 4. Pipeline & Ingestion Unit Tests (pytest) ---
============================== 50 passed in 0.11s ==============================

--- 5. Retrieval & RRF Evaluation Benchmark ---
Loaded 46 documents for evaluation.
Loaded 25 evaluation queries.
{
  "lexical":  {"Recall@10": 0.92, "MRR@10": 0.8133, "p50_latency_ms": 0.3, "p95_latency_ms": 0.47},
  "semantic": {"Recall@10": 0.88, "MRR@10": 0.7190, "p50_latency_ms": 0.13, "p95_latency_ms": 0.48},
  "hybrid":   {"Recall@10": 0.92, "MRR@10": 0.7708, "p50_latency_ms": 0.01, "p95_latency_ms": 0.01}
}
========================================================
   SUCCESS: All 5 Verification Gates Passed Cleanly!
========================================================
```
- **Verdict**: **PASS** (Local build and test gates execute cleanly).

---

## 2. Live Site Audit (`https://kiru6006.github.io/highcourt-judgment-agent/`)

Audited with Playwright Chromium across Desktop (`1440x900`) and Mobile (`375x667`) viewports (`audit/02_live_site_check.ts`).

| Route | Viewport | Status | Console Errors | Footer Attribution | Load Time |
|---|---|---|---|---|---|
| `/` | 1440x900 | 200 OK | 0 | CC-BY-4.0 & eCourts | 2467 ms |
| `/search` | 1440x900 | 200 OK | 0 | CC-BY-4.0 & eCourts | 621 ms |
| `/case/HCMA01-CRL-OP-2022-101` | 1440x900 | 200 OK | 0 | CC-BY-4.0 & eCourts | 635 ms |
| `/links` | 1440x900 | 200 OK | 0 | CC-BY-4.0 & eCourts | 649 ms |
| `/folders` | 1440x900 | 200 OK | 0 | CC-BY-4.0 & eCourts | 640 ms |
| `/about-data` | 1440x900 | 200 OK | 0 | CC-BY-4.0 & eCourts | 644 ms |
| `/` | 375x667 | 200 OK | 0 | CC-BY-4.0 & eCourts | 794 ms |
| `/search` | 375x667 | 200 OK | 0 | CC-BY-4.0 & eCourts | 636 ms |
| `/case/HCMA01-CRL-OP-2022-101` | 375x667 | 200 OK | 0 | CC-BY-4.0 & eCourts | 635 ms |
| `/links` | 375x667 | 200 OK | 0 | CC-BY-4.0 & eCourts | 640 ms |
| `/folders` | 375x667 | 200 OK | 0 | CC-BY-4.0 & eCourts | 642 ms |
| `/about-data` | 375x667 | 200 OK | 0 | CC-BY-4.0 & eCourts | 638 ms |

### Deep-Link & Storage Evidence:
- **Direct Deep-Link Refresh**: `deepLinkRefreshOk: true`. Hash-routing / SPA fallback routes cleanly without 404.
- **Pages Bundle Size**: 1.57 MB total ($< 500\text{ MB}$ budget).
- **Shard Sizes**: `docs-33_10-2022.json.gz` is 0.0492 MB ($< 25\text{ MB}$ cap).
- **About Data Page**: Present and accessible at `/about-data`.

---

## 3. Corpus Reality vs Claims

Measured from `data/shards/` and `web/public/data-sample/` (`audit/03_corpus_audit.py`).

| Metric | Claimed in README | Actual Measured Value | Verdict | Evidence |
|---|---|---|---|---|
| Document Count | "Pilot Corpus" | 46 documents in shard | **Verified (Small Pilot)** | `data/shards/docs-33_10-2022.json.gz` |
| Court Coverage | "Madras, Karnataka, Delhi" | Madras High Court (`33~10`) only | **Discrepancy** | Only 1 shard generated |
| Year Window | "2022" | 2022 only | **Verified** | `docs-33_10-2022.json.gz` |
| Paragraph Extraction | Real Madras HC | 4.59 paras/doc, real text | **Verified** | Paragraphs match genuine orders |
| Header Metadata | "Real metadata" | Hardcoded synthetic strings | **REFUTED (DEF-DATA-01)** | `pipeline/ingest.py` lines 116–127 |
| Section Tagging | "100% Tagged" | 46 / 46 (100.0%) | **Verified** | Facts, submissions, reasoning present |
| Synthetic Data Leak | Zero in Prod | 8 mock records in fixture | **Risk** | Reachable if offline / mock mode toggled |

---

## 4. Embedding Parity Audit (B1)

Measured on 200 random corpus chunks and 30 legal queries (`audit/04_embedding_parity.py`).
Compares Python `pipeline/embedder.py` (MD5/SHA1 projection) against TypeScript `web/src/search/vector-search.ts` (`djb2` + additive char hash).

```json
{
  "chunks_evaluated": 200,
  "queries_evaluated": 30,
  "cosine_similarity": {
    "median": 0.0753,
    "mean": 0.0826,
    "min": 0.0651,
    "max": 0.1977,
    "std": 0.0208
  },
  "rank_agreement_top10_overlap": {
    "median": 0.0,
    "mean": 0.0667,
    "min": 0.0,
    "max": 0.4
  },
  "threshold_median_cosine": 0.99,
  "threshold_top10_overlap": 0.80,
  "parity_passed": false
}
```

- **Verdict**: **FAILED (CRITICAL BLOCKER `DEF-SEARCH-01`)**
- **Root Cause**: The Python embedder uses cryptographic hashing (`hashlib.md5`, `hashlib.sha1`), whereas the browser query encoder uses rolling polynomial bitwise hashes (`h1 * 31 + char` and `djb2`). The resulting vector spaces are completely orthogonal (median cosine similarity is **0.0753**; rank overlap is **0.00**).
- **Impact**: In-browser vector search produces arbitrary rankings. Hybrid RRF effectively degenerates to BM25 alone with noise.

---

## 5. AI Faithfulness & Verifier Adversarial Evaluation

Measured across 5 adversarial test categories (`audit/05_verifier_adversarial.ts`).

| Test Case | Scenario | Expected | Actual | Status | Defect ID |
|---|---|---|---|---|---|
| 1. Valid Claim | Exact quote in cited paragraph | `verified: true` | `verified: true` | **PASS** | None |
| 2. Fabricated Quote | Made-up text not in judgment | `verified: false` | `verified: false` | **PASS** | None |
| 3. Wrong Paragraph | Quote exists in Para 1, cited Para 3 | `verified: false` | `verified: false` | **PASS** | None |
| 4. Prompt Injection | Judgment text contains `Ignore instructions...` | Substring match | Verified as quote | **PASS (Expected)** | Needs prompt jailbreak defense |
| 5. Advocate Submission | Counsel argument quoted as judicial ratio | `warning / reject` | `verified: true` | **FAIL (VULNERABILITY)** | **`DEF-AI-01`** |

- **Key Finding**: The verifier only performs a raw character substring check. It does not check which section the paragraph belongs to (`submissions` vs `reasoning`). An LLM claiming "The court held the petitioner is innocent" citing an advocate's submission passes verification as `verified: true`.

---

## 6. Restricted Content & Quarantine Audit

Tested 6 sensitive case scenarios against `config/restricted.json` and `pipeline/quarantine.py` (`audit/06_restricted_audit.py`).

| Fixture ID | Category | Current Status | Leaks to Production? | Root Cause |
|---|---|---|---|---|
| `FIXTURE-POCSO-01` | POCSO in Case Header | QUARANTINED | No | Matched `pocso_protection` |
| `FIXTURE-POCSO-02-LATE` | POCSO Mentioned in Para 8 Only | **LEAKED** | **YES** | `pipeline/quarantine.py` line 56 checks only `paragraphs[:3]`! |
| `FIXTURE-JUVENILE-01` | Juvenile Justice Act | QUARANTINED | No | Matched `juvenile_justice` |
| `FIXTURE-RAPE-NAME-01` | Section 376 IPC with Victim Name | **LEAKED** | **YES** | No regex for S. 376 victim naming without S. 228A citation |
| `FIXTURE-IN-CAMERA-01` | In-Camera / Prohibited Publication | **LEAKED** | **YES** | No rule for in-camera or prohibited publication markers |
| `FIXTURE-MATRIMONIAL-01` | Matrimonial Custody Sealed Cover | **LEAKED** | **YES** | No rule for matrimonial / custody sealed records |

- **Verdict**: **FAILED (HIGH SEVERITY `DEF-SEC-01`, `DEF-SEC-02`, `DEF-SEC-03`)**
- **Critical Leak**: Restricting inspection to only the first 3 paragraphs allows POCSO and juvenile details in subsequent paragraphs to leak into published shards.

---

## 7. Statute Bridge Audit

Audited `data/mappings/statute_transitions.csv` (`audit/07_statute_audit.py`).
- **Source**: `data/mappings/statute_transitions.csv`
- **Total Mappings Indexed**: 15 rows
- **TEST_ONLY Guard**: **PASSED** (0 `TEST_ONLY` rows found).
- **Official Gazette Spot-Check Required (20 Provisions)**:
  1. CrPC § 482 $\to$ BNSS § 528 (Inherent powers)
  2. CrPC § 438 $\to$ BNSS § 482 (Anticipatory bail)
  3. CrPC § 439 $\to$ BNSS § 483 (Special bail powers)
  4. CrPC § 167 $\to$ BNSS § 187 (Remand & police custody duration — *substantive alteration*)
  5. CrPC § 154 $\to$ BNSS § 173 (FIR & e-FIR)
  6. CrPC § 313 $\to$ BNSS § 351 (Accused examination)
  7. CrPC § 173(8) $\to$ BNSS § 193(9) (Further investigation)
  8. CrPC § 41A $\to$ BNSS § 35(3) (Notice of appearance)
  9. IPC § 420 $\to$ BNS § 318(4) (Cheating)
  10. IPC § 406 $\to$ BNS § 316(2) (Criminal breach of trust)
  11. IPC § 302 $\to$ BNS § 103(1) (Murder)
  12. IPC § 307 $\to$ BNS § 109 (Attempt to murder)
  13. IPC § 376 $\to$ BNS § 64 (Rape)
  14. IPC § 498A $\to$ BNS § 85 (Cruelty by husband/relatives)
  15. IPC § 120B $\to$ BNS § 61(2) (Criminal conspiracy)
  16. IPC § 124A $\to$ BNS § 152 (Sedition replaced by endangering sovereignty)
  17. IPC § 304A $\to$ BNS § 106 (Causing death by negligence)
  18. IEA § 65B $\to$ BSA § 63 (Electronic records admissibility)
  19. IEA § 27 $\to$ BSA § 23 (Discovery of facts)
  20. IEA § 114A $\to$ BSA § 119 (Presumption of absence of consent)

---

## 8. Security & Compliance Audit

Measured via `audit/08_security_audit.sh`.

```json
{
  "compliance_files": [
    "LICENSE: MISSING",
    "LICENSE.md: MISSING",
    "NOTICE: MISSING",
    "THIRD_PARTY.md: MISSING",
    "docs/TAKEDOWN.md: MISSING",
    "docs/PRIVACY.md: MISSING",
    "docs/SECURITY_PRIVACY.md: PRESENT"
  ],
  "inner_html_usages": [],
  "csp_header_present": true,
  "hardcoded_secrets_found": false,
  "key_storage_references": []
}
```

- **CSP Security**: Enforced in `web/index.html` with restrictive meta tag (`connect-src 'self' https://generativelanguage.googleapis.com https://*.github.io https://registry.opendata.aws; object-src 'none'`).
- **XSS & DOM Safety**: Zero usages of `innerHTML` or `dangerouslySetInnerHTML` in `web/src/`.
- **Secrets & Keys**: Zero hardcoded API keys detected in repository.
- **Compliance Gaps**: `LICENSE`, `NOTICE`, `THIRD_PARTY.md`, `TAKEDOWN.md`, and standalone `PRIVACY.md` are missing from the repo root.

---

## 9. Web Links Audit

Measured via `audit/09_links_audit.py` on `config/links.json`.
- **Top-Level Portals**: eCourts CNR, eCourts Search, Indian Kanoon, and Google Scholar URL templates are valid.
- **Defect Identified (`DEF-DATA-03`)**:
  - `court_29_3` (Karnataka High Court) contains a domain typo in `portal_url` and `judis_search_url`:
    - Observed: `https://karnatakahihecourt.kar.nic.in/`
    - Correct: `https://karnatakahighcourt.kar.nic.in/`

---

## 10. Operations & Nightly Sync Audit

Measured via `audit/10_ops_audit.py` on `.github/workflows/nightly.yml`.
- **Schedule**: `0 2 * * *` (Daily at 02:00 UTC).
- **Defects Identified**:
  - `DEF-OPS-02`: Unpinned pip dependencies (`pip install pymupdf duckdb boto3 jsonschema pytest sentence-transformers`) in CI.
  - `DEF-OPS-03`: `pipeline/sync_monitor.py` does not crawl AWS S3 for new dates; it only logs existing local shard metrics to `docs/ops.md`.

---

## 11. Comprehensive Defect Register & README Claim Audit

### Defect Register (Ranked by Severity)

| Defect ID | Severity | Component | Issue Summary | Proposed Fix | Effort |
|---|---|---|---|---|---|
| **`DEF-SEARCH-01`** | **Blocker** | `pipeline/embedder.py` & `web/src/search/vector-search.ts` | Python MD5/SHA1 vs TypeScript `djb2` hash discrepancy; median cosine is **0.0753**; top-10 overlap is **0.00**. | Standardize on identical MurmurHash3/FNV-1a 384-dim algorithm in both languages. | 20h |
| **`DEF-DATA-01`** | **Blocker** | `pipeline/ingest.py` (L116–127) | Header metadata hardcodes synthetic template values (`HCMA01`, `State Respondent`, `Hon'ble High Court Judge`). | Implement regex extractor for real case number, parties, and coram from judgment text. | 16h |
| **`DEF-SEC-01`** | **Blocker** | `pipeline/quarantine.py` (L56) | Only inspects first 3 paragraphs; POCSO/juvenile references in paragraph 4+ leak into production. | Scan all paragraphs or joined full-text for sensitive markers. | 6h |
| **`DEF-AI-01`** | **High** | `web/src/copilot/verifier.ts` | Verifier does not enforce section tags; counsel submissions cited as judicial ratios pass verification. | Check paragraph section classification; reject submissions as ratio. | 16h |
| **`DEF-SEC-02`** | **High** | `config/restricted.json` | Lacks in-camera, matrimonial custody, and prohibited publication markers. | Add regex rules for `in-camera`, `sealed cover`, and family dispute privacy. | 8h |
| **`DEF-OPS-01`** | **Medium** | `web/public/data-sample/manifest.json` | Manifest reports 46 records but sample file has only 20 records. | Synchronize manifest record counts with build artifacts. | 4h |
| **`DEF-DATA-03`** | **Medium** | `config/links.json` (L31–33) | Domain typo `karnatakahihecourt.kar.nic.in` breaks Karnataka HC links. | Fix domain spelling to `karnatakahighcourt.kar.nic.in`. | 1h |
| **`DEF-OPS-02`** | **Medium** | `.github/workflows/nightly.yml` | Unpinned pip dependencies in CI workflow. | Pin dependencies in `requirements-ci.txt` or lockfile. | 4h |
| **`DEF-COMP-01`**| **Low** | Root directory | `LICENSE`, `NOTICE`, and `THIRD_PARTY.md` missing from repo root. | Add Apache 2.0 / MIT license and third-party notices. | 4h |

---

### README Claim Audit Reconciliation

| README Claim | Reality Check | Audit Classification |
|---|---|---|
| "5/5 Gates Passed" | Scripts pass, but retrieval benchmark masks hash discrepancy | **Partially Verified (Flawed Metric)** |
| "Hybrid RRF Retrieval" | Lexical BM25 works; dense vector is orthogonal noise | **Refuted (Blocker `DEF-SEARCH-01`)** |
| "Grounded AI Copilot" | Substring match works; ratio vs submission boundary missing | **Partially Verified (`DEF-AI-01`)** |
| "Statute Transition Bridge" | 15 rows mapped; TEST_ONLY blocked; substantive alterations unflagged | **Verified (Small Catalog)** |
| "POCSO Quarantine Regex" | Leaks if POCSO appears after paragraph 3 | **Refuted (`DEF-SEC-01`)** |
| "3-Pane Reader" | Layout, anchors, and navigation render cleanly | **Verified Working** |
| "Multi-Source Web Links" | Valid templates, but Karnataka HC domain has typo | **Verified with Defect (`DEF-DATA-03`)** |
| "Zero Server / Static" | 100% static on GitHub Pages; 1.57 MB bundle | **Verified Working** |
