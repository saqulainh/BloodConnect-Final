async function testProd() {
    try {
        const res = await fetch('https://bloodconnect-vert.vercel.app/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@test.com', password: 'password' })
        });
        console.log('Prod URL Status:', res.status);
        const text = await res.text();
        console.log('Prod URL Response:', text.slice(0, 100));
    } catch (error) {
        console.log('Prod URL Failure:', error.message);
    }
}
testProd();
