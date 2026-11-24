"""
Nyaya AI Reader — Deterministic Classification Subsystem (Levels 1 & 2)
v1.2.0 Structured Case Intelligence
"""

from .level1 import classify_level1
from .level2 import classify_level2, LEVEL2_RULES
from .engine import classify_document

__all__ = [
    "classify_level1",
    "classify_level2",
    "LEVEL2_RULES",
    "classify_document",
]
