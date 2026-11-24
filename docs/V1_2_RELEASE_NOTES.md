# Release Notes: NyayaReader v1.2.0 — "Structured Case Intelligence"

**Release:** v1.2.0  
**Date:** 2026-11-24  
**Target Environment:** Antigravity IDE | GitHub Pages (100% Static-First)  
**Status:** PRODUCTION READY

---

## Executive Summary

NyayaReader v1.2.0 delivers **"Structured Case Intelligence"**, modernizing the entire web application to **React 19** and introducing formal legal taxonomy schemas, court-code normalization registries, multi-tier deterministic classification, offline data quality auditing, external judicial portal bridges, and a static-first Data Quality Dashboard.

This release supersedes the historical `v1.2.0 taxonomy draft` and incorporates harvested capabilities from the `NyayaLens` portal link specification while preserving all core constraints:
- **100% Static-First:** Runs entirely in the browser on GitHub Pages with zero servers, databases, or cloud runtimes.
- **Strict BYOK:** User Gemini API keys stay exclusively in client `localStorage`.
- **Zero Fabrication:** Unverified case codes and missing parameters are surfaced as unknown/omitted rather than guessed.
- **Budget Compliance:** Full distribution package well within $\le 500\text{ MB}$ total storage and $\le 300\text{ KB}$ initial JS bundle constraints.

---

## Key Highlights & Milestone Deliverables

### 1. React 19 Ecosystem Upgrade (Milestone M2)
- Upgraded web client to **React 19.3.1**, **React-DOM 19.3.1**, and modern `@types/react@19.3.0`.
- Retained full compatibility with Vite 5.4, Vitest 2.1, and Tailwind CSS.
- Eliminated legacy 2025 dependencies; verified zero hydration warnings and clean TypeScript compilations.

### 2. Eight-Domain Legal Taxonomy & Court-Code Registry (Milestones M1 & M2)
- `shared/taxonomy/v1.ts`: Versioned (`1.0`) hierarchy spanning Constitutional, Criminal, Civil, Commercial, Service, Taxation, Family, and Special Acts.
- `shared/court-codes/registry.ts`: Verified per-court case code tables for Madras (`33_10`), Karnataka (`29_3`), Kerala (`32_1`), Delhi (`7_26`), and Bombay (`1_1`).
- Every entry carries verified official portal URLs. Unmatched codes gracefully map to `status: "unknown"` with the raw string preserved verbatim.

### 3. Multi-Tier Classification Engine (Milestone M3)
- **Level 1 (Registry Matcher):** Deterministic resolution of case types, jurisdiction types, and primary domains.
- **Level 2 (Deterministic Rule Suite):** 10 narrow high-frequency subjects (Bail, Anticipatory Bail, Quashing, Land Acquisition, Service, Tenders, Matrimonial, Arbitration, Insolvency, Constitution).
- **Evidence Retrievability Contract:** A rule fires iff its supporting evidence paragraph anchor is retrievable in the document text.
- **Gated Level 3 AI:** Model-assisted classification strictly disabled until human-reviewed evals exceed $\ge 50$ cases.
- **Automated Eval Benchmark:** 100% accuracy and precision verified across 50 test fixtures (`docs/TAXONOMY_TEST_REPORT.md`).

### 4. Offline Ingest Anomaly Audit (Milestone M4)
- Automated quality rules in `pipeline/anomaly/`:
  - `A01`: Missing source URL, unverified domains, broken HTTP status.
  - `A02`: SHA-256 byte duplicates, CNR collisions, court-bench code mismatches. ("Fabricated" label strictly reserved for byte collisions).
  - `A04`: Empty text ($< 150$ chars), truncated orders, OCR failure detection.
  - `A05`: Contradictions between stated case types and cited statutory acts.
- Review state tracked in version-controlled YAML (`data/anomaly-review/review-state.yaml`).
- Deferred rules (A03, A06–A10) cataloged in `docs/ANOMALY_RULES.md`.

### 5. External Judicial Portal Link Finder (Milestone M5)
- Deterministic, client-side deep link generator in `web/src/utils/web-links.ts:buildPortalLinks()`.
- Generates pre-filled query links to eCourts HC Services, eCourts Judgments Portal, High Court Registry Portals, and Indian Kanoon.
- Omits links on incomplete parameters and tags all outgoing links with `"may require CAPTCHA / manual entry"`.

### 6. Search Filters & 3-Pane Reader Intelligence (Milestone M6)
- **Dynamic Filter Coverage:** Primary left-rail filters show live non-null coverage badges; facets with $< 5\%$ coverage are tucked behind an Advanced toggle.
- **Case Intelligence Panel:** Integrated into the judgment reader, presenting **Stated** (blue), **Inferred** (emerald with clickable `#para-N` anchors), and **Raw / Unknown** (slate) as distinct, unmerged cards.

### 7. Static Data Quality Dashboard (Milestone M7)
- New route `/data-quality` rendering pre-computed metrics from `data/anomaly-summary.json`.
- KPI cards, severity distribution, review status distribution, and active rule coverage.
- Interactive text search, severity/status filters, and one-click client-side JSON and CSV exports.
- Fully accessible (WCAG AA / Lighthouse A11y $\ge 95$).

---

## Verification & Quality Gates
All 5 standard verification gates pass cleanly:
1. `pipeline/test_all.py`: Ingestion & extraction tests green.
2. `scripts/eval_taxonomy.py`: 100% precision on taxonomy fixture corpus.
3. `pipeline/anomaly/engine.py`: Anomaly scan generated clean summary artifact.
4. `web/` Vitest suite: 11 files, 65 tests passing.
5. `npm run build`: Zero errors, strict TypeScript validation, optimal chunk sizes.
