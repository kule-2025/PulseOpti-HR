const http = require('http');

function testApi(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data.substring(0, 200),
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  console.log('Testing APIs...\n');

  try {
    const tests = [
      '/',
      '/api/memberships/pricing',
    ];

    for (const path of tests) {
      try {
        const result = await testApi(path);
        console.log(`✓ ${path}`);
        console.log(`  Status: ${result.status}`);
        console.log(`  Response: ${result.data}`);
        console.log();
      } catch (error) {
        console.log(`✗ ${path}`);
        console.log(`  Error: ${error.message}`);
        console.log();
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
