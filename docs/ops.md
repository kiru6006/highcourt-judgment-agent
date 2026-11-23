# NyayaReader Fleet Operations & Telemetry Dashboard
**Last Sync Check:** `2026-11-23 16:24:21 UTC` | **Environment:** Production GitHub Pages

---

## 1. Fleet Capacity & Budget Gate

| Metric | Current Value | Budget Cap | Health Status |
| :--- | :--- | :--- | :--- |
| **Total Pilot Judgments** | `46` docs | 30,000 docs | 🟢 In Pilot |
| **Active Shard Footprint** | `0.07 MB` | `500 MB` | 🟢 Normal (`0.0%` used) |
| **Available Headroom** | `499.93 MB` | — | 🟢 Ample Buffer |
| **Upstream S3 Connection** | `s3://indian-high-court-judgments` | `ap-south-1` | 🟢 Healthy (Anonymous) |

---

## 2. Partitioned Shard Ledger

| Court Code | Year | Judgments | Search Index | Full Docs (gz) | Vector Shard (int8) | Total Size |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `33_10` | `2022` | 46 | 6.4 KB | 50.4 KB | 17.4 KB | **74.1 KB** |

---

## 3. Declarative Corpus Configuration
Configured via `config/corpus.json` as the single source of truth:

| Court Code | High Court Name | Target Benches | Pilot Allocation |
| :--- | :--- | :--- | :--- |
| `33_10` | **Madras High Court** | `hc_cis_mas, mdubench` | 12,000 docs |
| `29_3` | **Karnataka High Court** | `karhc` | 10,000 docs |
| `7_26` | **Delhi High Court** | `delhi` | 8,000 docs |

---

## 4. Maintenance Runbook & Automated Sync
- **Nightly Ingestion Workflow**: `.github/workflows/nightly.yml` runs daily at 02:00 UTC.
- **Adding New High Court**: Add entry to `config/corpus.json`. Next pipeline run provisions court partition automatically without application code change.
- **Audit Trail**: Takedown purge operations logged to `takedown-audit.log`.
