# Nyaya AI Reader — Architecture Specification

## 1. Static-First 3-Layer Architecture

Nyaya AI Reader operates strictly on a static-first, zero-server architecture designed for GitHub Pages hosting, delegating all compute-heavy extraction, indexing, and embedding workloads to GitHub Actions offline runners.

```mermaid
flowchart TD
    subgraph Layer1["1. Offline Pipeline (GitHub Actions Runner)"]
        S3["AWS S3 Open Data<br/>s3://indian-high-court-judgments<br/>(Metadata Parquet + TAR Archives)"]
        Ingest["Python 3.11 Ingest Engine<br/>PyMuPDF Extraction + Tesseract Fallback<br/>Dedupe, Section Rules, Statute Parser"]
        Index["Node 20 Search & Embed Engine<br/>BM25 Sharding (Orama/MiniSearch)<br/>Transformers.js bge-small-en-v1.5 int8"]
        S3 --> Ingest
        Ingest --> Index
    end

    subgraph Layer2["2. Published Shard Artifacts (GitHub Pages / Object Storage)"]
        Manifest["manifest.json<br/>(Catalog, Courts, Year Counts, Shard Hashes)"]
        SearchShards["search-{court}-{year}.json<br/>(Search Documents & Inverted Index)"]
        DocShards["docs-{court}-{year}.json<br/>(Full Text, Paragraphs, Citations)"]
        VecShards["vec-{court}-{year}.bin<br/>(Int8 Binary Embeddings)"]
        Index --> Manifest
        Index --> SearchShards
        Index --> DocShards
        Index --> VecShards
    end

    subgraph Layer3["3. Client Browser Runtime (React + Vite + Web Workers)"]
        App["React 19 App (Vite)<br/>Tailwind CSS + Headless UI / Virtual Scroll"]
        Worker["Search & Hybrid Retrieval Web Worker<br/>Manifest Filter -> Shard Fetch -> BM25 + Dot-Product"]
        Cache["Browser Cache API & IndexedDB<br/>(Shard caching, AI response caching, local folders)"]
        AI["Grounded AI Engine (Client-side Verifier)<br/>Demo Mode / BYOK (Gemini, Anthropic, OpenAI)"]
        
        App <--> Worker
        Worker <--> Cache
        Worker <--> SearchShards
        Worker <--> VecShards
        App <--> DocShards
        App <--> AI
    end
```

---

## 2. Component Breakdown & Data Flow

### 2.1 Layer 1: Offline Ingestion & Processing (GitHub Actions)
- **Environment**: Linux x86_64 runner, Python 3.11, Node.js 20.
- **Workflow Triggers**: Manual (`workflow_dispatch`), pilot setup, or scheduled incremental cron (`nightly.yml`).
- **Processing Steps**:
  1. Read upstream `STATS.md`, `court-codes.json`, and Parquet metadata anonymously via DuckDB/Boto3 from `s3://indian-high-court-judgments` (ap-south-1).
  2. Stream targeted TAR archives via index offsets without storing multi-gigabyte tar files on runner disks.
  3. Extract text using PyMuPDF; fall back to Tesseract OCR only if character density drops below verified thresholds.
  4. Generate stable JID hash: `sha1(cnr|decision_date|order_number)`.
  5. Apply deterministic section tagging rules (Facts, Issues, Submissions, Ratio, Order). Mark low-confidence sections as "Untagged".
  6. Extract statutory citations (IPC, CrPC, CPC, BNS, BNSS, BSA, Constitution) and precedent case citations.
  7. Filter records against `config/restricted.json` and `config/takedown.json`.
  8. Build court-year partition shards ($\le 25\text{ MB}$ uncompressed).
  9. Generate int8 embeddings via `transformers.js` (`BAAI/bge-small-en-v1.5`) and output separate `.bin` files.
  10. Emit `manifest.json` with SHA-256 checksums, court-year indices, and model metadata.

### 2.2 Layer 2: Published Artifacts Layout
Artifacts reside within the GitHub Pages build output under the base path:
```
web/dist/
├── index.html
├── assets/
├── data-sample/
│   ├── manifest.json
│   ├── search-33_10-2022.json.gz
│   ├── docs-33_10-2022.json.gz
│   └── vectors-33_10-2022.bin
```

### 2.3 Layer 3: Client Browser Execution
- **Zero Server Overhead**: The client loads static assets from GitHub Pages.
- **Web Worker Concurrency**:
  - `SearchWorker`: Loads `manifest.json`, evaluates active UI filters (court, year, bench, category), lazy-fetches only the required shard JSONs, executes BM25 search, computes real-time facet distributions, and returns paginated result cards.
  - `VectorEngine`: Lazy-loads compact `.bin` int8 quantized shards (388 B/vec) and computes dot-product similarity against active query embeddings.
  - `HybridSearch`: Reciprocal Rank Fusion combines BM25 keyword rankings with dense vector similarities.
- **Client Cache Strategy**:
  - Shard responses cached via browser in-memory LRU and Cache API.
  - Advocate case folders, notes, and AI response cache stored in `IndexedDB`/`localStorage`.

---

## 3. Hosting Options & Evaluation

| Option | Architecture | Browser CORS | Shard Range / Chunking | Cost | Status / Caveat |
|---|---|---|---|---|---|
| **A. Pages Artifact (Default)** | Static files deployed in same artifact as React app | **Zero CORS issues** (same-origin `data-sample/`) | Supported by GitHub Pages CDN | Free | **Primary Plan**: Hard cap $\le 500\text{ MB}$ (Pages limit 1 GB). |
| **B. Data Branch + jsDelivr** | Shards committed to separate orphan branch and served via jsDelivr CDN | Permissive CORS headers | Unreliable byte-range requests; 50 MB per-file limit | Free | **Rejected**: CDN rate limits and per-file caps risk breaking larger shards. |
| **C. GitHub Release Assets** | Shards uploaded as release assets | **Fails browser CORS** (browser cross-origin downloads blocked) | Redirects to AWS S3 without browser CORS headers | Free | **Rejected**: Unusable directly from web applications without proxy. |
| **D. Cloudflare R2 / AWS S3** | External object storage with public custom domain | Explicit CORS configuration (`Access-Control-Allow-Origin: *`) | Full HTTP Range request support | Negligible ($\sim \$0.015/\text{GB}$) | **Migration Target (Phase 10)**: Documented in `docs/PRODUCTION_MIGRATION.md` for scaling beyond 500 MB. |

*Verified: Phase 2 empirical spike validated same-origin Pages hosting (see `docs/data-report.md`). Phase 10 migration runbook established in `docs/PRODUCTION_MIGRATION.md`.*
