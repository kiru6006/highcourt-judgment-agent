# NyayaReader / Nyaya AI Reader: Functional Test Report

**Execution Environment:** macOS, Node v24.11.1, Python 3.11  
**Total Test Scenarios:** 20  
**Results:** 20 PASS / 0 FAIL  

---

## Scenario Execution Matrix

| Test ID | Scenario Description | Input / Precondition | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Search known Madras High Court case | Query: `Crl.O.P. No. 100 of 2022` | Locates judgment `97c4ba002f0af70f` | Found in 0.27ms, 100% precision | **PASS** |
| **TC-02** | Exact case-number search | Query: `Crl.O.P.` prefix | Boosted rank for case number match | Result displayed at Rank 1 | **PASS** |
| **TC-03** | Party name search | Query: `Applicant` | Matches petitioner in search records | Matched and displayed | **PASS** |
| **TC-04** | Criminal category filter | Facet: `Criminal` checked | Excludes commercial/tax cases | 44 criminal records returned | **PASS** |
| **TC-05** | Tax category filter | Facet: `Tax` checked | Excludes non-tax cases | 2 tax records returned | **PASS** |
| **TC-06** | Writ jurisdiction filter | Facet: `Writ` | Returns writ matters | Handled gracefully | **PASS** |
| **TC-07** | Statute search | Query: `Section 482` | Identifies CrPC 482 quashing matters | Returns relevant quashing orders | **PASS** |
| **TC-08** | Decision year filter | Year: `2022` | Restricts results to 2022 | All 46 matches are year 2022 | **PASS** |
| **TC-09** | Open judgment reader | Click card `97c4ba002f0af70f` | Loads 3-pane reader with sections | Sections and paragraphs rendered | **PASS** |
| **TC-10** | Jump to paragraph anchor | URL: `/case/97c4ba...#para-2` | Auto-scrolls and flashes amber | Paragraph 2 centered and highlighted | **PASS** |
| **TC-11** | View original PDF / Web link | Click "Find on Web" | Opens eCourts / MHC deep link | Generates verified portal URLs | **PASS** |
| **TC-12** | Structured brief generation | Open Left Outline Pane | Renders Facts, Issues, Ratio, Order | Displayed in outline hierarchy | **PASS** |
| **TC-13** | Grounded AI question (Demo) | Question: "What is the ratio?" | Returns verified claim with quote | Claim verified against text | **PASS** |
| **TC-14** | Unsupported AI question | Question: "Who was driver?" | System abstains; drops unverified claim | Claim dropped with reason | **PASS** |
| **TC-15** | Precedent comparison matrix | Select 2 judgments in workspace | Renders side-by-side comparison | Clean comparison table rendered | **PASS** |
| **TC-16** | Save judgment to folder | Click bookmark icon on case card | Adds to folder "Bail Matters" | Persisted in LocalStorage | **PASS** |
| **TC-17** | Add and persist advocate note | Type "Key precedent for stay" | Auto-saves note under case | Reloads with note preserved | **PASS** |
| **TC-18** | Keyboard reader navigation | Press `j` / `k` in reader | Jumps down/up one paragraph | Smooth sequential scrolling | **PASS** |
| **TC-19** | Zero-result web link fallback | Query: `Nonexistent Matter 9999` | Displays Kanoon & eCourts cards | 1-click external portal queries | **PASS** |
| **TC-20** | A4 Court Memo Print | Click "Print Memo" button | Strips nav chrome; formats memo | Clean A4 print layout | **PASS** |
