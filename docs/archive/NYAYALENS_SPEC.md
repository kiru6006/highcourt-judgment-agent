# ARCHIVE: NyayaLens External Integration Specification (Historical Provenance)

> [!NOTE]
> **Provenance & Supersession Notice:**  
> This specification has been harvested and integrated into NyayaReader v1.2.0 as Milestone M5 (`web/src/utils/web-links.ts` and `WebLinksModal.tsx`).
>
> **Scope Cuts & Deferrals for v1.2.0:**
> 1. **Zero Runtime Scraping:** Dynamic browser puppeteering, live CAPTCHA solvers, and runtime backend web scraping were strictly cut.
> 2. **Deterministic URL Construction Only:** Link generation is 100% deterministic and client-side, respecting judicial bot safeguards and terms of service.
> 3. **Mandatory Disclaimer:** All links carry an explicit statutory notice: `"may require CAPTCHA / manual entry"`.
> 4. **Zero Guessing Invariant:** Links with insufficient parameters (e.g., missing year or case number) omit the respective link rather than hallucinating search query params.

---

## Historical Specification Overview
The original NyayaLens proposal outlined a federated search bridge connecting local static judgments with live external judicial portals:
1. **eCourts HC Services**: Deep search by Case Type, Number, and Year.
2. **eCourts Judgments**: CNR-based order sheet retrieval.
3. **High Court Official Portals**: Cause list and certified copy tracking.
4. **Indian Kanoon**: Secondary full-text web search backup.

All deterministic link building algorithms have been harvested into `web/src/utils/web-links.ts:buildPortalLinks()`.
