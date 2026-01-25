const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function createSuperAdmin() {
  try {
    await client.connect();
    console.log('Connected to database');

    // 检查是否已存在超级管理员
    const checkResult = await client.query(
      'SELECT id, email, name, is_super_admin FROM users WHERE email = $1',
      ['208343256@qq.com']
    );

    if (checkResult.rows.length > 0) {
      const admin = checkResult.rows[0];
      console.log('\n超级管理员已存在:');
      console.log('  ID:', admin.id);
      console.log('  Email:', admin.email);
      console.log('  Name:', admin.name);
      console.log('  Is Super Admin:', admin.is_super_admin);
      await client.end();
      return;
    }

    // 创建超级管理员
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const insertResult = await client.query(
      `INSERT INTO users (
        id, username, email, password, name, role, is_super_admin, is_active, created_at
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        NOW()
      ) RETURNING id, username, email, name, role, is_super_admin`,
      [
        '208343256@qq.com',
        '208343256@qq.com',
        hashedPassword,
        '超级管理员',
        'admin',
        true,
        true
      ]
    );

    const admin = insertResult.rows[0];
    console.log('\n超级管理员创建成功:');
    console.log('  ID:', admin.id);
    console.log('  Username:', admin.username);
    console.log('  Email:', admin.email);
    console.log('  Name:', admin.name);
    console.log('  Role:', admin.role);
    console.log('  Is Super Admin:', admin.is_super_admin);
    console.log('  Password: admin123');

    await client.end();
    console.log('\nDisconnected from database');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createSuperAdmin();
