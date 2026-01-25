const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'system_settings'
    `);

    console.log('\nsystem_settings table exists:', result.rows.length > 0);

    if (result.rows.length > 0) {
      const columns = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'system_settings'
        ORDER BY ordinal_position
      `);

      console.log('\nColumns:');
      columns.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type}`);
      });
    }

    await client.end();
    console.log('\nDisconnected from database');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTable();
