#!/usr/bin/env node

/**
 * 数据库备份和恢复脚本
 * 支持完整的数据库备份和恢复
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function warn(message) {
  log(`⚠ ${message}`, 'yellow');
}

// 配置
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DATABASE_URL = process.env.DATABASE_URL;

// 确保备份目录存在
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 备份数据库
async function backupDatabase() {
  if (!DATABASE_URL) {
    error('未设置 DATABASE_URL 环境变量');
    return false;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `pulseopti-hr-backup-${timestamp}.sql`);

  info(`开始备份数据库...`);
  info(`备份文件: ${backupFile}`);

  try {
    // 使用 pg_dump 备份数据库
    const command = `pg_dump "${DATABASE_URL}" > "${backupFile}"`;
    execSync(command, { stdio: 'pipe' });

    success(`数据库备份成功！`);
    info(`备份文件大小: ${fs.statSync(backupFile).size} bytes`);

    // 压缩备份文件
    info('正在压缩备份文件...');
    execSync(`gzip "${backupFile}"`);
    const compressedFile = `${backupFile}.gz`;
    success(`压缩完成: ${compressedFile}`);
    info(`压缩后大小: ${fs.statSync(compressedFile).size} bytes`);

    // 清理旧备份（保留最近30天）
    cleanOldBackups();

    return true;
  } catch (err) {
    error(`数据库备份失败: ${err.message}`);
    return false;
  }
}

// 恢复数据库
async function restoreDatabase(backupFile) {
  if (!DATABASE_URL) {
    error('未设置 DATABASE_URL 环境变量');
    return false;
  }

  if (!fs.existsSync(backupFile)) {
    error(`备份文件不存在: ${backupFile}`);
    return false;
  }

  warn('警告: 此操作将覆盖现有数据库！');
  warn('请确保已停止所有数据库写入操作。');

  // 确认恢复
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('确定要恢复数据库吗？(输入 "yes" 确认): ', (answer) => {
      rl.close();

      if (answer.toLowerCase() !== 'yes') {
        info('取消恢复操作');
        resolve(false);
        return;
      }

      info(`开始恢复数据库...`);
      info(`备份文件: ${backupFile}`);

      try {
        let command;

        // 检查是否是压缩文件
        if (backupFile.endsWith('.gz')) {
          command = `gunzip -c "${backupFile}" | psql "${DATABASE_URL}"`;
        } else {
          command = `psql "${DATABASE_URL}" < "${backupFile}"`;
        }

        execSync(command, { stdio: 'pipe' });

        success(`数据库恢复成功！`);
        resolve(true);
      } catch (err) {
        error(`数据库恢复失败: ${err.message}`);
        resolve(false);
      }
    });
  });
}

// 清理旧备份
function cleanOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR);
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天

  files.forEach((file) => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);

    if (now - stats.mtimeMs > maxAge) {
      info(`删除旧备份: ${file}`);
      fs.unlinkSync(filePath);
    }
  });
}

// 列出所有备份
function listBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter((file) => file.endsWith('.sql') || file.endsWith('.sql.gz'))
    .map((file) => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        date: stats.mtime,
      };
    })
    .sort((a, b) => b.date - a.date);

  if (files.length === 0) {
    info('没有找到备份文件');
    return;
  }

  log('\n备份文件列表:', 'blue');
  log('========================================', 'blue');

  files.forEach((file, index) => {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    log(`${index + 1}. ${file.name}`, 'cyan');
    log(`   大小: ${sizeMB} MB`, 'cyan');
    log(`   日期: ${file.date.toLocaleString()}`, 'cyan');
    log('');
  });

  log('========================================\n', 'blue');
}

// 主函数
async function main() {
  const command = process.argv[2];

  log('\n========================================', 'blue');
  log('  PulseOpti HR 数据库备份工具', 'blue');
  log('========================================\n', 'blue');

  switch (command) {
    case 'backup':
      await backupDatabase();
      break;

    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        error('请指定要恢复的备份文件');
        log('用法: node scripts/backup-restore.js restore <备份文件路径>', 'blue');
        process.exit(1);
      }
      await restoreDatabase(backupFile);
      break;

    case 'list':
      listBackups();
      break;

    default:
      info('用法:');
      log('  node scripts/backup-restore.js backup          # 备份数据库', 'blue');
      log('  node scripts/backup-restore.js restore <文件>  # 恢复数据库', 'blue');
      log('  node scripts/backup-restore.js list            # 列出所有备份', 'blue');
      break;
  }
}

// 运行
main().catch((err) => {
  error(`执行失败: ${err.message}`);
  process.exit(1);
});
