# Nyaya AI Reader — Operational Runbook

## 1. Local Developer Setup

### 1.1 Prerequisites
- **Node.js**: v20 LTS or higher (`node -v`)
- **Python**: v3.11 (`python3 --version`)
- **Git**: v2.40+

### 1.2 Frontend Setup & Run
```bash
# Navigate to web application directory
cd web

# Install dependencies strictly from lockfile
npm ci

# Start development server on port 5173
npm run dev
```
The application opens at `http://localhost:5173/`.

### 1.3 Production Build & Local Preview
```bash
# Build production bundle with base path matching repo
npm run build

# Serve production build locally
npm run preview
```
Visit `http://localhost:4173/highcourt-judgment-agent/` to preview under the production base href.

---

## 2. Offline Data Pipeline Execution (Sample & Local)

### 2.1 Python Virtual Environment
```bash
# Create and activate local virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install pipeline dependencies
pip install pymupdf duckdb boto3 jsonschema pytest sentence-transformers
```

### 2.2 Ingesting a Sample Court-Year
```bash
# Run extraction and structuring on pilot court (Madras HC, 2022)
PYTHONPATH=. python -m pipeline.ingest --court "33_10" --year 2022 --max-docs 500 --output-dir data/shards
```

### 2.3 Generating Embeddings & Manifest
```bash
# Generate int8 quantized vector shards (388 bytes/vector)
PYTHONPATH=. python pipeline/embedder.py --shards-dir data/shards

# Generate master manifest.json with SHA-256 hashes
PYTHONPATH=. python pipeline/manifest_builder.py data/shards data/shards/manifest.json
```

---

## 3. GitHub Actions Workflows & Deployments

### 3.1 CI Workflow (`.github/workflows/ci.yml`)
- Triggers on every pull request and push to `main`.
- Runs linter, TypeScript strict checks, unit tests, and size budget enforcement (`scripts/check-budget.sh`).

### 3.2 Pages Deployment (`.github/workflows/pages.yml`)
- Triggers automatically on push to `main` when web code or data artifacts change.
- Steps:
  1. Builds React 18+ Vite application with `base: '/highcourt-judgment-agent/'`.
  2. Embeds sample shards and manifest into `dist/data-sample/`.
  3. Enforces the 500 MB Pages budget gate.
  4. Deploys to GitHub Pages via `actions/deploy-pages@v4`.

### 3.3 Offline Pipeline Workflow (`.github/workflows/pipeline.yml`)
- Manually triggered (`workflow_dispatch`) with matrix execution across configured courts and years.
- Emits zipped search, doc, and vector shards.

### 3.4 Nightly Sync & Telemetry Workflow (`.github/workflows/nightly.yml`)
- Scheduled daily at 02:00 UTC.
- Executes `pipeline/sync_monitor.py` and `pipeline/takedown.py`.
- Enforces full verification suite (`scripts/verify-all.sh`).
- Updates `docs/ops.md` telemetry dashboard.

---

## 4. Operational Procedures

### 4.1 Running the Full 5-Gate Verification Suite
```bash
# Run client unit tests, vite build, budget check, pytest, and retrieval evaluation
bash scripts/verify-all.sh
```

### 4.2 Adding a New Court to the Corpus
To expand corpus coverage to a new High Court:
1. Open `config/corpus.json`.
2. Add the court entry with its official court code:
   ```json
   {
     "court_code": "29_3",
     "name": "Karnataka High Court",
     "benches": ["karhc"],
     "max_docs": 10000
   }
   ```
3. Trigger the `pipeline.yml` workflow in GitHub Actions or run `pipeline/ingest.py` locally.
4. Verify that generated shard sizes remain within the $\le 25\text{ MB}$ limit and that total Pages artifact stays $\le 500\text{ MB}$.

### 4.3 Handling a Statutory Takedown Request
1. Obtain the JID or case number of the target judgment.
2. Edit `config/takedown.json` and append the entry:
   ```json
   {
     "jid": "<target-jid>",
     "case_no": "<target-case-no>",
     "reason": "Court expungement order",
     "requested_by": "High Court Registry",
     "date_added": "2026-11-23",
     "court_order_ref": "ORDER-REF"
   }
   ```
3. Run the automated purge engine:
   ```bash
   PYTHONPATH=. python pipeline/takedown.py
   ```
4. Verify audit log entry in `takedown-audit.log`.
5. Commit and push changes to `main`. Shards and manifests are regenerated automatically.

### 4.4 Scaling Beyond GitHub Pages
When total corpus exceeds GitHub Pages' 500 MB ceiling:
- Refer to [`docs/PRODUCTION_MIGRATION.md`](PRODUCTION_MIGRATION.md) for deploying to **Cloudflare Pages + Cloudflare R2** (zero egress, native HTTP Range requests) or **AWS S3 + CloudFront CDN**.

---

## 5. Advocate, Law Clerk & Student 5-Minute Runbook

This section guides practicing advocates, judicial law clerks, and students on using Nyaya AI Reader for live case research, hearing prep, and memo generation.

### 5.1 Instant Zero-Install Launch
1. Open the [Live Web App](https://kiru6006.github.io/highcourt-judgment-agent/).
2. The app loads statically in your browser. All search indexing, vector retrieval, and data processing run locally inside Web Workers without transmitting queries to a backend server.

### 5.2 Searching Case Law & Utilizing Facet Filters
1. **Search Modes**:
   - **Hybrid (RRF)** *(Default)*: Fuses BM25 keyword matching with 384-dimensional dense semantic vectors. Best for conceptual legal questions like *"quashing FIR when dispute is purely civil"*.
   - **Keyword**: Strict lexical search with field boosting (`cnr: 6x`, `case_no: 3.5x`, `title: 3x`).
   - **Semantic**: Pure dense vector similarity.
2. **Left-Rail Facets**:
   - **High Court & Bench**: Select Madras High Court (Principal Seat or Madurai Bench), Karnataka, Delhi, or Bombay.
   - **Decision Year**: Filter by specific year or range using preset pills (2022–2024) or custom input.
   - **Category & Disposal**: Narrow down to Criminal, Commercial, or Writ; filter by Allowed or Dismissed.
3. **Multi-Source External Fallback**: If a query yields zero results in the local Madras HC sample, click the pre-filled **Indian Kanoon**, **eCourts**, or **High Court Portal** buttons directly inside the zero-result view to launch immediate external searches.

### 5.3 Verifiable Grounded AI (Demo Mode vs BYOK Gemini)
1. **Demo Mode**: Requires no API key. Automatically answers common bench questions (*"What is the ratio decidendi?"*, *"What are petitioner's submissions?"*) with pre-verified paragraph citations.
2. **BYOK Gemini**:
   - Click **Key Manager** in the top navigation or copilot drawer.
   - Paste a Google AI Studio Gemini API key.
   - *Security Guarantee*: The key is saved strictly in browser `localStorage`. It is never uploaded, transmitted to any proxy, or stored on servers.
3. **Verification Contract**:
   - Every claim must have an exact verbatim quote matching a retrieved paragraph.
   - Claims failing verification are removed and displayed in the **Dropped Claims** disclosure tab.

### 5.4 Case Folders, Precedent Comparison Matrix & Memo Print
1. **Saving Cases**: On any result card or reader page, click **Save** and assign the judgment to a folder (e.g. *"Bail & Quashing Matters"*).
2. **Adding Hearing Notes**: Navigate to `/folders`. Write customized argument notes, distinguishing factors, or hearing submissions under each case. Notes auto-persist in your browser.
3. **Precedent Comparison Matrix**:
   - Check the **Compare** box on 2 to 5 judgments.
   - Click **Compare Matrix** to render a side-by-side comparative table of Benches, Dates, Outcomes, Key Statutes, Ratios, and Advocate Notes.
4. **Court Memo Printing (A4 / PDF)**:
   - Click **Print Memo** (or press `Cmd+P` / `Ctrl+P`).
   - The UI automatically strips navigational chrome, expands notes into formal typography, and formats an A4 Court Research Memorandum ready for bench submission or case conferences.
   - Click **Export JSON** to save a portable local backup file of your entire workspace.

---

## 6. Structured Case Intelligence & Anomaly Operations (v1.2.0)

### 6.1 Running Multi-Tier Case Classification
Execute the offline deterministic classification engine across document fixtures:
```bash
.venv/bin/python pipeline/classify/engine.py
```
- Maps metadata against `shared/court-codes/registry.ts` (Level 1).
- Evaluates the 10-rule narrow subject suite (Level 2).
- Asserts paragraph evidence anchors exist before assigning labels.

### 6.2 Running Ingest Anomaly Audit & Emitting Summary
Run the offline data quality audit suite:
```bash
.venv/bin/python pipeline/anomaly/engine.py
```
- Executes rules A01 (Source), A02 (Identity), A04 (Quality), A05 (Classification).
- Reads existing review state from `data/anomaly-review/review-state.yaml`.
- Emits pre-computed artifact `data/anomaly-summary.json` and syncs to `web/public/data/`.

### 6.3 Evaluating Taxonomy & Filter Coverage Reports
Regenerate CI quality audit reports:
```bash
# Evaluate taxonomy precision against 50-doc benchmark
.venv/bin/python scripts/eval_taxonomy.py

# Evaluate left-rail filter coverage & 5% threshold
.venv/bin/python scripts/filter_coverage.py
```
Outputs: `docs/TAXONOMY_TEST_REPORT.md` and `docs/FILTER_COVERAGE_REPORT.md`.

### 6.4 Navigating the Data Quality Dashboard
1. Navigate to `/data-quality` via the top navigation `ShieldAlert` icon or footer link.
2. Filter anomalies by severity (`High`, `Medium`, `Low`) or status (`Pending`, `Reviewed`, `Suppressed`).
3. Click **JSON** or **CSV** to download full filtered audit records directly in the browser.
