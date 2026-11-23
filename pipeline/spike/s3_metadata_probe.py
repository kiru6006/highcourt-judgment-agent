#!/usr/bin/env python3
"""
S3 Metadata Probe for NyayaReader
Queries s3://indian-high-court-judgments anonymously using DuckDB httpfs and boto3.
Discovers real schema, null rates, duplicate keys, and outputs config/schema.discovered.json.
"""

import json
import os
import sys
import duckdb
import boto3
from botocore import UNSIGNED
from botocore.config import Config
import pandas as pd

BUCKET_NAME = "indian-high-court-judgments"
REGION = "ap-south-1"

def inspect_s3():
    print("=== Step 1: Listing S3 Partitions and TAR Indexes ===")
    s3 = boto3.client("s3", region_name=REGION, config=Config(signature_version=UNSIGNED))

    # Check 2022/2023 partitions in metadata/parquet/
    sample_prefix = "metadata/parquet/year=2022/"
    res = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix=sample_prefix, Delimiter="/", MaxKeys=20)
    courts_2022 = [p.get("Prefix") for p in res.get("CommonPrefixes", [])]
    print(f"Sample court prefixes in 2022: {courts_2022[:5]}")

    # Check metadata/tar/ structure
    tar_res = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix="metadata/tar/", MaxKeys=10)
    tar_indices = [obj["Key"] for obj in tar_res.get("Contents", [])]
    print(f"Sample tar index keys: {tar_indices[:3]}")

    # Check data/tar/ structure
    data_tar_res = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix="data/tar/", MaxKeys=10)
    data_tars = [obj["Key"] for obj in data_tar_res.get("Contents", [])]
    print(f"Sample data tar keys: {data_tars[:3]}")

    return s3

def query_duckdb_pilot_metrics():
    print("\n=== Step 2: Querying Real Metadata via DuckDB httpfs ===")
    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs;")
    con.execute(f"SET s3_region='{REGION}';")
    con.execute("SET s3_use_ssl=true;")
    con.execute("SET s3_url_style='path';")
    con.execute("SET s3_access_key_id='';")
    con.execute("SET s3_secret_access_key='';")

    # Let's find Madras (33_10), Karnataka (29_3), Delhi (7_26) in 2022
    s3 = boto3.client("s3", region_name=REGION, config=Config(signature_version=UNSIGNED))
    
    # Check Madras: court code for Madras is usually 33_10 or madras
    madras_res = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix="metadata/parquet/year=2022/court=33_10/", MaxKeys=10)
    madras_files = [f"s3://{BUCKET_NAME}/{obj['Key']}" for obj in madras_res.get("Contents", []) if obj['Key'].endswith('.parquet')]
    
    if not madras_files:
        # Fallback to search any 2022 files
        print("Looking for any 2022 parquet files...")
        res_any = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix="metadata/parquet/year=2022/", MaxKeys=5)
        for obj in res_any.get("Contents", []):
            if obj['Key'].endswith('.parquet'):
                madras_files.append(f"s3://{BUCKET_NAME}/{obj['Key']}")

    print(f"Selected target parquet files: {madras_files[:2]}")

    target_file = madras_files[0] if madras_files else 's3://indian-high-court-judgments/metadata/parquet/year=1950/court=19_16/bench=calcutta_original_side/metadata.parquet'

    # Schema introspection
    desc = con.execute(f"DESCRIBE SELECT * FROM read_parquet('{target_file}')").fetchall()
    columns_info = []
    for col_name, col_type, col_null, _, _, _ in desc:
        columns_info.append({"column": col_name, "type": col_type, "nullable": col_null})

    # Read records & compute null rates
    df = con.execute(f"SELECT * FROM read_parquet('{target_file}') LIMIT 500").df()
    total_sample = len(df)
    null_rates = (df.isnull().sum() / total_sample).to_dict()

    print(f"\nAnalyzed {total_sample} rows from {target_file}:")
    for col, rate in null_rates.items():
        print(f"  {col:<25}: Null Rate = {rate:.1%}")

    # Check unique keys / duplicate rate on (cnr, decision_date)
    dup_cnr_date = df.duplicated(subset=['cnr', 'decision_date']).sum()
    dup_rate = dup_cnr_date / total_sample if total_sample > 0 else 0
    print(f"\nDuplicate rate on (cnr, decision_date): {dup_rate:.2%} ({dup_cnr_date}/{total_sample})")

    # Sample records
    sample_records = df.head(3).to_dict(orient="records")

    result = {
        "verified_at": "2026-11-23",
        "sample_parquet_url": target_file,
        "sample_rows_analyzed": total_sample,
        "duplicate_rate_cnr_decision_date": dup_rate,
        "null_rates": null_rates,
        "columns": columns_info,
        "sample_records": sample_records,
    }

    # Case Details check
    cd_res = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix="metadata/parquet_case_details/", MaxKeys=3)
    cd_files = [f"s3://{BUCKET_NAME}/{obj['Key']}" for obj in cd_res.get("Contents", []) if obj['Key'].endswith('.parquet')]
    if cd_files:
        cd_file = cd_files[0]
        desc_cd = con.execute(f"DESCRIBE SELECT * FROM read_parquet('{cd_file}')").fetchall()
        result["case_details_columns"] = [{"column": c[0], "type": c[1]} for c in desc_cd]
        print(f"\nCase Details Columns in {cd_file}: {[c[0] for c in desc_cd]}")

    return result

def main():
    os.makedirs("config", exist_ok=True)
    os.makedirs("docs", exist_ok=True)

    inspect_s3()
    metrics = query_duckdb_pilot_metrics()

    out_path = "config/schema.discovered.json"
    with open(out_path, "w") as f:
        json.dump(metrics, f, indent=2, default=str)
    print(f"\nSaved empirical schema to {out_path}!")

if __name__ == "__main__":
    main()
