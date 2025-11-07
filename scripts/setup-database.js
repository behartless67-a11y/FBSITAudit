const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const sql = postgres('postgres://postgres.rzqvkwallkbymarqowzb:RkF3Jk8q3UeMtlmO@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require');

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
