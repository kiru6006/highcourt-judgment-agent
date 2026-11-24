"""
Nyaya AI Reader — Classification Engine (Levels 1 & 2 Integration)
Coordinates Level 1 (Metadata/Registry) and Level 2 (Rule-Based Evidence Grounding).
Attaches backward-compatible classification_metadata to judgment documents.
Level 3 (AI Model Inference) is strictly GATED until Levels 1 & 2 pass evaluation.
"""

from typing import Dict, Any, List
from .level1 import classify_level1
from .level2 import classify_level2

def classify_document(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Runs Level 1 and Level 2 classification on a raw or parsed judgment document.
    Returns the document enriched with `classification_metadata`.
    Never mutates original document fields.
    """
    court_code = doc.get("court_code", "")
    raw_case_type = doc.get("case_type") or doc.get("raw_case_type", "")
    bench = doc.get("bench_name") or doc.get("bench", "")
    
    # 1. Level 1: Deterministic Registry & Metadata Classification
    stated = classify_level1(court_code=court_code, raw_case_type=raw_case_type, bench=bench)
    
    # 2. Level 2: Rule-Based Classification from Extracted Paragraphs
    paragraphs: List[str] = doc.get("paragraphs", [])
    inferred = classify_level2(paragraphs)
    
    # 3. Construct ClassificationMetadata schema
    classification_metadata = {
        "reviewStatus": "pending",
        "statedClassification": stated,
        "inferredClassification": inferred,
        "anomaliesDetected": doc.get("anomaliesDetected", []),
    }
    
    # Enrich without breaking existing schema
    enriched_doc = dict(doc)
    enriched_doc["classification_metadata"] = classification_metadata
    enriched_doc["raw_case_type"] = raw_case_type
    
    return enriched_doc
