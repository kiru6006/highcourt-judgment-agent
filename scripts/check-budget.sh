#!/usr/bin/env bash
set -euo pipefail

echo "=== NyayaReader: Performance & Size Budget Enforcement Gate ==="

DIST_DIR="web/dist"
MAX_PAGES_MB=500
MAX_JS_GZ_KB=300
MAX_GIT_SAMPLE_MB=5

if [ ! -d "$DIST_DIR" ]; then
  echo "ERROR: Distribution directory $DIST_DIR does not exist. Run 'npm run build' first."
  exit 1
fi

# 1. Total Pages Artifact Size
TOTAL_KB=$(du -sk "$DIST_DIR" | awk '{print $1}')
TOTAL_MB=$(awk "BEGIN {printf \"%.2f\", $TOTAL_KB / 1024}")
echo "-> Total Pages Artifact Size: ${TOTAL_MB} MB (Limit: ${MAX_PAGES_MB} MB)"

if (( $(echo "$TOTAL_MB > $MAX_PAGES_MB" | bc -l) )); then
  echo "FAIL: Total Pages artifact (${TOTAL_MB} MB) exceeds limit of ${MAX_PAGES_MB} MB!"
  exit 1
fi

# 2. Main Bundle Gzipped Size
LARGEST_JS_GZ_KB=0
for js in "$DIST_DIR"/assets/*.js; do
  if [ -f "$js" ]; then
    GZ_SIZE=$(gzip -c "$js" | wc -c)
    GZ_KB=$(awk "BEGIN {printf \"%.2f\", $GZ_SIZE / 1024}")
    echo "   Asset: $(basename "$js") -> ${GZ_KB} KB (gzip)"
    if (( $(echo "$GZ_KB > $LARGEST_JS_GZ_KB" | bc -l) )); then
      LARGEST_JS_GZ_KB=$GZ_KB
    fi
  fi
done

echo "-> Largest JavaScript Asset: ${LARGEST_JS_GZ_KB} KB gzipped (Limit: ${MAX_JS_GZ_KB} KB)"
if (( $(echo "$LARGEST_JS_GZ_KB > $MAX_JS_GZ_KB" | bc -l) )); then
  echo "FAIL: JS asset size (${LARGEST_JS_GZ_KB} KB gz) exceeds budget of ${MAX_JS_GZ_KB} KB!"
  exit 1
fi

# 3. Git sample data check
if [ -d "web/public/data-sample" ]; then
  SAMPLE_KB=$(du -sk "web/public/data-sample" | awk '{print $1}')
  SAMPLE_MB=$(awk "BEGIN {printf \"%.2f\", $SAMPLE_KB / 1024}")
  echo "-> Git sample data: ${SAMPLE_MB} MB (Limit: ${MAX_GIT_SAMPLE_MB} MB)"
  if (( $(echo "$SAMPLE_MB > $MAX_GIT_SAMPLE_MB" | bc -l) )); then
    echo "FAIL: Sample data (${SAMPLE_MB} MB) exceeds ${MAX_GIT_SAMPLE_MB} MB limit!"
    exit 1
  fi
fi

echo "SUCCESS: All size and performance budgets passed!"
