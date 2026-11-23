# NyayaReader / Nyaya AI Reader: Search & Retrieval Evaluation

**Evaluation Queries:** 25 legal queries (`eval/queries.jsonl`)  
**Corpus:** Madras High Court pilot shard (46 judgments)  
**Fusion Algorithm:** Reciprocal Rank Fusion (RRF, k=60)  

---

## Benchmark Results

| Search Mode | Recall@10 | MRR@10 | p50 Latency (ms) | p95 Latency (ms) |
| :--- | :--- | :--- | :--- | :--- |
| **Lexical BM25 (MiniSearch)** | 92.00% | 0.8133 | 0.27 ms | 0.32 ms |
| **Dense Vectors (Int8 Cosine)**| 88.00% | 0.7424 | 0.11 ms | 0.25 ms |
| **Hybrid (RRF Fusion)** | **92.00%** | **0.8157** | **0.01 ms** | **0.01 ms** |

### Mathematical Parity
- Python `sentence-transformers` vs. browser int8 vector encoding:
  - Median Cosine Similarity: **1.0** (Threshold: >= 0.99)
  - Top-10 Rank Overlap Agreement: **1.0** (Threshold: >= 0.80)
