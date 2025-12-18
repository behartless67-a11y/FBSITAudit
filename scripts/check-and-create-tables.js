const { createClient } = require('@supabase/supabase-js');

// Hardcode the credentials for this setup script
const supabaseUrl = 'https://rzqvkwallkbymarqowzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cXZrd2FsbGtieW1hcnFvd3piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUzMzIwNSwiZXhwIjoyMDc4MTA5MjA1fQ.Xtn7BgoiggAcxiI26HYMjXXXW3a6iAqGjEunLal2hTE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateTables() {
  console.log('🔧 Checking database tables...\n');

  try {
    // Check if user_area_assignments table exists
    console.log('Checking user_area_assignments table...');
    const { data: assignments, error: error1 } = await supabase
      .from('user_area_assignments')
      .select('id')
      .limit(1);

    if (!error1) {
      console.log('✅ user_area_assignments table exists');
      console.log(`   Found ${assignments ? assignments.length : 0} records\n`);
    } else if (error1.code === '42P01') {
      console.log('❌ user_area_assignments table does NOT exist\n');
    } else {
      console.log('⚠️  Error checking table:', error1.message, '\n');
    }

    // Check if email_reminders table exists
    console.log('Checking email_reminders table...');
    const { data: reminders, error: error2 } = await supabase
      .from('email_reminders')
      .select('id')
      .limit(1);

    if (!error2) {
      console.log('✅ email_reminders table exists');
      console.log(`   Found ${reminders ? reminders.length : 0} records\n`);
    } else if (error2.code === '42P01') {
      console.log('❌ email_reminders table does NOT exist\n');
    } else {
      console.log('⚠️  Error checking table:', error2.message, '\n');
    }

    // Check audit_responses table
    console.log('Checking audit_responses table...');
    const { data: responses, error: error3 } = await supabase
      .from('audit_responses')
      .select('id')
      .limit(1);

    if (!error3) {
      console.log('✅ audit_responses table exists');
      console.log(`   Found ${responses ? responses.length : 0} records\n`);
    } else if (error3.code === '42P01') {
      console.log('❌ audit_responses table does NOT exist\n');
    } else {
      console.log('⚠️  Error checking table:', error3.message, '\n');
    }

    // Provide instructions based on results
    if (error1?.code === '42P01' || error2?.code === '42P01') {
      console.log('📋 MANUAL SETUP REQUIRED:');
      console.log('─────────────────────────────────────────────────────');
      console.log('1. Open your Supabase dashboard:');
      console.log('   https://supabase.com/dashboard/project/rzqvkwallkbymarqowzb/sql/new');
      console.log('');
      console.log('2. Copy the contents of this file:');
      console.log('   database/user-assignments.sql');
      console.log('');
      console.log('3. Paste into the SQL Editor and click "Run"');
      console.log('─────────────────────────────────────────────────────\n');
    } else {
      console.log('✅ All required tables exist! Database is ready.');
      console.log('\n📧 Next steps:');
      console.log('1. Add user assignments (users responsible for each area)');
      console.log('2. Test email sending functionality\n');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkAndCreateTables();
