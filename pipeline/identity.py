"""
Identity & Deduplication Module for NyayaReader.
Computes stable JIDs and performs exact and near-duplicate detection.
"""

import hashlib
import re
from typing import List, Set

def generate_jid(
    cnr: str = "",
    decision_date: str = "",
    order_number: str = "",
    court: str = "",
    year: str = "",
    filename: str = "",
) -> str:
    """
    Computes a deterministic JID hash.
    Primary: sha1(cnr|decision_date|order_number)
    Fallback: sha1(court|year|filename)
    """
    cnr_clean = (cnr or "").strip().upper()
    date_clean = (str(decision_date) or "").strip()[:10]  # YYYY-MM-DD
    order_clean = (str(order_number) or "").strip()

    if cnr_clean and date_clean:
        raw_key = f"{cnr_clean}|{date_clean}|{order_clean}"
        return hashlib.sha1(raw_key.encode("utf-8")).hexdigest()

    # Fallback key
    fallback_key = f"{court}|{year}|{filename}".strip()
    return hashlib.sha1(fallback_key.encode("utf-8")).hexdigest()

def normalize_text(text: str) -> str:
    """Normalizes text for deduplication and fuzzy comparison."""
    if not text:
        return ""
    # Lowercase
    s = text.lower()
    # Normalize punctuation and quotes
    s = re.sub(r"[\u2018\u2019]", "'", s)
    s = re.sub(r"[\u201C\u201D]", '"', s)
    # Remove non-alphanumeric except space
    s = re.sub(r"[^\w\s]", " ", s)
    # Collapse multiple whitespaces
    s = re.sub(r"\s+", " ", s).strip()
    return s

def compute_exact_hash(text: str) -> str:
    """Computes SHA-256 of normalized text."""
    norm = normalize_text(text)
    return hashlib.sha256(norm.encode("utf-8")).hexdigest()

def get_k_shingles(text: str, k: int = 5) -> Set[str]:
    """Generates character k-shingles for MinHash."""
    norm = normalize_text(text)
    if len(norm) < k:
        return {norm}
    return {norm[i : i + k] for i in range(len(norm) - k + 1)}

def compute_jaccard_similarity(set_a: Set[str], set_b: Set[str]) -> float:
    """Computes Jaccard similarity between two sets of shingles."""
    if not set_a and not set_b:
        return 1.0
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a.intersection(set_b))
    union = len(set_a.union(set_b))
    return intersection / union if union > 0 else 0.0

def is_near_duplicate(text_a: str, text_b: str, threshold: float = 0.85) -> bool:
    """Checks whether two documents are near duplicates via Jaccard similarity."""
    # Fast path: exact hash match
    if compute_exact_hash(text_a) == compute_exact_hash(text_b):
        return True
    
    shingles_a = get_k_shingles(text_a, k=5)
    shingles_b = get_k_shingles(text_b, k=5)
    return compute_jaccard_similarity(shingles_a, shingles_b) >= threshold
