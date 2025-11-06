# Azure Deployment Guide

## Quick Start Deployment to Azure

### Prerequisites
- Azure account with active subscription
- Azure CLI installed (or use Azure Portal)
- GitHub account (for automatic deployments)

---

## Step 1: Create Azure Static Web App

### Option A: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Static Web App"
4. Click "Create"
5. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new `batten-audit-rg`
   - **Name**: `batten-audit-form`
   - **Region**: East US 2 (or closest to you)
   - **SKU**: Standard (for authentication)
   - **Deployment source**: GitHub
   - **GitHub account**: Sign in and authorize
   - **Repository**: behartless67-a11y/FBSITAudit
   - **Branch**: main
   - **Build presets**: Next.js
   - **App location**: /
   - **Output location**: .next

6. Click "Review + Create"
7. Click "Create"

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name batten-audit-rg \
  --location eastus2

# Create Static Web App
az staticwebapp create \
  --name batten-audit-form \
  --resource-group batten-audit-rg \
  --source https://github.com/behartless67-a11y/FBSITAudit \
  --location eastus2 \
  --branch main \
  --app-location "/" \
  --output-location ".next" \
  --login-with-github
```

---

## Step 2: Configure Azure AD Authentication

1. In Azure Portal, go to your Static Web App
2. Click "Authentication" in the left menu
3. Click "+ Add" to add identity provider
4. Select "Azure Active Directory"
5. Configuration:
   - **App registration name**: batten-audit-form-auth
   - **Supported account types**: Current tenant - Single tenant
   - **Client secret**: Azure manages this automatically
6. Click "Add"

### Configure Allowed Roles (Optional)

Edit `staticwebapp.config.json` to restrict access:

```json
{
  "routes": [
    {
      "route": "/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/admin/*",
      "allowedRoles": ["admin"]
    }
  ]
}
```

---

## Step 3: Set Up Database

### Option A: Azure SQL Database

```bash
# Create SQL Server
az sql server create \
  --name batten-audit-db-server \
  --resource-group batten-audit-rg \
  --location eastus2 \
  --admin-user dbadmin \
  --admin-password "YourSecurePassword123!"

# Create database
az sql db create \
  --name batten-audit-db \
  --server batten-audit-db-server \
  --resource-group batten-audit-rg \
  --service-objective S0

# Allow Azure services to access
az sql server firewall-rule create \
  --resource-group batten-audit-rg \
  --server batten-audit-db-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Run Database Schema

1. Connect to your database using Azure Data Studio or SQL Server Management Studio
2. Run the script from `database/schema.sql` (SQL Server version)
3. Verify tables are created

---

## Step 4: Configure Application Settings

In Azure Portal:

1. Go to your Static Web App
2. Click "Configuration" in the left menu
3. Add these Application Settings:

```
DATABASE_CONNECTION_STRING = Server=tcp:batten-audit-db-server.database.windows.net,1433;Database=batten-audit-db;User ID=dbadmin;Password=YourPassword;Encrypt=true;

SENDGRID_API_KEY = (your SendGrid key)
FROM_EMAIL = noreply@virginia.edu
APP_URL = https://batten-audit-form.azurestaticapps.net
```

---

## Step 5: Set Up Email Reminders

### Option A: Azure Logic Apps (Recommended - No Code)

1. Create Logic App:
   ```bash
   az logic workflow create \
     --resource-group batten-audit-rg \
     --location eastus2 \
     --name batten-audit-reminders
   ```

2. Configure in Azure Portal:
   - Trigger: Recurrence (monthly on 20th at 9 AM)
   - Action: SQL Server - Execute query
   - Query: `SELECT * FROM v_monthly_completion_status WHERE status = 'Pending'`
   - Action: For each result, send email

### Option B: Azure Functions

See `functions/README.md` for detailed setup

---

## Step 6: Populate User Assignments

Connect to your database and run:

```sql
-- Add users and their assigned areas
INSERT INTO user_area_assignments (user_id, user_email, user_name, area_id, area_name)
VALUES
  ('user-id-from-azure-ad', 'john.doe@virginia.edu', 'John Doe', 'desktop-client-user', 'Desktop/Client/User'),
  ('user-id-from-azure-ad', 'jane.smith@virginia.edu', 'Jane Smith', 'data-analytics', 'Data and Analytics'),
  ('user-id-from-azure-ad', 'bob.wilson@virginia.edu', 'Bob Wilson', 'school-systems', 'School Systems');
```

**To get user IDs:**
- Users must log in once first
- Check the `audit_responses` table for their user IDs after they submit
- Or query Azure AD via Microsoft Graph API

---

## Step 7: Configure Custom Domain (Optional)

1. In your Static Web App, go to "Custom domains"
2. Click "+ Add"
3. Enter: `audit.thebattenspace.org`
4. Follow DNS configuration instructions
5. SSL certificate will be provisioned automatically

---

## Step 8: Test Deployment

1. Visit your app URL: `https://batten-audit-form.azurestaticapps.net`
2. You should be redirected to Azure AD login
3. After login, test:
   - Form submission
   - Admin dashboard
   - Email reminders (wait for scheduled time or trigger manually)

---

## Troubleshooting

### Authentication not working
- Ensure you're using Standard SKU (not Free)
- Check that Azure AD app is configured correctly
- Verify `staticwebapp.config.json` is in the repo root

### Database connection fails
- Check firewall rules allow Azure services
- Verify connection string is correct
- Test connection from Azure Portal

### Build fails
- Check GitHub Actions logs
- Ensure Node.js version is 18 or higher
- Verify all dependencies are in package.json

### Email reminders not sending
- Check Logic App run history for errors
- Verify database view returns correct data
- Check email service credentials

---

## Monitoring

### Application Insights

1. Create Application Insights:
   ```bash
   az monitor app-insights component create \
     --app batten-audit-insights \
     --location eastus2 \
     --resource-group batten-audit-rg
   ```

2. Link to Static Web App in Azure Portal

### View Logs

```bash
# View deployment logs
az staticwebapp logs show \
  --name batten-audit-form \
  --resource-group batten-audit-rg
```

---

## Cost Estimate

- **Static Web App (Standard)**: ~$9/month
- **Azure SQL Database (S0)**: ~$15/month
- **Logic App**: ~$0-5/month (few executions)
- **Application Insights**: Free tier available

**Total**: ~$25-30/month

---

## Security Checklist

- [ ] Azure AD authentication enabled
- [ ] Database firewall configured
- [ ] Connection strings in App Settings (not code)
- [ ] HTTPS enforced (automatic)
- [ ] Regular database backups enabled
- [ ] Application Insights monitoring enabled
- [ ] Email reminder service secured

---

## Maintenance

### Monthly Tasks
- Review audit completion rates
- Check Application Insights for errors
- Verify email reminders are sending
- Review database size and performance

### Quarterly Tasks
- Review and rotate database passwords
- Update dependencies (`npm update`)
- Review access logs
- Check for security updates

---

## Support

For issues, check:
1. GitHub Actions logs for deployment issues
2. Azure Portal logs for runtime errors
3. Application Insights for performance issues
4. [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed steps

---

## Next Steps

After deployment:
1. Add School Systems questions
2. Train users on the system
3. Set up monitoring alerts
4. Schedule monthly completion reviews
