# How NyayaReader Grounds AI Answers: Verifiable Legal AI

> **Mathematical Verbatim Claim Verification for Indian Case Law**

---

## 1. The Core Problem in Legal AI
Large Language Models (LLMs) hallucinate citations, invent case precedents, and attribute quotes to judges that never appeared in the source text. In Indian judicial research, an erroneous citation or fabricated legal ratio can compromise court submissions and mislead legal counsel.

Traditional RAG (Retrieval-Augmented Generation) systems send retrieved text to an LLM and render the generated answer directly. If the model hallucinates a phrase or inverts a holding, the user has no automated verification.

---

## 2. The NyayaReader Grounding Contract

NyayaReader enforces a strict, four-stage zero-trust pipeline executed directly in the client browser:

```
[User Query]
      │
      ▼
1. Hybrid Retrieval (BM25 + 384-dim Dense Vector RRF)
      │
      ▼
2. Strict JSON Schema Generation (FILAC Framework)
      │
      ▼
3. Client-Side Verbatim Quote Verifier (AST / Character-exact match)
      │
      ├──> Claim Verified  ───> Rendered with Clickable Paragraph Chip (#para-N)
      └──> Quote Missing   ───> Claim REJECTED & Struck Out with Warning
```

### The Invariable Rules:
1. **Schema Compliance**: Model must return structured JSON conforming to `AIAnswerSchema` with explicit source paragraph anchors (`paraId`) and exact quote strings.
2. **Verbatim Verification**: Every claim must include a verbatim quote $\ge 15$ characters that matches substring in the cited paragraph.
3. **Automatic Rejection**: If an LLM claim cites an argument not found in the original text, the claim is dropped or marked as rejected.
4. **Insufficient Evidence Fallback**: If retrieved chunks lack clear authority on the query, the engine returns an explicit `insufficient_evidence: true` status rather than guessing.

---

## 3. Auditing the Implementation
- Grounding specification: [`docs/AI_GROUNDING_SPEC.md`](AI_GROUNDING_SPEC.md)
- Client verifier implementation: [`web/src/copilot/verifier.ts`](../web/src/copilot/verifier.ts)
- Automated verification tests: [`web/src/copilot/verifier.test.ts`](../web/src/copilot/verifier.test.ts)
- Interactive Trust Page (Live Route): [`/how-ai-grounds`](https://kiru6006.github.io/highcourt-judgment-agent/#/how-ai-grounds)
