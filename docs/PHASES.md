# NyayaReader — Phase Roadmap & Acceptance Criteria

## Summary Roadmap

| Phase | Deliverable | Live Verification Gate |
|---|---|---|
| **Phase 0** | Full `docs/` documentation baseline committed as `phase0` | Complete specifications committed on GitHub |
| **Phase 1** | Scaffolding, CI, Pages deploy, synthetic fixture UI skeleton | Live Pages URL + local run at 375px and 1440px |
| **Phase 2** | Data spike: real schema, extraction quality, size budget, CORS | `docs/data-report.md` with measured numbers |
| **Phase 3** | Offline pipeline $\to$ validated court-year shard artifacts | Sample shards generated + schema validation green |
| **Phase 4** | Client search core: manifest, BM25, facets, Web Worker bench | Real in-browser search on live Pages |
| **Phase 5** | Real UI wiring + Multi-Source Web Links generator | Facets live on real data; URL templates verified |
| **Phase 6** | 3-Pane Reader: paragraphs, outline, statutes, extractive brief | Case reader active on real judgments; 800-para smooth scroll |
| **Phase 7** | Semantic search: embeddings + query encoder + hybrid fusion | Hybrid Recall@10 and MRR@10 measured on eval set |
| **Phase 8** | Grounded AI copilot: BYOK, client verifier, Demo Mode | Verifier drops fake quotes; Demo mode operates zero-key |
| **Phase 9** | Folders, print/export, multi-judgment synthesis, `npm run verify` | Advocate workflow active; `npm run verify` green |
| **Phase 10**| Security, compliance, a11y, e2e, production migration doc | Playwright + axe green; audit clean; migration guide |
| **Phase 11**| Nightly sync, incremental rebuild, ops dashboard | Automated cron green; `docs/ops.md` updated |
| **Phase 12**| Optional enhancements (WebLLM, API proxy, citation treatment) | Per-item explicit user approval |

---

## Detailed Acceptance Criteria per Phase

### Phase 0: Documentation Baseline
- [x] All 13 core documentation files exist in `docs/` and root `README.md`.
- [x] `docs/PRD_RECONCILIATION.md` maps all 54 audited requirements into phases with conflict analysis.
- [x] Canonical data schemas drafted for all core entities.
- [x] Git commit message `docs: phase0 — product, architecture, decisions, specs`, tagged `phase-0`, pushed to origin.

### Phase 1: Scaffold, CI, Pages & Fixture UI Skeleton
- [ ] React app in `web/` with Vite, Tailwind CSS, TypeScript strict, and ESLint.
- [ ] Routes active: `/`, `/search`, `/case/:id`, `/links`, `/folders`, `/about-data`.
- [ ] Top bar with brand, search box, and mode switch.
- [ ] Left-rail facets with live counts and clear-all chips.
- [ ] 3-pane reader with outline, paragraph anchors, statute chips, and copilot placeholder.
- [ ] 8 synthetic sample judgments across Madras, Karnataka, Delhi, and Bombay HC with visible "SYNTHETIC SAMPLE" banners.
- [ ] Responsive browser verification at 375px and 1440px with zero console errors.
- [ ] CI (`ci.yml`) and Pages deployment (`pages.yml`) active and passing.
- [ ] Automated budget gate verifies failure when an oversized dummy file is introduced.

### Phase 2: Empirical Data Spike
- [ ] DuckDB httpfs metadata extraction from `s3://indian-high-court-judgments` (ap-south-1).
- [ ] Real schema discovered and documented in `config/schema.discovered.json`.
- [ ] 300 sample PDFs extracted with PyMuPDF; extraction rates and OCR fallback metrics recorded.
- [ ] Empirical size model computed from 500-judgment sample.
- [ ] Live hosting CORS test page deployed to Pages testing same-origin, jsDelivr, release assets, and S3.
- [ ] Findings published in `docs/data-report.md`.

### Phase 3: Offline Ingestion Pipeline
- [x] Python streaming tar reader extracts judgments without writing multi-GB tars to disk.
- [x] Stable JID hash generated: `sha1(cnr|decision_date|order_number)`.
- [x] Deduplication via SHA-256 and MinHash near-duplicate detection.
- [x] Heuristic section tagger extracts Facts, Issues, Submissions, Ratio, Order (confidence thresholding).
- [x] Statutory pattern extractor normalizes citations (IPC, CrPC, CPC, BNS, BNSS, BSA, Constitution).
- [x] Deterministic taxonomy normalizer maps court codes and disposal types.
- [x] `config/restricted.json` rules exclude sensitive records to `review-queue.csv`.
- [x] Shards validated against JSON-Schema in CI; sample data $\le 5\text{ MB}$ committed to `web/public/data-sample/`.

### Phase 4: Client Search Core
- [x] Node/Python manifest builder outputs `manifest.json` and BM25 shards.
- [x] `SearchWorker` executes BM25 search and computes facet distributions off the main thread.
- [x] Benchmark comparison between Orama and MiniSearch completed; metrics recorded in D-004.
- [x] Query parser accurately handles case numbers, party names, and section references.
- [x] Main thread long tasks remain $< 50\text{ ms}$ during search operations.

### Phase 5: Real UI Integration & Web Links Generator
- [x] Left-rail facets bound to live shard counts with URL state synchronization.
- [x] Virtual-scrolled result cards render genuine judgment records from search shards.
- [x] Multi-Source Web Links mode generates zero-key deep links for eCourts, High Court portals, and Indian Kanoon.
- [x] Every web link template validated against live web targets with verification dates recorded in `config/links.json`.
- [x] Per-card "Find on web" button auto-populates query parameters and launches modal.

### Phase 6: Judgment Reader
- [x] Lazy-load judgment text by JID into 3-pane reader (`docs-*.json.gz` with memory LRU cache).
- [x] Left outline supports scroll-spy; unclassified text gracefully displays paragraph numbers.
- [x] Center pane provides paragraph anchors (`#para-N`), copy-link actions, and font size steppers.
- [x] View toggle switches between Original Full Text and Extractive Structured Brief.
- [x] Statute transition chips display verified IPC$\to$BNS / CrPC$\to$BNSS mappings from static CSVs (`data/mappings/statute_transitions.csv`).
- [x] Precedent citations drawer with one-click "Find on web" deep links.
- [x] Smooth scrolling and responsive mobile collapsible drawers.

### Phase 7: Semantic Search & Hybrid Retrieval
- [x] Offline embeddings generated via `pipeline/embedder.py` (`bge-small-en-v1.5` symmetric int8).
- [x] Vector shards saved as compact `.bin` files decoupled from BM25 indexes (388 bytes/vector).
- [x] In-browser VectorEngine computes int8 dot-product similarity off main thread.
- [x] Manifest verifies exact model revision and tokenizer hash before enabling semantic mode.
- [x] Reciprocal Rank Fusion (RRF) combines BM25 and vector scores with mode toggle (Keyword / Semantic / Hybrid).
- [x] Evaluation on `eval/queries.jsonl` reports Recall@10 (92%) and MRR@10 (0.77).

### Phase 8: Grounded AI Copilot & Demo Mode
- [ ] Provider adapters implemented for Gemini, Anthropic, and OpenAI-compatible endpoints.
- [ ] Client-side verifier drops claims lacking verbatim paragraph quote support.
- [ ] Unverified claims dropped; abstention triggered if zero claims survive.
- [ ] Pre-computed Demo Mode (`demo/answers.json`) enables instant, zero-key analysis on pilot judgments.
- [ ] Memory-first API key storage policy strictly enforced; explicit user consent required for persistent storage.

### Phase 9: Advocate Research Workspace & Verification Suite
- [ ] Local case folders in `IndexedDB` (save judgments, notes, web links, import/export JSON).
- [ ] Markdown export and `@media print` court memo layout.
- [ ] Precedent comparison table for 2–5 selected judgments.
- [ ] Single verification command `npm run verify` passes locally and in CI.

### Phase 10: Security, Compliance & Production Migration
- [ ] Strict meta tag Content Security Policy enforced.
- [ ] Takedown workflow validated with automated document purge and rebuild.
- [ ] `/about-data` displays complete attribution, CC-BY-4.0 terms, and disclaimer.
- [ ] Playwright E2E and axe accessibility test suites pass in CI.
- [ ] `docs/PRODUCTION_MIGRATION.md` verified with multi-host build checks.

### Phase 11: Automated Sync & Ops
- [ ] Scheduled `nightly.yml` checks upstream S3 partitions and rebuilds only modified shards.
- [ ] Adding a court requires editing only `config/corpus.json`.
- [ ] Automated ops telemetry (`docs/ops.md`) tracks corpus volume and Pages artifact size.

### Phase 12: Optional Enhancements (Explicit Approval Gated)
- [ ] 12a: In-browser WebLLM experimental toggle with WebGPU verification.
- [ ] 12b: Server-side FastAPI proxy tier for enterprise deployments off GitHub Pages.
- [ ] 12c: Citation treatment classifier (Overruled/Followed) with human-labelled validation set.
- [ ] 12d: Regional language translation on demand.
