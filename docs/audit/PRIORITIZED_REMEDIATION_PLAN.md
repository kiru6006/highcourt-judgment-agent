# NyayaReader / Nyaya AI Reader: Prioritized Remediation Plan

---

## Wave 1: Critical Corrections & Compliance (Immediate)
- **REM-01 (Governance)**: Add `LICENSE` (Apache-2.0 / CC-BY-4.0), `NOTICE`, and `THIRD_PARTY.md` to repository root (`DEF-SEC-01`).
- **REM-02 (CI)**: Add secret check guard to `.github/workflows/nightly.yml` to prevent fork build failures (`DEF-OPS-01`).

## Wave 2: v1.2.0 Schema & Classification Engine (Milestones M2–M3)
- **REM-03 (Taxonomy Tier)**: Implement `shared/taxonomy/v1.ts` (8-domain hierarchy) and `shared/court-codes/registry.ts` (verified sources for Madras, Karnataka, Kerala, Delhi, Bombay).
- **REM-04 (Additive Schema)**: Extend `JudgmentDocument` with `classification_metadata` defaulting to `pending` and null without mutating raw court strings.
- **REM-05 (Deterministic Classification)**: Implement Level 1 metadata and Level 2 rule-based classification in `pipeline/classify/` with retrievable evidence paragraph requirements.

## Wave 3: Anomaly Engine & Data Quality Dashboard (Milestones M4 & M7)
- **REM-06 (Anomaly Detection)**: Implement A01 (Source), A02 (Identity), A04 (Quality), and A05 (Classification) in `pipeline/anomaly/`. Store reviews in `data/anomaly-review/`.
- **REM-07 (Quality Dashboard)**: Build static route `/data-quality` reading static JSON with client-side CSV/JSON export.

## Wave 4: Search & Reader Refinement (Milestones M5–M6)
- **REM-08 (External Portal Finder)**: Refactor `web/src/utils/web-links.ts` with zero-guessing parameter validation and CAPTCHA advisories.
- **REM-09 (Filter Coverage)**: Add coverage indicators and Advanced toggle for low-coverage (< 5%) facets.
- **REM-10 (Reader Intelligence Card)**: Add compact Case Classification panel in `ReaderPage.tsx` cleanly distinguishing Stated vs. Inferred (with paragraph chips) vs. Unknown.

## Wave 5: Documentation & v1.3.0 Backlog (Milestone M8)
- **REM-11 (Docs Consolidation)**: Publish `docs/LEGAL_CASE_TAXONOMY.md`, `docs/CLASSIFICATION_AND_ANOMALY.md`, `docs/SEARCH_FILTER_SPEC.md`, `docs/V1_2_RELEASE_NOTES.md`.
- **REM-12 (v1.3 Backlog)**: Document deferred items (A03, A06–A10, Level 3 AI classification, citator).
