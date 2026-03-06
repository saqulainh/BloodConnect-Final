async function testLogin() {
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testuser@email.com',
                password: 'password123'
            })
        });
        console.log('Response Status:', response.status);
        const data = await response.json();
        console.log('Response Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.log('Error Message:', error.message);
    }
}

testLogin();
