import http from "http";

const loginData = JSON.stringify({ email: "testuser@email.com", password: "password123" });

const reqOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
    }
};

const req = http.request(reqOptions, (res) => {
    let rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(rawData);

            const token = parsed.accessToken || (parsed.data && parsed.data.accessToken) || (parsed.user && parsed.user.accessToken) || parsed.token || (parsed.data && parsed.data.token) || (parsed.user && parsed.user.token);
            if (!token) {
                console.error("Login failed, no token found. Response was:\n" + JSON.stringify(parsed, null, 2));
                process.exit(1);
            }
            console.log("Logged in successfully. Seeding camps...");

            const camps = [
                {
                    name: "City Central Blood Drive",
                    organizer: "Red Cross Society",
                    date: "2026-03-15",
                    time: "09:00 AM - 04:00 PM",
                    location: "Central Park Community Hall",
                },
                {
                    name: "University Mega Camp",
                    organizer: "Student Union",
                    date: "2026-03-22",
                    time: "10:00 AM - 05:00 PM",
                    location: "Main Campus Auditorium",
                },
                {
                    name: "Tech Park Donation Drive",
                    organizer: "IT Welfare Association",
                    date: "2026-04-05",
                    time: "09:30 AM - 06:00 PM",
                    location: "Tech Park Block A, Lobby",
                }
            ];

            const seedNext = (index) => {
                if (index >= camps.length) {
                    console.log("All camps seeded!");
                    return;
                }
                const makeReq = http.request({
                    hostname: 'localhost',
                    port: 5000,
                    path: '/api/v1/camps',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }, (cr) => {
                    let d = '';
                    cr.on('data', c => d += c);
                    cr.on('end', () => {
                        console.log(`Seeded camp ${index + 1}:`, d);
                        seedNext(index + 1);
                    });
                });
                makeReq.write(JSON.stringify(camps[index]));
                makeReq.end();
            };

            seedNext(0);

        } catch (e) {
            console.error("Error parsing login response", e.message);
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with login request: ${e.message}`);
});

req.write(loginData);
req.end();
