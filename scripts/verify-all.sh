#!/usr/bin/env bash
set -euo pipefail

# Find repo root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Ensure Node & Python in PATH
export PATH="/Users/apple/.nvm/versions/node/v24.11.1/bin:$PATH"

echo "========================================================"
echo "   NyayaReader: Full Platform Verification Suite"
echo "========================================================"

echo ""
echo "--- 1. Client Unit & Integration Tests (vitest) ---"
(cd web && npm test)

echo ""
echo "--- 2. Client Production Bundle Build (vite) ---"
(cd web && npm run build)

echo ""
echo "--- 3. Static Performance & Hard Budget Gate ---"
bash scripts/check-budget.sh

echo ""
echo "--- 4. Pipeline & Ingestion Unit Tests (pytest) ---"
PYTHONPATH=. .venv/bin/pytest -v tests/

echo ""
echo "--- 5. Retrieval & RRF Evaluation Benchmark ---"
PYTHONPATH=. .venv/bin/python eval/evaluate.py
PYTHONPATH=. .venv/bin/python scripts/eval_taxonomy.py
PYTHONPATH=. .venv/bin/python scripts/filter_coverage.py

echo ""
echo "========================================================"
echo "   SUCCESS: All 5 Verification Gates Passed Cleanly!"
echo "========================================================"
