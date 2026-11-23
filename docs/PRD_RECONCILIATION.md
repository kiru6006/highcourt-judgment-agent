# PRD Reconciliation & Requirements Traceability Matrix

## 1. Overview
This document reconciles all requirements from `highcourt-app-prd3.md`, the legacy PRD prompt drafts, and the final GitHub Actions $\to$ GitHub Pages static playbook. Every feature is mapped to an execution phase, marked dropped with explicit rationale, or flagged as an open conflict.

Total Requirements Audited: **54**

---

## 2. Traceability Matrix

| Req ID | Requirement Description | Source Document | Assigned Phase | Status | Notes / Rationale |
|---|---|---|---|---|---|
| **R-001** | Static-first architecture (GitHub Pages static host) | Playbook §1, PRD3 §4 | Phase 1 | Accepted | Zero server at runtime; Python runs only offline in CI |
| **R-002** | React + Vite + TypeScript + Tailwind frontend stack | Playbook §2, PRD3 §4 | Phase 1 | Accepted | Locked under D-001; user directive overrides earlier Angular draft |
| **R-003** | Unified search bar (party, case no, section, legal issue) | PRD3 §5.A, Playbook Phase 1 | Phase 1 (UI), Phase 4 (Worker) | Accepted | Query parser handles case formats, section names, free text |
| **R-004** | Dual-mode toggle (Indexed Corpus vs Multi-Source Web Links) | PRD3 §5.A, Playbook Phase 1 | Phase 1 (UI), Phase 5 (Live) | Accepted | Instant switch between in-corpus reader and external deep links |
| **R-005** | Left-rail facet: High Court selection | PRD3 §5.B, Playbook Phase 1 | Phase 1 (UI), Phase 5 (Live) | Accepted | Filter by court code (Madras 33~10, Karnataka 29~3, Delhi 7~26) |
| **R-006** | Left-rail facet: Bench (geography + coram strength) | PRD3 §5.B, Playbook Phase 1 | Phase 1 (UI), Phase 5 (Live) | Accepted | Single Judge vs Division Bench; Principal vs circuit benches |
| **R-007** | Left-rail facet: Category (Criminal, Civil, Writ, etc.) | PRD3 §5.B, Playbook Phase 1 | Phase 1 (UI), Phase 5 (Live) | Accepted | Derived deterministically; tagged with `derived: true` |
| **R-008** | Left-rail facet: Dynamic Case Type prefix per court | PRD3 §5.B, Playbook Phase 1 | Phase 1 (UI), Phase 5 (Live) | Accepted | Dynamically adapts options based on selected High Court |
| **R-009** | Left-rail facet: Purpose / Stage / Disposal status | PRD3 §5.B, Playbook Phase 1 | Phase 1 (UI), Phase 5 (Live) | Accepted | Bail, Quashing, Stay, Allowed, Dismissed, Partly Allowed |
| **R-010** | Live facet counts & Clear-all chips | Playbook Phase 1 | Phase 1 (UI), Phase 5 (Live) | Accepted | Real-time counts computed in Web Worker |
| **R-011** | Virtual-scroll results card list | PRD3 §5.C, Playbook Phase 1 | Phase 1 (UI), Phase 5 (Live) | Accepted | Angular CDK Virtual Scroll for 60fps performance |
| **R-012** | Direct card action: "Find on web / eCourts / Indian Kanoon" | PRD3 §5.C, Playbook Phase 5 | Phase 5 | Accepted | Client-side deep link prefilled from case number & parties |
| **R-013** | 3-pane desktop judgment reader layout | PRD3 §5.D, Playbook Phase 1 | Phase 1 (UI), Phase 6 (Live) | Accepted | Outline left, text center, AI copilot right |
| **R-014** | Mobile collapsible reader drawers/tabs | PRD3 §5.D, Playbook Phase 1 | Phase 1 (UI), Phase 6 (Live) | Accepted | 375px responsive layout verified |
| **R-015** | Paragraph numbering with deep anchors (`#para-N`) | PRD3 §5.D, Playbook Phase 6 | Phase 6 | Accepted | Preserves original judgment numbering; shareable deep links |
| **R-016** | View toggle: Original Judgment vs Structured Brief | PRD3 §5.D, Playbook Phase 6 | Phase 6 | Accepted | Brief is extractive (verbatim quotes), labelled non-AI |
| **R-017** | Statute reference badges & in-corpus citation links | PRD3 §5.D, Playbook Phase 6 | Phase 6 | Accepted | Links direct to internal judgment where available |
| **R-018** | Reader controls: font size, line width, reading progress | PRD3 §5.D, Playbook Phase 6 | Phase 6 | Accepted | Reader usability enhancements |
| **R-019** | Statutory Transition Chips (IPC$\to$BNS, CrPC$\to$BNSS, IEA$\to$BSA) | PRD3 §12, Playbook Phase 6 | Phase 6 | Accepted | Strictly static table lookup (`data/mappings/*.csv`); no LLM |
| **R-020** | Grounded AI answer contract (`claims: [{text, jid, para, quote}]`) | PRD3 §11, Playbook Phase 8 | Phase 8 | Accepted | Enforces structured JSON output with verbatim quotes |
| **R-021** | Client-side verbatim quote evidence verifier | PRD3 §11, Playbook Phase 8 | Phase 8 | Accepted | Drops claims failing quote match; abstains if none survive |
| **R-022** | Demo Mode AI (zero-key pre-computed answers) | PRD3 §10, Playbook Phase 8 | Phase 8 | Accepted | Zero-friction exploration on sample judgments |
| **R-023** | BYOK Live AI provider adapters (Gemini, Anthropic, OpenAI) | PRD3 §10, Playbook Phase 8 | Phase 8 | Accepted | Direct browser fetch subject to provider CORS check |
| **R-024** | Memory-first API key storage policy | Playbook §1, PRD3 §10 | Phase 8 | Accepted | Never stored in bundle; `sessionStorage` optional; warn on `localStorage` |
| **R-025** | IndexedDB cache for AI answers & search shards | Playbook §2, PRD3 §8 | Phase 4 (Shards), Phase 8 (AI) | Accepted | Keyed `(jid, task, model, promptVersion)`; reduces redundant fetches |
| **R-026** | Research Workspace: Local case folders | PRD3 §5.G, Playbook Phase 9 | Phase 9 | Accepted | Create, rename, delete folders; save judgments and notes |
| **R-027** | Export: Markdown & Court Memo Print-to-PDF | PRD3 §5.G, Playbook Phase 9 | Phase 9 | Accepted | CSS `@media print` layout with attribution header & disclaimer |
| **R-028** | Multi-judgment synthesis matrix (2–5 judgments) | PRD3 §5.F, Playbook Phase 9 | Phase 9 | Accepted | Extractive comparative table with cross-case evidence validation |
| **R-029** | Single verification command (`npm run verify`) | PRD3 §16, Playbook Phase 9 | Phase 9 | Accepted | Manifest checksum, schema, sample search, and budget gate |
| **R-030** | Dataset Transparency page (`/about-data`) | PRD3 §5.H, Playbook Phase 1 | Phase 1 (UI), Phase 10 (Final) | Accepted | Coverage stats, CC-BY-4.0 attribution, limitations notice |
| **R-031** | Anonymous AWS S3 metadata & tar ingestion pipeline | PRD3 §6, Playbook Phase 3 | Phase 3 | Accepted | Python 3.11 streaming tar index reader; no huge disk footprint |
| **R-032** | PDF text extraction via PyMuPDF with Tesseract OCR fallback | PRD3 §6, Playbook Phase 3 | Phase 3 | Accepted | Extract native text; OCR fallback for scanned pages |
| **R-033** | Document deduplication & stable JID hashing | PRD3 §6, Playbook Phase 3 | Phase 3 | Accepted | `sha1(cnr|decision_date|order_number)` + MinHash near-dup |
| **R-034** | Rule-based section tagger (Facts, Issues, Submissions, Ratio, Order) | PRD3 §5.E, Playbook Phase 3 | Phase 3 | Accepted | Heuristic regex parser; low confidence marked "Untagged" |
| **R-035** | Shard generator by Court $\times$ Year | PRD3 §6, Playbook Phase 3 | Phase 3 | Accepted | Emits JSON search metadata and text fragments $\le 25\text{ MB}$ |
| **R-036** | Global `manifest.json` generation | PRD3 §7, Playbook Phase 4 | Phase 4 | Accepted | Root catalog of shards, checksums, court codes, and dates |
| **R-037** | Web Worker search engine (Orama vs MiniSearch benchmark) | PRD3 §8, Playbook Phase 4 | Phase 4 | Accepted | D-004 decision gated by latency, memory, and index size |
| **R-038** | Semantic embeddings pipeline (bge-small-en-v1.5 int8) | PRD3 §9, Playbook Phase 7 | Phase 7 | Accepted | Transformers.js offline; binary vector shards (`.bin`) |
| **R-039** | In-browser query encoder & hybrid search fusion | PRD3 §9, Playbook Phase 7 | Phase 7 | Accepted | Web Worker encodes query; dot-product; reciprocal rank fusion |
| **R-040** | Data size budget gate ($\le 500\text{ MB}$ total Pages artifact) | Playbook §1, §3 | Phase 1 (CI Gate) | Accepted | CI check fails if Pages upload exceeds budget |
| **R-041** | Content restriction & takedown policy system | Playbook §1, PRD3 §17 | Phase 10 | Accepted | `config/restricted.json` & `takedown.json` exclusion in pipeline |
| **R-042** | Content Security Policy (CSP) via HTML `<meta>` | Playbook §1, PRD3 §17 | Phase 10 | Accepted | Strict meta tag CSP adapted for GitHub Pages static serving |
| **R-043** | Automated nightly sync workflow (`nightly.yml`) | Playbook Phase 11 | Phase 11 | Accepted | Checks S3 partitions daily; incremental rebuild of changed shards |
| **R-044** | Production migration runbook (Cloudflare / R2 / S3) | Playbook Phase 10 | Phase 10 | Accepted | Documents exit path from GitHub Pages for commercial compliance |
| **R-045** | Fast API backend tier (`/api/search`, `/api/web-links`) | Prompt Set A | Dropped | **DROPPED**: Incompatible with GitHub Pages static hosting |
| **R-046** | DuckDB in-browser WASM runtime for all judgments | Prompt Set A | Dropped | **DROPPED**: High memory footprint & slow cold start on mobile |
| **R-047** | Release assets via jsDelivr for vector/data distribution | Spec B | Dropped | **DROPPED**: CORS restrictions and 50MB file limits; Pages same-origin preferred |
| **R-048** | WebLLM in-browser LLM execution | Spec B | Phase 12a | **DEFERRED**: Multi-GB model download and WebGPU requirements; experimental only |
| **R-049** | Automated citation treatment classifier (Overruled/Followed) | PRD3 §12 | Phase 12c | **DEFERRED**: High risk of legal hallucination without verified human-labelled gold set |
| **R-050** | Scraped live web search (SerpAPI / Brave) | Prompt Set A | Dropped | **DROPPED**: Requires server API keys, introduces CORS & recurring costs |
| **R-051** | Fake/realistic simulated mock judgments | Prompt Set A | Dropped | **DROPPED**: Misinformation risk; replaced with synthetic fixtures bannered |
| **R-052** | Commercial SaaS monetization & user billing | Spec B | Dropped | **DROPPED**: Prohibited under GitHub Pages Terms of Service |
| **R-053** | National corpus ingestion (17M+ documents) | Prompt Set A | Dropped | **DROPPED**: 1.25+ TiB exceeds static hosting budgets; capped pilot used |
| **R-054** | Regional language auto-translation | PRD3 §12 | Phase 12d | **DEFERRED**: Translation model licensing and quality verification required first |

---

## 3. Conflict Analysis & Key Decisions
1. **Hosting Runtime Conflict**: Prompt Set A mandated FastAPI + DuckDB; GitHub Pages supports only static files.
   - *Resolution*: Architecture locked to 100% static client-side (Angular + Web Workers). All data processing occurs offline in GitHub Actions.
2. **UI Framework Conflict**: Previous prompts alternated between React+Vite and Angular.
   - *Resolution*: Locked to Angular standalone + Tailwind + CDK under ADR D-001. React remains documented as evaluated alternative.
3. **Data Distribution Conflict**: Spec B proposed GitHub Release assets via jsDelivr.
   - *Resolution*: Defaulting to same-origin Pages artifact ($\le 500\text{ MB}$) to eliminate browser CORS and CDN rate-limit hazards (ADR D-003). External object storage (R2/S3) is an emergency fallback.
4. **AI Citation Risk**: Prompt Set A permitted generative summaries without strict quotation bounds.
   - *Resolution*: Strict evidence verifier mandates exact paragraph references and verbatim substring matching before displaying any claim to users.
