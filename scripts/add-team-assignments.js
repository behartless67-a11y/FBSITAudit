const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rzqvkwallkbymarqowzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cXZrd2FsbGtieW1hcnFvd3piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUzMzIwNSwiZXhwIjoyMDc4MTA5MjA1fQ.Xtn7BgoiggAcxiI26HYMjXXXW3a6iAqGjEunLal2hTE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTeamAssignments() {
  console.log('📝 Setting up team assignments...\n');

  try {
    // First, update the existing test user to use your virginia.edu email
    console.log('Updating existing test user...');
    const { error: updateError } = await supabase
      .from('user_area_assignments')
      .update({
        user_id: 'bh4hb',
        user_name: 'Ben Hartless',
        user_email: 'bh4hb@virginia.edu'
      })
      .eq('user_id', 'test_user_1');

    if (updateError) {
      console.log('Note:', updateError.message);
    } else {
      console.log('✅ Updated test user to Ben Hartless');
    }

    // Add Bryan Crenshaw for Data and Analytics
    console.log('\nAdding Bryan Crenshaw...');
    const { data: bryan, error: bryanError } = await supabase
      .from('user_area_assignments')
      .insert([
        {
          user_id: 'bac7d',
          user_name: 'Bryan Crenshaw',
          user_email: 'bac7d@virginia.edu',
          area_id: 'data-analytics',
          area_name: 'Data and Analytics',
          is_active: true
        }
      ])
      .select();

    if (bryanError) {
      if (bryanError.code === '23505') {
        console.log('⚠️  Bryan already assigned');
      } else {
        console.error('Error:', bryanError.message);
      }
    } else {
      console.log('✅ Bryan Crenshaw assigned to Data and Analytics');
    }

    // Add Nikitha Edunuri for School Systems
    console.log('\nAdding Nikitha Edunuri...');
    const { data: nikitha, error: nikithaError } = await supabase
      .from('user_area_assignments')
      .insert([
        {
          user_id: 'ne2y',
          user_name: 'Nikitha Edunuri',
          user_email: 'ne2y@virginia.edu',
          area_id: 'school-systems',
          area_name: 'School Systems',
          is_active: true
        }
      ])
      .select();

    if (nikithaError) {
      if (nikithaError.code === '23505') {
        console.log('⚠️  Nikitha already assigned');
      } else {
        console.error('Error:', nikithaError.message);
      }
    } else {
      console.log('✅ Nikitha Edunuri assigned to School Systems');
    }

    // Show all current assignments
    console.log('\n' + '='.repeat(60));
    console.log('Current Team Assignments:');
    console.log('='.repeat(60));

    const { data: allAssignments } = await supabase
      .from('user_area_assignments')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    if (allAssignments) {
      allAssignments.forEach((assignment, index) => {
        console.log(`\n${index + 1}. ${assignment.user_name} (${assignment.user_email})`);
        console.log(`   Area: ${assignment.area_name}`);
        console.log(`   User ID: ${assignment.user_id}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Team setup complete!');
    console.log('='.repeat(60));
    console.log('\n📧 Once virginia.edu domain is verified in Resend:');
    console.log('   - Ben Hartless will receive reminders for Desktop/Client/User');
    console.log('   - Bryan Crenshaw will receive reminders for Data and Analytics');
    console.log('   - Nikitha Edunuri will receive reminders for School Systems\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

addTeamAssignments();
