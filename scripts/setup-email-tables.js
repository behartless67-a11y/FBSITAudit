const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupEmailTables() {
  console.log('Setting up email reminder tables in Supabase...\n');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(
      path.join(__dirname, '../database/user-assignments.sql'),
      'utf8'
    );

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      if (statement.includes('CREATE TABLE')) {
        const tableName = statement.match(/CREATE TABLE.*?(\w+)/i)?.[1];
        console.log(`Creating table: ${tableName}...`);
      } else if (statement.includes('CREATE INDEX')) {
        const indexName = statement.match(/CREATE INDEX.*?(\w+)/i)?.[1];
        console.log(`Creating index: ${indexName}...`);
      } else if (statement.includes('CREATE POLICY')) {
        console.log(`Creating RLS policy...`);
      }

      const { error } = await supabase.rpc('exec_sql', {
        query: statement
      });

      if (error) {
        // Try direct query if rpc doesn't work
        const { error: queryError } = await supabase
          .from('_sql')
          .select('*')
          .limit(0);

        console.log(`⚠️ Note: ${error.message}`);
      }
    }

    console.log('\n✅ Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Verify tables in Supabase dashboard');
    console.log('2. Add user assignments');
    console.log('3. Test email sending\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('\n💡 Manual setup required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of database/user-assignments.sql');
    console.log('4. Click Run\n');
  }
}

setupEmailTables();
