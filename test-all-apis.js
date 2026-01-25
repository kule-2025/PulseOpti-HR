const http = require('http');

function testApi(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            data: jsonData,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data.substring(0, 500),
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function main() {
  console.log('Testing HR Navigator APIs...\n');

  const tests = [
    { name: '首页', method: 'GET', path: '/' },
    { name: '会员定价', method: 'GET', path: '/api/memberships/pricing' },
    { name: '工作流列表', method: 'GET', path: '/api/workflows' },
    { name: '工作流实例列表', method: 'GET', path: '/api/workflows/instances' },
    { name: '工作流历史', method: 'GET', path: '/api/workflows/history' },
  ];

  for (const test of tests) {
    try {
      const result = await testApi(test.method, test.path);
      const success = result.status === 200;
      const icon = success ? '✓' : '✗';
      console.log(`${icon} ${test.name} (${test.path})`);
      console.log(`  Status: ${result.status}`);
      if (result.data.success !== undefined) {
        console.log(`  Success: ${result.data.success}`);
      }
      console.log();
    } catch (error) {
      console.log(`✗ ${test.name} (${test.path})`);
      console.log(`  Error: ${error.message}`);
      console.log();
    }
  }
}

main();
