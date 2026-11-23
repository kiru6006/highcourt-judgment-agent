# Nyaya AI Reader Production Migration Playbook
**Version 1.0 — Architecture & Runbook for Scaling Beyond GitHub Pages Limits**

---

## 1. Executive Summary & Migration Drivers

GitHub Pages serves as Nyaya AI Reader's zero-cost, static-first hosting platform for the 30,000 judgment pilot. However, GitHub Pages imposes two hard physical constraints:
1. **Repository / Site Size Limit**: 1 GB maximum repository size, 500 MB recommended Pages artifact.
2. **Monthly Bandwidth Soft Limit**: 100 GB/month.

When scaling Nyaya AI Reader to the full **3,000,000+ judgment pan-India corpus** across all 25 High Courts (estimated ~6.8 GB compressed text shards and ~1.2 GB quantized vector shards), the static shards must be offloaded to an enterprise object storage and edge CDN tier.

Crucially, **no application architecture rewrite is needed**. Because Nyaya AI Reader is 100% client-side (search engine in Web Workers, vector dot-products in JS, doc loading over HTTP), scaling requires only re-pointing the base shard URL.

---

## 2. Target Production Architecture

```
                                    +-----------------------------------------+
                                    |         Advocate Browser Client         |
                                    |   (React 18 + Vite + MiniSearch SPA)    |
                                    +-------------------+---------------------+
                                                        |
                                +-----------------------+-----------------------+
                                | Fetch HTML/JS Assets  | Fetch Shards / Binary  |
                                v                       v
                +-------------------------------+ +-------------------------------+
                |  Static Web Asset Edge (CDN)  | |  Object Storage Shard Tier    |
                |  (Cloudflare Pages / S3)      | |  (Cloudflare R2 / AWS S3)     |
                |  - HTML / JS / CSS            | |  - search-*.json.gz           |
                |  - manifest.json              | |  - docs-*.json.gz             |
                |  - Web Worker bundles         | |  - vectors-*.bin              |
                +-------------------------------+ +-------------------------------+
```

---

## 3. Option Comparison Matrix

| Provider & Topology | Storage Cost (10 GB) | Egress Cost (1 TB/mo) | HTTP Range Support | Edge POPs in India |
| :--- | :--- | :--- | :--- | :--- |
| **Cloudflare Pages + R2** *(Recommended)* | \$0.15 / month | **\$0.00 (Zero Egress)** | **Native** | BOM, DEL, MAA, BLR, CCU, HYD |
| **AWS S3 + CloudFront** | \$0.23 / month | ~\$85.00 / month | Native | Mumbai, Chennai, Delhi, Hyderabad |
| **Self-Hosted Docker + Nginx** | VPS cost (\$10–\$20) | VPS bandwidth pool | Configured | Dependent on VPS datacenter |

---

## 4. Option A: Cloudflare Pages + Cloudflare R2 (Recommended)

### Step 1: Create R2 Bucket & CORS Configuration
Create an R2 bucket named `nyayareader-production-shards`. Enable CORS so the client SPA can fetch shards with byte ranges:

```json
[
  {
    "AllowedOrigins": [
      "https://nyayareader.org",
      "https://*.pages.dev",
      "http://localhost:5173"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Range", "Accept-Encoding", "Content-Type"],
    "ExposeHeaders": ["Content-Length", "Content-Range", "ETag"],
    "MaxAgeSeconds": 86400
  }
]
```

### Step 2: Sync Production Shards to R2 via Wrangler / rclone
```bash
# Sync generated shards from GitHub Actions runner
npx wrangler r2 object put nyayareader-production-shards/manifest.json --file=data/shards/manifest.json
rclone sync data/shards/ r2:nyayareader-production-shards/
```

### Step 3: Terraform / OpenTofu Infrastructure Definition
```hcl
resource "cloudflare_r2_bucket" "shards_bucket" {
  account_id = var.cloudflare_account_id
  name       = "nyayareader-production-shards"
  location   = "APAC"
}

resource "cloudflare_pages_project" "nyayareader_web" {
  account_id        = var.cloudflare_account_id
  name              = "nyayareader"
  production_branch = "main"

  build_config {
    build_command       = "cd web && npm install && npm run build"
    destination_dir     = "web/dist"
    root_dir            = ""
  }

  deployment_configs {
    production {
      environment_variables = {
        VITE_DATA_BASE_URL = "https://shards.nyayareader.org"
      }
    }
  }
}
```

---

## 5. Option B: AWS S3 + CloudFront CDN

### Terraform Configuration (`aws_infra.tf`)
```hcl
resource "aws_s3_bucket" "shards" {
  bucket = "nyayareader-court-shards"
}

resource "aws_s3_bucket_cors_configuration" "shards_cors" {
  bucket = aws_s3_bucket.shards.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["https://nyayareader.org"]
    expose_headers  = ["Content-Range", "Content-Length", "ETag"]
    max_age_seconds = 86400
  }
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name              = aws_s3_bucket.shards.bucket_regional_domain_name
    origin_id                = "S3-nyayareader-shards"
    origin_access_control_id = aws_cloudfront_origin_access_control.default.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "manifest.json"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-nyayareader-shards"

    forwarded_values {
      query_string = false
      headers      = ["Range", "Origin"]
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  price_class = "PriceClass_200" # Includes India, APAC, Europe, US
}
```

---

## 6. Option C: Self-Hosted Nginx Configuration

If deploying inside an on-premise High Court intranet or private enterprise data center:

```nginx
server {
    listen 80;
    server_name nyayareader.internal;
    root /var/www/nyayareader/web/dist;
    index index.html;

    # Gzip Pre-compressed Shards
    gzip_static on;
    gzip_http_version 1.1;
    gzip_proxied any;
    gzip_vary on;

    # SPA Fallback Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static Shard Storage with Range Support & Cache Headers
    location /data/shards/ {
        alias /var/data/nyayareader/shards/;
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, HEAD, OPTIONS';
        add_header Access-Control-Allow-Headers 'Range, Accept-Encoding';
        add_header Access-Control-Expose-Headers 'Content-Range, Content-Length';
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 7. Zero-Downtime Client Switch

To switch the client application between local GitHub Pages and production CDN:
1. Set `VITE_DATA_BASE_URL=https://shards.nyayareader.org` in build environment.
2. In `web/src/constants/app.constants.ts`, the application defaults to relative path `/data-sample/` in dev, or `import.meta.env.VITE_DATA_BASE_URL` in production.
3. Deploy frontend bundle. Zero client-side downtime or data migration required.
