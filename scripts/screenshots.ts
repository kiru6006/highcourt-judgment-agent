import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../web/dist');
const OUTPUT_DIR = path.resolve(__dirname, '../docs/assets/screenshots');

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html': return 'text/html';
    case '.js': return 'application/javascript';
    case '.css': return 'text/css';
    case '.json': return 'application/json';
    case '.gz': return 'application/gzip';
    case '.png': return 'image/png';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

async function startServer(port: number): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    let reqPath = req.url?.split('?')[0] || '/';
    // Strip Vite base href if present
    if (reqPath.startsWith('/highcourt-judgment-agent')) {
      reqPath = reqPath.replace(/^\/highcourt-judgment-agent/, '');
    }
    if (!reqPath || reqPath === '') {
      reqPath = '/';
    }

    let filePath = path.join(DIST_DIR, reqPath);
    // Handle SPA fallback for routes like /search, /case/...
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    try {
      const content = fs.readFileSync(filePath);
      res.setHeader('Content-Type', getMimeType(filePath));
      res.writeHead(200);
      res.end(content);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const port = 4173;
  const server = await startServer(port);
  const baseUrl = `http://localhost:${port}/highcourt-judgment-agent`;
  console.log(`Preview server listening at ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  try {
    // 1. Search Screen
    console.log('Capturing Search Screen...');
    await page.goto(`${baseUrl}/search`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[type="text"]');
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('quash FIR section 482');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-search.png'), fullPage: false });
    console.log('Saved 01-search.png');

    // 2. Judgment Reader Screen
    console.log('Capturing Judgment Reader Screen...');
    await page.goto(`${baseUrl}/case/HCMA01-CRL-OP-2022-101`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-reader.png'), fullPage: false });
    console.log('Saved 02-reader.png');

    // 3. AI Copilot Citation Chip View
    console.log('Capturing AI Copilot Screen...');
    const copilotBtn = page.locator('button:has-text("Ask Copilot"), button:has-text("AI Copilot"), button:has-text("Copilot")').first();
    if (await copilotBtn.isVisible()) {
      await copilotBtn.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03-copilot.png'), fullPage: false });
    console.log('Saved 03-copilot.png');

  } finally {
    await browser.close();
    server.close();
  }

  console.log('All screenshots captured successfully.');
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
