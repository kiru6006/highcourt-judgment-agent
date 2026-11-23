# NyayaReader — Offline Data Ingestion Pipeline

## 1. Architecture & Principles
The NyayaReader offline ingestion pipeline converts upstream judicial archives from `s3://indian-high-court-judgments` into validated, compressed search and reader shards for client-side consumption.

```
   s3://indian-high-court-judgments (ap-south-1)
       ├── metadata/parquet/ (Case metadata)
       └── data/tar/ (PDF archives & indices)
                │
                ▼ (Streaming read via index offsets)
        pipeline.ingest
                │
  ┌─────────────┼─────────────┬─────────────┐
  ▼             ▼             ▼             ▼
identity    structure     extractors    quarantine
(stable JID, (paragraphs, (statutes,    (POCSO, s.228A,
 MinHash)     sections)    citations)   takedown.json)
  │             │             │             │
  └─────────────┴─────────────┼─────────────┘
                              ▼
                      shard_builder
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
search-{court}-{year}.json.gz          docs-{court}-{year}.json.gz
```

---

## 2. Core Modules

| Module | Purpose |
|---|---|
| `pipeline/identity.py` | Stable JID hashing (`sha1(cnr\|decision_date\|order_number)`), normalized text SHA-256, and MinHash near-duplicate detection. |
| `pipeline/structure.py` | Paragraph numbering parser and heuristic rule-based section classifier (Facts, Issues, Submissions, Ratio, Final Order, Untagged). |
| `pipeline/extractors/statutes.py` | Regex patterns for IPC, CrPC, CPC, BNS, BNSS, BSA, Constitution Articles, Arbitration Act, IT Act, NI Act Section 138 with statutory transition mappings. |
| `pipeline/extractors/citations.py` | Case citation parser for AIR, SCC, SCR, ILR, and precedential party titles. |
| `pipeline/taxonomy.py` | Deterministic court code mapping and case type prefix to category normalization (`derived: true`). |
| `pipeline/quarantine.py` | Scans against `config/restricted.json` and `config/takedown.json`; quarantines matches to `review-queue.csv`. |
| `pipeline/shard_builder.py` | Compresses search and full document shards ($\le 25\text{ MB}$) with SHA-256 checksums and manifest fragments. |
| `pipeline/ingest.py` | Main CLI entry point orchestrating S3 streaming and artifact generation. |

---

## 3. Running Ingestion Locally

### Execution Command:
```bash
PYTHONPATH=. .venv/bin/python -m pipeline.ingest \
  --court 33_10 \
  --year 2022 \
  --max-docs 100 \
  --output-dir data/shards \
  --sample-out web/public/data-sample
```

### Running Test Suite:
```bash
PYTHONPATH=. .venv/bin/pytest -v tests/test_pipeline.py
```
All 47 pipeline verification tests run in $<0.1\text{s}$.
