#!/usr/bin/env python3
"""
Real PDF Extraction & Metrics Probe
Reads part-20260429T170059Z.tar (4.88 MB, 71 real PDFs) from Madras HC 2022,
measures page count, characters per page, empty page rate, non-ASCII ratio,
and paragraph token distributions with PyMuPDF.
"""

import io
import json
import os
import tarfile
import boto3
from botocore import UNSIGNED
from botocore.config import Config
import pymupdf

BUCKET_NAME = "indian-high-court-judgments"
REGION = "ap-south-1"
KEY = "data/tar/year=2022/court=33_10/bench=hc_cis_mas/part-20260429T170059Z.tar"

def run_extraction_probe():
    print(f"=== Fetching {KEY} from S3 ===")
    s3 = boto3.client("s3", region_name=REGION, config=Config(signature_version=UNSIGNED))
    resp = s3.get_object(Bucket=BUCKET_NAME, Key=KEY)
    tar_bytes = resp["Body"].read()
    print(f"Downloaded {len(tar_bytes) / (1024 * 1024):.2f} MB tar archive.")

    tar = tarfile.open(fileobj=io.BytesIO(tar_bytes))
    members = [m for m in tar.getmembers() if m.name.endswith(".pdf") and m.size > 0]
    print(f"Total PDFs found in tar: {len(members)}")

    doc_metrics = []
    total_pages = 0
    empty_pages = 0
    total_chars = 0
    non_ascii_chars = 0
    total_tokens_approx = 0

    for idx, member in enumerate(members):
        f = tar.extractfile(member)
        if not f:
            continue
        pdf_data = f.read()
        doc = pymupdf.open(stream=pdf_data, filetype="pdf")
        
        pages_in_doc = len(doc)
        total_pages += pages_in_doc
        chars_in_doc = 0
        empty_in_doc = 0
        non_ascii_in_doc = 0
        paragraphs = []

        for page in doc:
            txt = page.get_text()
            if not txt.strip():
                empty_pages += 1
                empty_in_doc += 1
            chars_in_doc += len(txt)
            for ch in txt:
                if ord(ch) > 127:
                    non_ascii_chars += 1
                    non_ascii_in_doc += 1
            # Split into paragraphs by blank lines
            paras = [p.strip() for p in txt.split("\n\n") if len(p.strip()) > 25]
            paragraphs.extend(paras)

        total_chars += chars_in_doc
        tokens_est = chars_in_doc // 4  # standard ~4 chars per BPE token
        total_tokens_approx += tokens_est

        doc_metrics.append({
            "filename": member.name,
            "bytes": len(pdf_data),
            "pages": pages_in_doc,
            "chars": chars_in_doc,
            "empty_pages": empty_in_doc,
            "non_ascii_ratio": (non_ascii_in_doc / max(1, chars_in_doc)),
            "paragraphs_count": len(paragraphs),
            "tokens_est": tokens_est
        })

    avg_pages = total_pages / max(1, len(doc_metrics))
    avg_chars_page = total_chars / max(1, total_pages)
    empty_pct = (empty_pages / max(1, total_pages)) * 100
    non_ascii_pct = (non_ascii_chars / max(1, total_chars)) * 100
    avg_pdf_kb = (sum(d["bytes"] for d in doc_metrics) / max(1, len(doc_metrics))) / 1024
    avg_paras_doc = sum(d["paragraphs_count"] for d in doc_metrics) / max(1, len(doc_metrics))
    avg_tokens_doc = total_tokens_approx / max(1, len(doc_metrics))

    print("\n=== Real Measured Extraction Results ===")
    print(f"Total PDFs Processed   : {len(doc_metrics)}")
    print(f"Total Pages Analyzed    : {total_pages}")
    print(f"Average PDF File Size   : {avg_pdf_kb:.1f} KB")
    print(f"Average Pages / Document: {avg_pages:.1f}")
    print(f"Average Chars / Page    : {avg_chars_page:.0f}")
    print(f"Empty Page Rate         : {empty_pct:.2f}%")
    print(f"Non-ASCII Character Rate: {non_ascii_pct:.2f}%")
    print(f"Average Paragraphs / Doc: {avg_paras_doc:.1f}")
    print(f"Average Tokens / Doc    : {avg_tokens_doc:.0f}")

    results = {
        "source_tar": KEY,
        "pdf_count": len(doc_metrics),
        "total_pages": total_pages,
        "avg_pdf_kb": avg_pdf_kb,
        "avg_pages_per_doc": avg_pages,
        "avg_chars_per_page": avg_chars_page,
        "empty_page_pct": empty_pct,
        "non_ascii_pct": non_ascii_pct,
        "avg_paragraphs_per_doc": avg_paras_doc,
        "avg_tokens_per_doc": avg_tokens_doc,
        "sample_docs": doc_metrics[:5]
    }

    with open("config/extraction.discovered.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Saved config/extraction.discovered.json successfully!")
    return results

if __name__ == "__main__":
    run_extraction_probe()
