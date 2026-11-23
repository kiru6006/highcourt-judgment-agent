# Comprehensive Test Strategy & Quality Gates

## 1. Testing Philosophy & Quality Pyramid
NyayaReader employs multi-layered verification spanning data integrity, search correctness, accessibility, and AI grounding. Every phase includes executable test gates; no claim of functionality is valid without executed tests.

```
                  ┌────────────────────────┐
                  │    E2E & Axe A11y      │ Playwright (Desktop 1440px + Mobile 375px)
                  ├────────────────────────┤
                  │ Grounded Verifier Test │ Fabricated Quotes & Substring Verifier
                  ├────────────────────────┤
                  │ Retrieval & RRF Bench  │ Recall@10 & MRR@10 on 25 Legal Queries
                  ├────────────────────────┤
                  │ Pipeline, Sync & Takedown│ PyTest (JID, Quarantine, S3, Takedown)
                  ├────────────────────────┤
                  │ Frontend Unit & Client │ Vitest (React Components, Search, Store)
                  └────────────────────────┘
```

---

## 2. Test Suites by Layer

### 2.1 Layer 1: Ingestion Pipeline Tests (`pytest` - 50 tests)
- **JID Stability**: Verifies that identical CNR, decision date, and order numbers deterministically hash to the same JID across multiple runs.
- **Deduplication Engine**: Verifies MinHash and normalized text SHA-256 near-duplicate detection over synthetic duplicate pairs.
- **Section Extraction Regexes**: Evaluates section parser across $\ge 30$ real sample Indian High Court judgment header and ratio strings.
- **Statute Reference Normalizer**: Tests statutory pattern extraction across IPC, CrPC, CPC, BNS, BNSS, BSA, and Constitution Articles.
- **POCSO Statutory Quarantine**: Verifies that records mentioning the POCSO Act are quarantined to `review-queue.csv`.
- **Judicial Takedown Engine**: Verifies that adding a record to `config/takedown.json` purges it from docs and search shards and records an audit log entry.
- **Sync Monitor & Corpus Config**: Tests declarative corpus loading from `config/corpus.json` and ops report generation in `docs/ops.md`.

### 2.2 Layer 2: Client Search, Reader & Workspace Tests (`vitest` - 42 tests)
- **Legal Query Parser**: Parses case numbers (`WP 1234/2022`, `Crl.OP 567/2021`), statutes (`Section 482 CrPC`), party names, and free terms.
- **Search Engine Core**: Tests MiniSearch indexing, prefix matching, AND/OR queries, and live facet counts.
- **Vector Search Engine**: Tests int8 dot-product similarity computation, quantization scales, and model hash verification.
- **Document Loader & Statute Bridge**: Tests in-memory LRU caching, gzip decompression, and official CrPC$\to$BNSS, IPC$\to$BNS transitions with zero `TEST_ONLY` mock rows.
- **Multi-Source Web Links**: Tests URL building and escaping for eCourts, High Court portals, and Indian Kanoon.
- **Advocate Workspace Store**: Tests folder creation, judgment saving, note updating, and JSON import/export in `FolderStore`.

### 2.3 Layer 3: AI Grounding & Verifier Tests
- **Fabricated Quote Rejection**: Injects fake legal holdings with fictitious quotes; asserts that verifier rejects 100% of non-matching quotes.
- **Wrong Paragraph Association**: Injects real quotes assigned to incorrect paragraph numbers; asserts rejection.
- **Abstention Verification**: Asserts that queries with zero grounded evidence trigger complete abstention (`Insufficient evidence in judgment`).

### 2.4 Layer 4: Retrieval & Ranking Evaluation Benchmark
- Script: `eval/evaluate.py` across 25 legal queries in `eval/queries.jsonl`.
- Asserts Recall@10 $\ge 80\%$ and MRR@10 $\ge 0.60$ across BM25, dense vectors, and hybrid Reciprocal Rank Fusion (measured 92% Recall@10, 0.77 MRR@10).

---

## 3. Performance & Size Budget Enforcement

Automated CI budget gates fail if any threshold is exceeded (`scripts/check-budget.sh`):
- **Pages Upload Artifact**: $\le 500\text{ MB}$ total (measured 1.57 MB).
- **Individual Shard Size**: $\le 25\text{ MB}$ uncompressed (measured 0.06 MB).
- **First-Load JavaScript**: $\le 300\text{ KB}$ gzipped (measured 55.76 KB).
- **Committed Git Sample Data**: $\le 5\text{ MB}$ (measured 0.05 MB).
- **Search Query Latency**: $p50 < 50\text{ ms}$, $p95 < 150\text{ ms}$ (measured $< 1\text{ ms}$).

---

## 4. Unified Verification Command
The repository provides a single root validation script:
```bash
bash scripts/verify-all.sh
# or: npm run verify
```
This command sequentially executes:
1. Client Unit & Integration Tests (`npm test` in `web` - 42 tests).
2. Production Bundle Build (`tsc && vite build`).
3. Static Performance & Budget Gate (`bash scripts/check-budget.sh`).
4. Pipeline & Ingestion Unit Tests (`pytest` - 50 tests).
5. Retrieval & RRF Evaluation Benchmark (`eval/evaluate.py`).
