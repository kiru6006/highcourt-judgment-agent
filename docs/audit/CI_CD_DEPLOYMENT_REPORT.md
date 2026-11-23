# NyayaReader / Nyaya AI Reader: CI/CD & Deployment Audit

**Workflows Audited:** `.github/workflows/ci.yml`, `pages.yml`, `nightly.yml`, `pipeline.yml`  

---

## Workflow Status & Verification

1. **`ci.yml`**:
   - Enforces TypeScript strict check, vitest unit tests, vite build, and `check-budget.sh`.
   - Gate status: **HEALTHY**.
2. **`pages.yml`**:
   - Automatically triggers on push to `main`. Deploys client bundle with base path `/highcourt-judgment-agent/`.
   - Gate status: **HEALTHY**.
3. **`nightly.yml`**:
   - Scheduled daily at 02:00 UTC. Executes `pipeline/sync_monitor.py` and `scripts/verify-all.sh`.
   - Finding: Requires secret guard for forks without AWS credentials (`DEF-OPS-01`).
4. **Build Reproducibility**:
   - Clean lockfile builds verified via `npm ci` and Python virtual environment.
