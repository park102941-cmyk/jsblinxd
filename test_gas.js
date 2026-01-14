
const fetch = require('node-fetch'); // NOTE: In the user's environment, node-fetch might not be installed or might be strictly ESM. We'll try using native fetch if node version allows (Node 18+) or https module.
// Let's use standard https for compatibility if node-fetch isn't there, but let's try a simple fetch first assuming modern node.
// Actually, standard 'https' is safer.

const https = require('https');

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx243jP2MALxRyxq-u_cj2YMd7shKXvGRA0HKFDrp7ohcZ-U7M-0OY9jb881F_ZomLK/exec";

const mockOrder = {
    orderId: "TEST-ORD-001",
    date: new Date().toLocaleDateString(),
    fullAddress: "123 Test St, Test City, CA 90210, USA",
    items: [
        {
            index: 1,
            title: "Test Zebra Blind",
            sideMark: "Living Room",
            width: "50",
            height: "60",
            color: "White",
            mount: "Inside",
            motor: "Right",
            quantity: 1
        }
    ]
};

const payload = JSON.stringify({
    action: 'send_to_factory',
    order: mockOrder
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    }
};

console.log("Sending test order to Factory Sheet...");

const req = https.request(GOOGLE_SCRIPT_URL, (res) => {
    // Google Apps Script usually redirects. We need to follow redirects?
    // standard https.request doesn't follow redirects automatically.
    // However, the POST to /exec might return 302.
    // Let's check status.

    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log("Redirect received to:", res.headers.location);
        // Follow redirect (GET or POST? GAS redirects POST to GET sometimes if not setup right, but usually provides a temp URL for response)
        // Actually for web apps Executable API, it often redirects the response.

        // Easier approach: Use a child process to run curl.
    } else {
        console.log(`Status Code: ${res.statusCode}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            console.log("Response Body (Success):", chunk);
        });
    }
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(payload);
req.end();
