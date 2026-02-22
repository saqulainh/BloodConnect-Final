import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));

    await page.goto('http://localhost:3000/login');
    await page.type('input[type="email"]', 'testuser@email.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log("Logged in, going to requests tab...");
    // Find tab containing "Blood Requests"
    const tabs = await page.$$('button');
    for (const tab of tabs) {
        const text = await page.evaluate(el => el.textContent, tab);
        if (text && text.includes("Blood Requests")) {
            await tab.click();
            break;
        }
    }

    await page.waitForTimeout(2000);
    console.log("Done checking.");
    await browser.close();
})();
