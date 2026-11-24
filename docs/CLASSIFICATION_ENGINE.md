# Nyaya AI Reader: Classification Engine Architecture

**Target:** Antigravity IDE  
**Version:** v1.2.0 ("Structured Case Intelligence")  
**Compliance:** ADR D-012 | Zero Breaking Changes | Static-First  

---

## 1. Overview & Multi-Level Strategy

Nyaya AI Reader implements a three-tier classification hierarchy designed for legal integrity, strict grounding, and zero hallucination.

```
┌─────────────────────────────────────────────────────────────┐
│ Level 1: Court Registry & Metadata                          │
│ Source: Official court registries (Madras, Karnataka, etc.) │
│ Confidence: 1.0 (verified) / 0.0 (unknown)                  │
│ Evidence: Stated filing metadata (No text scanning)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Level 2: Rule-Based Evidence Grounding                      │
│ Source: 10 Narrow Rules (Bail, Quashing, Arbitration, etc.) │
│ Confidence: 0.85                                            │
│ Evidence: Mandatory retrievable paragraph anchor index      │
│ Invariant: No evidence paragraph -> No label emitted        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Level 3: AI-Assisted Classification (GATED / DEFERRED)       │
│ Status: GATED — Not implemented in v1.2.0                   │
│ Gate Condition: Levels 1 & 2 must achieve >= 90% precision  │
│ on an independently audited legal benchmark of >= 50 cases  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Level 1: Deterministic Registry Classification

- **Module**: `pipeline/classify/level1.py` & `shared/court-codes/registry.ts`
- **Mechanism**: Matches `court_code` and `case_type` against verified official registry mappings.
- **Courts Seeded**:
  1. Madras High Court (`33_10`)
  2. Karnataka High Court (`29_3`)
  3. Kerala High Court (`32_1`)
  4. Delhi High Court (`7_26`)
  5. Bombay High Court (`1_1`)
- **Strict Invariant**: If a case type is not found in the verified registry, it is classified as `status: "unknown"` with confidence `0.0`. The raw string is never stripped, guessed, or coerced.

---

## 3. Level 2: Rule-Based Evidence Grounding

- **Module**: `pipeline/classify/level2.py`
- **Scope**: 10 high-frequency, high-stakes procedural categories in Indian High Court jurisprudence:
  1. `RULE_CRIM_BAIL`: Bail under Sec 437/439 CrPC or Sec 480/482 BNSS.
  2. `RULE_CRIM_ANT_BAIL`: Anticipatory bail under Sec 438 CrPC or Sec 482 BNSS.
  3. `RULE_CRIM_FIR_QUASH`: Inherent power quashing under Sec 482 CrPC or Sec 528 BNSS.
  4. `RULE_CIVIL_LAND_ACQ`: Land acquisition disputes under RFCTLARR / Land Acquisition Act.
  5. `RULE_SERV_MATTERS`: Disciplinary proceedings, seniority, and compassionate appointment.
  6. `RULE_COMM_TENDERS`: Government procurement, NIT, and technical bid disqualification.
  7. `RULE_FAM_MATRIMONIAL`: Hindu Marriage Act disputes and CrPC 125 maintenance.
  8. `RULE_COMM_ARBITRATION`: Arbitration & Conciliation Act Sec 9, 11(6), 34 applications.
  9. `RULE_COMM_INSOLVENCY`: Corporate insolvency resolution (CIRP) under IBC 2016.
  10. `RULE_CONST_PETITION`: Extraordinary writ petitions under Article 226/32.

### Mandatory Grounding Contract
Every Level 2 rule requires an explicit evidence anchor:
$$\text{Rule Fires} \iff \text{len}(\text{evidenceParagraphs}) \ge 1$$
If a judgment does not contain an exact statutory phrase or prayer matching the rule's predicate, no inferred label is assigned. Under no circumstances does the engine guess a legal issue without quoting the exact paragraph number.

---

## 4. Level 3: AI-Assisted Classification (Gating Criteria)

Level 3 classification uses LLMs or local embedding models to infer complex, multi-issue legal domains where keyword rules are insufficient.

### Current Status: GATED (Excluded from v1.2.0)
To prevent legal hallucination and maintain zero-cost static deployment:
1. Level 3 is strictly deferred until Levels 1 and 2 achieve sustained precision $\ge 90\%$ on evaluated benchmark sets.
2. Any future AI classification must emit confidence bounds and verbatim sentence quotes, conforming to `docs/AI_GROUNDING_SPEC.md`.
3. In-browser client inference must not exceed the 300 KB bundle budget or require mandatory API keys for basic browsing.
