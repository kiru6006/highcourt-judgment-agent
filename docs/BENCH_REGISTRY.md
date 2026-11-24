# Official High Court Bench Registry (v1.3.0)

**Date:** 2026-11-24  
**Scope:** Canonical registry of all Principal Seats, Permanent Benches, and Circuit Benches across Indian High Courts.

---

## 1. Bench Registry Invariants

1. **Exact Official Nomenclature:** Benches are listed by their formal registry names (e.g. `Principal Seat at Chennai`, `Madurai Bench`, `Dharwad Bench`). Generic placeholders like "Bench 1" or "Other Bench" are strictly prohibited.
2. **Dependent Facet Rule:** In the search interface, selecting a High Court automatically filters the available bench choices to only valid seats for that specific court.
3. **No Guessing from Party Addresses:** Bench identity must derive strictly from official registry metadata or judgment title headers. Never infer a bench solely from a litigant's district.

---

## 2. Comprehensive Benches Directory

### 01. Allahabad High Court (`13_1`)
- **Principal Seat at Prayagraj**: `allahabad_principal` (City: Prayagraj, UP)
- **Lucknow Bench**: `allahabad_lucknow` (City: Lucknow, UP)

### 02. Andhra Pradesh High Court (`2_1`)
- **Principal Seat at Amaravati**: `ap_amaravati` (City: Amaravati, AP)

### 03. Bombay High Court (`1_1`)
- **Principal Seat at Mumbai**: `bombay_principal` (City: Mumbai, Maharashtra)
- **Nagpur Bench**: `bombay_nagpur` (City: Nagpur, Maharashtra)
- **Aurangabad Bench**: `bombay_aurangabad` (City: Chhatrapati Sambhajinagar, Maharashtra)
- **Panaji Bench**: `bombay_panaji` (City: Panaji, Goa)

### 04. Calcutta High Court (`19_16`)
- **Principal Seat at Kolkata**: `calcutta_principal` (City: Kolkata, West Bengal)
- **Circuit Bench at Port Blair**: `calcutta_port_blair` (City: Port Blair, A&N Islands)
- **Circuit Bench at Jalpaiguri**: `calcutta_jalpaiguri` (City: Jalpaiguri, West Bengal)

### 05. Chhattisgarh High Court (`18_1`)
- **Principal Seat at Bilaspur**: `cg_bilaspur` (City: Bilaspur, Chhattisgarh)

### 06. Delhi High Court (`7_26`)
- **Principal Seat at New Delhi**: `delhi_principal` (City: New Delhi, NCT of Delhi)

### 07. Gauhati High Court (`6_1`)
- **Principal Seat at Guwahati**: `gauhati_principal` (City: Guwahati, Assam)
- **Kohima Bench**: `gauhati_kohima` (City: Kohima, Nagaland)
- **Aizawl Bench**: `gauhati_aizawl` (City: Aizawl, Mizoram)
- **Itanagar Bench**: `gauhati_itanagar` (City: Itanagar, Arunachal Pradesh)

### 08. Gujarat High Court (`24_1`)
- **Principal Seat at Ahmedabad**: `gujarat_ahmedabad` (City: Ahmedabad, Gujarat)

### 09. Himachal Pradesh High Court (`5_1`)
- **Principal Seat at Shimla**: `hp_shimla` (City: Shimla, Himachal Pradesh)

### 10. Jammu & Kashmir and Ladakh High Court (`12_1`)
- **Srinagar Wing**: `jk_srinagar` (City: Srinagar, J&K)
- **Jammu Wing**: `jk_jammu` (City: Jammu, J&K)

### 11. Jharkhand High Court (`20_1`)
- **Principal Seat at Ranchi**: `jharkhand_ranchi` (City: Ranchi, Jharkhand)

### 12. Karnataka High Court (`29_3`)
- **Principal Bench at Bengaluru**: `kar_bengaluru` (City: Bengaluru, Karnataka)
- **Dharwad Bench**: `kar_dharwad` (City: Dharwad, Karnataka)
- **Kalaburagi (Gulbarga) Bench**: `kar_kalaburagi` (City: Kalaburagi, Karnataka)

### 13. Kerala High Court (`32_1`)
- **Principal Seat at Ernakulam**: `kerala_ernakulam` (City: Kochi, Kerala)

### 14. Madhya Pradesh High Court (`23_1`)
- **Principal Seat at Jabalpur**: `mp_jabalpur` (City: Jabalpur, Madhya Pradesh)
- **Gwalior Bench**: `mp_gwaliar` (City: Gwalior, Madhya Pradesh)
- **Indore Bench**: `mp_indore` (City: Indore, Madhya Pradesh)

### 15. Madras High Court (`33_10`)
- **Principal Seat at Chennai**: `hc_cis_mas` (City: Chennai, Tamil Nadu)
- **Madurai Bench**: `mdubench` (City: Madurai, Tamil Nadu)

### 16. Manipur High Court (`25_1`)
- **Principal Seat at Imphal**: `manipur_imphal` (City: Imphal, Manipur)

### 17. Meghalaya High Court (`21_1`)
- **Principal Seat at Shillong**: `meghalaya_shillong` (City: Shillong, Meghalaya)

### 18. Orissa High Court (`11_1`)
- **Principal Seat at Cuttack**: `orissa_cuttack` (City: Cuttack, Odisha)

### 19. Patna High Court (`8_1`)
- **Principal Seat at Patna**: `patna_principal` (City: Patna, Bihar)

### 20. Punjab and Haryana High Court (`4_1`)
- **Principal Seat at Chandigarh**: `ph_chandigarh` (City: Chandigarh, Punjab/Haryana)

### 21. Rajasthan High Court (`14_1`)
- **Principal Seat at Jodhpur**: `raj_jodhpur` (City: Jodhpur, Rajasthan)
- **Jaipur Bench**: `raj_jaipur` (City: Jaipur, Rajasthan)

### 22. Sikkim High Court (`28_1`)
- **Principal Seat at Gangtok**: `sikkim_gangtok` (City: Gangtok, Sikkim)

### 23. Telangana High Court (`36_1`)
- **Principal Seat at Hyderabad**: `telangana_hyderabad` (City: Hyderabad, Telangana)

### 24. Tripura High Court (`16_1`)
- **Principal Seat at Agartala**: `tripura_agartala` (City: Agartala, Tripura)

### 25. Uttarakhand High Court (`35_1`)
- **Principal Seat at Nainital**: `uk_nainital` (City: Nainital, Uttarakhand)

---

## 3. Implementation References
- TypeScript: `shared/court-codes/all_courts.ts:getBenchesForCourt(courtCode)`
- UI Integration: `web/src/components/LeftRailFacets.tsx` (Dependent Bench Dropdown)
