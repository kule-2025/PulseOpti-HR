const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function createSuperAdmin() {
  try {
    await client.connect();
    console.log('Connected to database');

    const adminEmail = process.env.ADMIN_EMAIL || '208343256@qq.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // 检查是否已存在
    const result = await client.query(
      'SELECT id, email, name FROM users WHERE email = $1 LIMIT 1',
      [adminEmail]
    );

    console.log('\n查询结果:', result.rows);

    if (result.rows.length > 0) {
      console.log('超级管理员已存在:', result.rows[0]);
      await client.end();
      return;
    }

    // 创建
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('\n密码哈希成功');

    const insertResult = await client.query(
      `INSERT INTO users (
        email, username, password, name, role, is_super_admin,
        company_id, user_type, is_active, phone
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      RETURNING id, email, name`,
      [
        adminEmail,
        adminEmail,
        hashedPassword,
        '超级管理员',
        'admin',
        true,
        'a68a530a-be89-4d38-9c1a-b1961d1e6ffe',
        'developer',
        true,
        '13800138000'
      ]
    );

    console.log('\n超级管理员创建成功:', insertResult.rows[0]);

    await client.end();
    console.log('\nDisconnected from database');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createSuperAdmin();
