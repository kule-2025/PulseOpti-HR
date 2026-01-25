const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkTables() {
  try {
    await client.connect();
    console.log('Connected to database');

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\nTables in database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check if users table exists
    const usersExists = result.rows.some(row => row.table_name === 'users');
    console.log(`\nusers table exists: ${usersExists}`);

    await client.end();
    console.log('\nDisconnected from database');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTables();
