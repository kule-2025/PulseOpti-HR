#!/usr/bin/env node

/**
 * 主测试运行脚本
 * 统一运行所有测试
 */

const { execSync } = require('child_process');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
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

// 获取脚本路径
const scriptsDir = path.join(__dirname, '..');

// 运行命令
function runCommand(command, description) {
  info(`\n${description}...`);

  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    success(`${description} 完成`);
    return true;
  } catch (err) {
    error(`${description} 失败`);
    return false;
  }
}

// 主函数
async function main() {
  log('\n========================================', 'blue');
  log('  PulseOpti HR 测试套件', 'blue');
  log('========================================\n', 'blue');

  const results = {};

  // 1. 集成测试
  results.integration = runCommand(
    'node scripts/test-api-integration.js',
    '运行集成测试'
  );

  // 2. 性能测试
  results.performance = runCommand(
    'node scripts/test-performance.js 10 50',
    '运行性能测试'
  );

  // 3. 类型检查
  results.typecheck = runCommand(
    'npx tsc --noEmit',
    '运行类型检查'
  );

  // 4. Lint检查
  results.lint = runCommand(
    'npx next lint',
    '运行Lint检查'
  );

  // 输出总结
  log('\n========================================', 'blue');
  log('  测试总结', 'blue');
  log('========================================\n', 'blue');

  for (const [test, passed] of Object.entries(results)) {
    if (passed) {
      success(`${test}: 通过`);
    } else {
      error(`${test}: 失败`);
    }
  }

  log('');

  // 检查是否所有测试都通过
  const allPassed = Object.values(results).every((r) => r);

  if (allPassed) {
    success('所有测试通过！');
    log('\n项目可以安全部署到生产环境。\n', 'green');
    process.exit(0);
  } else {
    error('部分测试失败，请检查日志并修复问题。');
    log('\n请修复失败的测试后重新运行。\n', 'red');
    process.exit(1);
  }
}

// 运行测试
main().catch((err) => {
  error(`测试执行失败: ${err.message}`);
  process.exit(1);
});
