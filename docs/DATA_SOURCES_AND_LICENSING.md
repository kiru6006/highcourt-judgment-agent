# Data Sources, Licensing & Legal Attribution

## 1. Upstream Data Source
Nyaya AI Reader utilizes the open-access Indian High Court Judgments dataset curated and maintained by Vanga:
- **Repository**: `https://github.com/vanga/indian-high-court-judgments`
- **AWS Open Data Registry**: `s3://indian-high-court-judgments` (AWS Region: `ap-south-1`, anonymous access permitted).
- **Format**:
  - `metadata/parquet/` & `metadata/parquet_case_details/`: Tabular case metadata.
  - `metadata/tar/`: Tar archive indices.
  - `data/tar/`: Raw judgment/order PDF archives.
- **Upstream Volume**: Over 17.8 million judgments and orders spanning 25 High Courts (~1.25 TiB). *Note: Upstream dataset expands on a daily sync cycle; empirical counts measured live in Phase 2.*

---

## 2. Dataset Licensing & Mandatory Attribution
The underlying dataset is licensed under **Creative Commons Attribution 4.0 International (CC-BY-4.0)**.

### Mandatory Attribution Notice:
Under Section 3(a) of CC-BY-4.0, every view, exported document, and metadata catalog must provide clear attribution.

**Standard Footer Attribution (Enforced across all pages and exports)**:
> *"Data: Indian High Court Judgments, CC-BY-4.0, source eCourts. Not legal advice. Verify against the certified copy."*

The `/about-data` route provides full source details, links to the upstream repository, and links to the AWS Open Data Registry.

---

## 3. Indian Copyright Act Reliance
Under Section 52(1)(q) of the Indian Copyright Act, 1957, the reproduction or publication of any judgment or order of a court, tribunal, or other judicial authority does not constitute an infringement of copyright, provided such reproduction is not expressly prohibited by the court.

> **[IMPORTANT] OPEN ITEM FOR COUNSEL REVIEW**:
> *Confirm application of Section 52(1)(q) to parsed text and automated extractive summaries across state High Courts. — Owner: counsel.*

---

## 4. Hosting Platform Restrictions (GitHub Pages Terms of Service)
- **The Issue**: GitHub Pages Terms of Service explicitly prohibit using GitHub Pages for commercial SaaS, payment processing, or running business applications.
- **The Stance**: Nyaya AI Reader is deployed on GitHub Pages strictly as an **open-access, free educational and non-commercial public research platform**.
- **Commercial Migration Path**: If commercial monetization, paid API keys, or private advocate tiers are introduced in future phases, the frontend and shard artifacts must migrate off GitHub Pages to Cloudflare Pages, Vercel, or AWS S3 + CloudFront as specified in `docs/PRODUCTION_MIGRATION.md`.

---

## 5. Third-Party Software License Audit Plan
All dependencies utilized across the repository must conform to open-source licensing standards:
- **Permitted Licenses**: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC.
- **Prohibited Licenses**: AGPL-3.0, GPL-3.0 (for client bundle distribution).
- **Automated Verification**: `npm run verify` runs `license-checker` in CI to guarantee that no copyleft or incompatible dependencies are packaged into client distribution artifacts. A generated `THIRD_PARTY.md` ledger will be maintained and updated in Phase 10.
