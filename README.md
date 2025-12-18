# FBS IT Audit - Monthly Audit Form

A web application for managing monthly IT audit questionnaires at the Frank Batten School of Leadership and Public Policy.

## Project Overview

This application enables FBS IT staff to:
- Submit monthly audit questionnaires for different IT areas
- Track submission status across teams and months
- Receive automated email reminders for incomplete audits
- View completion dashboards (admin)

**IT Areas Covered:**
- Desktop/Client/User
- Data and Analytics
- School Systems

## Prerequisites

Before running this application, ensure you have:

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20.9.0+ | LTS recommended |
| npm | 10.0+ | Comes with Node.js |
| Azure CLI | Latest | For deployment |
| GitHub CLI | Latest | For repository management |
| Azure Account | - | With active subscription |

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BattenIT/fbs-itaudit.git
cd fbs-itaudit
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (see Environment Variables section).

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### For IT Staff
1. Navigate to the application URL
2. Sign in with your UVA Azure AD credentials
3. Select your IT area from the dropdown
4. Complete all required questions
5. Submit the form

### For Administrators
1. Navigate to `/admin`
2. View all submissions and completion status
3. Export data as needed

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.x |
| UI Library | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Hosting | Azure Static Web Apps | - |
| Database | Azure SQL Database | - |
| Auth | Azure AD | - |
| Functions | Azure Functions | v4 |

## Environment Variables

```bash
# Database
DATABASE_CONNECTION_STRING=Server=tcp:fbs-itaudit-dev-dbserver.database.windows.net,1433;Database=fbs-itaudit-dev-db;...

# Email (choose one)
SENDGRID_API_KEY=your-sendgrid-key
# OR
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@virginia.edu
SMTP_PASSWORD=your-password

# Application
FROM_EMAIL=noreply@virginia.edu
APP_URL=https://fbs-itaudit-dev-app.azurestaticapps.net
```

## Deployment

See [FBS_AZURE_DEPLOYMENT.md](FBS_AZURE_DEPLOYMENT.md) for complete FBS-compliant deployment instructions.

### Quick Deploy Summary

1. **Create Azure Resources** (following FBS naming standards)
2. **Configure GitHub Actions** with deployment token
3. **Set up Azure AD authentication**
4. **Run database schema**
5. **Push to main branch** to trigger deployment

### FBS Resource Naming

| Resource | Development | Production |
|----------|-------------|------------|
| Resource Group | `fbs-itaudit-dev-rg` | `fbs-itaudit-prod-rg` |
| Static Web App | `fbs-itaudit-dev-app` | `fbs-itaudit-prod-app` |
| SQL Database | `fbs-itaudit-dev-db` | `fbs-itaudit-prod-db` |

## Project Structure

```
fbs-itaudit/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── page.tsx           # Main audit form
├── components/            # React components
├── data/                  # Question definitions
├── database/              # SQL schema files
├── functions/             # Azure Functions (email reminders)
├── lib/                   # Utility functions
├── public/                # Static assets
├── types/                 # TypeScript definitions
└── FBS_AZURE_DEPLOYMENT.md # Deployment guide
```

## Adding New Questions

Edit `data/questions.ts`:

```typescript
{
  id: 11,
  section: 'New Section',
  text: 'Your question here?',
  type: 'single-choice',
  required: true,
  options: ['Yes', 'No', 'N/A']
}
```

## Security

- Azure AD authentication required for all users
- Role-based access control for admin features
- SQL injection protection via parameterized queries
- HTTPS enforced by Azure Static Web Apps
- Secrets stored in Azure Key Vault / App Settings

## Contact

**FBS IT Team**
- Email: Contact through UVA IT channels
- GitHub: [@BattenIT](https://github.com/BattenIT)

For issues with this application:
1. Check existing GitHub Issues
2. Create a new issue with detailed description
3. Contact FBS IT Team directly for urgent matters

## License

Internal use only - Frank Batten School of Leadership and Public Policy, University of Virginia.
