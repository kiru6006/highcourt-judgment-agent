# Nyaya AI Reader — Phase 2 Empirical Data Spike Report

## 1. Executive Summary
This report documents the empirical measurements conducted against `s3://indian-high-court-judgments` (AWS region: `ap-south-1`, anonymous access), real PDF document extraction metrics via PyMuPDF, vector similarity throughput, browser hosting CORS validation, and size budget projections.

All numbers in this report are measured directly by the reproducible spike suite (`make spike`).

---

## 2. Upstream Parquet Metadata & Schema Discovery

### 2.1 Partition Layout & S3 Top-Level Structure
- **Prefixes**: `metadata/parquet/`, `metadata/parquet_case_details/`, `metadata/tar/`, `data/tar/`.
- **Partition Scheme**: `metadata/parquet/year={YYYY}/court={court_code}/bench={bench_name}/metadata.parquet`
- **Pilot Example (Madras High Court 2022)**:
  - Principal Seat: `metadata/parquet/year=2022/court=33_10/bench=hc_cis_mas/metadata.parquet`
  - Madurai Bench: `metadata/parquet/year=2022/court=33_10/bench=mdubench/metadata.parquet`

### 2.2 Verified Column Schema (`metadata.parquet`)
Analyzed 500 rows from `metadata/parquet/year=2022/court=33_10/bench=hc_cis_mas/metadata.parquet`:

| Column Name | Discovered Type | Null Rate (%) | Description / Purpose |
|---|---|---|---|
| `court_code` | VARCHAR | **0.0%** | State High Court identifier (e.g. `33_10` Madras) |
| `court` | VARCHAR | **0.0%** | Formal court name |
| `bench` | VARCHAR | **0.0%** | Specific bench seat (`hc_cis_mas`, `mdubench`) |
| `year` | BIGINT | **0.0%** | Decision year (2022) |
| `cnr` | VARCHAR | **0.0%** | eCourts 16-character Case Record Number |
| `title` | VARCHAR | **0.0%** | "Petitioner vs Respondent" |
| `judge` | VARCHAR | **0.0%** | Sitting judge(s) |
| `decision_date`| TIMESTAMP_NS | **0.0%** | Date of order / judgment |
| `disposal_nature`| VARCHAR | **0.0%** | Disposition ("ALLOWED", "DISMISSED", etc.) |
| `pdf_link` | VARCHAR | **0.0%** | Original source eCourts download URL |
| `pdf_exists` | BOOLEAN | **0.0%** | PDF availability flag |
| `description` | VARCHAR | **0.0%** | Case registration description |
| `date_of_registration`| VARCHAR | **0.0%** | Date matter was numbered |
| `raw_html` | VARCHAR | **0.0%** | Source portal snippet |

### 2.3 Key Verification & Duplicate Rates
- **Composite Primary Key**: `(cnr, decision_date)`
- **Duplicate Rate on Sample**: **0.00%** (0 duplicates found across 500 rows).
- **Secondary Details**: `metadata/parquet_case_details/` contains `case_no`, `case_type`, `petitioner`, `respondent`, `pet_advocate`, `res_advocate`, `acts`, `hearings`.

---

## 3. PDF Extraction Metrics & Text Quality (PyMuPDF)

Measured on 71 genuine Madras High Court 2022 judgment and order PDFs from `data/tar/year=2022/court=33_10/bench=hc_cis_mas/part-20260429T170059Z.tar`:

| Metric | Measured Value | Analysis / Interpretation |
|---|---|---|
| **Sampled PDFs** | 71 documents | Madras High Court 2022 real partition |
| **Total Pages Analyzed** | 233 pages | Average document length: 3.3 pages |
| **Average PDF File Size** | **68.6 KB** | Compact vector-native digital PDFs |
| **Average Chars / Page** | **1,014 chars** | Standard legal density (approx 200 words/page) |
| **Empty Page Rate** | **0.00%** (0 / 233) | 100% of pages yielded native extractable text |
| **OCR Fallback Required** | **0.00%** | Zero pages required Tesseract OCR |
| **Non-ASCII Character Rate**| **0.03%** | Judgments are virtually pure ASCII English |
| **Average Tokens / Document** | **831 tokens** | $\approx 2.8$ chunks (at 300 tokens/chunk) |
| **Average Paragraphs / Doc** | **3.3 paragraphs** | Clean discrete paragraph blocks |

---

## 4. Size & Compression Model vs 500 MB Budget

Based on measured averages ($831\text{ tokens}$, $2.8\text{ chunks}$, $3.3\text{ paragraphs}$):

### 4.1 Per-Document Footprint (On-Disk / Transfer)
- **Document Text JSON (gzipped)**: **1,033 bytes** (uncompressed $\approx 3.9\text{ KB}$, 3.8x gzip ratio)
- **Search Metadata Record (gzipped)**: **203 bytes** (uncompressed $\approx 650\text{ bytes}$)
- **Int8 Binary Vectors (`.bin`)**: **1,075 bytes** ($2.8\text{ chunks} \times 388\text{ bytes}$)
- **Total Combined Footprint per Judgment**: **2.26 KB**

### 4.2 Budget Projections (GitHub Pages Hard Cap: 500 MB)

| Corpus Scenario | Judgments | Total Size | % of 500 MB Budget | Status |
|---|---|---|---|---|
| **Pilot Conservative** | 10,000 | **22.04 MB** | **4.4%** | Feasible |
| **Pilot Standard (Target)** | 30,000 | **66.12 MB** | **13.2%** | **Recommended** |
| **Pilot Extended** | 50,000 | **110.20 MB** | **22.0%** | Feasible |
| **Theoretical Maximum** | 226,850 | **500.00 MB** | **100.0%** | Absolute Ceiling |

*Conclusion*: A default pilot corpus of **30,000 judgments** across Madras, Karnataka, and Delhi High Courts requires only **66.12 MB**, comfortably within the 500 MB Pages budget.

---

## 5. Vector Similarity Throughput (Int8 Dot-Product)
Measured on local V8 / Node 24 runtime over 10,000 vectors (384 dimensions, int8):
- **Throughput**: **1,163,064 vectors / second**
- **Latency over 10,000 vectors**: **8.60 ms**
- **Long Task Impact**: $8.6\text{ ms} < 50\text{ ms}$ threshold; Web Worker maintains 60fps main-thread responsiveness.

---

## 6. Hosting & Browser CORS Verification Matrix

| Host Candidate | Status Code | CORS Header | HTTP Range Support | Measured Latency | Assessment |
|---|---|---|---|---|---|
| **GitHub Pages (Same-Origin)** | 200 (Active) | **Same-Origin** (Zero CORS) | **Supported (bytes)** | **0.323s** | **PRIMARY WINNER**: Zero CORS hazard, byte-range supported. |
| **jsDelivr CDN** | 200 | `*` (Permissive) | **NOT Supported** (Returns 200 whole file) | **2.069s** | **REJECTED**: No partial Range reads for vectors, slow initial cache miss. |
| **GitHub Release Asset** | 302 $\to$ 403 | **MISSING** | Not Supported | 0.436s | **REJECTED**: Redirects to AWS S3 without CORS; browser `fetch()` blocked. |
| **AWS S3 Direct** | 403/404 | **MISSING** | Requires custom S3 CORS XML | 0.093s | **MIGRATION ONLY**: Usable only when deploying custom Cloudflare R2 / S3. |

---

## 7. Confirmed Decisions & Architectural Updates
1. **D-003 (Hosting)**: **CONFIRMED SAME-ORIGIN PAGES ARTIFACT**. All shards will be bundled inside `dist/data/shards/` under the Pages build artifact. GitHub Releases and jsDelivr are eliminated due to CORS and Range limitations.
2. **D-004 (Search & Retrieval)**: Separate binary int8 vector `.bin` files verified with sub-10ms query latency over 10,000 vectors.
3. **Corpus Cap in `config/corpus.json`**: Capped at **30,000 judgments** across Madras, Karnataka, and Delhi High Courts for the last 10 years ($\approx 66\text{ MB}$ total).
