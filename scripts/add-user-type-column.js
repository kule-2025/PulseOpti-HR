const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function addUserTypeColumn() {
  try {
    await client.connect();
    console.log('Connected to database');

    // 添加 user_type 列
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS user_type varchar(20) NOT NULL DEFAULT 'employee'
    `);
    console.log('Added user_type column successfully');

    // 添加索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS users_user_type_idx ON users(user_type)
    `);
    console.log('Added users_user_type_idx index successfully');

    // 更新现有超级管理员的 user_type
    await client.query(`
      UPDATE users
      SET user_type = CASE
        WHEN is_super_admin = true THEN 'developer'
        WHEN role = 'admin' THEN 'main_account'
        ELSE 'employee'
      END
      WHERE user_type IS NULL OR user_type = ''
    `);
    console.log('Updated existing users user_type values successfully');

    await client.end();
    console.log('\nDisconnected from database');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addUserTypeColumn();
