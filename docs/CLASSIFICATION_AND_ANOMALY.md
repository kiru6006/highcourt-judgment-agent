# Classification Engine & Ingest Anomaly Audit (v1.2.0)

## 1. Multi-Tier Classification Architecture

NyayaReader classifies judgments using a multi-tier deterministic architecture. No unverified probabilistic models are permitted in production paths.

```
+-----------------------------------------------------------------------+
| Level 1: Registry & Metadata Classifier                               |
|   Inputs: court_code, bench, raw_case_type, jurisdiction               |
|   Output: Domain, Normalized Case Type, Stated Jurisdiction           |
|   Guarantee: 100% deterministic, 0 runtime LLM tokens                 |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| Level 2: Narrow Rule-Based Subject Classifier                         |
|   Inputs: Extracted Judgment Paragraphs & Statute Mentions            |
|   Output: Inferred Subject Tags + Evidence Paragraph Anchors          |
|   Invariant: Rule fires IFF evidence anchor is physically retrievable |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| Level 3: AI-Assisted Semantic Classifier [GATED / DEFERRED]           |
|   Status: GATED until Level 1 & 2 pass human-reviewed eval set >= 50  |
+-----------------------------------------------------------------------+
```

---

## 2. Level 1: Court Registry Matcher
Implemented in `pipeline/classify/level1.py`:
- Matches `raw_case_type` and `court_code` against `shared/court-codes/registry.ts`.
- Resolves normalized case type string (e.g. `CRL.OP` -> `Crl.O.P.`).
- Assigns primary legal domain (e.g. `domain_criminal`).
- Attaches authentic source URL from High Court gazettes.

---

## 3. Level 2: Deterministic Rule Suite (10 Narrow Areas)
Implemented in `pipeline/classify/level2.py`. Every rule specifies:
- `id`: Unique identifier (e.g., `RULE_CRIM_BAIL`).
- `domain`: High-level domain ID.
- `subject_ids`: Secondary taxonomy tags.
- `predicate`: Boolean combination of regex keywords and cited statutory sections.
- `evidence_requirement`: Mandatory paragraph condition. If no paragraph contains the keyword or statute, the rule does NOT fire.

### Narrow 10-Rule Inventory:
1. `RULE_CRIM_BAIL`: Regular Bail (Sec 439 CrPC / Sec 483 BNSS).
2. `RULE_CRIM_ANT_BAIL`: Anticipatory Bail (Sec 438 CrPC / Sec 482 BNSS).
3. `RULE_CRIM_QUASH`: FIR / Chargesheet Quashing (Sec 482 CrPC / Sec 528 BNSS).
4. `RULE_CIVIL_LAND_ACQ`: Land Acquisition & Compensation (LARR Act 2013 / Land Acquisition Act 1894).
5. `RULE_SERV_DISCIPLINARY`: Service Disciplinary Inquiries & Dismissals.
6. `RULE_COMM_TENDER`: Government Tenders & Public Procurement Contracts.
7. `RULE_FAM_MATRIMONIAL`: Matrimonial, Divorce, Maintenance & Custody.
8. `RULE_COMM_ARBITRATION`: Arbitration & Conciliation Act (Sec 9, 11, 34, 37).
9. `RULE_COMM_INSOLVENCY`: IBC 2016 Corporate Insolvency Resolution (CIRP / Sec 7, 9).
10. `RULE_CONST_WRIT`: Constitutional Writs under Article 226 / 227 of the Constitution.

---

## 4. Evaluation Benchmark (50 Fixtures)
The evaluation script `scripts/eval_taxonomy.py` runs against `eval/eval_taxonomy_50.json`:
- **Level 1 Accuracy:** 100.0%
- **Level 2 Macro Precision:** 100.0%
- **Level 2 Macro Recall:** 100.0%
Full audit metrics published in `docs/TAXONOMY_TEST_REPORT.md`.

---

## 5. Level 3 AI Gating Criteria
Level 3 model-assisted classification is explicitly **DISABLED** in v1.2.0. To enable Level 3 in future releases:
1. Level 1 & 2 rules must pass an expanded gold standard set of $\ge 200$ human-annotated orders.
2. AI-inferred tags must carry verbatim quote verifier grounding against raw paragraphs.
3. User must supply BYOK Gemini key; zero background server token expenditure.

---

## 6. Offline Ingest Anomaly Detection Engine

Implemented in `pipeline/anomaly/engine.py`. Evaluates documents offline during shard compilation and emits `data/anomaly-summary.json`.

### Active Audit Rules (v1.2.0):
- **A01 Source Provenance (`a01_source.py`):**
  - Flags missing `source_url`, non-HTTPS URLs, unverified domains, or broken links.
  - Severity: `high` or `medium`.
- **A02 Case Identity Integrity (`a02_identity.py`):**
  - Flags SHA-256 duplicate records, CNR collisions, and court/bench code mismatches.
  - **Terminology Discipline:** The label "fabricated" is reserved strictly for A02 byte-level checksum duplicates.
  - Severity: `high`.
- **A04 Extraction Quality (`a04_quality.py`):**
  - Flags empty text extractions ($< 150$ characters), truncated judgments, or zero paragraph boundaries.
  - Severity: `high` or `medium`.
- **A05 Classification Contradiction (`a05_classification.py`):**
  - Flags unmapped case codes or irreconcilable contradictions between stated case type and cited enactments (e.g. Criminal case citing solely the Companies Act).
  - Severity: `high` or `medium`.

### Version-Controlled Review State
Review state is stored in version-controlled YAML (`data/anomaly-review/review-state.yaml`), NOT in a runtime database.
Statuses: `pending`, `reviewed`, `suppressed`.

### Deferred Rules (Scheduled for v1.3.0+):
- `A03`: Alignment between stated outcome and reasoning text.
- `A06`: Broken or circular precedent citation links.
- `A07`: Paragraph numbering discontinuities.
- `A08`: OCR confidence score degradation.
- `A09`: Coram size vs judgment signature count mismatches.
- `A10`: Ingest pipeline latency and throughput drift.
Each deferred rule is documented in `docs/ANOMALY_RULES.md`.
