const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    try {
        console.log("Starting Chrome for full screenshot suite...");
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        // Ensure directory exists
        const dir = path.join(__dirname, 'screenshots');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);

        // API MOCKING
        await page.setRequestInterception(true);
        page.on('request', req => {
            const url = req.url();
            if (url.includes('/api/v1/')) {
                req.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ 
                        success: true, 
                        data: { 
                            // Common stats
                            stats: { users: 1540, requests: 850, donors: 1200, critical: 15, totalDonations: 4500, activeDonors: 850, collections: { A_Pos: 200, O_Pos: 150 }, newDonors: 45 },
                            camps: [{_id: "1", name: "City Hospital Drive", location: "Downtown", date: "2026-08-15"}],
                            timeline: [],
                            summary: "System Health Excellent",
                            users: 1540, totalCamps: 12, totalAdmins: 4, 
                            collections:{A_Pos:850,O_Pos:1200,B_Pos:600}, 
                            donationsList: [], 
                            recentActivities: [],  
                            overallUptime: '99.99%', 
                            activeTokens: 125, activeSessions: 85, 
                            loadAverage: [0.15, 0.22, 0.18], 
                            freeMemory: '4.2GB', apiLatency: '15ms', uptime:1234567,
                            
                            // Receiver Wallet specific
                            impactScore: 1250, badges: 4, streak: 8, lifebloodPoints: 850, nextEligibility: "Ready", fitnessScore: 92,
                            wallet: { impactScore: 1250, badges: 4, streak: 8, lifebloodPoints: 850, nextEligibility: "Ready", fitnessScore: 92 },
                            receivedLogs: [],

                            // Admin specific
                            bloodBankStatus: { status: 'Optimal', capacity: '78%' },
                            revenue: { total: 45000, monthly: 5000 },
                            alerts: [],

                            // Auth Me
                            user: { _id: "mock123", name: "Mock User", email: "mock@test.com", role: "donor" }
                        }
                    })
                });
            } else {
                req.continue();
            }
        });

        const takeScreenshot = async (name, waitTime = 2000) => {
            await new Promise(r => setTimeout(r, waitTime));
            const p = path.join(dir, name + '.png');
            await page.screenshot({ path: p });
            console.log(`Captured: ${name}.png`);
        };

        const clickTab = async (tabName) => {
            await page.evaluate((name) => {
                const elements = Array.from(document.querySelectorAll('button, div, span, a'));
                const el = elements.find(e => e.textContent && e.textContent.trim() === name);
                if(el) el.click();
            }, tabName);
        };

        // ─── PUBLIC PAGES ───
        console.log("Navigating to Home...");
        await page.goto('http://127.0.0.1:3000/');
        await page.evaluate(() => localStorage.clear());
        await takeScreenshot('01_home');

        console.log("Navigating to Register...");
        await page.goto('http://127.0.0.1:3000/register');
        await takeScreenshot('02_register');

        console.log("Navigating to Login...");
        await page.goto('http://127.0.0.1:3000/login');
        await takeScreenshot('03_login');

        // ─── DONOR DASHBOARD ───
        console.log("Setting up Donor Auth...");
        await page.goto('http://127.0.0.1:3000/');
        await page.evaluate(() => {
            localStorage.setItem('accessToken', 'mock-token');
            localStorage.setItem('donor_test', 'true');
        });
        await page.goto('http://127.0.0.1:3000/dashboard');
        await takeScreenshot('04_donor_dashboard', 3000);
        
        await clickTab("Blood Requests");
        await takeScreenshot('05_donor_requests', 1500);

        await clickTab("Nearby Donors");
        await takeScreenshot('06_donor_donors', 1500);

        await clickTab("Blood Camps");
        await takeScreenshot('07_donor_camps', 1500);

        await clickTab("Secure Chat");
        await takeScreenshot('08_chat', 1500);

        // ─── RECEIVER DASHBOARD ───
        console.log("Setting up Receiver Auth...");
        await page.goto('http://127.0.0.1:3000/');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('accessToken', 'mock-token');
            localStorage.setItem('receiver_test', 'true');
        });
        await page.goto('http://127.0.0.1:3000/dashboard');
        
        // Ensure on Receiver Dashboard tab
        await clickTab("Receiver Dashboard");
        await takeScreenshot('09_receiver_dashboard', 3000);

        await clickTab("My Requests");
        await takeScreenshot('10_receiver_requests', 1500);

        await clickTab("Find Donors");
        await takeScreenshot('11_receiver_donors', 1500);

        await clickTab("My Wallet");
        await takeScreenshot('12_receiver_wallet', 1500);

        await clickTab("Analytics");
        await takeScreenshot('13_receiver_analytics', 1500);

        // ─── ADMIN DASHBOARD ───
        console.log("Setting up Admin Auth...");
        await page.goto('http://127.0.0.1:3000/');
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('accessToken', 'mock-token');
            localStorage.setItem('admin_test', 'true');
        });
        await page.goto('http://127.0.0.1:3000/dashboard');

        await clickTab("Admin Dashboard");
        await takeScreenshot('14_admin_dashboard', 3000);

        await clickTab("User Management");
        await takeScreenshot('15_admin_users', 1500);

        await clickTab("Blood Inventory");
        await takeScreenshot('16_admin_inventory', 1500);

        await clickTab("System Health");
        await takeScreenshot('17_admin_health', 1500);

        await clickTab("Revenue & Donations");
        await takeScreenshot('18_admin_revenue', 1500);

        await browser.close();
        console.log("All screenshots captured successfully!");
    } catch (err) {
        console.error("Error capturing screenshots:", err);
    }
})();
