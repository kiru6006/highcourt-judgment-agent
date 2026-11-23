# Nyaya AI Reader — Product Requirements Document (PRD)

## 1. Product Mission & Vision
**Nyaya AI Reader** is an open-access, AI-native Indian High Court judgment search and reading platform designed for advocates, legal researchers, judicial clerks, law students, and litigants.

The platform provides:
- Clean, fast, zero-ad readability for Indian High Court orders and judgments.
- Real-time client-side faceted search over indexed High Court jurisprudence.
- Multi-Source Web Links generator providing instant deep links to official eCourts portals, High Court case status pages, Indian Kanoon, and legal news repositories without live scraping.
- High-fidelity 3-pane reader with deterministic section breakdown (Facts, Issues, Submissions, Reasoning/Ratio, Final Order) and paragraph-level navigation.
- Grounded AI legal analysis governed by a client-side verbatim evidence verifier, guaranteeing that every AI claim is anchored to exact paragraph quotes.
- 100% static client-side operation deployed on GitHub Pages with zero required server infrastructure and zero mandatory API keys (Demo Mode included).

## 2. Target Users & Personas
1. **Practicing Advocate / Litigator**:
   - *Needs*: Rapidly locate relevant High Court precedents by section (e.g., Section 482 CrPC / Section 528 BNSS), bench strength, and disposal nature; copy exact quotes with verified paragraph anchors into court memos.
2. **Judicial Clerk / Law Researcher**:
   - *Needs*: Read clean judgment text with outline navigation; review statutory transitions (IPC→BNS, CrPC→BNSS, IEA→BSA); compare 2–5 judgments extractively.
3. **Law Student / Academic**:
   - *Needs*: Study ratio decidendi and court reasoning separated from arguments; understand case structure via structured briefs without paywalls.
4. **Pro Se Litigant**:
   - *Needs*: Understand procedural history and final operative orders in plain terms without confusing advertisements or legal jargon.

## 3. In-Scope Modules (Core Scope)
- **Module A: Global Search**:
  - Unified search box supporting party names, case numbers, CNR, judges, statutes, sections, legal issues, and free text.
  - Dual-mode switch: "Indexed Corpus + AI Reader" vs "Multi-Source Web Links".
  - Shareable URL state (`?q=...&court=...`).
- **Module B: Left-Rail Facets**:
  - High Court selection (Pilot: Madras `33~10`, Karnataka `29~3`, Delhi `7~26`).
  - Bench filters (geographic bench e.g. Principal/Madurai, coram strength: Single Bench vs Division Bench).
  - Category (Criminal, Civil, Writ, Commercial, Tax, Service, Matrimonial).
  - Case type prefixes (dynamic per court: CRL.P, WP, RFA, MFA, WA, ARB.P, etc.).
  - Purpose / Stage / Disposal (Bail/Anticipatory Bail, Quashing, Stay, Final Disposal: Allowed/Dismissed/Partly Allowed).
  - Explicit distinction between verified metadata and derived metadata (`derived: true`).
- **Module C: Search Results View**:
  - Virtual-scrolled result cards with title, court, bench, decision date, case number, disposal tag, and statute badges.
  - Direct actions: Open Judgment Reader, Open Original Source PDF, Find on Web / eCourts / Indian Kanoon.
- **Module D: 3-Pane Judgment Reader**:
  - Left pane: Interactive outline (Facts, Issues, Petitioner Submissions, Respondent Submissions, Reasoning & Ratio, Final Order) with scroll-spy.
  - Center pane: Paragraph-numbered judgment text (`[Para N]`), statute chips, in-corpus citation links, font/width controls, reading progress.
  - Right pane: Copilot drawer (summaries, ratio, statute mappings, Q&A).
  - View toggle: Full Original Judgment vs Structured Brief (extractive).
  - Mobile responsiveness: Left outline and right copilot collapse into slide-over drawers.
- **Module E: Statutory Transition & Mapping**:
  - Pre-computed mapping chips for Indian Penal Code (IPC) → Bharatiya Nyaya Sanhita (BNS), Code of Criminal Procedure (CrPC) → Bharatiya Nagarik Suraksha Sanhita (BNSS), and Indian Evidence Act (IEA) → Bharatiya Sakshya Adhiniyam (BSA).
  - Zero hallucination: mappings sourced strictly from static verified CSV tables; missing entries display "Mapping unavailable".
- **Module F: Grounded AI Legal Copilot**:
  - Standard prompt contract emitting structured JSON (`claims: [{text, jid, para_ns, supporting_quote}]`).
  - Client-side Verifier: Drops claims whose quote does not match source text verbatim.
  - Demo Mode: Pre-computed, verified answers for representative cases (zero API key required).
  - BYOK (Bring Your Own Key): Browser direct calls to Google Gemini, Anthropic, or OpenAI-compatible endpoints with memory-first key management.
- **Module G: Research Workspace (Local-Only)**:
  - Client-side case folders in IndexedDB (save judgments, web links, user notes).
  - Export capabilities: Markdown export, print-to-PDF court memo layout.
  - Multi-judgment extractive synthesis matrix (2–5 judgments).
- **Module H: Dataset Transparency & Status**:
  - `/about-data` route detailing court coverage, date spans, document counts, ingestion date, limitations, CC-BY-4.0 attribution, and disclaimer.

## 4. Non-Goals & Boundaries
- **No live server or database backend at runtime**: No FastAPI, Node server, or cloud SQL at runtime. GitHub Pages static file delivery only.
- **No web scraping**: No live scraping of eCourts, High Court portals, or Indian Kanoon. Client-side URL template generation only.
- **No automated legal advice**: Strictly a legal research and comprehension tool. Not legal advice. Mandatory disclaimer on all footers and exports.
- **No unverified AI claims**: AI will never answer from internal parametric weights without verbatim source paragraph citation.
- **No whole-dataset publication**: Corpus remains capped within the 500 MB GitHub Pages artifact limit.
- **No user account servers**: All bookmarks, folders, and API keys remain in the client browser's local storage/memory.

## 5. Success Metrics & Performance Budgets
- **First Load JS**: $\le 300\text{ KB}$ gzipped.
- **Search Shard Size**: $\le 25\text{ MB}$ uncompressed per shard.
- **Pages Artifact Total Size**: $\le 500\text{ MB}$ (hard limit: 1 GB).
- **BM25 Search Latency**: $p50 < 50\text{ ms}$, $p95 < 150\text{ ms}$ on pilot corpus in Web Worker.
- **Main Thread Long Tasks during Search**: $< 50\text{ ms}$.
- **Evidence Verification Pass Rate**: 100% of claims displayed to user match underlying judgment paragraph text verbatim.
- **Lighthouse Scores on Reader Page**: Performance $\ge 90$, Accessibility $\ge 95$.
