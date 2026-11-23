import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.resolve(__dirname, '../docs/assets/social-preview.png');

async function run() {
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%);
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 64px 80px;
      position: relative;
      overflow: hidden;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.4);
      color: #38bdf8;
      font-size: 16px;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 9999px;
      width: fit-content;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .title-group {
      margin-top: 24px;
    }
    h1 {
      font-size: 64px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      background: linear-gradient(to right, #ffffff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    h1 span {
      background: linear-gradient(to right, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p.tagline {
      font-size: 24px;
      color: #94a3b8;
      margin-top: 16px;
      max-width: 900px;
      line-height: 1.4;
      font-weight: 400;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-top: 32px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 24px 32px;
    }
    .stat-item h3 {
      font-size: 32px;
      font-weight: 700;
      color: #38bdf8;
    }
    .stat-item p {
      font-size: 14px;
      color: #64748b;
      margin-top: 4px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 24px;
      font-size: 16px;
      color: #64748b;
    }
    .footer strong {
      color: #e2e8f0;
    }
  </style>
</head>
<body>
  <div>
    <div class="badge">Open-Access Legal Intelligence</div>
    <div class="title-group">
      <h1>NyayaReader <span>(न्याय Reader)</span></h1>
      <p class="tagline">Static-First, Zero-Server Indian High Court Judgment Search & Grounded AI Legal Copilot</p>
    </div>
    <div class="stats-grid">
      <div class="stat-item">
        <h3>100% Static</h3>
        <p>Zero Backend Servers</p>
      </div>
      <div class="stat-item">
        <h3>Hybrid RRF</h3>
        <p>BM25 + int8 Dense Search</p>
      </div>
      <div class="stat-item">
        <h3>Grounded AI</h3>
        <p>Verbatim Quote Verifier</p>
      </div>
      <div class="stat-item">
        <h3>Statute Bridge</h3>
        <p>IPC / CrPC &rarr; BNS / BNSS</p>
      </div>
    </div>
  </div>
  <div class="footer">
    <span>Free & Open Source &bull; CC-BY-4.0 &bull; Built on Indian High Court Open Data</span>
    <span><strong>kiru6006.github.io/highcourt-judgment-agent</strong></span>
  </div>
</body>
</html>
`;

  await page.setContent(html);
  await page.screenshot({ path: OUTPUT_PATH });
  await browser.close();
  console.log(`Generated social preview at ${OUTPUT_PATH}`);
}

run().catch((err) => {
  console.error('Social preview generation failed:', err);
  process.exit(1);
});
