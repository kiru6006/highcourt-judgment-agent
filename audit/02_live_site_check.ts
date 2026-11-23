import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LIVE_URL = 'https://kiru6006.github.io/highcourt-judgment-agent';
const REPORT_PATH = path.resolve(__dirname, 'live_site_report.json');

interface RouteAudit {
  route: string;
  viewport: { width: number; height: number };
  status: number;
  consoleErrors: string[];
  footerAttributionFound: boolean;
  pageTitle: string;
  loadTimeMs: number;
}

async function run() {
  console.log(`Auditing live deployment at ${LIVE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const results: { routes: RouteAudit[]; deepLinkRefreshOk: boolean; aboutDataPresent: boolean } = {
    routes: [],
    deepLinkRefreshOk: false,
    aboutDataPresent: false,
  };

  const viewports = [
    { width: 1440, height: 900, name: 'desktop' },
    { width: 375, height: 667, name: 'mobile' }
  ];

  const testRoutes = [
    '/',
    '/search',
    '/case/HCMA01-CRL-OP-2022-101',
    '/links',
    '/folders',
    '/about-data',
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });

    for (const r of testRoutes) {
      const page = await context.newPage();
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const fullUrl = `${LIVE_URL}/#${r}`;
      const startTime = Date.now();
      let status = 200;

      try {
        const resp = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
        status = resp?.status() || 200;
      } catch (err: any) {
        consoleErrors.push(`Navigation error: ${err.message}`);
        status = 500;
      }

      const loadTimeMs = Date.now() - startTime;
      const content = await page.content();
      const footerAttributionFound = content.includes('CC-BY-4.0') || content.includes('eCourts') || content.includes('Indian Kanoon');
      const pageTitle = await page.title();

      results.routes.push({
        route: r,
        viewport: { width: vp.width, height: vp.height },
        status,
        consoleErrors,
        footerAttributionFound,
        pageTitle,
        loadTimeMs,
      });

      if (r === '/about-data' && status === 200) {
        results.aboutDataPresent = true;
      }

      await page.close();
    }

    await context.close();
  }

  // Deep-link test with direct URL reload (without hash or with HTML5 path)
  const directContext = await browser.newContext();
  const directPage = await directContext.newPage();
  try {
    const directResp = await directPage.goto(`${LIVE_URL}/case/HCMA01-CRL-OP-2022-101`, { waitUntil: 'load', timeout: 15000 });
    // GitHub pages returns 404 for subpath unless 404.html redirects to index.html
    const finalUrl = directPage.url();
    results.deepLinkRefreshOk = !finalUrl.includes('404') && (directResp?.status() === 200 || directResp?.status() === 304);
  } catch {
    results.deepLinkRefreshOk = false;
  }
  await directContext.close();

  await browser.close();

  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));
  console.log(`Live site audit complete. Results saved to ${REPORT_PATH}`);
}

run().catch((err) => {
  console.error('Live audit error:', err);
  process.exit(1);
});
