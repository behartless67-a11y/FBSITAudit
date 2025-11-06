# Deployment Guide - Monthly Audit Form

## Quick Start Deployment Checklist

### Phase 1: Database Setup (Choose One)

#### Option A: Azure SQL Database
- [ ] Create Azure SQL Server
- [ ] Create database instance
- [ ] Run schema from `database/schema.sql` (SQL Server version)
- [ ] Configure firewall rules
- [ ] Note connection string

#### Option B: AWS RDS PostgreSQL
- [ ] Create RDS PostgreSQL instance
- [ ] Configure security groups
- [ ] Run schema from `database/schema.sql` (PostgreSQL version)
- [ ] Note connection string

### Phase 2: Azure Static Web App Setup

1. **Create Static Web App**
```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create --name batten-audit-rg --location eastus2

# Create Static Web App
az staticwebapp create \
  --name batten-audit-form \
  --resource-group batten-audit-rg \
  --location eastus2
```

2. **Get Deployment Token**
```bash
az staticwebapp secrets list \
  --name batten-audit-form \
  --resource-group batten-audit-rg \
  --query "properties.apiKey" -o tsv
```

### Phase 3: Configure Azure AD Authentication

1. Go to Azure Portal → Your Static Web App
2. Click "Authentication" in left menu
3. Click "+ Add identity provider"
4. Select "Azure Active Directory"
5. Configure:
   - **App registration name**: batten-audit-form-auth
   - **Supported account types**: Current tenant only
   - **Redirect URI**: Will be auto-configured
6. Click "Add"
7. **Optional**: Configure allowed email domains or groups

### Phase 4: Configure Application Settings

Add these configuration values in Azure Portal under "Configuration":

```
DATABASE_CONNECTION_STRING=<your-connection-string>
```

For email reminders (if using SendGrid):
```
SENDGRID_API_KEY=<your-api-key>
FROM_EMAIL=noreply@virginia.edu
```

### Phase 5: Deploy Application

#### Method 1: GitHub Actions (Recommended)

1. Push your code to GitHub
2. In Azure Portal, go to your Static Web App
3. Click "Deployment" → "GitHub Actions"
4. Connect your GitHub repository
5. Select branch: `main`
6. Build presets: Choose "Next.js"
7. App location: `/`
8. API location: leave blank (using built-in API routes)
9. Output location: `.next`

Azure will create a workflow file automatically and deploy!

#### Method 2: Azure CLI

```bash
# Build the app
npm run build

# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy \
  --deployment-token <your-deployment-token> \
  --app-location "." \
  --output-location ".next"
```

### Phase 6: Set Up Email Reminders

#### Option A: Azure Logic Apps (No-Code Solution)

1. **Create Logic App**
   - Go to Azure Portal
   - Create new "Logic App (Consumption)"
   - Name: `batten-audit-reminders`

2. **Configure Workflow**
   - Trigger: "Recurrence"
     - Frequency: Month
     - On day: 20 (or your preferred reminder day)
     - At hour: 9 AM

   - Action 1: "SQL Server - Execute query"
     - Query:
     ```sql
     SELECT user_id, user_name, user_email, area_name
     FROM v_monthly_completion_status
     WHERE status = 'Pending'
     AND current_month = FORMAT(GETDATE(), 'yyyy-MM')
     ```

   - Action 2: "For each" (loop through results)
     - Action: "Send an email (V2)" (using Office 365 Connector)
     - To: `@{items('For_each')?['user_email']}`
     - Subject: `Reminder: Monthly Audit Form - @{items('For_each')?['area_name']}`
     - Body:
     ```html
     <p>Hi @{items('For_each')?['user_name']},</p>

     <p>This is a reminder to complete your monthly audit form for <strong>@{items('For_each')?['area_name']}</strong>.</p>

     <p>Please submit your responses by the end of the month:</p>
     <p><a href="https://your-app-url.azurestaticapps.net">Complete Audit Form</a></p>

     <p>Thank you!</p>
     ```

#### Option B: Azure Function with Timer Trigger

See `functions/README.md` for detailed function implementation.

### Phase 7: Populate User Assignments

Run this SQL to assign users to their areas:

```sql
INSERT INTO user_area_assignments (user_id, user_email, user_name, area_id, area_name)
VALUES
  ('user-id-1', 'john.doe@virginia.edu', 'John Doe', 'desktop-client-user', 'Desktop/Client/User'),
  ('user-id-2', 'jane.smith@virginia.edu', 'Jane Smith', 'data-analytics', 'Data and Analytics'),
  ('user-id-3', 'bob.wilson@virginia.edu', 'Bob Wilson', 'school-systems', 'School Systems');
```

### Phase 8: Test the Deployment

1. **Navigate to your app**: `https://your-app-name.azurestaticapps.net`
2. **Test authentication**: You should be redirected to Azure AD login
3. **Test form submission**:
   - Select an area
   - Answer all questions
   - Submit form
   - Check database for record

4. **Test reminder system**:
   - Manually trigger Logic App
   - Verify email is received

### Phase 9: Configure Custom Domain (Optional)

1. In Azure Portal, go to Static Web App
2. Click "Custom domains"
3. Click "+ Add"
4. Enter your domain (e.g., `audit.thebattenspace.org`)
5. Follow DNS configuration instructions
6. Wait for SSL certificate provisioning (~10 minutes)

## Monitoring and Maintenance

### View Logs
```bash
# Static Web App logs
az monitor log-analytics query \
  --workspace <workspace-id> \
  --analytics-query "AppServiceHTTPLogs | where TimeGenerated > ago(1h)"
```

### Database Maintenance

**Monthly cleanup** (optional - keep 12 months of history):
```sql
DELETE FROM audit_responses
WHERE submitted_at < DATEADD(month, -12, GETDATE());

DELETE FROM email_reminders
WHERE reminder_sent_at < DATEADD(month, -12, GETDATE());
```

**View completion rates**:
```sql
SELECT
  area_name,
  COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
  COUNT(*) as total
FROM v_monthly_completion_status
GROUP BY area_name;
```

## Troubleshooting

### Issue: Users can't log in
- Check Azure AD authentication is configured
- Verify users are in the correct tenant
- Check `staticwebapp.config.json` routes are correct

### Issue: Form submission fails
- Check database connection string in Application Settings
- Verify database firewall allows Azure services
- Check API route logs in Azure Portal

### Issue: Email reminders not sending
- Verify Logic App is enabled and running
- Check Logic App run history for errors
- Verify email connector is authenticated
- Check database view returns expected results

### Issue: Wrong questions showing
- Edit `data/questions.ts`
- Redeploy application
- Clear browser cache

## Cost Estimates (Monthly)

- **Azure Static Web Apps**: Free tier available, or ~$9/month for Standard
- **Azure SQL Database**: ~$5-15/month (Basic tier) or ~$15-30/month (S0 Standard)
- **AWS RDS PostgreSQL**: ~$15-30/month (db.t3.micro)
- **Azure Logic Apps**: ~$0-5/month (few runs per month)
- **SendGrid**: Free tier (100 emails/day)

**Total estimated cost**: $5-50/month depending on tier selections

## Security Best Practices

- ✅ Use managed identities where possible
- ✅ Store secrets in Azure Key Vault (for production)
- ✅ Enable diagnostic logging
- ✅ Regularly update dependencies
- ✅ Use parameterized SQL queries only
- ✅ Implement rate limiting on API routes
- ✅ Monitor for unusual activity

## Next Steps

After deployment:
1. Add remaining questions for Data and Analytics area
2. Add remaining questions for School Systems area
3. Create admin dashboard (see README for guidance)
4. Set up monitoring alerts
5. Train users on the system

## Support Contacts

- Technical issues: Batten IT Team
- Authentication issues: Azure AD Administrator
- Database issues: Database Administrator
