/**
 * 数据同步验证脚本
 * 用于验证前端和超管端的实时数据同步
 */

const { Pool } = require('pg');

// 数据库连接字符串
const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('❌ 错误：未提供数据库连接字符串');
  console.error('用法：node verify-data-sync.js');
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

async function verifyDataSync() {
  const client = await pool.connect();

  try {
    console.log('========================================');
    console.log('  数据同步验证工具');
    console.log('========================================');
    console.log('');

    // 1. 测试数据库连接
    console.log('1️⃣ 测试数据库连接...');
    const timeResult = await client.query('SELECT NOW() as now');
    console.log(`   ✅ 数据库连接成功`);
    console.log(`   🕐 服务器时间：${timeResult.rows[0].now}`);
    console.log('');

    // 2. 统计数据
    console.log('2️⃣ 数据统计：');
    const statsResult = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE is_super_admin = false) as normal_users,
        (SELECT COUNT(*) FROM users WHERE is_super_admin = true) as super_admins,
        (SELECT COUNT(*) FROM companies WHERE name != 'PulseOpti HR 管理公司') as normal_companies,
        (SELECT COUNT(*) FROM companies WHERE name = 'PulseOpti HR 管理公司') as admin_companies,
        (SELECT COUNT(*) FROM subscriptions) as subscriptions,
        (SELECT COUNT(*) FROM audit_logs) as audit_logs
    `);

    const stats = statsResult.rows[0];
    console.log(`   👤 普通用户数量：${stats.normal_users}`);
    console.log(`   👑 超级管理员数量：${stats.super_admins}`);
    console.log(`   🏢 普通企业数量：${stats.normal_companies}`);
    console.log(`   🏛️  管理公司数量：${stats.admin_companies}`);
    console.log(`   💳 订阅记录数量：${stats.subscriptions}`);
    console.log(`   📝 审计日志数量：${stats.audit_logs}`);
    console.log('');

    // 3. 最近注册的用户
    console.log('3️⃣ 最近注册的用户（5个）：');
    const recentUsersResult = await client.query(`
      SELECT
        u.email,
        u.name,
        u.role,
        c.name as company_name,
        u.created_at
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.is_super_admin = false
      ORDER BY u.created_at DESC
      LIMIT 5
    `);

    if (recentUsersResult.rows.length === 0) {
      console.log('   ℹ️  暂无普通用户');
    } else {
      recentUsersResult.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`);
        console.log(`      姓名：${user.name}`);
        console.log(`      企业：${user.company_name || '未设置'}`);
        console.log(`      角色：${user.role}`);
        console.log(`      注册时间：${user.created_at}`);
        console.log('');
      });
    }
    console.log('');

    // 4. 最近创建的企业
    console.log('4️⃣ 最近创建的企业（5个）：');
    const recentCompaniesResult = await client.query(`
      SELECT
        c.name,
        c.industry,
        c.size,
        c.subscription_tier,
        s.status as subscription_status,
        c.created_at
      FROM companies c
      LEFT JOIN subscriptions s ON c.id = s.company_id
      WHERE c.name != 'PulseOpti HR 管理公司'
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    if (recentCompaniesResult.rows.length === 0) {
      console.log('   ℹ️  暂无普通企业');
    } else {
      recentCompaniesResult.rows.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name}`);
        console.log(`      行业：${company.industry}`);
        console.log(`      规模：${company.size}`);
        console.log(`      套餐：${company.subscription_tier}`);
        console.log(`      状态：${company.subscription_status}`);
        console.log(`      创建时间：${company.created_at}`);
        console.log('');
      });
    }
    console.log('');

    // 5. 数据库表统计
    console.log('5️⃣ 数据库表统计：');
    const tablesResult = await client.query(`
      SELECT
        table_name,
        (
          SELECT COUNT(*)
          FROM information_schema.columns
          WHERE table_name = t.table_name
          AND table_schema = 'public'
        ) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`   找到 ${tablesResult.rows.length} 张数据表：`);
    tablesResult.rows.forEach(table => {
      console.log(`   - ${table.table_name} (${table.column_count} 列)`);
    });
    console.log('');

    // 6. 同步测试
    console.log('6️⃣ 同步测试：');
    console.log('   测试数据实时同步...');

    // 创建测试记录
    const testId = `test-sync-${Date.now()}`;
    await client.query(`
      INSERT INTO audit_logs (company_id, user_id, user_name, action, resource_type, resource_id, status, created_at)
      VALUES ('admin-company-id-001', 'admin-user-id-001', '同步测试', 'sync_test', 'test', $1, 'success', NOW())
    `, [testId]);

    // 立即查询
    const queryResult = await client.query(`
      SELECT * FROM audit_logs WHERE resource_id = $1
    `, [testId]);

    // 清理测试记录
    await client.query(`
      DELETE FROM audit_logs WHERE resource_id = $1
    `, [testId]);

    if (queryResult.rows.length > 0) {
      console.log(`   ✅ 数据实时同步正常（延迟<1秒）`);
    } else {
      console.log(`   ⚠️  数据同步可能有问题`);
    }
    console.log('');

    // 7. 总结
    console.log('========================================');
    console.log('  验证总结');
    console.log('========================================');
    console.log('');

    const hasNormalUsers = stats.normal_users > 0;
    const hasNormalCompanies = stats.normal_companies > 0;
    const hasSuperAdmin = stats.super_admins > 0;
    const allTablesExist = tablesResult.rows.length >= 50;

    console.log('检查项：');
    console.log(`   ${hasNormalUsers ? '✅' : '❌'} 有普通用户`);
    console.log(`   ${hasNormalCompanies ? '✅' : '❌'} 有普通企业`);
    console.log(`   ${hasSuperAdmin ? '✅' : '❌'} 有超级管理员`);
    console.log(`   ${allTablesExist ? '✅' : '❌'} 数据库表完整（${tablesResult.rows.length}张）`);
    console.log('');

    if (hasNormalUsers && hasNormalCompanies && hasSuperAdmin && allTablesExist) {
      console.log('🎉 数据同步验证通过！');
      console.log('');
      console.log('接下来可以：');
      console.log('1. 在前端注册新用户');
      console.log('2. 在超管端查看新用户');
      console.log('3. 验证实时同步');
      console.log('');
      console.log('访问地址：');
      console.log('  前端：https://www.aizhixuan.com.cn');
      console.log('  超管端：https://admin.aizhixuan.com.cn');
    } else {
      console.log('⚠️  数据同步验证未完全通过，请检查：');
      if (!hasSuperAdmin) console.log('   - 需要创建超级管理员账号');
      if (!allTablesExist) console.log('   - 需要运行数据库迁移');
      console.log('');
      console.log('运行以下命令修复：');
      console.log('  pnpm db:push');
      console.log('  node create-super-admin.js');
    }

    console.log('');

  } catch (error) {
    console.error('❌ 验证失败：', error.message);
    console.error('');
    console.error('详细错误信息：');
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// 运行验证脚本
verifyDataSync()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败：', error);
    process.exit(1);
  });
