"""
Document Structure & Section Tagger for Indian High Court Judgments.
Extracts numbered paragraphs and classifies sections using deterministic heuristic rules.
"""

import re
from typing import List, Dict, Any, Tuple

SECTION_RULES = [
    {
        "tag": "Facts",
        "pattern": r"(?:brief\s+facts|factual\s+matrix|factual\s+background|case\s+of\s+the\s+prosecution|case\s+of\s+the\s+petitioner|allegation\s+in\s+the\s+FIR)",
        "confidence": 0.90,
    },
    {
        "tag": "Issues",
        "pattern": r"(?:points?\s+for\s+(?:consideration|determination)|issues?\s+framed|substantial\s+questions?\s+of\s+law|the\s+question\s+that\s+arises|core\s+issue)",
        "confidence": 0.92,
    },
    {
        "tag": "Petitioner Submissions",
        "pattern": r"(?:submissions?\s+of\s+(?:the\s+)?(?:learned\s+)?(?:senior\s+)?counsel\s+for\s+the\s+petitioner|learned\s+(?:senior\s+)?counsel\s+for\s+the\s+(?:petitioner|appellant)\s+(?:submitted|contended|argued)|argued\s+by\s+the\s+petitioner)",
        "confidence": 0.92,
    },
    {
        "tag": "Respondent Submissions",
        "pattern": r"(?:submissions?\s+of\s+(?:the\s+)?(?:learned\s+)?(?:additional\s+)?public\s+prosecutor|learned\s+(?:additional\s+)?public\s+prosecutor\s+(?:submitted|contended|opposed)|learned\s+(?:counsel|advocate)\s+for\s+the\s+respondent\s+(?:submitted|contended|opposed)|opposing\s+the\s+petition)",
        "confidence": 0.91,
    },
    {
        "tag": "Reasoning & Ratio",
        "pattern": r"(?:we\s+have\s+considered|having\s+heard\s+the\s+rival\s+submissions|in\s+our\s+considered\s+opinion|analysis\s+and\s+findings|as\s+laid\s+down\s+by|it\s+is\s+a\s+settled\s+principle\s+of\s+law|it\s+is\s+well\s+settled)",
        "confidence": 0.88,
    },
    {
        "tag": "Final Order",
        "pattern": r"(?:in\s+the\s+result|consequently|the\s+criminal\s+original\s+petition\s+is\s+(?:allowed|dismissed)|the\s+appeal\s+is\s+(?:allowed|dismissed)|petition\s+stands\s+disposed\s+of|ordered\s+accordingly|operative\s+portion)",
        "confidence": 0.98,
    },
]

def split_into_paragraphs(raw_text: str) -> List[Dict[str, Any]]:
    """
    Splits text into paragraphs, detecting native numbering (e.g. '1.', '2.', '[Para 1]')
    or assigning sequential 1-based indices.
    """
    raw_blocks = [b.strip() for b in re.split(r"\n\s*\n", raw_text) if len(b.strip()) > 20]
    paragraphs: List[Dict[str, Any]] = []

    for idx, block in enumerate(raw_blocks, start=1):
        # Detect paragraph label prefix (e.g. "1.", "Para 2", "(3)")
        m = re.match(r"^(?:(?:Para|paragraph)\s+)?(?:\[?(\d+)\]?|\(?(\d+)\)?)[\.\:\-]\s*(.*)", block, re.DOTALL | re.IGNORECASE)
        if m:
            label_num = m.group(1) or m.group(2)
            clean_text = m.group(3).strip()
            orig_label = f"{label_num}."
        else:
            clean_text = block
            orig_label = None

        paragraphs.append({
            "index": idx,
            "original_label": orig_label,
            "text": clean_text,
            "section_tag": "Untagged",
            "statute_mentions": [],
            "citation_mentions": [],
            "token_count": len(clean_text) // 4,
        })

    return paragraphs

def classify_sections(paragraphs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Classifies sections by testing heuristic rules across paragraphs.
    Low-confidence sections remain "Untagged".
    """
    current_tag = "Untagged"
    current_start = 1
    current_conf = 0.5
    sections: List[Dict[str, Any]] = []

    for idx, p in enumerate(paragraphs, start=1):
        text_lower = p["text"].lower()
        matched_tag = None
        matched_conf = 0.0
        matched_rule = "none"

        for rule in SECTION_RULES:
            if re.search(rule["pattern"], text_lower, re.IGNORECASE):
                matched_tag = rule["tag"]
                matched_conf = rule["confidence"]
                matched_rule = rule["tag"].lower().replace(" ", "_")
                break

        if matched_tag and matched_tag != current_tag:
            # Close previous section
            if idx > current_start:
                sections.append({
                    "tag": current_tag,
                    "start_para_index": current_start,
                    "end_para_index": idx - 1,
                    "confidence": current_conf,
                    "rule_id": f"r_{current_tag.lower().replace(' ', '_')}"
                })
            current_tag = matched_tag
            current_start = idx
            current_conf = matched_conf

        p["section_tag"] = current_tag

    # Close final section
    if paragraphs:
        sections.append({
            "tag": current_tag,
            "start_para_index": current_start,
            "end_para_index": len(paragraphs),
            "confidence": current_conf,
            "rule_id": f"r_{current_tag.lower().replace(' ', '_')}"
        })

    return sections
