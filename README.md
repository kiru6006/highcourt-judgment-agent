# NyayaReader (न्याय Reader)

> **AI-native Indian High Court judgment search and reader platform for legal professionals.**

[![Deployment Status](https://img.shields.io/badge/Deployment-GitHub%20Pages-blue)](https://kiru6006.github.io/highcourt-judgment-agent/)
[![License: CC-BY-4.0](https://img.shields.io/badge/Data%20License-CC--BY--4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Architecture](https://img.shields.io/badge/Architecture-Static--First%20%7C%20Web%20Worker-emerald)](#architecture)

---

## 1. What is NyayaReader?
NyayaReader provides an open-access, distraction-free environment for Indian advocates, researchers, judicial law clerks, and students to search, analyze, and read High Court orders and judgments.

### Key Capabilities:
- **Clean 3-Pane Reader**: Outline navigation (Facts, Issues, Submissions, Ratio, Order), anchored paragraphs (`#para-N`), statute chips, and reading progress.
- **Client-Side Faceted Search**: High Court, Bench, Year, Case Type, Category, and Disposal status filtering executed in a Web Worker over compact pre-built shards.
- **Multi-Source Web Links**: Instant zero-key deep link generator for eCourts, High Court portals, and Indian Kanoon.
- **Grounded AI Legal Copilot**: Rigorous client-side evidence verification engine that drops any AI claim lacking verbatim paragraph quote support.
- **Statute Transition Bridge**: Instant reference mapping for IPC $\to$ BNS, CrPC $\to$ BNSS, and IEA $\to$ BSA based strictly on verified official gazette tables.
- **100% Static Deployment**: Runs on GitHub Pages with zero required server infrastructure and zero mandatory API keys (Demo Mode pre-computed).

---

## 2. Project Status & Roadmap

| Phase | Description | Status |
|---|---|---|
| **Phase 0** | Documentation baseline, architecture specifications, ADR log, and canonical schemas | **Completed** |
| **Phase 1** | Angular standalone scaffold, CI/CD, Pages deploy, and synthetic fixture UI | *Next up* |
| **Phase 2** | Empirical data spike (schema discovery, extraction quality, size model, CORS) | Queued |
| **Phase 3** | Offline ingestion pipeline (streaming tar, PyMuPDF, OCR fallback, section tagger) | Queued |
| **Phase 4** | Client search core (Web Worker BM25, shard loading, Orama vs MiniSearch bench) | Queued |
| **Phase 5** | Real UI integration & Multi-Source Web Links mode | Queued |
| **Phase 6** | 3-Pane Reader (outline, paragraph anchors, extractive structured briefs) | Queued |
| **Phase 7** | Semantic search & hybrid retrieval (bge-small-en-v1.5 int8 in Web Worker) | Queued |
| **Phase 8** | Grounded AI copilot (BYOK, verbatim verifier, Demo Mode answers) | Queued |
| **Phase 9** | Advocate workspace (folders, Markdown/PDF export, precedent synthesis) | Queued |
| **Phase 10** | Security, compliance, a11y, Playwright E2E, and production migration runbook | Queued |
| **Phase 11** | Nightly incremental sync and automated ops telemetry | Queued |
| **Phase 12** | Optional enhancements (WebLLM, API proxy, citation treatment) | Optional |

---

## 3. Technology Stack

- **Frontend**: React 18+ with Vite (Functional components, Hooks, React Router, Strict TypeScript).
- **Styling**: Tailwind CSS + Typography.
- **UI Tooling**: Lucide Icons, Virtual Scroll (`@tanstack/react-virtual`), Headless/Radix primitives.
- **Client Search**: Web Worker BM25 (Orama / MiniSearch) + Cache API & IndexedDB.
- **Data Ingestion**: Python 3.11 (PyMuPDF, Tesseract OCR fallback, MinHash dedupe).
- **Embeddings & Indexing**: Node.js 20 (`transformers.js` with `BAAI/bge-small-en-v1.5` int8).
- **Deployment & CI**: GitHub Actions $\to$ GitHub Pages static hosting.

---

## 4. Documentation Index

The `docs/` directory contains complete architecture and technical specifications:
- [`docs/PRD.md`](docs/PRD.md): Product requirements, personas, scope, and non-goals.
- [`docs/PRD_RECONCILIATION.md`](docs/PRD_RECONCILIATION.md): 54-item requirements traceability matrix and conflict analysis.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): Static-first 3-layer architecture, data flow, and hosting options.
- [`docs/DECISIONS.md`](docs/DECISIONS.md): Architecture Decision Records (ADR D-001 through D-011).
- [`docs/SCHEMA.md`](docs/SCHEMA.md): Canonical data models (documents, paragraphs, shards, manifest, claims).
- [`docs/UX_SPEC.md`](docs/UX_SPEC.md): Design tokens, 3-pane layout, facets, responsive breakpoints, and states.
- [`docs/AI_GROUNDING_SPEC.md`](docs/AI_GROUNDING_SPEC.md): Prompt contract, structured JSON schema, and verbatim quote verifier.
- [`docs/SECURITY_PRIVACY.md`](docs/SECURITY_PRIVACY.md): Threat model, BYOK policy, CSP meta rules, and takedown workflow.
- [`docs/DATA_SOURCES_AND_LICENSING.md`](docs/DATA_SOURCES_AND_LICENSING.md): Dataset credit, CC-BY-4.0 attribution, and Copyright Act reliance.
- [`docs/TEST_STRATEGY.md`](docs/TEST_STRATEGY.md): Comprehensive test pyramid, E2E, accessibility, and budgets.
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md): Local developer setup, data builds, deployment, and ops procedures.
- [`docs/PHASES.md`](docs/PHASES.md): Full phase roadmap and acceptance criteria.

---

## 5. Local Quickstart

### Prerequisites
- Node.js v20+
- Python 3.11+
- Git

### Running the Web App
```bash
# Navigate to web application directory
cd web

# Install dependencies from lockfile
npm ci

# Start development server
npm start   # or: npm run dev

# Run unit tests
npm run test

# Build production bundle with base path
npm run build

# Preview production build locally
npm run preview
```
Visit `http://localhost:4200/` in your browser.

### Verifying Performance & Size Budgets
```bash
./scripts/check-budget.sh
```

---

## 6. Attribution & Disclaimer
- **Data Source**: Indian High Court Judgments dataset (`s3://indian-high-court-judgments`), licensed under **CC-BY-4.0**, source eCourts.
- **Legal Disclaimer**: *Not legal advice. NyayaReader is an academic and research platform. Always verify case records against the certified copy issued by the concerned High Court.*
