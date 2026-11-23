# NyayaReader / Nyaya AI Reader: Performance & Scalability Report

**Audit Script:** `scripts/check-budget.sh`  

---

## Measured Performance & Budgets

| Asset / Metric | Measured Value | Hard Budget Limit | Status |
| :--- | :--- | :--- | :--- |
| **Total Pages Artifact Size** | 1.67 MB | 500 MB | **PASS** |
| **Largest JavaScript Chunk** | 57.28 KB (gzip) | 300 KB (gzip) | **PASS** |
| **Main Application Chunk** | 44.74 KB (gzip) | 300 KB (gzip) | **PASS** |
| **Search Query Latency (p50)** | 0.01 ms (hybrid) | 50 ms | **PASS** |
| **Sample Git Data Payload** | 0.09 MB | 5 MB | **PASS** |

### Corpus Scalability Projections
- Current Corpus (46 docs): 1.67 MB total bundle.
- Projected 10,000 docs: ~22 MB gzipped shards (well within 500 MB GitHub Pages limit).
- Projected 50,000 docs: ~110 MB gzipped shards (requires Cloudflare Pages + R2 migration as documented in `docs/PRODUCTION_MIGRATION.md`).
