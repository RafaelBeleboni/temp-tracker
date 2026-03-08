const http = require('http');

// Token válido - substitua com o token gerado no painel admin
const VALID_TOKEN = '';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/temperaturas',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${VALID_TOKEN}`
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(JSON.stringify({ 
  temperatura: 47.9,
  deviceInfo: {
    model: "ESP32-DevKit",
    firmware: "1.0.2",
    wifi: "WiFi-5G",
    battery: 85,
    signal: -45
  }
}));
req.end();
