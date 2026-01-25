#!/usr/bin/env node

/**
 * API集成测试脚本
 * 测试主要API端点的功能
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

// 测试统计
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

// 测试用例
const testCases = [
  {
    name: '健康检查',
    method: 'GET',
    path: '/api/health',
    expectedStatus: 200,
  },
  {
    name: '获取统计数据',
    method: 'GET',
    path: '/api/dashboard/stats?companyId=demo-company',
    expectedStatus: 200,
  },
  {
    name: '获取员工列表',
    method: 'GET',
    path: '/api/employees?companyId=demo-company',
    expectedStatus: 200,
  },
  {
    name: '获取部门列表',
    method: 'GET',
    path: '/api/departments?companyId=demo-company',
    expectedStatus: 200,
  },
  {
    name: '获取职位列表',
    method: 'GET',
    path: '/api/positions?companyId=demo-company',
    expectedStatus: 200,
  },
  {
    name: '获取工作流定义列表',
    method: 'GET',
    path: '/api/workflow/definitions?companyId=demo-company',
    expectedStatus: 200,
  },
  {
    name: '获取工作流实例列表',
    method: 'GET',
    path: '/api/workflow/instances',
    expectedStatus: 200,
  },
  {
    name: '获取告警规则列表',
    method: 'GET',
    path: '/api/alerts/rules?companyId=demo-company',
    expectedStatus: 200,
  },
  {
    name: '导出权限配置',
    method: 'GET',
    path: '/api/permissions/config?companyId=demo-company',
    expectedStatus: 200,
  },
];

// 执行单个测试
async function runTest(test) {
  stats.total++;
  info(`运行测试: ${test.name}`);

  try {
    const response = await fetch(`${BASE_URL}${test.path}`, {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === test.expectedStatus) {
      success(`${test.name} (状态码: ${response.status})`);
      stats.passed++;
      return true;
    } else {
      error(`${test.name} - 预期状态码 ${test.expectedStatus}, 实际状态码 ${response.status}`);
      stats.failed++;
      stats.errors.push({
        test: test.name,
        expected: test.expectedStatus,
        actual: response.status,
      });
      return false;
    }
  } catch (err) {
    error(`${test.name} - 请求失败: ${err.message}`);
    stats.failed++;
    stats.errors.push({
      test: test.name,
      error: err.message,
    });
    return false;
  }
}

// 主函数
async function main() {
  log('\n========================================', 'blue');
  log('  PulseOpti HR API集成测试', 'blue');
  log('========================================\n', 'blue');

  info(`测试服务器: ${BASE_URL}\n`);

  // 运行所有测试
  for (const test of testCases) {
    await runTest(test);
  }

  // 输出测试结果
  log('\n========================================', 'blue');
  log('  测试结果', 'blue');
  log('========================================\n', 'blue');

  log(`总计: ${stats.total} 个测试`, 'blue');
  success(`通过: ${stats.passed} 个`);
  if (stats.failed > 0) {
    error(`失败: ${stats.failed} 个`);
    log('\n失败详情:', 'red');
    stats.errors.forEach((err, index) => {
      log(`  ${index + 1}. ${err.test}`, 'red');
      if (err.error) {
        log(`     错误: ${err.error}`, 'red');
      } else {
        log(`     预期: ${err.expected}, 实际: ${err.actual}`, 'red');
      }
    });
  }

  log('\n========================================\n', 'blue');

  // 退出码
  process.exit(stats.failed > 0 ? 1 : 0);
}

// 运行测试
main().catch((err) => {
  error(`测试执行失败: ${err.message}`);
  process.exit(1);
});
