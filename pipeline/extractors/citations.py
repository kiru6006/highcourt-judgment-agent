"""
Case Citation Extractor for Indian High Court Judgments.
Extracts AIR, SCC, SCR, and official case citations.
"""

import re
from typing import List, Dict, Any

CITATION_PATTERNS = [
    # AIR Citation: e.g. "AIR 2020 SC 1234", "AIR 1992 SC 604", "AIR 2018 Mad 45"
    r"\bAIR\s+(\d{4})\s+([A-Za-z\s]+)\s+(\d+)\b",
    # SCC Citation: e.g. "(2020) 4 SCC 1", "2018 (3) SCC 450", "(1992) Supp (1) SCC 335"
    r"\(?(\d{4})\)?\s*(?:Supp\s*\(\d+\)\s*)?(?:\(\d+\)|\d+)?\s*SCC\s+(\d+)",
    # SCR Citation: e.g. "(2015) 2 SCR 500"
    r"\(?(\d{4})\)?\s+(?:\d+\s+)?SCR\s+(\d+)",
    # ILR Citation: e.g. "ILR 2018 2 Mad 120"
    r"\bILR\s+(\d{4})\s+(?:\d+\s+)?([A-Za-z]+)\s+(\d+)\b",
    # Case Title versus: e.g. "State of Haryana v. Bhajan Lal", "Arnesh Kumar v. State of Bihar"
    r"([A-Z][A-Za-z\.\s]+)\s+(?:v\.|vs\.|versus)\s+([A-Z][A-Za-z\.\s]+(?:\s+Another|\s+Others|\s+Ors\.?)?)",
]

def extract_citations_from_text(text: str, para_index: int = 1) -> List[Dict[str, Any]]:
    """
    Extracts citation references and precedent case mentions from text.
    """
    citations: List[Dict[str, Any]] = []
    seen: set = set()

    # 1. Structured Citations (AIR, SCC, SCR, ILR)
    for pat in CITATION_PATTERNS[:4]:
        for m in re.finditer(pat, text):
            raw = m.group(0).strip()
            if raw not in seen:
                seen.add(raw)
                citations.append({
                    "raw_citation": raw,
                    "paragraph_indices": [para_index]
                })

    # 2. Case Title Pattern: "X v. Y"
    for m in re.finditer(CITATION_PATTERNS[4], text):
        petitioner = m.group(1).strip()
        respondent = m.group(2).strip()
        # Filter false positives
        if len(petitioner) > 3 and len(respondent) > 3 and "Learned" not in petitioner and "Section" not in petitioner:
            title = f"{petitioner} v. {respondent}"
            if title not in seen:
                seen.add(title)
                citations.append({
                    "raw_citation": title,
                    "case_title": title,
                    "paragraph_indices": [para_index]
                })

    return citations
