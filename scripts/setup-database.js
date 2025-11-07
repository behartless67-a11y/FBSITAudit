const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('Please add DATABASE_URL to your .env.local file');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function setupDatabase() {
  try {
    console.log('Creating audit_responses table...');

    const sqlContent = fs.readFileSync(
      path.join(__dirname, '../database/create-table.sql'),
      'utf8'
    );

    await sql.unsafe(sqlContent);

    console.log('✅ Table created successfully!');
    console.log('✅ Indexes created successfully!');
    console.log('✅ RLS policies configured!');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

setupDatabase();
