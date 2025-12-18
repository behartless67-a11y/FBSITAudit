const sql = require('mssql');

const config = {
  user: 'fbsadmin',
  password: 'Fbs@DvCK9khMuKC3WXFH',
  server: 'fbs-audit-sql-server.database.windows.net',
  database: 'fbs-audit-db',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

const schema = `
-- Table to store audit responses
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'audit_responses')
CREATE TABLE audit_responses (
    id NVARCHAR(50) PRIMARY KEY,
    user_id NVARCHAR(100) NOT NULL,
    user_name NVARCHAR(200) NOT NULL,
    user_email NVARCHAR(200),
    area_id NVARCHAR(50) NOT NULL,
    area_name NVARCHAR(100) NOT NULL,
    responses NVARCHAR(MAX) NOT NULL,
    submitted_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    month NVARCHAR(7) NOT NULL,
    CONSTRAINT UQ_user_area_month UNIQUE (user_id, area_id, month)
);

-- Index for faster queries by user
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_audit_responses_user_id')
CREATE INDEX IX_audit_responses_user_id ON audit_responses(user_id);

-- Index for faster queries by area
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_audit_responses_area_id')
CREATE INDEX IX_audit_responses_area_id ON audit_responses(area_id);

-- Index for faster queries by month
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_audit_responses_month')
CREATE INDEX IX_audit_responses_month ON audit_responses(month);

-- Table to track email reminder status
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'email_reminders')
CREATE TABLE email_reminders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id NVARCHAR(100) NOT NULL,
    user_email NVARCHAR(200) NOT NULL,
    area_id NVARCHAR(50) NOT NULL,
    month NVARCHAR(7) NOT NULL,
    reminder_sent_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    reminder_type NVARCHAR(20) NOT NULL,
    CONSTRAINT UQ_reminder UNIQUE (user_id, area_id, month, reminder_type)
);

-- Index for tracking reminders
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_email_reminders_month')
CREATE INDEX IX_email_reminders_month ON email_reminders(month);

-- Table to store area assignments
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_area_assignments')
CREATE TABLE user_area_assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id NVARCHAR(100) NOT NULL,
    user_email NVARCHAR(200) NOT NULL,
    user_name NVARCHAR(200) NOT NULL,
    area_id NVARCHAR(50) NOT NULL,
    area_name NVARCHAR(100) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_user_area UNIQUE (user_id, area_id)
);

-- Index for active assignments
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_user_area_active')
CREATE INDEX IX_user_area_active ON user_area_assignments(is_active);
`;

const viewSql = `
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_monthly_completion_status')
DROP VIEW v_monthly_completion_status;
`;

const createViewSql = `
CREATE VIEW v_monthly_completion_status AS
SELECT
    uaa.user_id,
    uaa.user_name,
    uaa.user_email,
    uaa.area_id,
    uaa.area_name,
    FORMAT(GETDATE(), 'yyyy-MM') as current_month,
    CASE
        WHEN ar.id IS NOT NULL THEN 'Completed'
        ELSE 'Pending'
    END as status,
    ar.submitted_at
FROM user_area_assignments uaa
LEFT JOIN audit_responses ar
    ON uaa.user_id = ar.user_id
    AND uaa.area_id = ar.area_id
    AND ar.month = FORMAT(GETDATE(), 'yyyy-MM')
WHERE uaa.is_active = 1;
`;

async function setupDatabase() {
  let pool;
  try {
    console.log('Connecting to Azure SQL Database...');
    pool = await sql.connect(config);
    console.log('Connected successfully!');

    console.log('Creating tables and indexes...');
    await pool.request().query(schema);
    console.log('Tables and indexes created!');

    console.log('Creating view...');
    await pool.request().query(viewSql);
    await pool.request().query(createViewSql);
    console.log('View created!');

    // Verify tables
    const result = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    console.log('Tables in database:', result.recordset.map(r => r.TABLE_NAME));

    console.log('\nDatabase setup complete!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

setupDatabase();
