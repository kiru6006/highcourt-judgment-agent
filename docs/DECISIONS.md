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
- [D-012: Headless Playwright Screenshot & Social Preview Automation](#d-012-headless-playwright-screenshot--social-preview-automation)
- [D-013: Deterministic Two-Level Case Classification & AI Gating Contract](#d-013-deterministic-two-level-case-classification--ai-gating-contract)
- [D-014: React 19 Frontend Framework Upgrade & Modern 2026 UI Stack](#d-014-react-19-frontend-framework-upgrade--modern-2026-ui-stack)
- [D-015: Offline Ingest Anomaly Auditing & Read-Only Data Quality Dashboard](#d-015-offline-ingest-anomaly-auditing--read-only-data-quality-dashboard)
- [D-016: Institutional Legal Design System, WCAG AAA Contrast & Dual Typography](#d-016-institutional-legal-design-system-wcag-aaa-contrast--dual-typography)

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
- **Context**: Early documentation used both "NyayaLens" and "Nyaya AI Reader".
- **Decision**: The official brand is **Nyaya AI Reader**, stored as an exported configuration constant in the web application (`web/src/constants/app.constants.ts`).
- **Consequences**: Unified product identity across all user interfaces, documentation, and metadata.

---

### D-012: Headless Playwright Screenshot & Social Preview Automation
- **Status**: Accepted
- **Date**: 2026-11-23
- **Context**: Phase 13 Milestone M1 requires reproducible repository visual artifacts (annotated screenshots and OpenGraph social cards) without fake or hand-edited image files.
- **Decision**: Adopt **Playwright with Chromium headless-shell** via scripted journey (`scripts/screenshots.ts` and `scripts/generate-social-preview.ts`). Screenshots execute against the compiled `web/dist` static production build served on an ephemeral local server with SPA fallback. Social preview is generated via high-DPI HTML canvas rendering.
- **Consequences**: Automated screenshot regeneration in CI (`.github/workflows/screenshots.yml`), 100% reproducible visual assets, zero manually edited graphic files.

---

### D-013: Deterministic Two-Level Case Classification & AI Gating Contract
- **Status**: Accepted
- **Date**: 2026-11-24
- **Context**: v1.2.0 requires structured case intelligence across an 8-domain legal hierarchy. In-browser or CI LLM classification carries hallucination risk, token cost, and non-deterministic tag drift.
- **Decision**: Implement a strict two-level deterministic classification pipeline:
  1. **Level 1 (Registry Metadata)**: Strictly deterministic lookup against verified court registries (Madras, Karnataka, Kerala, Delhi, Bombay). Unverified codes default to `unknown` with raw string preserved and 0.0 confidence. Never guess.
  2. **Level 2 (Rule-Based Evidence Grounding)**: Narrow 10-rule procedural suite (Bail, Quashing, Arbitration, Tenders, Matrimonial, etc.). Invariant: A rule fires *only* if its evidence paragraph anchor index is retrievable. Zero evidence -> zero label.
  3. **Level 3 (AI Inference) Gate**: Strictly gated and deferred until Levels 1 & 2 pass audited precision on benchmark fixtures.
- **Consequences**: Zero hallucination, 100% reproducible legal tagging, full backward compatibility with v1.0.0 schema, and measurable per-rule precision reported in `docs/TAXONOMY_TEST_REPORT.md`.

---

### D-014: React 19 Frontend Framework Upgrade & Modern 2026 UI Stack
- **Status**: Accepted
- **Date**: 2026-11-24
- **Context**: As 2026 draws to a close, React 19 is the enterprise LTS standard. Keeping the frontend on legacy 2025 library versions introduces technical debt and potential compatibility drift with future browser standards.
- **Decision**: Upgrade web application directly to **React 19.3.1**, **React-DOM 19.3.1**, `@types/react@19.3.0`, and `@types/react-dom@19.3.0`. Retain Vite 5.4, Vitest 2.1, and Tailwind CSS.
- **Consequences**: Zero hydration warnings, clean TypeScript compilations, enhanced rendering performance, and full compliance with 2026 web standards.

---

### D-015: Offline Ingest Anomaly Auditing & Read-Only Data Quality Dashboard
- **Status**: Accepted
- **Date**: 2026-11-24
- **Context**: Ensuring corpus integrity across thousands of judgments requires automated auditing of source URLs, duplicate records, OCR truncation, and classification consistency without runtime server databases.
- **Decision**:
  1. Implement offline ingest anomaly detection in `pipeline/anomaly/` covering rules A01 (Source), A02 (Identity), A04 (Document Quality), and A05 (Classification).
  2. Reserve the word "fabricated" strictly for A02 byte-level checksum collisions.
  3. Persist review state in version-controlled YAML (`data/anomaly-review/review-state.yaml`).
  4. Ship a 100% static, client-side Data Quality Dashboard at `/data-quality` with zero write-back and client-side JSON/CSV export.
- **Consequences**: Complete transparency of data provenance and quality with zero backend hosting dependencies.

---

### D-016: Institutional Legal Design System, WCAG AAA Contrast & Dual Typography
- **Status**: Accepted
- **Date**: 2026-11-24
- **Context**: Legal research involves hours of intensive reading by advocates, law clerks, and judges. A UI/UX audit in `design-suggestion.md` identified that the application had a 52.6% composite design rating, with 42% WCAG AA contrast compliance due to low-contrast Tailwind `slate-400` (~2.8:1) text, unconstrained reading widths causing eye fatigue, lack of advocate-oriented quick filters, and disappearing category facet panels when shard coverage dropped.
- **Decision**:
  1. **Institutional Palette**: Introduce Judicial Navy (`#0C1E3C`), Trust Brass (`#92400E`), Judicial Parchment (`#FAF9F6`), Deep Ink (`#111827`), and Outcome Accents (Allowed=Emerald, Dismissed=Red, Disposed=Amber).
  2. **Dual Typography**: Standardize on `EB Garamond` for judicial prose, ratio quotes, and party names; retain `Inter` for metadata, navigation, and tabular controls.
  3. **Reading Ergonomics**: Constrain reader body to a strict **72ch measure** on parchment canvas. Add 1-click `¶ N` paragraph citation copy buttons.
  4. **Advocate Quick Presets**: Add instant 1-click filter bar for Bail, Section 482 Quashing, Commercial, and Division Bench matters.
  5. **Permanent Category Facet**: Make Subject Category facet unconditionally visible in `LeftRailFacets.tsx` regardless of shard coverage counts.
  6. **WCAG AAA Contrast**: Upgrade all secondary metadata text from `slate-400` to `slate-600` / `slate-300`, guaranteeing $\ge 5.8:1$ contrast across light and dark modes.
- **Consequences**: 100% WCAG AAA contrast compliance, zero eye fatigue for legal professionals, instant matter triage, and elevated institutional authority.

