const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rzqvkwallkbymarqowzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cXZrd2FsbGtieW1hcnFvd3piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUzMzIwNSwiZXhwIjoyMDc4MTA5MjA1fQ.Xtn7BgoiggAcxiI26HYMjXXXW3a6iAqGjEunLal2hTE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTestUser() {
  console.log('📝 Updating test user email address...\n');

  try {
    // Update the test user to use your Gmail address for testing
    const { data, error } = await supabase
      .from('user_area_assignments')
      .update({
        user_email: 'behartless67@gmail.com'
      })
      .eq('user_id', 'test_user_1')
      .select();

    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ Test user email updated successfully!');
      console.log('\nNew Details:');
      console.log('  User:', data[0].user_name);
      console.log('  Email:', data[0].user_email);
      console.log('  Area:', data[0].area_name);
      console.log('\n📧 Ready to send test email to:', data[0].user_email, '\n');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

updateTestUser();
