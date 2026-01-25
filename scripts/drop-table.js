const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function dropTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    // 删除有问题的表
    await client.query('DROP TABLE IF EXISTS role_permissions CASCADE');
    console.log('Dropped role_permissions table successfully');

    await client.end();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropTable();
