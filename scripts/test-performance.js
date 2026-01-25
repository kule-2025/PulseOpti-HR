#!/usr/bin/env node

/**
 * 性能测试脚本
 * 测试API响应时间和并发性能
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function info(message) {
  log(`ℹ ${message}`, 'blue');
}

function warn(message) {
  log(`⚠ ${message}`, 'yellow');
}

// 性能测试端点
const endpoints = [
  { name: '健康检查', path: '/api/health' },
  { name: '获取统计数据', path: '/api/dashboard/stats?companyId=demo-company' },
  { name: '获取员工列表', path: '/api/employees?companyId=demo-company' },
  { name: '获取部门列表', path: '/api/departments?companyId=demo-company' },
];

// 单次请求测试
async function testEndpoint(endpoint) {
  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}${endpoint.path}`);
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: response.ok,
      statusCode: response.status,
      duration,
    };
  } catch (err) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: false,
      error: err.message,
      duration,
    };
  }
}

// 性能测试
async function runPerformanceTest(concurrency = 10, iterations = 100) {
  log('\n========================================', 'blue');
  log('  性能测试', 'blue');
  log('========================================\n', 'blue');

  info(`并发数: ${concurrency}, 迭代次数: ${iterations}\n`);

  const results = {};

  for (const endpoint of endpoints) {
    info(`测试端点: ${endpoint.name}`);
    const durations = [];
    const errors = [];
    let successCount = 0;

    // 执行并发测试
    const batches = Math.ceil(iterations / concurrency);
    for (let i = 0; i < batches; i++) {
      const promises = [];
      const batchSize = Math.min(concurrency, iterations - i * concurrency);

      for (let j = 0; j < batchSize; j++) {
        promises.push(testEndpoint(endpoint));
      }

      const batchResults = await Promise.all(promises);

      batchResults.forEach((result) => {
        durations.push(result.duration);
        if (result.success) {
          successCount++;
        } else {
          errors.push(result.error || `Status: ${result.statusCode}`);
        }
      });
    }

    // 计算统计数据
    const sortedDurations = durations.sort((a, b) => a - b);
    const min = sortedDurations[0];
    const max = sortedDurations[sortedDurations.length - 1];
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const median = sortedDurations[Math.floor(sortedDurations.length / 2)];
    const p95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)];
    const p99 = sortedDurations[Math.floor(sortedDurations.length * 0.99)];
    const successRate = (successCount / iterations) * 100;

    results[endpoint.name] = {
      min,
      max,
      avg,
      median,
      p95,
      p99,
      successRate,
      errorCount: errors.length,
      errors: errors.slice(0, 5), // 只显示前5个错误
    };

    // 输出结果
    log(`  最小: ${min}ms`, 'cyan');
    log(`  最大: ${max}ms`, 'cyan');
    log(`  平均: ${avg.toFixed(2)}ms`, 'cyan');
    log(`  中位数: ${median}ms`, 'cyan');
    log(`  P95: ${p95}ms`, 'cyan');
    log(`  P99: ${p99}ms`, 'cyan');
    log(`  成功率: ${successRate.toFixed(2)}%`, successRate >= 95 ? 'green' : 'red');

    if (errors.length > 0) {
      error(`  错误数: ${errors.length}`);
      errors.slice(0, 3).forEach((err, index) => {
        log(`    ${index + 1}. ${err}`, 'red');
      });
    }

    log('');
  }

  // 输出总结
  log('========================================', 'blue');
  log('  性能测试总结', 'blue');
  log('========================================\n', 'blue');

  for (const [endpoint, result] of Object.entries(results)) {
    log(`${endpoint}:`, 'blue');
    log(`  平均响应时间: ${result.avg.toFixed(2)}ms`, 'cyan');
    log(`  成功率: ${result.successRate.toFixed(2)}%`, result.successRate >= 95 ? 'green' : 'red');

    if (result.successRate < 95) {
      warn(`  警告: 成功率低于95%`);
    }
    if (result.avg > 500) {
      warn(`  警告: 平均响应时间超过500ms`);
    }
    if (result.p95 > 1000) {
      warn(`  警告: P95响应时间超过1000ms`);
    }

    log('');
  }

  log('========================================\n', 'blue');

  // 检查是否所有指标都通过
  let allPassed = true;
  for (const result of Object.values(results)) {
    if (result.successRate < 95 || result.avg > 500 || result.p95 > 1000) {
      allPassed = false;
      break;
    }
  }

  if (allPassed) {
    success('所有性能测试通过！');
  } else {
    warn('部分性能测试未达标，请查看详情');
  }

  process.exit(allPassed ? 0 : 1);
}

// 解析命令行参数
const args = process.argv.slice(2);
const concurrency = parseInt(args[0]) || 10;
const iterations = parseInt(args[1]) || 100;

// 运行测试
runPerformanceTest(concurrency, iterations).catch((err) => {
  error(`性能测试失败: ${err.message}`);
  process.exit(1);
});
