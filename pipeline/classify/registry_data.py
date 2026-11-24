"""
Nyaya AI Reader — Court Code Registry Data (Python Mirror of shared/court-codes/registry.ts)
Covers Madras, Karnataka, Kerala, Delhi, and Bombay High Courts with verified sources.
"""

from typing import Dict, Any, Optional

COURT_REGISTRY: Dict[str, Dict[str, Dict[str, Any]]] = {
    # Madras High Court (33_10)
    "33_10": {
        "WP": {
            "court": "33_10",
            "courtName": "Madras High Court",
            "code": "WP",
            "officialDescription": "Writ Petition",
            "normalizedType": "W.P.",
            "jurisdiction": "Writ",
            "domainId": "domain_constitutional",
            "domainLabel": "Constitutional Law",
            "sourceUrl": "https://www.hcmadras.tn.nic.in/case_status.php",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "WA": {
            "court": "33_10",
            "courtName": "Madras High Court",
            "code": "WA",
            "officialDescription": "Writ Appeal",
            "normalizedType": "W.A.",
            "jurisdiction": "Appellate",
            "domainId": "domain_constitutional",
            "domainLabel": "Constitutional Law",
            "sourceUrl": "https://www.hcmadras.tn.nic.in/case_status.php",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "CRL.OP": {
            "court": "33_10",
            "courtName": "Madras High Court",
            "code": "CRL.OP",
            "officialDescription": "Criminal Original Petition",
            "normalizedType": "Crl.O.P.",
            "jurisdiction": "Original",
            "domainId": "domain_criminal",
            "domainLabel": "Criminal Law",
            "sourceUrl": "https://www.hcmadras.tn.nic.in/case_status.php",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "CRL.RC": {
            "court": "33_10",
            "courtName": "Madras High Court",
            "code": "CRL.RC",
            "officialDescription": "Criminal Revision Case",
            "normalizedType": "Crl.R.C.",
            "jurisdiction": "Revisional",
            "domainId": "domain_criminal",
            "domainLabel": "Criminal Law",
            "sourceUrl": "https://www.hcmadras.tn.nic.in/case_status.php",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "CRL.A": {
            "court": "33_10",
            "courtName": "Madras High Court",
            "code": "CRL.A",
            "officialDescription": "Criminal Appeal",
            "normalizedType": "Crl.A.",
            "jurisdiction": "Appellate",
            "domainId": "domain_criminal",
            "domainLabel": "Criminal Law",
            "sourceUrl": "https://www.hcmadras.tn.nic.in/case_status.php",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "CMA": {
            "court": "33_10",
            "courtName": "Madras High Court",
            "code": "CMA",
            "officialDescription": "Civil Miscellaneous Appeal",
            "normalizedType": "C.M.A.",
            "jurisdiction": "Appellate",
            "domainId": "domain_civil_property",
            "domainLabel": "Civil & Property Law",
            "sourceUrl": "https://www.hcmadras.tn.nic.in/case_status.php",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "CRP": {
            "court": "33_10",
            "courtName": "Madras High Court",
            "code": "CRP",
            "officialDescription": "Civil Revision Petition",
            "normalizedType": "C.R.P.",
            "jurisdiction": "Revisional",
            "domainId": "domain_civil_property",
            "domainLabel": "Civil & Property Law",
            "sourceUrl": "https://www.hcmadras.tn.nic.in/case_status.php",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "CS": {
            "court": "33_10",
            "courtName": "Madras High Court",
            "code": "CS",
            "officialDescription": "Civil Suit (Original Side)",
            "normalizedType": "C.S.",
            "jurisdiction": "Original",
            "domainId": "domain_civil_property",
            "domainLabel": "Civil & Property Law",
            "sourceUrl": "https://www.hcmadras.tn.nic.in/case_status.php",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "ARB.OP": {
            "court": "33_10",
            "courtName": "Madras High Court",
            "code": "ARB.OP",
            "officialDescription": "Arbitration Original Petition",
            "normalizedType": "Arb.O.P.",
            "jurisdiction": "Original",
            "domainId": "domain_commercial_corporate",
            "domainLabel": "Commercial & Corporate",
            "sourceUrl": "https://www.hcmadras.tn.nic.in/case_status.php",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "TCA": {
            "court": "33_10",
            "courtName": "Madras High Court",
            "code": "TCA",
            "officialDescription": "Tax Case Appeal",
            "normalizedType": "T.C.A.",
            "jurisdiction": "Appellate",
            "domainId": "domain_tax_revenue",
            "domainLabel": "Taxation & Revenue",
            "sourceUrl": "https://www.hcmadras.tn.nic.in/case_status.php",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        }
    },
    # Karnataka High Court (29_3)
    "29_3": {
        "WP": {
            "court": "29_3",
            "courtName": "Karnataka High Court",
            "code": "WP",
            "officialDescription": "Writ Petition",
            "normalizedType": "W.P.",
            "jurisdiction": "Writ",
            "domainId": "domain_constitutional",
            "domainLabel": "Constitutional Law",
            "sourceUrl": "https://karnatakahi.courtrecords.gov.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "CRL.P": {
            "court": "29_3",
            "courtName": "Karnataka High Court",
            "code": "CRL.P",
            "officialDescription": "Criminal Petition",
            "normalizedType": "Crl.P.",
            "jurisdiction": "Original",
            "domainId": "domain_criminal",
            "domainLabel": "Criminal Law",
            "sourceUrl": "https://karnatakahi.courtrecords.gov.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "CRL.A": {
            "court": "29_3",
            "courtName": "Karnataka High Court",
            "code": "CRL.A",
            "officialDescription": "Criminal Appeal",
            "normalizedType": "Crl.A.",
            "jurisdiction": "Appellate",
            "domainId": "domain_criminal",
            "domainLabel": "Criminal Law",
            "sourceUrl": "https://karnatakahi.courtrecords.gov.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "RFA": {
            "court": "29_3",
            "courtName": "Karnataka High Court",
            "code": "RFA",
            "officialDescription": "Regular First Appeal",
            "normalizedType": "R.F.A.",
            "jurisdiction": "Appellate",
            "domainId": "domain_civil_property",
            "domainLabel": "Civil & Property Law",
            "sourceUrl": "https://karnatakahi.courtrecords.gov.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "MFA": {
            "court": "29_3",
            "courtName": "Karnataka High Court",
            "code": "MFA",
            "officialDescription": "Miscellaneous First Appeal",
            "normalizedType": "M.F.A.",
            "jurisdiction": "Appellate",
            "domainId": "domain_civil_property",
            "domainLabel": "Civil & Property Law",
            "sourceUrl": "https://karnatakahi.courtrecords.gov.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        }
    },
    # Kerala High Court (32_1)
    "32_1": {
        "WP(C)": {
            "court": "32_1",
            "courtName": "Kerala High Court",
            "code": "WP(C)",
            "officialDescription": "Writ Petition (Civil)",
            "normalizedType": "WP(C)",
            "jurisdiction": "Writ",
            "domainId": "domain_constitutional",
            "domainLabel": "Constitutional Law",
            "sourceUrl": "https://hckerala.gov.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "BA": {
            "court": "32_1",
            "courtName": "Kerala High Court",
            "code": "BA",
            "officialDescription": "Bail Application",
            "normalizedType": "B.A.",
            "jurisdiction": "Original",
            "domainId": "domain_criminal",
            "domainLabel": "Criminal Law",
            "sourceUrl": "https://hckerala.gov.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "CRL.MC": {
            "court": "32_1",
            "courtName": "Kerala High Court",
            "code": "CRL.MC",
            "officialDescription": "Criminal Miscellaneous Case",
            "normalizedType": "Crl.M.C.",
            "jurisdiction": "Original",
            "domainId": "domain_criminal",
            "domainLabel": "Criminal Law",
            "sourceUrl": "https://hckerala.gov.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "MAT.APPEAL": {
            "court": "32_1",
            "courtName": "Kerala High Court",
            "code": "MAT.APPEAL",
            "officialDescription": "Matrimonial Appeal",
            "normalizedType": "Mat.Appeal",
            "jurisdiction": "Appellate",
            "domainId": "domain_family_matrimonial",
            "domainLabel": "Family & Matrimonial",
            "sourceUrl": "https://hckerala.gov.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        }
    },
    # Delhi High Court (7_26)
    "7_26": {
        "W.P.(C)": {
            "court": "7_26",
            "courtName": "Delhi High Court",
            "code": "W.P.(C)",
            "officialDescription": "Writ Petition (Civil)",
            "normalizedType": "W.P.(C)",
            "jurisdiction": "Writ",
            "domainId": "domain_constitutional",
            "domainLabel": "Constitutional Law",
            "sourceUrl": "https://delhihighcourt.nic.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "BAIL APPLN.": {
            "court": "7_26",
            "courtName": "Delhi High Court",
            "code": "BAIL APPLN.",
            "officialDescription": "Bail Application",
            "normalizedType": "Bail Appln.",
            "jurisdiction": "Original",
            "domainId": "domain_criminal",
            "domainLabel": "Criminal Law",
            "sourceUrl": "https://delhihighcourt.nic.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "CRL.M.C.": {
            "court": "7_26",
            "courtName": "Delhi High Court",
            "code": "CRL.M.C.",
            "officialDescription": "Criminal Miscellaneous Case",
            "normalizedType": "Crl.M.C.",
            "jurisdiction": "Original",
            "domainId": "domain_criminal",
            "domainLabel": "Criminal Law",
            "sourceUrl": "https://delhihighcourt.nic.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "CS(COMM)": {
            "court": "7_26",
            "courtName": "Delhi High Court",
            "code": "CS(COMM)",
            "officialDescription": "Commercial Civil Suit",
            "normalizedType": "CS(COMM)",
            "jurisdiction": "Original",
            "domainId": "domain_commercial_corporate",
            "domainLabel": "Commercial & Corporate",
            "sourceUrl": "https://delhihighcourt.nic.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "ARB.P.": {
            "court": "7_26",
            "courtName": "Delhi High Court",
            "code": "ARB.P.",
            "officialDescription": "Arbitration Petition",
            "normalizedType": "Arb.P.",
            "jurisdiction": "Original",
            "domainId": "domain_commercial_corporate",
            "domainLabel": "Commercial & Corporate",
            "sourceUrl": "https://delhihighcourt.nic.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        }
    },
    # Bombay High Court (1_1)
    "1_1": {
        "WP": {
            "court": "1_1",
            "courtName": "Bombay High Court",
            "code": "WP",
            "officialDescription": "Writ Petition",
            "normalizedType": "W.P.",
            "jurisdiction": "Writ",
            "domainId": "domain_constitutional",
            "domainLabel": "Constitutional Law",
            "sourceUrl": "https://bombayhighcourt.nic.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "ABA": {
            "court": "1_1",
            "courtName": "Bombay High Court",
            "code": "ABA",
            "officialDescription": "Anticipatory Bail Application",
            "normalizedType": "A.B.A.",
            "jurisdiction": "Original",
            "domainId": "domain_criminal",
            "domainLabel": "Criminal Law",
            "sourceUrl": "https://bombayhighcourt.nic.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "BA": {
            "court": "1_1",
            "courtName": "Bombay High Court",
            "code": "BA",
            "officialDescription": "Bail Application",
            "normalizedType": "B.A.",
            "jurisdiction": "Original",
            "domainId": "domain_criminal",
            "domainLabel": "Criminal Law",
            "sourceUrl": "https://bombayhighcourt.nic.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        },
        "COMMS": {
            "court": "1_1",
            "courtName": "Bombay High Court",
            "code": "COMMS",
            "officialDescription": "Commercial Summary Suit",
            "normalizedType": "COMMS",
            "jurisdiction": "Original",
            "domainId": "domain_commercial_corporate",
            "domainLabel": "Commercial & Corporate",
            "sourceUrl": "https://bombayhighcourt.nic.in/",
            "verifiedOn": "2026-11-24",
            "status": "verified"
        }
    }
}

def lookup_court_code(court_code: str, case_code: str) -> Optional[Dict[str, Any]]:
    """Looks up case code in court registry without guessing."""
    norm_court = court_code.replace("~", "_").strip()
    court_entries = COURT_REGISTRY.get(norm_court)
    if not court_entries:
        return None
    
    clean_code = case_code.strip().upper()
    if clean_code in court_entries:
        return court_entries[clean_code]
    
    # Try with punctuation stripped or dots standardized
    for k, v in court_entries.items():
        if k.replace(".", "").upper() == clean_code.replace(".", "").upper():
            return v
            
    return None
