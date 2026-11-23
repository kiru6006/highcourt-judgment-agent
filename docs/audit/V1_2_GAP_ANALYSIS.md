# NyayaReader / Nyaya AI Reader: v1.2.0 Specification Gap Analysis

**Milestone Traceability for v1.2.0 "Structured Case Intelligence"**:

| Milestone | Specification Objective | Implementation Plan | Status |
| :--- | :--- | :--- | :--- |
| **M1** | Repository Discovery & Gap Analysis | Produce `docs/CASE_TAXONOMY_GAP_ANALYSIS.md` naming file/function and stating reuse/extend/build/defer. | **COMPLETE** |
| **M2** | Taxonomy + Court-Code Registry | `shared/taxonomy/v1.ts`, `shared/court-codes/registry.ts`, additive `schema.ts`. | **PLANNED** |
| **M3** | Deterministic Classification (Levels 1–2) | Level 1 registry metadata + Level 2 narrow rule set with evidence paragraphs in `pipeline/classify/`. | **PLANNED** |
| **M4** | Anomaly Detection (A01, A02, A04, A05) | Offline anomaly detection in `pipeline/anomaly/` with YAML reviews under `data/anomaly-review/`. | **PLANNED** |
| **M5** | External Portal Link Finder | `buildPortalLinks` with zero-guessing and CAPTCHA notices in `web/src/utils/web-links.ts`. | **PLANNED** |
| **M6** | Search & Reader Integration | Coverage indicators, Advanced filter toggle, Reader Case Classification Card (Stated vs Inferred vs Unknown). | **PLANNED** |
| **M7** | Data Quality Dashboard | Static read-only route `/data-quality` with JSON/CSV export. | **PLANNED** |
| **M8** | Documentation & Release | Consolidate 10 docs into 5 modular specifications; ADR D-012 onward. | **PLANNED** |
