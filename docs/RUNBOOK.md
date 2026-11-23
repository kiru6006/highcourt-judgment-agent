# NyayaReader — Operational Runbook

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
