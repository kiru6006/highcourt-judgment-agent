"""
Nyaya AI Reader v1.3.0 — Python Mirror of 25 High Courts Registry
Source of truth for offline ingestion, anomaly detection, and classification.
"""

from typing import Dict, List, Optional, Any

ALL_25_HIGH_COURTS = [
    {
        "court_id": "allahabad",
        "court_name": "Allahabad High Court",
        "court_code": "13_1",
        "principal_seat": "Principal Bench at Prayagraj (Allahabad)",
        "benches": [
            {"bench_code": "allahabad_principal", "bench_name": "Principal Bench at Prayagraj"},
            {"bench_code": "allahabad_lucknow", "bench_name": "Lucknow Bench"}
        ],
        "states": ["Uttar Pradesh"],
        "official_website": "https://www.allahabadhighcourt.in"
    },
    {
        "court_id": "andhra_pradesh",
        "court_name": "Andhra Pradesh High Court",
        "court_code": "2_1",
        "principal_seat": "Principal Seat at Amaravati",
        "benches": [
            {"bench_code": "ap_amaravati", "bench_name": "Principal Seat at Amaravati"}
        ],
        "states": ["Andhra Pradesh"],
        "official_website": "https://aphc.gov.in"
    },
    {
        "court_id": "bombay",
        "court_name": "Bombay High Court",
        "court_code": "1_1",
        "principal_seat": "Principal Seat at Mumbai",
        "benches": [
            {"bench_code": "bombay_principal", "bench_name": "Principal Seat at Mumbai"},
            {"bench_code": "bombay_nagpur", "bench_name": "Nagpur Bench"},
            {"bench_code": "bombay_aurangabad", "bench_name": "Aurangabad Bench (Chhatrapati Sambhajinagar)"},
            {"bench_code": "bombay_panaji", "bench_name": "Panaji Bench (Goa)"}
        ],
        "states": ["Maharashtra", "Goa", "Dadra and Nagar Haveli and Daman and Diu"],
        "official_website": "https://bombayhighcourt.nic.in"
    },
    {
        "court_id": "calcutta",
        "court_name": "Calcutta High Court",
        "court_code": "19_16",
        "principal_seat": "Principal Seat at Kolkata",
        "benches": [
            {"bench_code": "calcutta_principal", "bench_name": "Principal Seat at Kolkata"},
            {"bench_code": "calcutta_port_blair", "bench_name": "Circuit Bench at Port Blair"},
            {"bench_code": "calcutta_jalpaiguri", "bench_name": "Circuit Bench at Jalpaiguri"}
        ],
        "states": ["West Bengal", "Andaman and Nicobar Islands"],
        "official_website": "https://www.calcuttahighcourt.gov.in"
    },
    {
        "court_id": "chhattisgarh",
        "court_name": "Chhattisgarh High Court",
        "court_code": "18_1",
        "principal_seat": "Principal Seat at Bilaspur",
        "benches": [
            {"bench_code": "cg_bilaspur", "bench_name": "Principal Seat at Bilaspur"}
        ],
        "states": ["Chhattisgarh"],
        "official_website": "https://highcourt.cg.gov.in"
    },
    {
        "court_id": "delhi",
        "court_name": "Delhi High Court",
        "court_code": "7_26",
        "principal_seat": "Principal Seat at New Delhi",
        "benches": [
            {"bench_code": "delhi_principal", "bench_name": "Principal Seat at New Delhi"}
        ],
        "states": ["National Capital Territory of Delhi"],
        "official_website": "https://delhihighcourt.nic.in"
    },
    {
        "court_id": "gauhati",
        "court_name": "Gauhati High Court",
        "court_code": "6_1",
        "principal_seat": "Principal Seat at Guwahati",
        "benches": [
            {"bench_code": "gauhati_principal", "bench_name": "Principal Seat at Guwahati"},
            {"bench_code": "gauhati_kohima", "bench_name": "Kohima Bench"},
            {"bench_code": "gauhati_aizawl", "bench_name": "Aizawl Bench"},
            {"bench_code": "gauhati_itanagar", "bench_name": "Itanagar Bench"}
        ],
        "states": ["Assam", "Nagaland", "Mizoram", "Arunachal Pradesh"],
        "official_website": "https://ghconline.gov.in"
    },
    {
        "court_id": "gujarat",
        "court_name": "Gujarat High Court",
        "court_code": "24_1",
        "principal_seat": "Principal Seat at Ahmedabad",
        "benches": [
            {"bench_code": "gujarat_ahmedabad", "bench_name": "Principal Seat at Ahmedabad"}
        ],
        "states": ["Gujarat"],
        "official_website": "https://gujarathighcourt.nic.in"
    },
    {
        "court_id": "himachal_pradesh",
        "court_name": "Himachal Pradesh High Court",
        "court_code": "5_1",
        "principal_seat": "Principal Seat at Shimla",
        "benches": [
            {"bench_code": "hp_shimla", "bench_name": "Principal Seat at Shimla"}
        ],
        "states": ["Himachal Pradesh"],
        "official_website": "https://hphighcourt.nic.in"
    },
    {
        "court_id": "jk_ladakh",
        "court_name": "Jammu & Kashmir and Ladakh High Court",
        "court_code": "12_1",
        "principal_seat": "Srinagar Seat / Jammu Seat",
        "benches": [
            {"bench_code": "jk_srinagar", "bench_name": "Srinagar Wing"},
            {"bench_code": "jk_jammu", "bench_name": "Jammu Wing"}
        ],
        "states": ["Jammu and Kashmir", "Ladakh"],
        "official_website": "https://jkhighcourt.nic.in"
    },
    {
        "court_id": "jharkhand",
        "court_name": "Jharkhand High Court",
        "court_code": "20_1",
        "principal_seat": "Principal Seat at Ranchi",
        "benches": [
            {"bench_code": "jharkhand_ranchi", "bench_name": "Principal Seat at Ranchi"}
        ],
        "states": ["Jharkhand"],
        "official_website": "https://jharkhandhighcourt.nic.in"
    },
    {
        "court_id": "karnataka",
        "court_name": "Karnataka High Court",
        "court_code": "29_3",
        "principal_seat": "Principal Bench at Bengaluru",
        "benches": [
            {"bench_code": "kar_bengaluru", "bench_name": "Principal Bench at Bengaluru"},
            {"bench_code": "kar_dharwad", "bench_name": "Dharwad Bench"},
            {"bench_code": "kar_kalaburagi", "bench_name": "Kalaburagi (Gulbarga) Bench"}
        ],
        "states": ["Karnataka"],
        "official_website": "https://karnatakahihecourt.kar.nic.in"
    },
    {
        "court_id": "kerala",
        "court_name": "Kerala High Court",
        "court_code": "32_1",
        "principal_seat": "Principal Seat at Ernakulam (Kochi)",
        "benches": [
            {"bench_code": "kerala_ernakulam", "bench_name": "Principal Seat at Ernakulam"}
        ],
        "states": ["Kerala", "Lakshadweep"],
        "official_website": "https://hckerala.gov.in"
    },
    {
        "court_id": "madhya_pradesh",
        "court_name": "Madhya Pradesh High Court",
        "court_code": "23_1",
        "principal_seat": "Principal Seat at Jabalpur",
        "benches": [
            {"bench_code": "mp_jabalpur", "bench_name": "Principal Seat at Jabalpur"},
            {"bench_code": "mp_gwaliar", "bench_name": "Gwalior Bench"},
            {"bench_code": "mp_indore", "bench_name": "Indore Bench"}
        ],
        "states": ["Madhya Pradesh"],
        "official_website": "https://mphc.gov.in"
    },
    {
        "court_id": "madras",
        "court_name": "Madras High Court",
        "court_code": "33_10",
        "principal_seat": "Principal Seat at Chennai (Madras)",
        "benches": [
            {"bench_code": "hc_cis_mas", "bench_name": "Principal Seat at Chennai"},
            {"bench_code": "mdubench", "bench_name": "Madurai Bench"}
        ],
        "states": ["Tamil Nadu", "Puducherry"],
        "official_website": "https://www.hcmadras.tn.nic.in"
    },
    {
        "court_id": "manipur",
        "court_name": "Manipur High Court",
        "court_code": "25_1",
        "principal_seat": "Principal Seat at Imphal",
        "benches": [
            {"bench_code": "manipur_imphal", "bench_name": "Principal Seat at Imphal"}
        ],
        "states": ["Manipur"],
        "official_website": "https://hcmimphal.nic.in"
    },
    {
        "court_id": "meghalaya",
        "court_name": "Meghalaya High Court",
        "court_code": "21_1",
        "principal_seat": "Principal Seat at Shillong",
        "benches": [
            {"bench_code": "meghalaya_shillong", "bench_name": "Principal Seat at Shillong"}
        ],
        "states": ["Meghalaya"],
        "official_website": "https://meghalayahighcourt.nic.in"
    },
    {
        "court_id": "orissa",
        "court_name": "Orissa High Court",
        "court_code": "11_1",
        "principal_seat": "Principal Seat at Cuttack",
        "benches": [
            {"bench_code": "orissa_cuttack", "bench_name": "Principal Seat at Cuttack"}
        ],
        "states": ["Odisha"],
        "official_website": "https://orissahighcourt.nic.in"
    },
    {
        "court_id": "patna",
        "court_name": "Patna High Court",
        "court_code": "8_1",
        "principal_seat": "Principal Seat at Patna",
        "benches": [
            {"bench_code": "patna_principal", "bench_name": "Principal Seat at Patna"}
        ],
        "states": ["Bihar"],
        "official_website": "https://patnahighcourt.gov.in"
    },
    {
        "court_id": "punjab_haryana",
        "court_name": "Punjab and Haryana High Court",
        "court_code": "4_1",
        "principal_seat": "Principal Seat at Chandigarh",
        "benches": [
            {"bench_code": "ph_chandigarh", "bench_name": "Principal Seat at Chandigarh"}
        ],
        "states": ["Punjab", "Haryana", "Chandigarh"],
        "official_website": "https://highcourtchd.gov.in"
    },
    {
        "court_id": "rajasthan",
        "court_name": "Rajasthan High Court",
        "court_code": "14_1",
        "principal_seat": "Principal Seat at Jodhpur",
        "benches": [
            {"bench_code": "raj_jodhpur", "bench_name": "Principal Seat at Jodhpur"},
            {"bench_code": "raj_jaipur", "bench_name": "Jaipur Bench"}
        ],
        "states": ["Rajasthan"],
        "official_website": "https://hcraj.nic.in"
    },
    {
        "court_id": "sikkim",
        "court_name": "Sikkim High Court",
        "court_code": "28_1",
        "principal_seat": "Principal Seat at Gangtok",
        "benches": [
            {"bench_code": "sikkim_gangtok", "bench_name": "Principal Seat at Gangtok"}
        ],
        "states": ["Sikkim"],
        "official_website": "https://highcourtofsikkim.nic.in"
    },
    {
        "court_id": "telangana",
        "court_name": "Telangana High Court",
        "court_code": "36_1",
        "principal_seat": "Principal Seat at Hyderabad",
        "benches": [
            {"bench_code": "telangana_hyderabad", "bench_name": "Principal Seat at Hyderabad"}
        ],
        "states": ["Telangana"],
        "official_website": "https://tshc.gov.in"
    },
    {
        "court_id": "tripura",
        "court_name": "Tripura High Court",
        "court_code": "16_1",
        "principal_seat": "Principal Seat at Agartala",
        "benches": [
            {"bench_code": "tripura_agartala", "bench_name": "Principal Seat at Agartala"}
        ],
        "states": ["Tripura"],
        "official_website": "https://thc.nic.in"
    },
    {
        "court_id": "uttarakhand",
        "court_name": "Uttarakhand High Court",
        "court_code": "35_1",
        "principal_seat": "Principal Seat at Nainital",
        "benches": [
            {"bench_code": "uk_nainital", "bench_name": "Principal Seat at Nainital"}
        ],
        "states": ["Uttarakhand"],
        "official_website": "https://highcourtofuttarakhand.gov.in"
    }
]

def get_court_by_code(code: str) -> Optional[Dict[str, Any]]:
    norm = code.replace("~", "_")
    for c in ALL_25_HIGH_COURTS:
        if c["court_code"] == norm or c["court_id"] == norm:
            return c
    return None
