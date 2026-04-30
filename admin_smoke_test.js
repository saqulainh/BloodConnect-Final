const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const loadEnvFile = (envPath) => {
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

(async () => {
  loadEnvFile(path.join(__dirname, 'backend', '.env'));

  const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
  const adminEmail = process.env.SMOKE_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const adminPassword = process.env.SMOKE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  const adminKey =
    process.env.SMOKE_ADMIN_KEY ||
    process.env.ADMIN_SECRET_KEY ||
    process.env.ADMIN_API_KEY;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'Missing admin credentials. Set SMOKE_ADMIN_EMAIL and SMOKE_ADMIN_PASSWORD (or ADMIN_EMAIL and ADMIN_PASSWORD).'
    );
  }

  if (!adminKey) {
    throw new Error(
      'Missing admin key. Set SMOKE_ADMIN_KEY, or define ADMIN_SECRET_KEY/ADMIN_API_KEY in backend/.env.'
    );
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const issues = {
    pageErrors: [],
    consoleErrors: [],
    failedApi: [],
    failedResources: [],
  };

  page.on('pageerror', (e) => issues.pageErrors.push(String(e.message || e)));
  page.on('console', (m) => {
    if (m.type() === 'error') issues.consoleErrors.push(m.text());
  });
  page.on('response', (r) => {
    const u = r.url();
    if (u.includes('/api/v1/') && r.status() >= 400) {
      issues.failedApi.push({ url: u, status: r.status() });
    }
    if (!u.includes('/api/v1/') && r.status() >= 400) {
      issues.failedResources.push({ url: u, status: r.status() });
    }
  });

  await page.goto(`${baseUrl}/admin-login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', adminEmail);
  await page.type('input[autocomplete="current-password"]', adminPassword);

  const inputs = await page.$$('input');
  const keyInput = inputs[inputs.length - 1];
  if (!keyInput) {
    throw new Error('Admin key input not found on /admin-login page.');
  }
  await keyInput.type(adminKey);

  await page.click('button[type="submit"]');
  try {
    await page.waitForFunction(() => window.location.pathname.includes('/dashboard'), { timeout: 30000 });
  } catch {
    await new Promise((r) => setTimeout(r, 4000));
  }

  const clickText = async (text) => {
    await page.evaluate((targetText) => {
      const all = Array.from(document.querySelectorAll('button, a, div, span'));
      const el = all.find((e) => e.textContent && e.textContent.trim() === targetText);
      if (el) el.click();
    }, text);
    await new Promise((r) => setTimeout(r, 1800));
  };

  const tabs = [
    'Admin Dashboard',
    'User Management',
    'Request Ops',
    'Camp Management',
    'System Health',
    'Broadcast',
    'Revenue',
    'Audit Logs',
    'Mission Intel',
    'Donors',
  ];

  for (const tab of tabs) {
    await clickText(tab);
  }

  const uniqueFailedApi = [
    ...new Map(issues.failedApi.map((x) => [`${x.url}|${x.status}`, x])).values(),
  ];
  const uniqueFailedResources = [
    ...new Map(issues.failedResources.map((x) => [`${x.url}|${x.status}`, x])).values(),
  ];

  console.log(
    JSON.stringify({
      url: page.url(),
      pageErrorCount: issues.pageErrors.length,
      consoleErrorCount: issues.consoleErrors.length,
      failedApiCount: issues.failedApi.length,
      failedApiUnique: uniqueFailedApi.slice(0, 30),
      failedResourceCount: issues.failedResources.length,
      failedResourceUnique: uniqueFailedResources.slice(0, 30),
      sampleConsoleErrors: issues.consoleErrors.slice(0, 10),
      samplePageErrors: issues.pageErrors.slice(0, 10),
    })
  );

  await browser.close();
})();
