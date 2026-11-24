# ARCHIVE: NyayaReader v1.2.0 Taxonomy Draft (Historical Provenance)

> [!NOTE]
> **Provenance & Supersession Notice:**  
> This draft specification has been superseded for release v1.2.0 "Structured Case Intelligence" by the formal milestone specifications in `docs/CASE_TAXONOMY_GAP_ANALYSIS.md`, `docs/LEGAL_CASE_TAXONOMY.md`, and `docs/CLASSIFICATION_AND_ANOMALY.md`.
>
> **Scope Cuts & Deferrals for v1.2.0:**
> 1. **Zero Database / Backend:** All dynamic backend proposals (FastAPI, SQLite, PostgreSQL, Cloudflare D1) were strictly cut to preserve 100% static-first GitHub Pages hosting.
> 2. **Level 3 AI Gated:** Unverified AI-assisted taxonomy labeling was cut until Level 1 (Registry) and Level 2 (Deterministic Rules) pass a reviewed evaluation benchmark.
> 3. **Corpus Expansion Paused:** New High Court corpus ingestion was paused to prioritize data quality and verification on existing pilot fixtures (Madras, Karnataka, Kerala, Delhi, Bombay).
> 4. **Deferred Anomalies:** Anomaly rules A03 (Text Alignment) and A06–A10 (Citation defects, Pipeline drift) deferred to future releases.

---

## Historical Draft Content

### 8-Domain Taxonomy Concept
- Constitutional Law (`domain_constitutional`)
- Criminal Law (`domain_criminal`)
- Civil Law (`domain_civil`)
- Commercial & Corporate Law (`domain_commercial`)
- Service & Employment Law (`domain_service`)
- Direct & Indirect Taxation (`domain_taxation`)
- Family & Matrimonial Law (`domain_family`)
- Special & Regulatory Acts (`domain_special`)

### Court Code Normalization
Targeted five core High Courts with official court gazettes and eCourts portal prefixes.
All entries preserved in `shared/court-codes/registry.ts`.
