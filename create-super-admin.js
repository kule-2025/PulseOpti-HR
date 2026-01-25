/**
 * 创建超级管理员账号脚本
 * 用于在共享数据库中创建超管端的管理员账号
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// 从环境变量或命令行参数获取数据库连接字符串
const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('❌ 错误：未提供数据库连接字符串');
  console.error('用法：');
  console.error('  node create-super-admin.js');
  console.error('  或');
  console.error('  set DATABASE_URL=your-connection-string');
  console.error('  node create-super-admin.js');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  min: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

const SUPER_ADMIN_EMAIL = 'admin@aizhixuan.com.cn';
const SUPER_ADMIN_PASSWORD = 'Admin123456';
const SUPER_ADMIN_COMPANY_ID = 'admin-company-id-001';
const SUPER_ADMIN_USER_ID = 'admin-user-id-001';
const SUPER_ADMIN_COMPANY_NAME = 'PulseOpti HR 管理公司';

async function createSuperAdmin() {
  const client = await pool.connect();

  try {
    console.log('🔄 开始创建超级管理员...');
    console.log('');

    await client.query('BEGIN');

    // 1. 创建超级管理员企业
    console.log('1️⃣ 创建超级管理员企业...');
    const companyResult = await client.query(`
      INSERT INTO companies (id, name, industry, size, subscription_tier, max_employees, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW()
      RETURNING id, name
    `, [
      SUPER_ADMIN_COMPANY_ID,
      SUPER_ADMIN_COMPANY_NAME,
      '互联网',
      '10-50人',
      'enterprise',
      1000,
    ]);

    const company = companyResult.rows[0];
    console.log(`   ✅ 企业创建成功：${company.name} (ID: ${company.id})`);
    console.log('');

    // 2. 检查用户是否已存在
    console.log('2️⃣ 检查用户是否存在...');
    const existingUser = await client.query(
      'SELECT id, email, is_super_admin FROM users WHERE email = $1',
      [SUPER_ADMIN_EMAIL]
    );

    let adminUser;

    if (existingUser.rows.length > 0) {
      console.log('   ℹ️  用户已存在，更新权限...');
      // 更新现有用户为超级管理员
      const updateResult = await client.query(`
        UPDATE users
        SET role = 'admin',
            is_super_admin = true,
            is_active = true,
            updated_at = NOW()
        WHERE email = $1
        RETURNING id, email, is_super_admin, role
      `, [SUPER_ADMIN_EMAIL]);

      adminUser = updateResult.rows[0];
      console.log(`   ✅ 用户权限已更新：${adminUser.email}`);
    } else {
      console.log('   ℹ️  用户不存在，创建新用户...');

      // 生成密码哈希
      console.log('   🔐 生成密码哈希...');
      const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

      // 创建新用户
      const insertResult = await client.query(`
        INSERT INTO users (id, company_id, email, name, password, role, is_super_admin, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id, email, name, role, is_super_admin
      `, [
        SUPER_ADMIN_USER_ID,
        SUPER_ADMIN_COMPANY_ID,
        SUPER_ADMIN_EMAIL,
        '超级管理员',
        passwordHash,
        'admin',
        true,
        true,
      ]);

      adminUser = insertResult.rows[0];
      console.log(`   ✅ 用户创建成功：${adminUser.email}`);
    }
    console.log('');

    // 3. 创建免费订阅记录（如果不存在）
    console.log('3️⃣ 创建订阅记录...');
    await client.query(`
      INSERT INTO subscriptions (company_id, tier, amount, currency, period, max_employees, start_date, end_date, status, payment_method, created_at)
      VALUES ($1, 'enterprise', 0, 'CNY', 'yearly', 1000, NOW(), NOW() + INTERVAL '10 years', 'active', 'manual', NOW())
      ON CONFLICT (company_id) DO NOTHING
    `, [SUPER_ADMIN_COMPANY_ID]);
    console.log('   ✅ 订阅记录创建成功');
    console.log('');

    // 4. 记录审计日志
    console.log('4️⃣ 记录审计日志...');
    await client.query(`
      INSERT INTO audit_logs (company_id, user_id, user_name, action, resource_type, resource_id, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [
      SUPER_ADMIN_COMPANY_ID,
      adminUser.id,
      adminUser.name,
      'system_init',
      'user',
      adminUser.id,
      'success',
    ]);
    console.log('   ✅ 审计日志记录成功');
    console.log('');

    await client.query('COMMIT');

    // 5. 显示创建结果
    console.log('========================================');
    console.log('  ✅ 超级管理员创建成功！');
    console.log('========================================');
    console.log('');
    console.log('📋 账号信息：');
    console.log('   邮箱：', adminUser.email);
    console.log('   密码：', SUPER_ADMIN_PASSWORD);
    console.log('   姓名：', adminUser.name);
    console.log('   角色：', adminUser.role);
    console.log('   超级管理员：', adminUser.is_super_admin ? '是' : '否');
    console.log('   状态：', '已激活');
    console.log('');
    console.log('🏢 企业信息：');
    console.log('   企业ID：', SUPER_ADMIN_COMPANY_ID);
    console.log('   企业名称：', company.name);
    console.log('   订阅类型：企业版');
    console.log('   最大员工数：1000人');
    console.log('');
    console.log('🔗 访问地址：');
    console.log('   超管端：https://admin.aizhixuan.com.cn');
    console.log('   用户端：https://www.aizhixuan.com.cn');
    console.log('');
    console.log('⚠️  重要提醒：');
    console.log('   1. 请立即修改默认密码');
    console.log('   2. 不要泄露账号密码');
    console.log('   3. 定期更换密码');
    console.log('');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 创建失败：', error.message);
    console.error('');
    console.error('详细错误信息：');
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// 运行创建脚本
console.log('========================================');
console.log('  PulseOpti HR 超级管理员创建工具');
console.log('========================================');
console.log('');

createSuperAdmin()
  .then(() => {
    console.log('✅ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败：', error);
    process.exit(1);
  });
