# Architecture Decision Records (ADR)

## Index of Decisions
- [D-001: Frontend Framework (Angular Standalone vs React)](#d-001-frontend-framework-angular-standalone-vs-react)
- [D-002: Static-First Hosting on GitHub Pages](#d-002-static-first-hosting-on-github-pages)
- [D-003: Shard Distribution & Hosting Strategy](#d-003-shard-distribution--hosting-strategy)
- [D-004: Client-Side BM25 Search Engine (Orama vs MiniSearch)](#d-004-client-side-bm25-search-engine-orama-vs-minisearch)
- [D-005: Embedding Model & Quantization Standard](#d-005-embedding-model--quantization-standard)
- [D-006: BYOK API Key Storage & Handling Policy](#d-006-byok-api-key-storage--handling-policy)
- [D-007: Ingestion Pipeline Language Stack](#d-007-ingestion-pipeline-language-stack)
- [D-008: Synthetic Sample Fixtures for Early Phases](#d-008-synthetic-sample-fixtures-for-early-phases)
- [D-009: Rule-Based Section Tagging vs CI LLM Calls](#d-009-rule-based-section-tagging-vs-ci-llm-calls)
- [D-010: Pilot Corpus Boundary & Court Coverage](#d-010-pilot-corpus-boundary--court-coverage)
- [D-011: Project Brand Name & Configuration Constant](#d-011-project-brand-name--configuration-constant)

---

### D-001: Frontend Framework (React + Vite + TypeScript)
- **Status**: Accepted (Overridden by User Directive)
- **Date**: 2026-11-23
- **Context**: Playbook initially defaulted to Angular standalone, but the user explicitly requested: "no angular - react is for frontend".
- **Decision**: Adopt **React (v18+) with Vite, strict TypeScript, Tailwind CSS**, and modern lightweight ecosystem libraries (`lucide-react` for icons, `@tanstack/react-virtual` for virtual scrolling, `@radix-ui` / headless primitives for accessible overlays/drawers).
- **Consequences**:
  - Extremely fast Vite build times, lightweight bundle footprint ($\le 150\text{ KB}$ gz initial load), and rapid developer ergonomics.
  - No Angular dependencies. Complete React ecosystem compatibility.

---

### D-002: Static-First Hosting on GitHub Pages
- **Status**: Accepted
- **Date**: 2026-11-23
- **Context**: The deployment target is GitHub Pages (`https://kiru6006.github.io/highcourt-judgment-agent/`). GitHub Pages serves static files only and cannot host Python runtimes (FastAPI) or server databases (PostgreSQL/DuckDB server).
- **Decision**: Deploy 100% static application to GitHub Pages. All heavy computation (data ingestion, PDF extraction, indexing, embedding) runs offline inside GitHub Actions. No backend server is required at runtime.
- **Consequences**: Zero hosting infrastructure cost, high reliability, zero operational downtime, but runtime search is bounded by browser memory and shard download size.

---

### D-003: Shard Distribution & Hosting Strategy
- **Status**: Accepted (Empirically Verified in Phase 2)
- **Date**: 2026-11-23
- **Context**: Browser search requires fetching court-year metadata and index shards. Options evaluated in Phase 2 probe: (a) Pages same-origin artifact, (b) GitHub Releases via jsDelivr, (c) External Cloudflare R2 / AWS S3 bucket.
- **Empirical Findings**:
  - Pages same-origin: 0.32s latency, byte-range supported, 100% zero browser CORS risk.
  - GitHub Releases: Redirects to AWS S3 without browser CORS headers; rejected.
  - jsDelivr: Lacks HTTP Range request support for vector chunks and has 50MB limits; rejected.
  - 30,000 judgment pilot requires only 66.12 MB (13.2% of 500 MB budget).
- **Decision**: Locked to **Pages artifact same-origin (`data/shards/`)** within the 500 MB budget. External R2/S3 retained only as Phase 10 commercial SaaS exit path.
- **Consequences**: Zero cross-origin failures, fast loading, zero external storage expenses.

---

### D-004: Client-Side BM25 Search Engine (Orama vs MiniSearch)
- **Status**: Accepted
- **Date**: 2026-11-23
- **Context**: Client-side full-text search requires a performant JavaScript/TypeScript search engine that can execute inside a Web Worker over pre-built inverted index shards.
- **Decision**: Adopt **MiniSearch** as the primary client-side search engine. Empirical benchmarking in Phase 4 (`docs/search-bench.md`) demonstrated that MiniSearch delivers equivalent p95 query latency ($< 4\text{ ms}$) while offering a 3.5x smaller gzipped index footprint (117 KB vs 406 KB per 1,000 docs), 2.4x faster index construction, and a ~7 KB gzipped bundle impact compared to Orama's ~28 KB. Vector embeddings remain decoupled in separate `.bin` files.
- **Consequences**: Minimal bundle size overhead, fast in-worker shard loading, low memory consumption on mobile devices. Details in `docs/search-bench.md`.

---

### D-005: Embedding Model & Quantization Standard
- **Status**: Accepted
- **Date**: 2026-11-23
- **Context**: Semantic retrieval requires generating vector representations offline and running in-browser query encoding. Browser environments have strict bandwidth and compute limits.
- **Decision**: Use `BAAI/bge-small-en-v1.5` (384 dimensions), quantized to symmetric int8 with per-vector scale. Pin exact model ID, git revision, and tokenizer hash in `manifest.json`. The browser query encoder must verify the hash before executing similarity search.
- **Consequences**: Compact vector files ($\sim 384\text{ bytes/chunk}$), fast dot-product in Web Worker, zero risk of query/document embedding misalignment.

---

### D-006: BYOK API Key Storage & Handling Policy
- **Status**: Accepted
- **Date**: 2026-11-23
- **Context**: AI features require LLM inference. Storing shared API keys in client bundles risks severe financial theft and rate exhaustion.
- **Decision**:
  - Keys are stored in **memory by default** (lost on tab close).
  - Optional `sessionStorage` support.
  - `localStorage` permitted only after explicit user consent and security warning.
  - Zero server-side key proxy in core application. Provide zero-key **Demo Mode** with pre-computed, verified answers.
- **Consequences**: High security posture, zero platform API cost risk, transparent user privacy.

---

### D-007: Ingestion Pipeline Language Stack
- **Status**: Accepted
- **Date**: 2026-11-23
- **Context**: Ingestion requires PDF parsing, text layout analysis, deduplication, NLP tokenization, and search index construction.
- **Decision**:
  - **Python 3.11** for S3 stream reading, PyMuPDF extraction, Tesseract OCR fallback, paragraph layout analysis, and rule-based section classification.
  - **Node.js 20** for index shard generation and transformers.js embedding builds.
- **Consequences**: Combines Python's superior document processing ecosystem with Node's parity with in-browser search index serialization.

---

### D-008: Synthetic Sample Fixtures for Early Phases
- **Status**: Accepted
- **Date**: 2026-11-23
- **Context**: Early UI scaffolding needs representative data before the offline data pipeline is finalized. Prompt Set A suggested "realistic mock judgments," which risks introducing fake legal precedents.
- **Decision**: Use strictly **synthetic fixtures with prominent "SYNTHETIC SAMPLE" banners**, synthetic party names, and synthetic case numbers across Madras, Karnataka, Delhi, and Bombay High Courts.
- **Consequences**: Prevents any accidental hallucination or misinformation in early deployments.

---

### D-009: Rule-Based Section Tagging vs CI LLM Calls
- **Status**: Accepted
- **Date**: 2026-11-23
- **Context**: Indian judgments require section partitioning (Facts, Issues, Submissions, Reasoning/Ratio, Final Order). Running LLMs over hundreds of thousands of pages in GitHub Actions is cost-prohibitive and non-deterministic.
- **Decision**: Implement deterministic heuristic regular-expression rules for section tagging. If confidence is below threshold, tag the section as **"Untagged"** rather than hallucinating boundaries.
- **Consequences**: Zero CI API cost, reproducible builds, honest presentation of unclassified text.

---

### D-010: Pilot Corpus Boundary & Court Coverage
- **Status**: Accepted
- **Date**: 2026-11-23
- **Context**: The national repository contains over 17 million documents ($>1.25\text{ TiB}$), far exceeding GitHub Pages and browser static delivery limits.
- **Decision**: Pilot corpus is capped to 3 High Courts: **Madras High Court (`33~10`)**, **Karnataka High Court (`29~3`)**, and **Delhi High Court (`7~26`)**, spanning the last 10 years, capped to meet the $\le 500\text{ MB}$ Pages budget.
- **Consequences**: Provides high-depth jurisprudence for 3 major commercial and civil jurisdictions while maintaining razor-sharp performance budgets.

---

### D-011: Project Brand Name & Configuration Constant
- **Status**: Accepted
- **Date**: 2026-11-23
- **Context**: Early documentation used both "NyayaLens" and "NyayaReader".
- **Decision**: The official brand is **NyayaReader**, stored as an exported configuration constant in the web application (`web/src/constants/app.constants.ts`).
- **Consequences**: Unified product identity across all user interfaces, documentation, and metadata.
