-- Database Schema for Monthly Audit Form
-- This can be used with Azure SQL Database or AWS RDS PostgreSQL

-- Table to store audit responses
CREATE TABLE audit_responses (
    id NVARCHAR(50) PRIMARY KEY,
    user_id NVARCHAR(100) NOT NULL,
    user_name NVARCHAR(200) NOT NULL,
    user_email NVARCHAR(200),
    area_id NVARCHAR(50) NOT NULL,
    area_name NVARCHAR(100) NOT NULL,
    responses NVARCHAR(MAX) NOT NULL, -- JSON string of question responses
    submitted_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    month NVARCHAR(7) NOT NULL, -- Format: YYYY-MM
    CONSTRAINT UQ_user_area_month UNIQUE (user_id, area_id, month)
);

-- Index for faster queries by user
CREATE INDEX IX_audit_responses_user_id ON audit_responses(user_id);

-- Index for faster queries by area
CREATE INDEX IX_audit_responses_area_id ON audit_responses(area_id);

-- Index for faster queries by month
CREATE INDEX IX_audit_responses_month ON audit_responses(month);

-- Table to track email reminder status
CREATE TABLE email_reminders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id NVARCHAR(100) NOT NULL,
    user_email NVARCHAR(200) NOT NULL,
    area_id NVARCHAR(50) NOT NULL,
    month NVARCHAR(7) NOT NULL,
    reminder_sent_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    reminder_type NVARCHAR(20) NOT NULL, -- 'first', 'second', 'final'
    CONSTRAINT UQ_reminder UNIQUE (user_id, area_id, month, reminder_type)
);

-- Index for tracking reminders
CREATE INDEX IX_email_reminders_month ON email_reminders(month);

-- Table to store area assignments (which users are responsible for which areas)
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
CREATE INDEX IX_user_area_active ON user_area_assignments(is_active);

-- View to see completion status by month
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

-- ==========================================
-- PostgreSQL Version (for AWS RDS)
-- ==========================================

/*
-- Table to store audit responses (PostgreSQL)
CREATE TABLE audit_responses (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(200) NOT NULL,
    user_email VARCHAR(200),
    area_id VARCHAR(50) NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    responses JSONB NOT NULL, -- Use JSONB for better performance
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    CONSTRAINT uq_user_area_month UNIQUE (user_id, area_id, month)
);

-- Indexes
CREATE INDEX idx_audit_responses_user_id ON audit_responses(user_id);
CREATE INDEX idx_audit_responses_area_id ON audit_responses(area_id);
CREATE INDEX idx_audit_responses_month ON audit_responses(month);

-- Table to track email reminder status (PostgreSQL)
CREATE TABLE email_reminders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    user_email VARCHAR(200) NOT NULL,
    area_id VARCHAR(50) NOT NULL,
    month VARCHAR(7) NOT NULL,
    reminder_sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reminder_type VARCHAR(20) NOT NULL,
    CONSTRAINT uq_reminder UNIQUE (user_id, area_id, month, reminder_type)
);

CREATE INDEX idx_email_reminders_month ON email_reminders(month);

-- Table to store area assignments (PostgreSQL)
CREATE TABLE user_area_assignments (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    user_email VARCHAR(200) NOT NULL,
    user_name VARCHAR(200) NOT NULL,
    area_id VARCHAR(50) NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_area UNIQUE (user_id, area_id)
);

CREATE INDEX idx_user_area_active ON user_area_assignments(is_active);

-- View for monthly completion status (PostgreSQL)
CREATE VIEW v_monthly_completion_status AS
SELECT
    uaa.user_id,
    uaa.user_name,
    uaa.user_email,
    uaa.area_id,
    uaa.area_name,
    TO_CHAR(CURRENT_DATE, 'YYYY-MM') as current_month,
    CASE
        WHEN ar.id IS NOT NULL THEN 'Completed'
        ELSE 'Pending'
    END as status,
    ar.submitted_at
FROM user_area_assignments uaa
LEFT JOIN audit_responses ar
    ON uaa.user_id = ar.user_id
    AND uaa.area_id = ar.area_id
    AND ar.month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
WHERE uaa.is_active = TRUE;
*/
