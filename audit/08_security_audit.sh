#!/usr/bin/env bash
set -uo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BASE_DIR"

export PATH="/Users/apple/.nvm/versions/node/v24.11.1/bin:$PATH"

REPORT_FILE="audit/security_compliance_report.json"
echo "Running Security & Compliance Audit..."

# 1. npm audit
NPM_AUDIT_OUT=$(cd web && npm audit --json 2>/dev/null || true)

# 2. Check innerHTML in web/src
INNER_HTML_HITS=$(grep -rn "dangerouslySetInnerHTML\|innerHTML" web/src/ || true)

# 3. Check compliance files
COMPLIANCE_FILES=()
for f in LICENSE LICENSE.md NOTICE THIRD_PARTY.md docs/TAKEDOWN.md docs/PRIVACY.md docs/SECURITY_PRIVACY.md; do
  if [ -f "$f" ]; then
    COMPLIANCE_FILES+=("$f: PRESENT")
  else
    COMPLIANCE_FILES+=("$f: MISSING")
  fi
done

# 4. Check CSP in web/index.html
CSP_META=$(grep -i "Content-Security-Policy" web/index.html || true)

# 5. Secret scan for API keys or private tokens
SECRET_SCAN=$(grep -rnE "(AIza[0-9A-Za-z\\-_]{35}|sk-[a-zA-Z0-9]{48}|ghp_[a-zA-Z0-9]{36})" web/src/ pipeline/ config/ || true)

# 6. Key storage inspection
KEY_STORAGE=$(grep -rnE "(localStorage|sessionStorage)\.setItem\(['\"][a-zA-Z0-9_-]*(key|token|api)" web/src/ || true)

cat <<EOF > "$REPORT_FILE"
{
  "compliance_files": [
$(printf '    "%s",\n' "${COMPLIANCE_FILES[@]}" | sed '$ s/,$//')
  ],
  "inner_html_usages": [
$(if [ -n "$INNER_HTML_HITS" ]; then echo "$INNER_HTML_HITS" | sed 's/"/\\"/g' | sed 's/^/    "/; s/$/",/' | sed '$ s/,$//'; fi)
  ],
  "csp_header_present": $(if [ -n "$CSP_META" ]; then echo "true"; else echo "false"; fi),
  "csp_content": "$(echo "$CSP_META" | sed 's/"/\\"/g')",
  "hardcoded_secrets_found": $(if [ -n "$SECRET_SCAN" ]; then echo "true"; else echo "false"; fi),
  "hardcoded_secrets": [
$(if [ -n "$SECRET_SCAN" ]; then echo "$SECRET_SCAN" | sed 's/"/\\"/g' | sed 's/^/    "/; s/$/",/' | sed '$ s/,$//'; fi)
  ],
  "key_storage_references": [
$(if [ -n "$KEY_STORAGE" ]; then echo "$KEY_STORAGE" | sed 's/"/\\"/g' | sed 's/^/    "/; s/$/",/' | sed '$ s/,$//'; fi)
  ]
}
EOF

echo "Security & compliance audit written to $REPORT_FILE"
