# NyayaReader — User Experience & Interface Specification

## 1. Design Philosophy & Visual Tokens
NyayaReader provides an uncluttered, high-contrast, distraction-free environment optimized for long hours of legal reading, precedent discovery, and court preparation.

### 1.1 Color Palette
- **Paper Canvas**: `#F8FAFC` (Slate-50) — Soft off-white to eliminate glare.
- **Card / Surface Background**: `#FFFFFF` (Pure White).
- **Ink Primary**: `#0F172A` (Slate-900) — High-legibility body contrast (WCAG AAA).
- **Ink Secondary**: `#475569` (Slate-600) — Metadata, court dates, paragraph labels.
- **Border Subtle**: `#E2E8F0` (Slate-200) — Clean structural dividers without visual noise.
- **Accent Amber**: `#B45309` (Amber-700) — Citation chips, paragraph highlights, active states.
- **Verified Green**: `#047857` (Emerald-700) — Verbatim quote badges, verified evidence markers.
- **Derived Blue**: `#2563EB` (Blue-600) — Derived metadata badges, external web links.
- **Warning Coral**: `#DC2626` (Red-600) — Unverified claims, takedown notices, errors.

### 1.2 Dark Mode Adaptation
- Follows system preference by default; user toggle persisted in local storage.
- Canvas: `#0F172A` (Slate-900).
- Surface: `#1E293B` (Slate-800).
- Ink Primary: `#F1F5F9` (Slate-100).
- Ink Secondary: `#94A3B8` (Slate-400).
- Accent: `#F59E0B` (Amber-500).

---

## 2. Layouts & Responsive Breakpoints

### 2.1 Global Top Bar
- **Brand Title**: "NyayaReader" (config constant) with subtitle "Indian High Court Judgments".
- **Unified Search Bar**:
  - Placeholder: "Search party, case number, section (e.g. 482 CrPC), or issue..."
  - Clear button (`×`), keyboard shortcut indicator (`/` or `Cmd+K`).
- **Mode Toggle Switch**:
  - `[ Indexed Corpus + AI Reader ]` vs `[ Multi-Source Web Links ]`.
- **Top Actions**:
  - Research Folders shortcut, Settings (API key & theme), Dataset status link (`/about-data`).

### 2.2 Global Search View (`/search`)
- **Desktop (1440px+)**:
  - **Left Rail (320px fixed)**:
    - High Court selector (Multi-select pill chips).
    - Bench selector (Geographic bench + Single Judge / Division Bench).
    - Year slider / checkboxes (2014 – 2024).
    - Category (Criminal, Civil, Writ, Commercial, Tax, Service, Matrimonial).
    - Dynamic Case Type prefixes (e.g., `CRL.P`, `WP`, `WA`, `MFA`).
    - Purpose / Stage / Disposal status.
    - Active Filter Summary Bar with "Clear All" chip and total match count.
  - **Main Content Area (Fluid)**:
    - Result count and active sort toggle (Relevance / Date Descending / Date Ascending).
    - Virtual-scrolled results list using `@angular/cdk/scrolling`.
    - Result Card Component:
      - Title: Party names formatted with bold typography.
      - Meta header: Court name, Bench, Date, Coram, Disposal status.
      - Case number pill + CNR pill.
      - Relevant statutory provisions as clickable filter badges.
      - Direct action buttons: `Read Judgment`, `Source PDF`, `Find on Web / eCourts`.
- **Mobile (375px)**:
  - Left rail collapses into slide-over drawer triggered by "Filter (N)" sticky floating button.
  - Result cards stack metadata vertically with touch-friendly tap targets ($\ge 44\times 44\text{ px}$).

### 2.3 3-Pane Judgment Reader (`/case/:id`)
- **Left Pane (Outline & Navigation — 280px)**:
  - Sections tree with scroll-spy highlighting:
    - Facts
    - Procedural History
    - Issues Framed
    - Petitioner Submissions
    - Respondent Submissions
    - Court's Analysis & Ratio
    - Final Operative Order
  - Fallback: If sections are unclassified ("Untagged"), displays a clean paragraph jump list.
- **Center Pane (Judgment Text — Fluid, max 75ch reading width)**:
  - Reader header: Full formal title, Bench, Judges, Date, Source PDF link.
  - View toggle: `[ Original Full Text ]` | `[ Structured Extractive Brief ]`.
  - Paragraph items:
    - Prominent anchor chip: `#para-14` (clicking copies direct anchor URL).
    - High-contrast, serif/sans typography toggle, font size stepper ($14\text{px}$ to $22\text{px}$).
    - Statute chips embedded inline above citing sentences.
    - Amber flash highlight when navigated via citation jump.
- **Right Pane (AI Legal Copilot — 360px)**:
  - Header with AI mode indicator (`Demo Mode` or `BYOK Active`).
  - Preset action chips:
    - `Summarize Ratio`
    - `Extract Cited Cases`
    - `Map to BNS / BNSS / BSA`
    - `Operative Order Breakdown`
  - Chat input box for specific judgment queries.
  - Grounded Claim cards with green "Verified (Para X)" chips that scroll the center pane to exact text.
- **Mobile Behavior (375px)**:
  - Full-screen center text pane.
  - Outline accessible via bottom left floating sheet toggle.
  - AI Copilot accessible via bottom right floating action button.

---

## 3. UI State Transitions & Empty/Error States
- **Loading State**: Subtle animated skeleton loaders matching exact card and paragraph heights; zero layout shift (CLS $\le 0.05$).
- **Empty Search**: Friendly icon, suggested legal search queries (e.g., "Section 482 quashing FIR delay", "Bail principles PMLA").
- **Offline Mode**: Offline banner notification ("Browsing cached data. Offline mode active."); cached judgments and folders remain 100% accessible.
- **Error State**: Explicit error box with retry button and clear explanation (e.g. shard download timeout or provider API quota error).
- **Mandatory Footer (All Views)**:
  > *"Data: Indian High Court Judgments, CC-BY-4.0, source eCourts. Not legal advice. Verify against the certified copy."*
