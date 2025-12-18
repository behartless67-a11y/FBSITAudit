const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rzqvkwallkbymarqowzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cXZrd2FsbGtieW1hcnFvd3piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUzMzIwNSwiZXhwIjoyMDc4MTA5MjA1fQ.Xtn7BgoiggAcxiI26HYMjXXXW3a6iAqGjEunLal2hTE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestUser() {
  console.log('📝 Adding test user assignment...\n');

  try {
    // Add a test user assignment for you
    const { data, error } = await supabase
      .from('user_area_assignments')
      .insert([
        {
          user_id: 'test_user_1',
          user_name: 'Test User',
          user_email: 'bh4hb@virginia.edu',
          area_id: 'desktop-client-user',
          area_name: 'Desktop/Client/User',
          is_active: true
        }
      ])
      .select();

    if (error) {
      if (error.code === '23505') {
        console.log('⚠️  User assignment already exists');
      } else {
        console.error('❌ Error:', error.message);
      }
    } else {
      console.log('✅ Test user assignment added successfully!');
      console.log('\nDetails:');
      console.log('  User:', data[0].user_name);
      console.log('  Email:', data[0].user_email);
      console.log('  Area:', data[0].area_name);
      console.log('  ID:', data[0].id);
    }

    console.log('\n📧 Ready to test email sending!');
    console.log('Run: npm run dev');
    console.log('Then test the API endpoint.\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

addTestUser();
