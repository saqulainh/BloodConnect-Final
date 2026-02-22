const fs = require('fs');
const investigateRequests = async () => {
    try {
        const loginRes = await fetch("http://localhost:5000/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "testuser@email.com", password: "password123" })
        });
        const loginData = await loginRes.json();
        const token = loginData.data.accessToken;

        const reqRes = await fetch("http://localhost:5000/api/v1/requests", {
            headers: { Authorization: "Bearer " + token }
        });
        const reqData = await reqRes.json();
        fs.writeFileSync("req.json", JSON.stringify(reqData, null, 2));
        console.log("Wrote to req.json");
    } catch (e) {
        console.error(e);
    }
}
investigateRequests();
