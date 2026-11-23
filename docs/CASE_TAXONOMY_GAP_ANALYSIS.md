# NyayaReader v1.2.0: Case Taxonomy & Anomaly Gap Analysis
**Target:** Antigravity IDE | **Release:** v1.2.0 ("Structured Case Intelligence")  
**Date:** 2026-11-24 | **Author:** Independent Technical & Legal Audit Board  
**Status:** M1 Gate Approved (Read-Only Analysis)

---

## 1. Executive Summary

This gap analysis establishes the baseline for **v1.2.0 "Structured Case Intelligence"**. It evaluates the existing v1.0.0+ implementation across schema, ingestion, classification, anomaly detection, search, and reading surfaces.

Every proposed feature is categorized as:
- **Reuse**: Functionality exists and requires no architectural modifications.
- **Extend**: Functionality exists but requires additive, backward-compatible enhancements.
- **Build**: New subsystem required for v1.2.0 specifications.
- **Defer**: Non-goals explicitly postponed to v1.3.0.

---

## 2. Feature-by-Feature Gap Analysis

| Subsystem | Existing File & Function | Proposed Feature in v1.2.0 | Action | Technical Justification & Implementation Plan |
| :--- | :--- | :--- | :--- | :--- |
| **8-Domain Legal Taxonomy** | `pipeline/normalizer.py:derive_category()`, `web/src/constants/app.constants.ts:CATEGORIES` | Centralized versioned 8-domain legal hierarchy (`taxonomyVersion: "1.0"`) | **Build** | Current categories are 7 flat strings (`Criminal`, `Civil`, `Writ`, `Tax`, etc.). Need typed 8-domain hierarchy with secondary subjects in `shared/taxonomy/v1.ts`. |
| **Court Code Registry** | `pipeline/normalizer.py:normalize_court_code()` | Per-court case type code registry for Madras, Karnataka, Kerala, Delhi, Bombay | **Build** | Currently uses raw string splits or regex. Need `shared/court-codes/registry.ts` with official description, normalized type, jurisdiction, and real verified `sourceUrl`. |
| **Additive Schema Extension** | `web/src/types/schema.ts:JudgmentDocument` | Backward-compatible schema with `classification_metadata` | **Extend** | Extend `JudgmentDocument` with `classification_metadata`, `stated_case_type`, `inferred_subjects`, and `review_status: "pending" | "reviewed" | "unknown"`. Existing records default to `pending` and null. |
| **Level 1 Metadata Classification** | `pipeline/taxonomy.py:classify_case_type()` | Deterministic classification from registry + metadata | **Extend** | Current classifier matches heuristic prefixes. Refactor to read from court code registry; assign jurisdiction type (`Appellate`, `Original`, `Writ`, `Revisional`). |
| **Level 2 Rule-Based Classification** | None (only statutory regex in `pipeline/extractors/statutes.py`) | Offline rule-based classification for 10 narrow areas with mandatory evidence paragraphs | **Build** | Build `pipeline/classify/level2.py` for bail, anticipatory bail, FIR quashing, land acquisition, service, tenders, matrimonial, arbitration, insolvency, constitution. Rule fires ONLY if evidence paragraph anchor resolves. |
| **Level 3 AI Classification** | None | Model-assisted classification | **Defer** | Explicit non-goal for v1.2.0. Gated until Level 1–2 pass reviewed eval set of $\ge 50$ judgments. |
| **A01 Source Link Anomaly** | None | Missing sourceUrl, broken HTTP links, unverified sources | **Build** | Build `pipeline/anomaly/a01_source.py`. Checks source URL presence and format. |
| **A02 Identity Anomaly** | `pipeline/identity.py:detect_duplicates()` | Duplicate records (checksum + MinHash), court/bench mismatch | **Extend** | Current identity checks JID collision. Extend to identify conflicting case numbers and court/bench mismatches. |
| **A04 Extraction Quality Anomaly** | None | Empty text, truncated text, OCR failure flag | **Build** | Build `pipeline/anomaly/a04_quality.py`. Flags texts with $< 150$ chars, paragraph length anomalies, or page-count vs text mismatches. |
| **A05 Classification Anomaly** | None | Unmapped case codes, statute vs domain mismatch | **Build** | Build `pipeline/anomaly/a05_classification.py`. Flags when case type says Criminal but statute is Arbitration Act. |
| **A03, A06–A10 Anomalies** | None | Outcome mismatches, citation defects, pipeline metrics | **Defer** | Documented as deferred in `docs/ANOMALY_RULES.md` for v1.3.0. |
| **External Portal Links** | `web/src/utils/web-links.ts:buildCaseWebLinks()` | Harvested NyayaLens deep link generator with zero-guessing | **Extend** | Extend `web/src/utils/web-links.ts` to omit links on missing parameters and append "may require CAPTCHA / manual entry" warning. |
| **Search Filter Coverage** | `web/src/components/LeftRailFacets.tsx` | Coverage indicator per filter; hide $< 5\%$ coverage behind Advanced toggle | **Extend** | Modify facet components to dynamically compute non-null coverage percentage and toggle low-coverage filters. |
| **3-Pane Reader Intelligence Panel** | `web/src/components/ExtractiveBrief.tsx` | Compact "Case Classification & Legal Intelligence" card (Stated vs. Inferred vs. Unknown) | **Build** | Add classification card to reader sidebar. Inferred items must render evidence paragraph chips; never merge stated and inferred visually. |
| **Data Quality Dashboard** | `docs/ops.md` | Static read-only route `/data-quality` with JSON/CSV export | **Build** | Build `web/src/pages/DataQualityPage.tsx` reading pre-computed `data/anomaly-summary.json`. 100% static, client-side export. |

---

## 3. Backward Compatibility & Migration Guarantee

1. **Zero Breaking Schema Changes**:
   - `JudgmentDocument` fields (`jid`, `case_number`, `court_code`, `paragraphs`, `statutes`) retain exact data types.
   - All v1.2.0 fields (`classification_metadata`, `stated_classification`, `inferred_classification`) are optional (`?`) with strict fallback handling.
2. **Deterministic Offline Ingestion**:
   - Classification and anomaly detection execute exclusively in the Python offline pipeline.
   - Zero runtime network dependencies or backend databases added.
3. **Audit Trail**:
   - Anomaly review state lives in version-controlled YAML files under `data/anomaly-review/`, preserving human review decisions across pipeline rebuilds.
