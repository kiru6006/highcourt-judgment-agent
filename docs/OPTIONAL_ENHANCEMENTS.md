# NyayaReader Optional Enhancements & Enterprise Extension Specifications
**Document Status:** Gated Extension Reference (Phase 12)  
**Governing ADRs:** D-001 (Pure Static Runtime), D-002 (Offline Indexing), D-006 (Client Grounding & Privacy)

---

## 1. Overview & Gating Principles

All core capabilities of NyayaReader (search, facets, reading, extractive structuring, int8 semantic retrieval, advocate workspace, grounded claims verification) execute 100% client-side on GitHub Pages without servers.

Phase 12 outlines optional extensions designed for enterprise, private intranet, or experimental research deployments. Per project governance, these extensions remain decoupled from the production static build:

---

## 2. Enhancement Specifications

### 12a: In-Browser WebLLM with WebGPU Verification
- **Concept**: Execute local quantized LLM inference (e.g. `Llama-3-8B-Instruct-q4f16_1` or `Phi-3-mini-4k-instruct-q4f16_1`) directly inside the user's browser via WebGPU using Apache TVM WebLLM.
- **Why Gated**:
  - Model weights require 1.8 GB to 4.2 GB client download on first run (violates standard web page load budgets).
  - High variance across user hardware: requires modern WebGPU-capable GPU (Apple Silicon M-series or discrete NVIDIA RTX).
- **Activation Path**:
  - Optional toggle in Copilot settings: "Enable Experimental In-Browser WebGPU LLM".
  - Feature-detects `navigator.gpu`. If unavailable, gracefully falls back to Gemini BYOK or Extractive Brief.

### 12b: Server-Side FastAPI Proxy Tier for Enterprise
- **Concept**: Standalone FastAPI service deployed inside a law firm or court intranet (`api.nyayareader.internal`).
- **Capabilities**:
  - Centralized DuckDB / PostgreSQL full-text search backend.
  - Team collaboration workspace (shared folders, multi-advocate case notes).
  - Centralized LLM inference endpoint with firm-wide Azure OpenAI or Vertex AI credentials.
- **Why Gated**:
  - Direct violation of ADR D-001 on public GitHub Pages (which must remain 100% static-first with zero backend server maintenance).
- **Activation Path**:
  - Enterprise deployments run `docker-compose up` using `docs/PRODUCTION_MIGRATION.md` Option C.

### 12c: Citation Treatment Classifier (Overruled / Followed / Distinguished)
- **Concept**: Fine-tuned classification model predicting whether a judicial precedent was:
  - *Followed* / *Affirmed*
  - *Distinguished* / *Clarified*
  - *Overruled* / *Doubted* / *Sub silentio*
- **Why Gated**:
  - Requires a verified, human-annotated ground-truth dataset of at least 5,000 High Court citation pairs to meet legal liability standards.
  - LLM heuristic labeling produces subtle hallucination risks on critical legal status questions.
- **Activation Path**:
  - Offline classification pipeline during ingestion once annotated corpus is finalized.

### 12d: Regional Language Judicial Translation on Demand
- **Concept**: Multi-lingual judicial reader translating judgments between English and official High Court languages (Tamil for Madras HC, Kannada for Karnataka HC, Hindi for Delhi/Allahabad HC) using Bhashini APIs or Gemini translation.
- **Why Gated**:
  - Legal terminology requires certified translation to avoid distortion of judicial orders.
- **Activation Path**:
  - Client-side hook invoking Bhashini API with explicit disclaimer: "Machine translation for academic reference; refer to certified High Court copy."
