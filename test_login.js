const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
      console.log('PAGE LOG:', msg.text());
  });
  
  page.on('pageerror', error => {
      console.log('\n=== PAGE ERROR ===\n', error.message, '\n==================\n');
  });

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  
  await page.type('input[type="email"]', 'donor@bc.com'); 
  await page.type('input[type="password"]', 'Test@123');
  
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(e => console.log('Navigation timeout or already triggered'));
  
  await new Promise(r => setTimeout(r, 2000));
  
  const ls = await page.evaluate(() => {
    return localStorage.getItem('accessToken');
  });
  console.log('--- LOCAL_STORAGE_TOKEN ---', ls);
  
  await browser.close();
})();
