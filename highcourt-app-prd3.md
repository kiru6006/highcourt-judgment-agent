# NYAYAREADER: FINAL MASTER BUILD PROMPT
## Indian High Court Judgment Search and AI Legal Research Platform

### 1. Your role

Act as a combined team of:

- Principal Software Architect
- Senior Indian Legal Research Expert
- Product Manager and Business Analyst
- Senior UI/UX Designer
- Frontend Architect
- Python and Data Engineering Architect
- AI/ML and RAG Engineer
- Search and Information Retrieval Engineer
- QA Automation Engineer
- DevOps and GitHub Actions Engineer

Build a fully functional public proof-of-concept application.

Do not create only a visual mockup. Build real data ingestion, real search, a working judgment reader, source-grounded AI functionality and a deployed website.

### 2. Project information

Project name: NyayaReader

Repository:
https://github.com/kiru6006/highcourt-judgment-agent

Target deployment:
https://kiru6006.github.io/highcourt-judgment-agent/

Primary dataset:
https://github.com/vanga/indian-high-court-judgments

AWS Open Data:
https://registry.opendata.aws/indian-high-court-judgments/

Reference interface:
https://indiankanoon.org/doc/14147151/

The application is a public educational and legal research demonstration. It is not initially a production SaaS application.

### 3. First action: inspect and reconcile

Before changing code:

1. Inspect the current Git repository.
2. Read the existing README and project structure.
3. Read count-app-PRD.md and count-app-prd2.md if present.
4. Read any existing Antigravity playbook and architecture documents.
5. Inspect existing framework, dependencies, scripts and workflows.
6. Identify already completed features.
7. Identify conflicting requirements.
8. Inspect the actual source dataset documentation.
9. Create a requirements reconciliation matrix.
10. Produce an implementation plan for approval.

Do not overwrite existing working features.

Do not assume that a previous phase is incomplete without inspecting the code and testing it.

### 4. Architecture decision

Use a static-first architecture.

Runtime:
- Browser application on GitHub Pages.
- No mandatory FastAPI backend.
- No mandatory hosted database.
- No shared LLM API key.
- No server-side processing during user search.

Offline:
- Python for dataset ingestion and PDF extraction.
- Node.js for search index generation and optional embeddings.
- GitHub Actions for repeatable builds and publication.

Frontend framework decision:
- Preserve Angular standalone if already implemented.
- Preserve React if already implemented.
- If the repository is empty, record a framework decision in docs/DECISIONS.md. The uploaded playbook defaults to Angular, while the alternative is React + Vite. Present the trade-off and obtain approval before scaffolding.
- Do not mix Angular and React.
- Do not rewrite the framework without approval.

Use strict TypeScript, Tailwind CSS, lazy loading and responsive layouts.

### 5. Product modules

Implement the following modules.

A. Global Search
- Unified search box.
- Search by party name, case number, CNR, judge, court, legal issue and keyword.
- Indexed Corpus mode.
- Multi-Source Web Links mode.
- Recent searches stored locally.

B. Search Filters
- High Court.
- Bench.
- Year and date range.
- Case category.
- Case type.
- Purpose/stage.
- Disposal status.
- Relevant legal provisions when available.

Only show filters supported by actual data.

Derived classifications must be labelled as derived.

C. Search Results
- Judgment title.
- Court and bench.
- Case number.
- Decision date.
- Judge where available.
- Short excerpt.
- Relevant provisions.
- Open judgment.
- Open original source.
- Find on external legal websites.

D. Judgment Reader
- Three-pane desktop interface.
- Left: judgment outline and navigation.
- Center: original judgment text.
- Right: AI copilot.
- Mobile drawers or tabs.
- Paragraph navigation.
- Search within judgment.
- Text highlighting.
- Font-size controls.
- Reading progress.
- Original PDF link.
- Print-friendly view.

E. Structured Judgment Analysis
- Facts.
- Procedural history.
- Legal issues.
- Petitioner/appellant arguments.
- Respondent arguments.
- Applicable statutes.
- Court reasoning.
- Ratio decidendi where identifiable.
- Final order.
- Relief granted or refused.
- Cited cases.

When a section cannot be reliably identified, mark it unclassified rather than inventing it.

F. AI Legal Assistant
- One-minute summary.
- Detailed explanation.
- FILAC analysis.
- Ask this judgment.
- Explain a selected paragraph.
- Explain a legal provision in context.
- Identify key legal issues.
- Explain the final order.
- Extract cited authorities.
- Compare selected judgments.

G. Research Workspace
- Save judgments.
- Local research folders.
- Personal notes.
- Export Markdown.
- Print to PDF.
- Save selected external research links.

No authentication is required for the first version.

H. Dataset Status
- Courts included.
- Years covered.
- Number of indexed documents.
- Last successful data build.
- Data extraction limitations.
- Original source attribution.

### 6. Data ingestion layer

Read the actual AWS S3 dataset schema before coding.

Do not assume column names from previous prompts.

Start with 100 real judgments/orders.

Preferred pilot court: Madras High Court.

Use the official court code mapping from the source repository.

Implement:

1. Anonymous S3 metadata access.
2. Parquet schema discovery.
3. Metadata normalization.
4. TAR index resolution.
5. Selected PDF extraction.
6. PyMuPDF text extraction.
7. OCR fallback where necessary.
8. Page and paragraph mapping.
9. Duplicate detection.
10. Document classification.
11. Statute extraction.
12. Citation extraction.
13. Search document generation.
14. JSON shard generation.
15. Manifest generation.
16. Schema validation.
17. Build reporting.

Keep the pipeline restartable and idempotent.

Do not download the entire national dataset.

Do not commit large PDF collections to Git.

### 7. Canonical data model

Define schemas for:

Court
Bench
Case
Judgment
Document
Page
Paragraph
Section
StatuteReference
CaseCitation
SearchRecord
SearchShard
CorpusManifest
AIAnswer
AIClaim
DataBuildRun

Distinguish CNR from individual judgment/order identity.

Preserve:
- Original source URL.
- Court identifier.
- Decision date.
- Document identifier.
- Source file hash.
- Page number.
- Original paragraph number.
- Extraction method.
- Confidence or quality indicators.
- Ingestion timestamp.

Generate JSON Schema definitions and validate published artifacts.

### 8. Search architecture

Start with client-side keyword/BM25 search.

Use a Web Worker for indexing and querying.

Partition the data by court and year.

Lazy-load only the necessary shards.

Implement:
- Query normalization.
- Exact case number matching.
- Party-name matching.
- Keyword search.
- Field weighting.
- Faceted filtering.
- Pagination.
- Search highlighting.
- Shareable search URLs.
- Empty and error states.

Benchmark Orama and MiniSearch before choosing.

Record:
- Index size.
- Load time.
- Query latency.
- Browser memory.
- Search relevance.

Do not implement semantic search before keyword search passes its acceptance tests.

### 9. Semantic retrieval

After the keyword search works:

- Select a pinned embedding model.
- Build embeddings offline.
- Store vector files separately from text indexes.
- Use the identical model/tokenizer for query encoding.
- Store model and tokenizer versions in the manifest.
- Reject incompatible vector files.
- Run query encoding in a Web Worker.
- Implement hybrid ranking.
- Measure Recall@10 and MRR@10.
- Document browser download and memory costs.

Semantic search is an enhancement, not a prerequisite for basic judgment search.

### 10. AI architecture

Implement two AI modes.

Mode 1: Demo AI
- No API key required.
- Pre-generated answers for selected genuine judgments.
- Clearly label answers as pre-generated.
- Every answer must pass evidence validation.
- Support summaries, FILAC and fixed example questions.

Mode 2: Live AI
- User supplies their own API key.
- Support providers only after browser CORS testing.
- Keep keys in memory by default.
- Provide optional session storage.
- Never bundle provider secrets.
- Show provider limitations and errors.
- If direct browser access is unsupported, mark that provider unavailable rather than pretending it works.

Optional later:
A small hosted FastAPI proxy for server-managed inference.

### 11. Grounded AI response contract

The AI must answer from retrieved judgment paragraphs.

Required structured response:

{
  "answer": "string",
  "claims": [
    {
      "text": "string",
      "judgment_id": "string",
      "paragraph_numbers": [1],
      "supporting_quote": "string"
    }
  ],
  "abstained": false,
  "limitations": []
}

Implement an evidence verifier that:
- Confirms referenced judgment IDs exist.
- Confirms paragraph references exist.
- Confirms supporting quotes match source text after controlled normalization.
- Rejects unsupported references.
- Marks failed claims unverified.
- Returns insufficient evidence when no usable support exists.

Important:
A matching quote proves source linkage, not that the legal interpretation is correct. Keep interpretation validation separate.

Treat judgment text as untrusted data, not instructions to the AI.

### 12. Legal research correctness

Do not fabricate:
- Case citations.
- Legal provisions.
- Court findings.
- Judge names.
- Paragraph references.
- Judgment outcomes.
- Precedent status.

Distinguish:
- Original judgment text.
- Extractive summary.
- AI-generated explanation.
- Derived metadata.
- Verified metadata.

Do not automatically classify cited cases as followed, distinguished or overruled.

Statutory mappings such as IPC to BNS and CrPC to BNSS must come from verified mapping tables.

If mapping data is unavailable, show "Mapping unavailable."

### 13. User interface

Design a clean, professional legal research application.

Use:
- Light background by default.
- Compact header.
- Left-side search filters.
- Readable result cards.
- Strong typography for judgments.
- Clear distinction between original and AI text.
- Minimal wasted space.
- Responsive desktop, tablet and mobile layouts.
- Consistent loading, empty, error and offline states.

Suggested layout:

Desktop:
Left navigation | Judgment text | AI copilot

Mobile:
Judgment text with collapsible outline and AI panel.

Do not fill the interface with unrelated dashboards, decorative statistics or excessive cards.

### 14. External legal search links

Implement a separate Multi-Source Web Links mode.

Use verified URL patterns for:
- Official eCourts resources.
- High Court websites.
- Indian Kanoon search.
- Relevant legal research websites.

Do not scrape Indian Kanoon.

Do not claim that a generated link represents a confirmed search result.

Validate URL patterns and record verification dates.

### 15. Hosting and artifact management

Use GitHub Actions to generate static data artifacts.

Publish the frontend through GitHub Pages.

Support:
- Configurable base path.
- Configurable data host.
- Same-origin static data by default.
- Optional external object storage later.
- Manifest versioning.
- Artifact checksums.
- Build size budgets.
- Cache invalidation.
- Deployment rollback instructions.

Validate actual Pages artifact and bandwidth constraints instead of relying on assumed limits.

Keep the application portable to other static hosting providers.

### 16. Testing strategy

Backend/data tests:
- Schema validation.
- Ingestion.
- Duplicate handling.
- PDF extraction.
- Paragraph mapping.
- Citation extraction.
- Classification.
- Manifest generation.

Frontend tests:
- Search.
- Filters.
- Routing.
- Reader.
- AI panel.
- Mobile navigation.
- Local storage.
- Export.

AI tests:
- Valid citation.
- Invalid citation.
- Fabricated quote.
- Wrong paragraph.
- Unsupported question.
- Prompt injection.
- Partial extraction.
- Very long judgment.

Integration tests:
- Manifest to search.
- Search to reader.
- Reader to AI.
- AI answer to source paragraph.
- GitHub Actions to deployed website.

Performance tests:
- Search latency.
- Shard download size.
- Browser memory.
- Long-document rendering.
- Mobile responsiveness.

Create a single npm run verify command that runs the relevant validation suite.

### 17. Basic public-demo safeguards

Do not overengineer security.

Mandatory:
- Never expose shared API secrets.
- Escape untrusted judgment text.
- Show dataset attribution.
- Do not publish synthetic judgments as real.
- Allow removal of problematic public documents.
- Display AI limitations.
- Avoid uncontrolled paid API usage.

Optional later:
- Authentication.
- RBAC.
- Enterprise audit logging.
- Advanced monitoring.
- Paid subscription infrastructure.
- Multi-tenant isolation.

### 18. Documentation deliverables

Create or update:

docs/PRD.md
docs/PRD_RECONCILIATION.md
docs/ARCHITECTURE.md
docs/DECISIONS.md
docs/SCHEMA.md
docs/UX_SPEC.md
docs/DATA_SOURCES_AND_LICENSING.md
docs/DATA_PIPELINE.md
docs/SEARCH_DESIGN.md
docs/AI_GROUNDING_SPEC.md
docs/TEST_STRATEGY.md
docs/DEPLOYMENT.md
docs/RUNBOOK.md
docs/PHASES.md
docs/KNOWN_LIMITATIONS.md

Update the root README with actual setup, build and deployment commands.

### 19. Execution phases

Phase 0: Audit, reconciliation and architecture.

Phase 1: Frontend skeleton and deployment.

Phase 2: Real dataset spike.

Phase 3: Offline ingestion pipeline.

Phase 4: Keyword search.

Phase 5: Real search UI integration.

Phase 6: Judgment reader.

Phase 7: Semantic search.

Phase 8: AI assistant and demo mode.

Phase 9: Research folders and export.

Phase 10: QA and public release.

Phase 11: Incremental refresh and operations.

Phase 12: Optional enhancements.

Implement one phase at a time.

Do not silently skip requirements. Maintain a traceability matrix connecting requirements, phases, code modules and tests.

### 20. Agent working protocol

Before implementation:
1. Inspect the existing project.
2. Report what is already implemented.
3. Identify missing features.
4. Create an implementation plan.
5. Identify framework and architecture conflicts.
6. Ask for approval on unresolved major decisions.

During implementation:
1. Work within the approved phase.
2. Preserve existing working functionality.
3. Use real data where required.
4. Add appropriate tests.
5. Run tests.
6. Fix failures.
7. Record architectural changes.
8. Commit completed work with meaningful messages.

Do not claim tests passed without running them.

Ask before:
- Force pushing.
- Deleting significant files.
- Changing the frontend framework.
- Purchasing cloud resources.
- Making paid AI calls.
- Modifying repository secrets or settings.
- Expanding the corpus beyond the approved budget.

### 21. Progress reporting

After each phase, report:

- Phase objective.
- Requirements implemented.
- Files created or modified.
- Tests executed and results.
- Real dataset records processed.
- Deployment status.
- Known defects.
- Deferred requirements.
- Next recommended phase.

Provide evidence such as command outputs, workflow URLs and screenshots where available.

### 22. Final acceptance criteria

The public application must:

1. Load successfully from GitHub Pages.
2. Display genuine Indian High Court judgment records.
3. Search by case, party and keyword.
4. Filter available court metadata.
5. Open and read original judgment text.
6. Link to original source documents.
7. Navigate to relevant paragraphs.
8. Show structured judgment analysis.
9. Generate or display evidence-backed summaries.
10. Provide FILAC analysis.
11. Support judgment-specific AI questions.
12. Validate source references.
13. Handle unavailable evidence.
14. Work on mobile and desktop.
15. Operate in demo mode without an API key.
16. Support optional live AI where technically feasible.
17. Run the documented test suite.
18. Build and deploy through GitHub Actions.
19. Show actual corpus coverage and update status.
20. Include complete setup and architecture documentation.

### 23. Start now

Begin with Phase 0 only.

Inspect the existing repository and both PRD documents.

Produce:
- Current-state assessment.
- Requirement reconciliation.
- Final architecture proposal.
- Confirmed technology stack.
- Dependency list.
- Phase-by-phase implementation backlog.
- Acceptance criteria.
- Risks and unresolved decisions.

Do not begin application scaffolding until Phase 0 has been reviewed and approved.