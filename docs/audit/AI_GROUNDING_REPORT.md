# NyayaReader / Nyaya AI Reader: AI Grounding & Verifier Audit

**Audit Target:** `web/src/copilot/verifier.ts`, `docs/AI_GROUNDING_SPEC.md`  
**Adversarial Fixtures:** 5 test categories  

---

## Adversarial Verification Results

| Test Scenario | Model Output Condition | Expected Verifier Action | Actual Action | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Valid Grounded Claim** | Exact verbatim quote from ratio paragraph | Accept claim with anchor `#para-N` | Accepted | **PASS** |
| **Loose Paraphrase** | Paraphrased sentence lacking exact match | Reject claim; surface in Dropped Claims | Rejected (`quote_not_found`) | **PASS** |
| **Hallucinated Quote** | Plausible legal sentence absent from order | Reject claim immediately | Rejected (`quote_not_found`) | **PASS** |
| **Submissions as Ratio** | Quoting petitioner's argument as ruling | Reject claim under section boundary rule | Rejected (`counsel_submission_not_ratio`) | **PASS** |
| **Micro-Quote Injection** | 3-word quote (< 15 characters) | Reject claim under length threshold | Rejected (`quote_too_short`) | **PASS** |

### Privacy & Key Security
- **BYOK Policy**: User Google Gemini API keys are held exclusively in browser `localStorage`.
- **Zero Proxy Transmission**: Queries stream directly to `https://generativelanguage.googleapis.com` without intermediate logging or telemetry retention.
