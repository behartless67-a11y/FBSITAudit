# Monthly Audit Form - Batten School

A modern web application for managing monthly IT audit questionnaires for the Frank Batten School of Leadership and Public Policy.

## Features

- **Area-based Questionnaires**: Dropdown selector for different IT areas (Desktop/Client/User, Data and Analytics, School Systems)
- **Dynamic Question Loading**: Questions load based on selected area
- **Azure AD Authentication**: Secure login via Azure Easy Auth
- **Monthly Tracking**: Tracks submissions by month to prevent duplicates
- **Email Reminders**: Automated reminders for incomplete audits
- **Admin Dashboard**: View all responses and completion status
- **Batten Brand Styling**: Matches the official Batten School design system

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Libre Baskerville & Inter** fonts

### Backend
- **Azure Static Web Apps** for hosting
- **Azure Functions** for API endpoints
- **Azure AD** for authentication
- **Azure SQL Database** or **AWS RDS PostgreSQL** for data storage
- **Azure Logic Apps** or **Azure Functions with Timer** for email reminders

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Azure account (for deployment)
- Optional: AWS account (if using AWS RDS for database)

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will run with mock authentication data in development mode.

## Database Setup

### Option 1: Azure SQL Database

1. Create an Azure SQL Database in your Azure portal
2. Run the SQL schema from `database/schema.sql` (use the SQL Server version)
3. Configure connection string in your Azure Function App settings

### Option 2: AWS RDS PostgreSQL

1. Create an RDS PostgreSQL instance in AWS
2. Run the PostgreSQL schema from `database/schema.sql` (use the PostgreSQL version)
3. Configure connection string in your Azure Function App settings

### Database Tables

- **audit_responses**: Stores all form submissions
- **email_reminders**: Tracks which reminders have been sent
- **user_area_assignments**: Maps users to their responsible areas
- **v_monthly_completion_status**: View showing completion status

## Deployment to Azure

### Step 1: Create Azure Resources

1. **Azure Static Web App**:
```bash
az staticwebapp create \
  --name batten-audit-form \
  --resource-group your-resource-group \
  --location eastus2
```

2. **Azure SQL Database** (or skip if using AWS RDS):
```bash
az sql server create \
  --name batten-audit-db-server \
  --resource-group your-resource-group \
  --location eastus2 \
  --admin-user dbadmin \
  --admin-password YourSecurePassword123!

az sql db create \
  --name batten-audit-db \
  --server batten-audit-db-server \
  --resource-group your-resource-group \
  --service-objective S0
```

### Step 2: Configure Azure AD Authentication

1. Go to your Static Web App in Azure Portal
2. Navigate to "Authentication"
3. Add "Azure Active Directory" as identity provider
4. Configure allowed users/groups

### Step 3: Deploy the Application

```bash
npm run build

# Deploy using Azure Static Web Apps CLI
npx @azure/static-web-apps-cli deploy \
  --deployment-token <your-deployment-token> \
  --app-location "." \
  --output-location ".next"
```

Or use GitHub Actions (recommended):
- Connect your repository to Azure Static Web Apps
- It will auto-generate a deployment workflow

## Email Reminder System

### Option 1: Azure Logic Apps

1. Create a Logic App with a Recurrence trigger (runs monthly)
2. Add action to query `v_monthly_completion_status` view
3. Filter for status = 'Pending'
4. Send email for each pending submission

### Option 2: Azure Functions with Timer Trigger

Create a timer-triggered function that:
1. Runs daily during the reminder period
2. Queries database for incomplete submissions
3. Sends reminder emails via SendGrid or Azure Communication Services
4. Tracks sent reminders in `email_reminders` table

Example schedule for 15th of month:
```
0 0 9 15 * *  // 9 AM on the 15th of every month
```

## Adding New Questions

1. Edit `data/questions.ts`
2. Add questions to the appropriate area's `questions` array
3. Use sections to organize questions:

```typescript
{
  id: 11,
  section: 'New Section Name',  // This creates a visual section break
  text: 'Your question text?',
  type: 'single-choice',
  required: true,
  options: ['Yes', 'No']
}
```

## Adding New Areas

1. Edit `data/questions.ts`
2. Add a new area object to the `areas` array:

```typescript
{
  id: 'new-area-id',
  name: 'New Area Name',
  questions: [/* your questions */]
}
```

## Environment Variables

For production deployment, configure these in Azure:

```
DATABASE_CONNECTION_STRING=<your-database-connection-string>
SENDGRID_API_KEY=<your-sendgrid-key> // if using SendGrid
SMTP_HOST=<smtp-server>
SMTP_PORT=587
SMTP_USER=<smtp-username>
SMTP_PASSWORD=<smtp-password>
```

## Admin Dashboard

To create an admin dashboard to view responses:

1. Create `/app/admin/page.tsx`
2. Add an API route to fetch all responses
3. Protect with role-based authentication (add "admin" to `allowedRoles` in `staticwebapp.config.json`)

## Security Considerations

- ✅ Azure AD authentication required
- ✅ Role-based access control
- ✅ API routes protected
- ✅ Input validation on API endpoints
- ✅ SQL injection protection (use parameterized queries)
- ✅ HTTPS enforced by Azure Static Web Apps

## Support

For issues or questions, contact the Batten School IT team.

## License

© Frank Batten School of Leadership and Public Policy
