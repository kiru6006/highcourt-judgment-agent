#!/usr/bin/env python3
"""
Offline Ingestion Pipeline Driver for NyayaReader.
Processes court-year archives from s3://indian-high-court-judgments into validated shards.
"""

import argparse
import io
import json
import os
import re
import sys
import tarfile
import boto3
from botocore import UNSIGNED
from botocore.config import Config
import pymupdf

from pipeline.identity import generate_jid, is_near_duplicate
from pipeline.structure import split_into_paragraphs, classify_sections
from pipeline.extractors.statutes import extract_statutes_from_text
from pipeline.extractors.citations import extract_citations_from_text
from pipeline.taxonomy import normalize_court, derive_category, normalize_disposal
from pipeline.quarantine import is_quarantined, log_to_review_queue
from pipeline.shard_builder import build_shards_for_partition

BUCKET_NAME = "indian-high-court-judgments"
REGION = "ap-south-1"

def extract_header_metadata(full_text: str, default_year: int, cnr: str) -> dict:
    header = full_text[:1500]
    
    # 1. Judges / Coram
    judges = []
    judge_matches = re.findall(
        r"(?:THE\s+HON(?:OURA|')?BLE\s+(?:MR\.|MS\.|MRS\.|JUSTICE)\s+([A-Z\.\s]+?))\s*(?:\n|DATED|ORDER|JUDGMENT)",
        header,
        re.IGNORECASE
    )
    for j in judge_matches:
        cleaned = re.sub(r"\s+", " ", j).strip().title()
        if len(cleaned) > 2 and cleaned not in judges:
            judges.append(f"Hon'ble Justice {cleaned}")
            
    if not judges:
        judges = ["Hon'ble High Court Judge"]
        
    # 2. Case Number
    case_no_match = re.search(
        r"((?:Crl\.?\s*O\.?P\.?|W\.?P\.?|C\.?R\.?P\.?|W\.?A\.?|O\.?S\.?A\.?|C\.?M\.?A\.?|C\.?A\.?)(?:\s*\([A-Za-z]+\))?\s*(?:No\.?|NUMBER)?\s*[\(\[]?(\d+)[\)\]]?\s*(?:of|\/)\s*(\d{4}))",
        header,
        re.IGNORECASE
    )
    if case_no_match:
        case_no = re.sub(r"\s+", " ", case_no_match.group(1)).strip()
        case_type = case_no_match.group(1).split()[0].upper()
    else:
        case_no = f"Case No. {cnr[-4:]} of {default_year}"
        case_type = "CRL.OP"

    # 3. Parties
    petitioner = "Petitioner"
    respondent = "State Respondent"
    
    vs_match = re.search(
        r"([A-Za-z0-9\.\s,\(\)]+?)\s*(?:\.\.\.\s*Petitioner|\bPetitioner\b)\s*(?:Vs\.?|Versus)\s*([A-Za-z0-9\.\s,\(\)]+?)\s*(?:\.\.\.\s*Respondent|\bRespondent\b)",
        header,
        re.IGNORECASE
    )
    if vs_match:
        pet = re.sub(r"\s+", " ", vs_match.group(1)).strip()
        resp = re.sub(r"\s+", " ", vs_match.group(2)).strip()
        if len(pet) > 2:
            petitioner = pet[:80]
        if len(resp) > 2:
            respondent = resp[:80]
            
    return {
        "judges": judges,
        "case_number": case_no,
        "case_type": case_type,
        "petitioner": petitioner,
        "respondent": respondent,
        "coram_type": "Division Bench" if len(judges) > 1 else "Single Judge"
    }

def process_tar_archive(
    court_code: str,
    year: int,
    max_docs: int = 100,
    s3_key: str = "",
    tar_bytes: bytes = None
) -> list:
    """Extracts, structures, and enriches documents from a TAR stream."""
    court_name, default_bench = normalize_court(court_code)
    
    if not tar_bytes:
        try:
            s3 = boto3.client("s3", region_name=REGION, config=Config(signature_version=UNSIGNED))
            resp = s3.get_object(Bucket=BUCKET_NAME, Key=s3_key)
            tar_bytes = resp["Body"].read()
        except Exception as e:
            print(f"[Ingest Error] Failed to fetch s3://{BUCKET_NAME}/{s3_key}: {e}", file=sys.stderr)
            return []

    try:
        tar = tarfile.open(fileobj=io.BytesIO(tar_bytes))
    except Exception as e:
        print(f"[Ingest Error] Failed to parse TAR archive for {court_code}-{year}: {e}", file=sys.stderr)
        return []
    members = [m for m in tar.getmembers() if m.name.endswith(".pdf") and m.size > 0]

    judgments = []
    seen_texts = []
    quarantined_count = 0

    for idx, member in enumerate(members[:max_docs]):
        f = tar.extractfile(member)
        if not f:
            continue
        pdf_data = f.read()

        try:
            doc = pymupdf.open(stream=pdf_data, filetype="pdf")
        except Exception:
            continue

        # Extract text across all pages
        full_text = "\n\n".join(page.get_text() for page in doc if page.get_text().strip())
        if len(full_text.strip()) < 50:
            continue

        # Check deduplication
        is_dup = False
        for prev in seen_texts[-50:]:  # Check sliding window
            if is_near_duplicate(full_text, prev):
                is_dup = True
                break
        if is_dup:
            continue
        seen_texts.append(full_text)

        # Parse case title from filename: e.g. "HCMA010174862016_1_2022-08-12.pdf"
        base_name = os.path.basename(member.name).replace(".pdf", "")
        parts = base_name.split("_")
        cnr = parts[0] if len(parts) > 0 else f"CNRSAMPLE{idx:04d}"
        order_num = parts[1] if len(parts) > 1 else "1"
        date_str = parts[2] if len(parts) > 2 else f"{year}-06-15"

        jid = generate_jid(
            cnr=cnr,
            decision_date=date_str,
            order_number=order_num,
            court=court_code,
            year=str(year),
            filename=member.name
        )

        paragraphs = split_into_paragraphs(full_text)
        sections = classify_sections(paragraphs)

        # Extract statutes and citations per paragraph
        all_statutes = []
        all_citations = []
        for p in paragraphs:
            p_stats = extract_statutes_from_text(p["text"], para_index=p["index"])
            all_statutes.extend(p_stats)
            p_cites = extract_citations_from_text(p["text"], para_index=p["index"])
            all_citations.extend(p_cites)

        category, is_derived_cat = derive_category("CRL.OP", title=full_text[:300])
        disposal = normalize_disposal("Disposed Of", order_text=full_text[-500:])
        meta = extract_header_metadata(full_text, default_year=year, cnr=cnr)

        judgment_record = {
            "jid": jid,
            "cnr": cnr,
            "court_code": court_code,
            "court_name": court_name,
            "bench_code": "01",
            "bench_name": default_bench,
            "coram_type": meta["coram_type"],
            "judges": meta["judges"],
            "case_type": meta["case_type"],
            "case_number": meta["case_number"],
            "decision_date": date_str,
            "parties": {
                "petitioner": meta["petitioner"],
                "respondent": meta["respondent"],
            },
            "disposal_nature": disposal,
            "purpose_stage": "Final Hearing",
            "category": category,
            "pdf_source_url": f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_key}",
            "language": "en",
            "paragraphs": paragraphs,
            "sections": sections,
            "statutes": all_statutes[:10],
            "citations": all_citations[:10],
            "derived_fields": {
                "category": is_derived_cat,
                "purpose_stage": True,
                "coram_type": True,
            }
        }

        # Check quarantine
        quar, reason = is_quarantined(judgment_record)
        if quar:
            log_to_review_queue(judgment_record, reason)
            quarantined_count += 1
            continue

        judgments.append(judgment_record)

    print(f"Processed {len(judgments)} judgments (Quarantined: {quarantined_count}, Duplicates skipped)")
    return judgments

def main():
    parser = argparse.ArgumentParser(description="NyayaReader Offline Ingestion Pipeline (v1.3.0 Five-Year Ingestion)")
    parser.add_argument("--court", type=str, default="33_10", help="Court Code (e.g. 33_10 or comma-separated list or ALL)")
    parser.add_argument("--year", type=int, default=2022, help="Year (e.g. 2022, 2023, 2024, 2025, 2026)")
    parser.add_argument("--date-from", type=str, default="2022-01-01", help="Configurable start date YYYY-MM-DD")
    parser.add_argument("--date-to", type=str, default="2026-11-24", help="Configurable end date cutoff YYYY-MM-DD (can be advanced)")
    parser.add_argument("--max-docs", type=int, default=50, help="Max documents to process per court-year")
    parser.add_argument("--checkpoint-dir", type=str, default="data/checkpoints", help="Directory for resume checkpoints")
    parser.add_argument("--output-dir", type=str, default="data/shards", help="Output directory for shards")
    parser.add_argument("--sample-out", type=str, default="web/public/data-sample", help="Sample directory for web local runs")
    args = parser.parse_args()

    os.makedirs(args.checkpoint_dir, exist_ok=True)
    os.makedirs(args.output_dir, exist_ok=True)

    print(f"=== NyayaReader Ingestion Driver v1.3.0 ===")
    print(f"Date Boundary: {args.date_from} through {args.date_to}")
    print(f"Court: {args.court}, Target Year: {args.year} (Max docs: {args.max_docs})")

    s3_key = f"data/tar/year={args.year}/court={args.court}/bench=hc_cis_mas/part-20260429T170059Z.tar"

    # Checkpoint check
    cp_file = os.path.join(args.checkpoint_dir, f"cp_{args.court}_{args.year}.json")
    processed_jids = set()
    if os.path.exists(cp_file):
        try:
            with open(cp_file, "r") as f:
                processed_jids = set(json.load(f))
            print(f"Loaded checkpoint with {len(processed_jids)} previously indexed documents.")
        except Exception:
            pass

    judgments = process_tar_archive(
        court_code=args.court,
        year=args.year,
        max_docs=args.max_docs,
        s3_key=s3_key
    )

    if not judgments:
        print("No judgments processed.")
        sys.exit(1)

    # Filter out by date cutoff boundaries
    valid_judgments = [
        j for j in judgments 
        if args.date_from <= j.get("decision_date", "1900-01-01") <= args.date_to
    ]
    if not valid_judgments:
        valid_judgments = judgments

    # Build production shards
    shard_meta = build_shards_for_partition(args.court, args.year, valid_judgments, args.output_dir)
    print(f"Built production shards in {args.output_dir}: Search {shard_meta['search_shard_bytes']} B, Docs {shard_meta['docs_shard_bytes']} B")

    # Build local sample shards for web
    sample_meta = build_shards_for_partition(args.court, args.year, valid_judgments[:20], args.sample_out)
    print(f"Built local sample shards in {args.sample_out} ({sample_meta['count']} docs)")

    # Update checkpoint
    all_jids = processed_jids.union({j["jid"] for j in valid_judgments})
    with open(cp_file, "w") as f:
        json.dump(list(all_jids), f)

    # Save manifest fragment
    frag_path = os.path.join(args.output_dir, f"manifest-{args.court.replace('~', '_')}-{args.year}.json")
    with open(frag_path, "w") as f:
        json.dump(shard_meta, f, indent=2)
    print(f"Emitted manifest fragment: {frag_path}")

if __name__ == "__main__":
    main()
