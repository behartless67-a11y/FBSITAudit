# Azure Functions - Email Reminders

This directory contains Azure Functions for sending automated email reminders.

## Setup

### 1. Install Azure Functions Core Tools

```bash
npm install -g azure-functions-core-tools@4
```

### 2. Install Dependencies

```bash
cd functions
npm install
```

### 3. Configure Local Settings

Create `local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "DB_SERVER": "your-server.database.windows.net",
    "DB_NAME": "batten-audit-db",
    "DB_USER": "dbadmin",
    "DB_PASSWORD": "YourPassword123!",
    "SENDGRID_API_KEY": "your-sendgrid-api-key",
    "FROM_EMAIL": "noreply@virginia.edu",
    "APP_URL": "http://localhost:3001"
  }
}
```

### 4. Test Locally

```bash
npm start
```

To trigger manually:
```bash
# In another terminal
curl http://localhost:7071/admin/functions/sendReminders
```

## Deployment

### Deploy to Azure

```bash
# Login
az login

# Create Function App
az functionapp create \
  --name batten-audit-reminders \
  --resource-group batten-audit-rg \
  --consumption-plan-location eastus2 \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --storage-account battenfunctionstorage

# Deploy
func azure functionapp publish batten-audit-reminders
```

### Configure Application Settings

```bash
az functionapp config appsettings set \
  --name batten-audit-reminders \
  --resource-group batten-audit-rg \
  --settings \
    "DB_SERVER=your-server.database.windows.net" \
    "DB_NAME=batten-audit-db" \
    "DB_USER=dbadmin" \
    "DB_PASSWORD=YourPassword123!" \
    "SENDGRID_API_KEY=your-sendgrid-api-key" \
    "FROM_EMAIL=noreply@virginia.edu" \
    "APP_URL=https://your-app.azurestaticapps.net"
```

## Schedule

The function runs based on a CRON schedule in `function.json`:

```
"schedule": "0 0 9 20 * *"
```

This means: **9:00 AM on the 20th of every month**

CRON format: `{second} {minute} {hour} {day} {month} {day-of-week}`

### Common Schedules

- **Daily at 9 AM**: `0 0 9 * * *`
- **Weekly on Monday at 9 AM**: `0 0 9 * * 1`
- **Monthly on 15th at 9 AM**: `0 0 9 15 * *`
- **Every 6 hours**: `0 0 */6 * * *`

## Email Template Customization

Edit the HTML in `index.ts` to customize the email appearance. The current template uses:
- Batten colors (Navy: #232D4B, Orange: #E57200)
- Responsive design
- Clear call-to-action button

## Alternative: Using Office 365 SMTP

If you prefer Office 365 instead of SendGrid:

1. Install nodemailer:
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

2. Replace SendGrid code with:
```typescript
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

await transporter.sendMail({
  from: process.env.FROM_EMAIL,
  to: audit.user_email,
  subject: `Reminder: Monthly Audit Form - ${audit.area_name}`,
  html: /* your html here */
});
```

## Monitoring

### View Function Logs

```bash
func azure functionapp logstream batten-audit-reminders
```

Or in Azure Portal:
1. Go to Function App
2. Click "Functions" → "sendReminders"
3. Click "Monitor"
4. View execution history and logs

### Set Up Alerts

Create alerts for:
- Function failures
- Execution duration > 1 minute
- No executions in past month

## Testing

### Test with Specific Date

The function uses current date. To test with a different month:

1. Temporarily modify the query:
```sql
WHERE status = 'Pending'
  AND current_month = '2024-11'  -- Hardcode month for testing
```

2. Deploy and run
3. Revert changes

### Manual Execution

Trigger via HTTP (for testing):

```bash
curl -X POST \
  "https://batten-audit-reminders.azurewebsites.net/admin/functions/sendReminders" \
  -H "x-functions-key: YOUR_FUNCTION_KEY"
```

## Troubleshooting

### Emails not sending
- Check SendGrid API key is valid
- Verify sender email is authenticated with SendGrid
- Check function logs for errors

### Database connection fails
- Verify firewall allows Azure services
- Check connection string is correct
- Ensure database user has SELECT permission on view

### Function not triggering
- Check CRON schedule syntax
- Verify function is enabled in Azure Portal
- Check Application Insights for execution history

## Cost

Timer-triggered functions on Consumption plan:
- First 1 million executions: Free
- After that: $0.20 per million executions

For monthly execution: Essentially free!
