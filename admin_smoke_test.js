const puppeteer = require('puppeteer');

(async () => {
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

  await page.goto('http://localhost:3000/admin-login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'syedsaqulainhaider313@gmail.com');
  await page.type('input[autocomplete="current-password"]', '@Syedbloodconnect#');

  const inputs = await page.$$('input');
  const keyInput = inputs[inputs.length - 1];
  await keyInput.type('8df1c93b1f0902c919617e7d8ca0c471197551603af7247738b4e394301e9260');

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
