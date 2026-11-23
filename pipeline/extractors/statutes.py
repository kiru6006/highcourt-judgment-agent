"""
Statute Reference Extractor for Indian High Court Judgments.
Extracts normalized statutory mentions and official transition mappings (e.g. IPC -> BNS).
"""

import re
from typing import List, Dict, Any, Optional

STATUTE_PATTERNS = [
    # Criminal Procedure / BNSS
    {
        "act": "Code of Criminal Procedure, 1973",
        "act_code": "CrPC",
        "pattern": r"(?:Section|Sec\.?|s\.)\s*(\d+[A-Za-z]?)\s+(?:of\s+(?:the\s+)?)?(?:Cr\.?P\.?C\.?|Code\s+of\s+Criminal\s+Procedure)",
        "transition_mapping": {
            "482": {"new_act": "BNSS", "new_section": "528"},
            "439": {"new_act": "BNSS", "new_section": "483"},
            "438": {"new_act": "BNSS", "new_section": "482"},
            "167": {"new_act": "BNSS", "new_section": "187"},
            "313": {"new_act": "BNSS", "new_section": "351"},
            "154": {"new_act": "BNSS", "new_section": "173"},
        }
    },
    {
        "act": "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "act_code": "BNSS",
        "pattern": r"(?:Section|Sec\.?|s\.)\s*(\d+[A-Za-z]?)\s+(?:of\s+(?:the\s+)?)?(?:BNSS|Bharatiya\s+Nagarik\s+Suraksha\s+Sanhita)",
    },
    # Indian Penal Code / BNS
    {
        "act": "Indian Penal Code, 1860",
        "act_code": "IPC",
        "pattern": r"(?:Section|Sec\.?|s\.)\s*(\d+[A-Za-z]?)\s+(?:of\s+(?:the\s+)?)?(?:I\.?P\.?C\.?|Indian\s+Penal\s+Code)",
        "transition_mapping": {
            "420": {"new_act": "BNS", "new_section": "318"},
            "406": {"new_act": "BNS", "new_section": "316"},
            "302": {"new_act": "BNS", "new_section": "103"},
            "307": {"new_act": "BNS", "new_section": "109"},
            "376": {"new_act": "BNS", "new_section": "64"},
            "498A": {"new_act": "BNS", "new_section": "85"},
            "120B": {"new_act": "BNS", "new_section": "61"},
        }
    },
    {
        "act": "Bharatiya Nyaya Sanhita, 2023",
        "act_code": "BNS",
        "pattern": r"(?:Section|Sec\.?|s\.)\s*(\d+[A-Za-z]?)\s+(?:of\s+(?:the\s+)?)?(?:BNS|Bharatiya\s+Nyaya\s+Sanhita)",
    },
    # Civil Procedure Code
    {
        "act": "Code of Civil Procedure, 1908",
        "act_code": "CPC",
        "pattern": r"(?:Section|Sec\.?|Order\s+[IVXLCDM]+(?:\s+Rule\s+\d+)?)\s+(?:of\s+(?:the\s+)?)?(?:C\.?P\.?C\.?|Code\s+of\s+Civil\s+Procedure)",
    },
    # Constitution of India
    {
        "act": "Constitution of India, 1950",
        "act_code": "Const",
        "pattern": r"Article\s+(\d+[A-Za-z]?)\s+(?:of\s+(?:the\s+)?)?(?:Constitution\s+of\s+India|Constitution)",
    },
    # Arbitration and Conciliation Act
    {
        "act": "Arbitration and Conciliation Act, 1996",
        "act_code": "Other",
        "pattern": r"(?:Section|Sec\.?|s\.)\s*(\d+(?:\(\d+\))?)\s+(?:of\s+(?:the\s+)?)?Arbitration\s+(?:and\s+Conciliation\s+)?Act",
    },
    # Negotiable Instruments Act (Section 138)
    {
        "act": "Negotiable Instruments Act, 1881",
        "act_code": "Other",
        "pattern": r"(?:Section|Sec\.?|s\.)\s*(138)\s+(?:of\s+(?:the\s+)?)?(?:N\.?I\.?\s*Act|Negotiable\s+Instruments\s+Act)",
    },
    # Trade Marks Act
    {
        "act": "Trade Marks Act, 1999",
        "act_code": "Other",
        "pattern": r"(?:Section|Sec\.?|s\.)\s*(\d+)\s+(?:of\s+(?:the\s+)?)?(?:Trade\s+Marks?\s+Act)",
    },
    # Income Tax Act
    {
        "act": "Income Tax Act, 1961",
        "act_code": "Other",
        "pattern": r"(?:Section|Sec\.?|s\.)\s*(\d+[A-Za-z]*(?:\([a-z0-9]+\))?)\s+(?:of\s+(?:the\s+)?)?Income\s+Tax\s+Act",
    },
]

def extract_statutes_from_text(text: str, para_index: int = 1) -> List[Dict[str, Any]]:
    """
    Scans paragraph text and extracts unique statutory provisions.
    """
    found: Dict[str, Dict[str, Any]] = {}

    for rule in STATUTE_PATTERNS:
        matches = re.finditer(rule["pattern"], text, re.IGNORECASE)
        for m in matches:
            sec_num = m.group(1) if m.lastindex else m.group(0)
            key = f"{rule['act_code']}:{sec_num}"

            if key not in found:
                item: Dict[str, Any] = {
                    "act": rule["act"],
                    "act_code": rule["act_code"],
                    "section": sec_num,
                    "paragraph_indices": [para_index],
                }

                # Transition mapping if available
                mappings = rule.get("transition_mapping", {})
                if sec_num in mappings:
                    item["transition_mapping"] = {
                        "new_act": mappings[sec_num]["new_act"],
                        "new_section": mappings[sec_num]["new_section"],
                        "mapping_source": "official_transition_table.csv",
                    }
                found[key] = item
            else:
                if para_index not in found[key]["paragraph_indices"]:
                    found[key]["paragraph_indices"].append(para_index)

    return list(found.values())
