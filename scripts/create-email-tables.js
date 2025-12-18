const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rzqvkwallkbymarqowzb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6cXZrd2FsbGtieW1hcnFvd3piIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUzMzIwNSwiZXhwIjoyMDc4MTA5MjA1fQ.Xtn7BgoiggAcxiI26HYMjXXXW3a6iAqGjEunLal2hTE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createEmailTables() {
  console.log('🔧 Creating email reminder tables in Supabase...\n');

  try {
    // Create user_area_assignments table
    console.log('Creating user_area_assignments table...');

    const createTable1SQL = `
      CREATE TABLE IF NOT EXISTS user_area_assignments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        area_id TEXT NOT NULL,
        area_name TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT uq_user_area UNIQUE (user_id, area_id)
      );
    `;

    const { error: createError1 } = await supabase.rpc('exec_sql', {
      sql: createTable1SQL
    });

    if (createError1) {
      console.log('Note:', createError1.message);
    } else {
      console.log('✅ user_area_assignments table created');
    }

    // Create indexes for user_area_assignments
    console.log('Creating indexes for user_area_assignments...');
    const indexes1 = [
      'CREATE INDEX IF NOT EXISTS idx_user_area_active ON user_area_assignments(is_active);',
      'CREATE INDEX IF NOT EXISTS idx_user_area_area_id ON user_area_assignments(area_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_area_email ON user_area_assignments(user_email);'
    ];

    for (const indexSQL of indexes1) {
      await supabase.rpc('exec_sql', { sql: indexSQL });
    }
    console.log('✅ Indexes created for user_area_assignments');

    // Enable RLS
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_area_assignments ENABLE ROW LEVEL SECURITY;'
    });

    // Create RLS policy
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow all operations for user_area_assignments" ON user_area_assignments;
        CREATE POLICY "Allow all operations for user_area_assignments" ON user_area_assignments
          FOR ALL
          USING (true)
          WITH CHECK (true);
      `
    });
    console.log('✅ RLS enabled for user_area_assignments\n');

    // Create email_reminders table
    console.log('Creating email_reminders table...');

    const createTable2SQL = `
      CREATE TABLE IF NOT EXISTS email_reminders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        area_id TEXT NOT NULL,
        month TEXT NOT NULL,
        reminder_type TEXT NOT NULL CHECK (reminder_type IN ('first', 'mid_month', 'final')),
        reminder_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT uq_reminder UNIQUE (user_id, area_id, month, reminder_type)
      );
    `;

    const { error: createError2 } = await supabase.rpc('exec_sql', {
      sql: createTable2SQL
    });

    if (createError2) {
      console.log('Note:', createError2.message);
    } else {
      console.log('✅ email_reminders table created');
    }

    // Create indexes for email_reminders
    console.log('Creating indexes for email_reminders...');
    const indexes2 = [
      'CREATE INDEX IF NOT EXISTS idx_email_reminders_month ON email_reminders(month);',
      'CREATE INDEX IF NOT EXISTS idx_email_reminders_type ON email_reminders(reminder_type);'
    ];

    for (const indexSQL of indexes2) {
      await supabase.rpc('exec_sql', { sql: indexSQL });
    }
    console.log('✅ Indexes created for email_reminders');

    // Enable RLS
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE email_reminders ENABLE ROW LEVEL SECURITY;'
    });

    // Create RLS policy
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow all operations for email_reminders" ON email_reminders;
        CREATE POLICY "Allow all operations for email_reminders" ON email_reminders
          FOR ALL
          USING (true)
          WITH CHECK (true);
      `
    });
    console.log('✅ RLS enabled for email_reminders\n');

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Database setup complete!');
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error creating tables:', error.message);
    console.log('\n💡 If this method doesn\'t work, please run the SQL manually:');
    console.log('1. Go to: https://supabase.com/dashboard/project/rzqvkwallkbymarqowzb/sql/new');
    console.log('2. Copy contents of: database/user-assignments.sql');
    console.log('3. Click "Run"\n');
  }
}

createEmailTables();
