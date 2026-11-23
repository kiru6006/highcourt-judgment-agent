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

# Start development server on port 4200
npm start
```
The application opens at `http://localhost:4200/`.

### 1.3 Production Build & Local Preview
```bash
# Build production bundle with base path matching repo
npm run build

# Serve production build locally
npm run preview
```
Visit `http://localhost:4200/highcourt-judgment-agent/` to preview under the production base href.

---

## 2. Offline Data Pipeline Execution (Sample & Local)

### 2.1 Python Virtual Environment
```bash
# Create and activate local virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install pipeline dependencies
pip install -r pipeline/requirements.txt
```

### 2.2 Ingesting a Sample Court-Year
```bash
# Run extraction and structuring on pilot court (Madras HC, 2023)
python -m pipeline.ingest --court "33~10" --year 2023 --max-docs 100 --sample-out web/public/data-sample/

# Validate generated shard files
python -m pipeline.validate --dir web/public/data-sample/
```

### 2.3 Generating Search Index & Shards
```bash
# Generate search index shards and manifest
node pipeline/index/build-shards.js --input web/public/data-sample/ --output web/public/data/
```

---

## 3. GitHub Actions Deployment & Workflows

### 3.1 CI Workflow (`.github/workflows/ci.yml`)
- Triggers on every pull request and push to `main`.
- Runs linter, TypeScript strict checks, unit tests, and size budget enforcement.

### 3.2 Pages Deployment (`.github/workflows/pages.yml`)
- Triggers automatically on push to `main` when web code or data artifacts change.
- Steps:
  1. Builds Angular application with `--base-href /highcourt-judgment-agent/`.
  2. Embeds pre-built sample or artifact data into `dist/web/data/`.
  3. Uploads GitHub Pages artifact.
  4. Deploys to GitHub Pages via `actions/deploy-pages@v4`.

### 3.3 Offline Pipeline Workflow (`.github/workflows/pipeline.yml`)
- Manually triggered (`workflow_dispatch`) with matrix execution across configured courts and years.
- Emits zipped shards and updates `manifest.json`.

---

## 4. Operational Procedures

### 4.1 Adding a New Court to the Corpus
To expand corpus coverage to a new High Court:
1. Open `config/corpus.json`.
2. Add the court entry with its official court code:
   ```json
   {
     "court_code": "29~3",
     "court_name": "High Court of Karnataka",
     "years": [2021, 2022, 2023],
     "max_docs_per_year": 2000
   }
   ```
3. Trigger the `pipeline.yml` workflow in GitHub Actions.
4. Verify that generated shard sizes remain within the $\le 25\text{ MB}$ limit and that total Pages artifact stays $\le 500\text{ MB}$.

### 4.2 Handling a Takedown Request
1. Obtain the CNR and JID of the expunged judgment.
2. Edit `config/takedown.json` and append the entry:
   ```json
   {
     "jid": "<target-jid>",
     "cnr": "<target-cnr>",
     "reason": "Court expungement order",
     "authorized_by": "admin",
     "timestamp": "2026-11-23T18:00:00Z"
   }
   ```
3. Commit and push changes to `main`.
4. The CI pipeline will automatically exclude the target document from all shards, regenerate `manifest.json`, and deploy the updated static site.

### 4.3 Deployment Rollback
If a faulty deployment or corrupted shard is published:
1. Revert the commit on `main`:
   ```bash
   git revert HEAD
   git push origin main
   ```
2. GitHub Pages workflow deploys the previous stable artifact within minutes.
3. In case of immediate emergency, disable GitHub Pages temporarily in repository settings (`Settings -> Pages -> Unpublish site`).
