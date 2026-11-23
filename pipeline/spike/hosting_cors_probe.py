#!/usr/bin/env python3
"""
Hosting and Browser CORS Matrix Probe for NyayaReader
Tests CORS headers, HTTP Range requests, and latency across:
1. GitHub Pages same-origin
2. jsDelivr CDN
3. GitHub Release Asset direct downloads
4. AWS S3 direct anonymous access
"""

import json
import sys
import requests

def test_host(name, url, range_header=None):
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"}
    if range_header:
        headers["Range"] = range_header

    print(f"\n--- Testing Host: {name} ---")
    print(f"URL: {url}")
    try:
        resp = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        cors_header = resp.headers.get("access-control-allow-origin", "MISSING")
        range_support = "bytes" in resp.headers.get("accept-ranges", "") or resp.status_code == 206
        content_len = resp.headers.get("content-length", str(len(resp.content)))
        
        print(f"Status Code     : {resp.status_code}")
        print(f"CORS Header     : {cors_header}")
        print(f"Range Support   : {range_support}")
        print(f"Content Length  : {content_len} bytes")
        print(f"Latency         : {resp.elapsed.total_seconds():.3f}s")
        print(f"Final URL       : {resp.url}")

        browser_cors_ok = cors_header == "*" or "github.io" in cors_header or "same-origin" in name.lower()

        return {
            "name": name,
            "url": url,
            "status_code": resp.status_code,
            "cors_header": cors_header,
            "browser_cors_supported": browser_cors_ok,
            "range_supported": range_support,
            "latency_sec": round(resp.elapsed.total_seconds(), 3),
            "notes": "OK" if resp.status_code in [200, 206] else f"HTTP {resp.status_code}"
        }
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return {
            "name": name,
            "url": url,
            "status_code": 0,
            "cors_header": "ERROR",
            "browser_cors_supported": False,
            "range_supported": False,
            "latency_sec": 0,
            "notes": str(e)
        }

def run_hosting_tests():
    hosts_to_test = [
        # 1. GitHub Pages
        ("GitHub Pages (Same-Origin)", "https://kiru6006.github.io/highcourt-judgment-agent/", None),
        # 2. jsDelivr CDN
        ("jsDelivr CDN (Data Branch)", "https://cdn.jsdelivr.net/gh/kiru6006/highcourt-judgment-agent@main/README.md", "bytes=0-1024"),
        # 3. GitHub Release Asset simulation (GitHub tag release download)
        ("GitHub Release Asset", "https://github.com/kiru6006/highcourt-judgment-agent/releases/download/phase-1/release.json", None),
        # 4. AWS S3 Direct Anonymous
        ("AWS S3 Direct (ap-south-1)", "https://indian-high-court-judgments.s3.ap-south-1.amazonaws.com/court-codes.json", "bytes=0-512")
    ]

    results = []
    for name, url, r_header in hosts_to_test:
        res = test_host(name, url, range_header=r_header)
        results.append(res)

    with open("config/hosting_matrix.discovered.json", "w") as f:
        json.dump(results, f, indent=2)
    print("\nSaved config/hosting_matrix.discovered.json!")
    return results

if __name__ == "__main__":
    run_hosting_tests()
