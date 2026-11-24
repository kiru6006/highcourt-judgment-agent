# Nyaya AI Reader — Taxonomy & Rule Classification Test Report

**Specification:** NyayaReader v1.2.0 Milestone M3  
**Evaluated At:** 2026-11-24T02:58:40Z  
**Evaluation Set:** `eval/eval_taxonomy_50.json` (50 hand-labelled judgments)  
**Status:** ALL GATES PASSED (Levels 1 & 2 Deterministic Verification)

---

## 1. Executive Summary

| Metric | Target | Measured | Result |
| :--- | :--- | :--- | :--- |
| **Level 1 Registry Accuracy** | $\ge 95\%$ | **100.0%** (50/50) | 🟢 PASS |
| **Level 2 Macro Precision** | $\ge 90\%$ | **100.0%** | 🟢 PASS |
| **Level 2 Macro Recall** | $\ge 85\%$ | **100.0%** | 🟢 PASS |
| **Level 2 Macro F1** | $\ge 85\%$ | **100.0%** | 🟢 PASS |
| **Evidence Grounding Invariant** | $100\%$ with anchors | **100.0%** (55/55) | 🟢 PASS |

---

## 2. Level 2 Per-Rule Performance Breakdown

| Rule ID | Domain | TP | FP | FN | Precision | Recall | F1 | Valid Anchors |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `RULE_CRIM_BAIL` | Criminal Law | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% | 5/5 |
| `RULE_CRIM_ANT_BAIL` | Criminal Law | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% | 5/5 |
| `RULE_CRIM_FIR_QUASH` | Criminal Law | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% | 5/5 |
| `RULE_CIVIL_LAND_ACQ` | Civil & Property Law | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% | 5/5 |
| `RULE_SERV_MATTERS` | Service & Labour Law | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% | 5/5 |
| `RULE_COMM_TENDERS` | Commercial & Corporate | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% | 5/5 |
| `RULE_FAM_MATRIMONIAL` | Family & Matrimonial | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% | 5/5 |
| `RULE_COMM_ARBITRATION` | Commercial & Corporate | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% | 5/5 |
| `RULE_COMM_INSOLVENCY` | Commercial & Corporate | 5 | 0 | 0 | 100.0% | 100.0% | 100.0% | 5/5 |
| `RULE_CONST_PETITION` | Constitutional Law | 10 | 0 | 0 | 100.0% | 100.0% | 100.0% | 10/10 |

---

## 3. Strict Invariant Verification

1. **Zero Evidence $\implies$ Zero Labels**:
   Negative control cases (partition suits, general declaration) exhibited **zero false positives** (FP = 0), confirming that rules fire strictly when matching text anchors are present.
2. **100% Verifiable Evidence Anchors**:
   Every fired rule attached explicit paragraph indices (`evidenceParagraphs: [i]`) corresponding to authentic statutory provisions or procedural prayers.
3. **Level 3 (AI Inference) Gate Status**:
   `Level 3 (AI)` remains **GATED** per `docs/CLASSIFICATION_ENGINE.md`. High precision on Levels 1 & 2 ensures robust deterministic baseline before model-assisted tagging is introduced in future releases.
