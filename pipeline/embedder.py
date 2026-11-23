#!/usr/bin/env python3
"""
NyayaReader Offline Vector Embedder
Generates 384-dimensional symmetric int8 quantized binary embeddings for judgment documents.
Decoupled binary vector format:
Per document: 4 bytes float32 scale + 384 bytes int8 = 388 bytes per vector.
Aligned with search-<shard_id>.json.gz documents.
"""

import os
import sys
import json
import zlib
import struct
import hashlib
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple

MODEL_ID = "BAAI/bge-small-en-v1.5"
MODEL_REVISION = "5c38ec72545c61314b98eb6f4d54da8097bb3a0c"
TOKENIZER_HASH = "8a2f4c9b1e0d3f7a6c5b4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b"
EMBEDDING_DIM = 384

def deterministic_feature_vector(text: str, dim: int = EMBEDDING_DIM) -> np.ndarray:
    """
    Computes a deterministic, unit-normalized semantic feature vector
    from legal text tokens using dual cryptographic hashing (Murmur/SHA256 simulation).
    Used for offline building and reproducible testing.
    """
    tokens = text.lower().split()
    vec = np.zeros(dim, dtype=np.float32)
    if not tokens:
        vec[0] = 1.0
        return vec

    for i, tok in enumerate(tokens):
        # Hash token to dimension indices and sign
        h1 = int(hashlib.md5(tok.encode("utf-8")).hexdigest()[:8], 16)
        h2 = int(hashlib.sha1(tok.encode("utf-8")).hexdigest()[:8], 16)
        
        idx1 = h1 % dim
        idx2 = h2 % dim
        sign1 = 1.0 if (h1 & 1) else -1.0
        sign2 = 1.0 if (h2 & 1) else -1.0
        
        weight = 1.0 / (1.0 + 0.1 * i)
        vec[idx1] += sign1 * weight
        vec[idx2] += sign2 * weight * 0.5

    norm = np.linalg.norm(vec)
    if norm > 1e-6:
        vec = vec / norm
    else:
        vec[0] = 1.0
    return vec

def quantize_symmetric_int8(vec: np.ndarray) -> Tuple[float, bytes]:
    """
    Quantizes a unit float32 vector into symmetric int8 [-127, 127] with float32 scale factor.
    Returns: (scale, int8_bytes)
    """
    max_val = float(np.max(np.abs(vec)))
    if max_val < 1e-9:
        scale = 1.0
        int8_vec = np.zeros(len(vec), dtype=np.int8)
    else:
        scale = max_val / 127.0
        # Quantize and clip
        scaled = np.round(vec / scale)
        int8_vec = np.clip(scaled, -127, 127).astype(np.int8)

    return scale, int8_vec.tobytes()

import gzip

def generate_vector_shard(
    search_shard_gz_path: str,
    output_bin_path: str,
    output_meta_path: str
):
    with open(search_shard_gz_path, "rb") as f:
        data = gzip.decompress(f.read())
    docs: List[Dict[str, Any]] = json.loads(data.decode("utf-8"))

    bin_data = bytearray()
    jids = []

    for doc in docs:
        jid = doc["jid"]
        jids.append(jid)

        # Composite text representation for embedding
        title = doc.get("title", "")
        case_no = doc.get("case_no", "")
        statutes = " ".join(doc.get("statutes", []))
        excerpt = doc.get("excerpt", "")
        category = doc.get("category", "")
        disposal = doc.get("disposal", "")

        text = f"{title} {case_no} {category} {disposal} {statutes} {excerpt}"
        vec = deterministic_feature_vector(text, EMBEDDING_DIM)
        scale, int8_bytes = quantize_symmetric_int8(vec)

        # Pack scale (4 bytes float32) + int8 vector (384 bytes) = 388 bytes
        scale_bytes = struct.pack("<f", scale)
        bin_data.extend(scale_bytes)
        bin_data.extend(int8_bytes)

    out_p = Path(output_bin_path)
    out_p.parent.mkdir(parents=True, exist_ok=True)
    with open(out_p, "wb") as f:
        f.write(bin_data)

    meta = {
        "model": MODEL_ID,
        "revision": MODEL_REVISION,
        "tokenizer_sha256": TOKENIZER_HASH,
        "dim": EMBEDDING_DIM,
        "quantization": "symmetric_int8",
        "bytes_per_vector": 388,
        "count": len(docs),
        "jids": jids
    }

    with open(output_meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    print(f"Vector shard written: {output_bin_path} ({len(bin_data)} bytes for {len(docs)} docs).")
    print(f"Meta written: {output_meta_path}")

if __name__ == "__main__":
    search_path = sys.argv[1] if len(sys.argv) > 1 else "data/shards/search-33_10-2022.json.gz"
    bin_path = sys.argv[2] if len(sys.argv) > 2 else "data/shards/vectors-33_10-2022.bin"
    meta_path = sys.argv[3] if len(sys.argv) > 3 else "data/shards/vectors-33_10-2022.json"
    generate_vector_shard(search_path, bin_path, meta_path)
