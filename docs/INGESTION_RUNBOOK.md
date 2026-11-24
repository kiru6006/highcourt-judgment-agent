# Five-Year Corpus Ingestion Runbook (v1.3.0)

**Date:** 2026-11-24  
**Target Years:** 2022, 2023, 2024, 2025, 2026 (Cutoff: 2026-11-24)  
**Primary Source:** `s3://indian-high-court-judgments` (AWS Open Data, `ap-south-1`)

---

## 1. Operational Invariants

1. **Configurable Date Boundaries:** Start date defaults to `2022-01-01` and end date defaults to `2026-11-24`. When scheduled ingestion runs in future months, the end date is advanced via `--date-to YYYY-MM-DD`.
2. **Resume Checkpoints:** Checkpoints are persisted in `data/checkpoints/cp_{court}_{year}.json` to avoid re-extracting previously processed judgments.
3. **Quarantine Invariant:** Statutory POCSO, sealed cover, and in-camera matters are quarantined immediately by `pipeline/quarantine.py` into `review-queue.csv`. They are never emitted to public shards.
4. **Zero Overwrite of Benchmark Baseline:** The existing 100 verified Madras High Court judgments (`docs-33_10-2022.json.gz`, `eval_taxonomy_50.json`, `synthetic-judgments.ts`) must never be deleted or degraded.

---

## 2. Ingestion Execution Commands

### 2.1 Ingesting a Specific Court and Year
```bash
# Ingest Karnataka High Court (29_3) for Year 2023
PYTHONPATH=. python pipeline/ingest.py \
  --court "29_3" \
  --year 2023 \
  --date-from "2023-01-01" \
  --date-to "2023-12-31" \
  --max-docs 500 \
  --output-dir data/shards
```

### 2.2 Advancing Ingestion to Latest Calendar Boundary
```bash
# Ingest 2026 records up to 24 November 2026
PYTHONPATH=. python pipeline/ingest.py \
  --court "33_10" \
  --year 2026 \
  --date-from "2026-01-01" \
  --date-to "2026-11-24" \
  --max-docs 1000 \
  --output-dir data/shards
```

### 2.3 Generating Master Manifest & Checksums
After ingesting court/year partitions:
```bash
PYTHONPATH=. python pipeline/manifest_builder.py data/shards data/shards/manifest.json
```

### 2.4 Generating Quantized Embeddings (Int8)
```bash
PYTHONPATH=. python pipeline/embedder.py --shards-dir data/shards
```

---

## 3. Automated Error Recovery & Quality Audit
After each batch run:
```bash
# Run data quality & anomaly detection
PYTHONPATH=. python pipeline/anomaly/engine.py

# Verify filter coverage across active shards
PYTHONPATH=. python scripts/filter_coverage.py

# Verify performance budgets (< 500 MB Pages, < 300 KB JS)
bash scripts/check-budget.sh
```
