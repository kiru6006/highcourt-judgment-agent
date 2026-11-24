# Nyaya AI Reader — User Experience & Interface Specification

## 1. Design Philosophy & Visual Tokens
Nyaya AI Reader provides an institutional, high-contrast, distraction-free environment optimized for long hours of legal reading, precedent discovery, and court preparation by advocates, judicial law clerks, and judges.

### 1.1 Institutional Legal Palette
- **Judicial Navy (Header & Brand)**: `#0C1E3C` (Oxford Blue) — Authoritative, stable, and institutional header canvas.
- **Parchment Canvas**: `#FAF9F6` — Soft legal paper canvas minimizing screen glare and eye strain during continuous reading.
- **Deep Ink (Primary Typography)**: `#111827` (Gray-900) — High-legibility text providing $\ge 12.6:1$ contrast against parchment (surpassing WCAG AAA).
- **Secondary Ink (Metadata & Captions)**: `#475569` (Slate-600) — Court dates, bench numbers, and coram info with $5.8:1$ contrast (strictly avoiding low-contrast `slate-400`).
- **Trust Brass (Accents & Citations)**: `#92400E` (Amber-800) — Citation tags, active keyboard shortcuts, and `¶` paragraph badges.
- **Border Crisp**: `#E2E8F0` (Slate-200) — Restrained dividers preventing cognitive overload.

### 1.2 Outcome Status Accent Strips
Result cards use vertical 4px left accent strips for instant visual scanning:
- **Allowed / Relief Granted**: `#059669` (Emerald-600)
- **Dismissed / Rejected**: `#DC2626` (Red-600)
- **Disposed / Transferred / Settled**: `#D97706` (Amber-600)

### 1.3 Dual Typography Architecture
- **Judicial Text (`EB Garamond`)**: Used for judgment body text, operative orders, ratio decidendi quotes, and party titles. Formatted with `leading-relaxed` (1.75 line-height) and constrained to a strict **72ch reading measure** ($\sim 65\text{--}75$ characters per line) for optimal saccadic eye tracking.
- **Interface & Controls (`Inter`)**: Used for headers, facet labels, search inputs, metadata pills, keyboard shortcuts, and buttons. Clean, legible sans-serif with high tabular numeric clarity.

### 1.4 Advocate Productivity Controls
- **Advocate Quick Presets**: 1-click filter bar atop search rail ("Bail Matters", "Sec 482 Quash", "Commercial", "Division Bench").
- **1-Click Paragraph Citation Copying**: Hovering or focusing on any `¶ N` paragraph badge reveals a copy button that places formal citation text (e.g. `[2023] HCMA 1234, ¶ 14`) directly into clipboard.
- **Permanently Visible Category Facet**: Subject Category is unconditionally visible to ensure instant matter-type triage across all shard load states.
- **Accessible Focus Indicators**: Explicit `ring-2 ring-amber-600 ring-offset-2` outline rings on all interactive elements for full keyboard accessibility (`Tab` / `Shift+Tab`).

### 1.5 Dark Mode Adaptation
- Follows system preference by default; user toggle persisted in local storage.
- Canvas: `#0F172A` (Slate-900).
- Surface: `#1E293B` (Slate-800).
- Ink Primary: `#F1F5F9` (Slate-100).
- Ink Secondary: `#CBD5E1` (Slate-300).
- Accent: `#F59E0B` (Amber-500).

---

## 2. Layouts & Responsive Breakpoints

### 2.1 Global Top Bar
- **Brand Title**: "Nyaya AI Reader" (config constant) with subtitle "Indian High Court Judgments".
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
    - Virtual-scrolled results list using `@tanstack/react-virtual`.
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
