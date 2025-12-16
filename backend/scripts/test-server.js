const http = require('http');

console.log('Testing API health...');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/properties',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(`BODY: Response length ${data.length} bytes`);
            if (Array.isArray(json) || json.properties) {
                console.log('✅ API is accessible and returning properties data');
            } else {
                console.log('⚠️ API returned non-array:', json);
            }
        } catch (e) {
            console.log('⚠️ Failed to parse JSON:', data.substring(0, 100));
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ API check failed: ${e.message}`);
    // If connection refused, it means server is down
    if (e.code === 'ECONNREFUSED') {
        console.log('The server is definitely NOT running or not listening on port 3001.');
    }
});

req.end();
