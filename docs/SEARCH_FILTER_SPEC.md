# Search Filters, Facet Coverage & Portal Link Specification (v1.2.0)

## 1. Overview
NyayaReader v1.2.0 establishes empirical coverage thresholds for left-rail search filters and deterministic integration with external judicial portals.

---

## 2. Left-Rail Filter Coverage & Ergonomics

### 2.1 The 5% Coverage Cutoff Rule & Category Invariant
To prevent cluttering the primary search workspace with low-signal or sparsely populated metadata facets:
- Any optional facet whose non-null corpus coverage is **$\ge 5.0\%$** is rendered prominently in the primary filter rail.
- Any optional facet whose non-null corpus coverage is **$< 5.0\%$** is automatically tucked behind a collapsible **"Advanced Filters (< 5% Coverage)"** disclosure toggle.
- **Permanent Category Invariant:** Subject Category (`category`) is **unconditionally visible** in the primary rail at all times regardless of shard coverage calculations, ensuring advocate workflows are never interrupted when loading distributed or partial shards.

### 2.2 Coverage Badge Invariant
Every filter group displays a live non-null coverage indicator (e.g. `[100%]` or `[42%]`), computed dynamically by `scripts/filter_coverage.py` and rendered by `web/src/components/LeftRailFacets.tsx`.

### 2.3 Advocate Quick-Action Presets
To accelerate daily high-frequency legal workflows, an Advocate Quick Presets bar is docked atop the left filter rail:
1. **Bail Matters**: Activates Criminal domain and bail filters.
2. **Sec 482 Quash**: Activates Criminal domain and Section 482 CrPC quashing petitions.
3. **Commercial**: Activates Commercial dispute domain.
4. **Division Bench**: Activates DB coram type.

### 2.4 Empirical Coverage Matrix (Pilot Corpus)
Generated programmatically in `docs/FILTER_COVERAGE_REPORT.md`:

| Filter Facet | Field | Non-Null Count | Total Docs | Coverage % | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High Court** | `court_code` | 50 | 50 | **100.0%** | Primary Rail |
| **Bench** | `bench_code` | 50 | 50 | **100.0%** | Primary Rail |
| **Year / Date** | `decision_date` | 50 | 50 | **100.0%** | Primary Rail |
| **Case Type** | `case_type` | 50 | 50 | **100.0%** | Primary Rail |
| **Legal Domain** | `category` | 50 | 50 | **100.0%** | Primary Rail |
| **Disposal Nature** | `disposal_nature` | 50 | 50 | **100.0%** | Primary Rail |
| **Coram Type** | `coram_type` | 50 | 50 | **100.0%** | Primary Rail |
| **Purpose / Stage** | `purpose_stage` | 42 | 50 | **84.0%** | Primary Rail |

---

## 3. External Portal Link Finder (Harvested from NyayaLens)

Implemented in `web/src/utils/web-links.ts:buildPortalLinks()` and exposed via `WebLinksModal.tsx`.

### 3.1 Supported Judicial Portals
1. **eCourts High Court Services (`eCourts_services`):**
   - Prefills High Court code, case type, case number, and year.
   - Example: `https://services.ecourts.gov.in/ecourtindiaHC/cases/case_no.php?court_code=33_10&case_type=CRL.OP&case_no=1234&case_year=2023`
2. **eCourts Judgments Portal (`eCourts_judgments`):**
   - Direct CNR query or full-text party search.
   - Example: `https://judgments.ecourts.gov.in/pdfsearch/?cnr=HCMA010012342023`
3. **High Court Official Portal (`highcourt_official`):**
   - Registry portal link resolved directly from `shared/court-codes/registry.ts`.
   - Example: `https://www.hcmadras.tn.nic.in/case_status.php`
4. **Indian Kanoon Search (`indian_kanoon`):**
   - Full-text fallback prefilled with party names, case number, and court name.
   - Example: `https://indiankanoon.org/search/?formInput=Applicant+A+vs+State+Crl.OP+1234%2F2023+Madras+High+Court`

### 3.2 Verification Invariants
- **Zero Hallucination:** If a parameter is missing (e.g. no CNR or missing year), the corresponding link is omitted with an explicit `omittedReason` explaining why.
- **Mandatory User Warning:** Every generated portal link carries `warningNotice: "may require CAPTCHA / manual entry"`.
- **Zero Runtime Backend:** Link construction is 100% deterministic, instant, and executes entirely in the user's browser.
