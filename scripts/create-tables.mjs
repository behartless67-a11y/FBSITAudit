import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTables() {
  console.log('🔧 Setting up email reminder tables in Supabase...\n');

  try {
    // Check if tables already exist by trying to query them
    console.log('Checking if user_area_assignments table exists...');
    const { error: checkError1 } = await supabase
      .from('user_area_assignments')
      .select('id')
      .limit(1);

    if (!checkError1) {
      console.log('✓ user_area_assignments table already exists');
    }

    console.log('Checking if email_reminders table exists...');
    const { error: checkError2 } = await supabase
      .from('email_reminders')
      .select('id')
      .limit(1);

    if (!checkError2) {
      console.log('✓ email_reminders table already exists');
    }

    if (!checkError1 && !checkError2) {
      console.log('\n✅ All tables already exist! Database is ready.');
      console.log('\nYou can now:');
      console.log('1. Add user assignments via API or Supabase dashboard');
      console.log('2. Test email sending\n');
      return;
    }

    // If tables don't exist, provide manual instructions
    console.log('\n⚠️ Tables need to be created.');
    console.log('\n📋 Please follow these steps:');
    console.log('1. Go to: https://supabase.com/dashboard/project/rzqvkwallkbymarqowzb/sql/new');
    console.log('2. Copy the entire contents of: database/user-assignments.sql');
    console.log('3. Paste into the SQL Editor');
    console.log('4. Click "Run"');
    console.log('\nOr I can add a test user assignment if tables exist.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTables();
