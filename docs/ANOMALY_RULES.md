# Nyaya AI Reader: Anomaly Detection Engine & Rule Catalog

**Target:** Antigravity IDE  
**Version:** v1.2.0 ("Structured Case Intelligence")  
**Compliance:** ADR D-012 | Zero Database | Version-Controlled Review State  

---

## 1. Overview & Anomaly Philosophy

Nyaya AI Reader runs an offline deterministic anomaly audit across every ingested document. Anomalies highlight data lineage, physical extraction, or metadata discrepancies. 

### Core Ethical & Legal Guardrails
1. **Never accuse the court or parties of wrongdoing**: Anomalies are technical telemetry indicators regarding ingestion and digital extraction quality, not judgments on judicial propriety.
2. **Strict Use of the Word "Fabricated"**: Per v1.2.0 specification, the word **"fabricated"** is restricted exclusively to exact duplicate checksum / hash collisions (`A02_DUPLICATE_CHECKSUM`). It is **never** applied to inferred legal tags, judicial reasoning, or party claims.
3. **Audit Trail Persistence**: Review status (`pending`, `reviewed`, `suppressed`) is stored strictly in version-controlled YAML (`data/anomaly-review/review-state.yaml`), ensuring zero database dependencies and complete git traceability.

---

## 2. Active Anomaly Rules in v1.2.0

### A01: Source Link Anomalies
| Rule ID | Severity | Description | Evidence Condition | Recommended Remediation |
| :--- | :---: | :--- | :--- | :--- |
| `A01_MISSING_SOURCE_URL` | High | Document lacks mandatory provenance link | Missing or empty `source_url` | Populate authentic official High Court portal URL or eCourts record link. |
| `A01_INSECURE_HTTP_LINK` | Medium | Insecure plaintext HTTP link | URL starts with `http://` | Upgrade link protocol to HTTPS. |
| `A01_UNVERIFIED_DOMAIN` | Medium | Link points to unverified host | Host not in verified judiciary domain list | Verify host is an authorized government repository or add to domain whitelist. |

### A02: Identity & Collision Anomalies
| Rule ID | Severity | Description | Evidence Condition | Recommended Remediation |
| :--- | :---: | :--- | :--- | :--- |
| `A02_DUPLICATE_CHECKSUM` | High | Duplicate content checksum detected | Identical SHA-256 / content hash | Quarantine duplicate record and deduplicate JID in shard builder. |
| `A02_CNR_COURT_MISMATCH` | High | CNR state code conflicts with court code | CNR prefix (e.g. `HCMA`) does not match `court_code` | Audit filing record metadata to resolve true court jurisdiction. |
| `A02_BENCH_MISMATCH` | Medium | Bench is not recognized for court | Bench name not in court seat list | Standardize bench name or correct court partition. |

### A04: Document Extraction Quality Anomalies
| Rule ID | Severity | Description | Evidence Condition | Recommended Remediation |
| :--- | :---: | :--- | :--- | :--- |
| `A04_EMPTY_EXTRACTION` | High | Text extraction failed or yielded empty body | Extracted text $< 150$ chars or 0 paragraphs | Re-extract from source PDF using OCR fallback pipeline. |
| `A04_TRUNCATED_TEXT` | Medium | Text length disproportionate to page count | $\ge 3$ pages but $< 600$ characters | Verify PDF text layer extraction across all page streams. |
| `A04_OCR_FAILURE` | High | Severe OCR noise or character corruption | $> 5$ replacement chars (`\ufffd`) or $> 15\%$ noise ratio | Re-run Tesseract with legal lexicon and pre-processing de-skew. |

### A05: Classification & Category Anomalies
| Rule ID | Severity | Description | Evidence Condition | Recommended Remediation |
| :--- | :---: | :--- | :--- | :--- |
| `A05_UNMAPPED_CASE_CODE` | Medium | Case type code unmapped in registry | Case type not in `shared/court-codes/registry.ts` | Add verified case-type entry with official gazette source URL. |
| `A05_STATUTE_DOMAIN_MISMATCH` | Medium | Stated domain conflicts with cited statutes | Stated Criminal, but only cited acts are commercial | Review filing classification for possible miscategorization. |

---

## 3. Explicitly Deferred Rules (Postponed to v1.3.0)

Per v1.2.0 specification, the following anomaly categories are non-goals for this release and are deferred:

1. **A03: Outcome Mismatch**: Deferred until natural language dispositive reasoning parsing achieves verified zero-hallucination accuracy.
2. **A06: Citation Defects**: Deferred until the Phase 13 M5 in-corpus citation graph is landed.
3. **A07: Pipeline Latency & Ingestion Lag**: Deferred; operational health telemetry is already reported in `docs/ops.md`.
4. **A08: Coram Discrepancies**: Deferred until judge seniority and roster mapping registries are established.
5. **A09: Statute Transition Inconsistencies**: Deferred; handled directly by Statute Bridge drawer in reader.
6. **A10: Neutral Citation Mismatches**: Deferred until national high court neutral citation format harmonization completes.
