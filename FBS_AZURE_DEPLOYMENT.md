# FBS-Compliant Azure Deployment Guide

This guide follows **Frank Batten School IT Standards** for Azure deployments.

## Quick Reference - Resource Naming

| Resource | FBS Name |
|----------|----------|
| Resource Group | `fbs-itaudit-dev-rg` |
| Static Web App | `fbs-itaudit-dev-app` |
| SQL Server | `fbs-itaudit-dev-dbserver` |
| SQL Database | `fbs-itaudit-dev-db` |
| Function App | `fbs-itaudit-dev-func` |
| Storage Account | `fbsitauditdevsa` |
| Logic App | `fbs-itaudit-dev-logic` |
| App Insights | `fbs-itaudit-dev-insights` |

**Region**: `eastus` (FBS standard)

**Required Tags** (on ALL resources):
- `Owner`: FBS IT Team
- `Project`: ITAudit
- `Environment`: Development
- `ManagedBy`: GitHub

---

## Prerequisites

1. Azure CLI installed: `az --version`
2. Logged into Azure: `az login`
3. GitHub CLI installed: `gh --version`
4. Access to BattenIT GitHub organization

---

## Step 1: Create Repository in BattenIT Organization

```bash
# Create the repository in BattenIT org
gh repo create BattenIT/fbs-itaudit \
  --private \
  --description "Monthly IT Audit Form for Frank Batten School" \
  --clone

# Add required topics
gh repo edit BattenIT/fbs-itaudit \
  --add-topic fbs \
  --add-topic batten-it \
  --add-topic nextjs \
  --add-topic azure \
  --add-topic typescript
```

Or if migrating from existing repo:
```bash
# Add BattenIT as new remote
git remote add battenIT https://github.com/BattenIT/fbs-itaudit.git

# Push to new location
git push battenIT main
```

---

## Step 2: Check Existing FBS Resource Groups

**CRITICAL**: Before creating resources, check what already exists!

```bash
# List all FBS resource groups
az group list \
  --query "[?starts_with(name, 'fbs-')].{Name:name, Location:location}" \
  --output table
```

---

## Step 3: Create Azure Resource Group

```bash
az group create \
  --name fbs-itaudit-dev-rg \
  --location eastus \
  --tags Owner="FBS IT Team" Project="ITAudit" Environment="Development" ManagedBy="GitHub"
```

Verify creation:
```bash
az group show --name fbs-itaudit-dev-rg --output table
```

---

## Step 4: Create Azure Static Web App

```bash
az staticwebapp create \
  --name fbs-itaudit-dev-app \
  --resource-group fbs-itaudit-dev-rg \
  --location eastus \
  --sku Standard \
  --tags Owner="FBS IT Team" Project="ITAudit" Environment="Development" ManagedBy="GitHub"
```

Get deployment token for GitHub Actions:
```bash
az staticwebapp secrets list \
  --name fbs-itaudit-dev-app \
  --resource-group fbs-itaudit-dev-rg \
  --query "properties.apiKey" -o tsv
```

---

## Step 5: Create Azure SQL Database

### Create SQL Server
```bash
az sql server create \
  --name fbs-itaudit-dev-dbserver \
  --resource-group fbs-itaudit-dev-rg \
  --location eastus \
  --admin-user fbsdbadmin \
  --admin-password "<GENERATE_SECURE_PASSWORD>"
```

### Create Database
```bash
az sql db create \
  --name fbs-itaudit-dev-db \
  --server fbs-itaudit-dev-dbserver \
  --resource-group fbs-itaudit-dev-rg \
  --service-objective S0 \
  --tags Owner="FBS IT Team" Project="ITAudit" Environment="Development" ManagedBy="GitHub"
```

### Configure Firewall
```bash
# Allow Azure services
az sql server firewall-rule create \
  --resource-group fbs-itaudit-dev-rg \
  --server fbs-itaudit-dev-dbserver \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Run Database Schema
Connect to database and run `database/schema.sql`

---

## Step 6: Create Storage Account (for Functions)

```bash
az storage account create \
  --name fbsitauditdevsa \
  --resource-group fbs-itaudit-dev-rg \
  --location eastus \
  --sku Standard_LRS \
  --tags Owner="FBS IT Team" Project="ITAudit" Environment="Development" ManagedBy="GitHub"
```

---

## Step 7: Create Function App (for Email Reminders)

```bash
az functionapp create \
  --name fbs-itaudit-dev-func \
  --resource-group fbs-itaudit-dev-rg \
  --storage-account fbsitauditdevsa \
  --consumption-plan-location eastus \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4 \
  --tags Owner="FBS IT Team" Project="ITAudit" Environment="Development" ManagedBy="GitHub"
```

---

## Step 8: Create Application Insights

```bash
az monitor app-insights component create \
  --app fbs-itaudit-dev-insights \
  --location eastus \
  --resource-group fbs-itaudit-dev-rg \
  --tags Owner="FBS IT Team" Project="ITAudit" Environment="Development" ManagedBy="GitHub"
```

---

## Step 9: Configure Azure AD Authentication

1. Go to Azure Portal > Static Web App > Authentication
2. Click "+ Add identity provider"
3. Select "Microsoft" (Azure AD)
4. Configure:
   - App registration name: `fbs-itaudit-dev-auth`
   - Supported account types: Single tenant
5. Click "Add"

---

## Step 10: Configure Application Settings

```bash
# Get connection string components
SQL_SERVER="fbs-itaudit-dev-dbserver.database.windows.net"
SQL_DB="fbs-itaudit-dev-db"

# Set Static Web App settings
az staticwebapp appsettings set \
  --name fbs-itaudit-dev-app \
  --resource-group fbs-itaudit-dev-rg \
  --setting-names \
    "DATABASE_CONNECTION_STRING=Server=tcp:${SQL_SERVER},1433;Database=${SQL_DB};Encrypt=true;" \
    "APP_URL=https://fbs-itaudit-dev-app.azurestaticapps.net"
```

For Function App:
```bash
az functionapp config appsettings set \
  --name fbs-itaudit-dev-func \
  --resource-group fbs-itaudit-dev-rg \
  --settings \
    "DB_SERVER=${SQL_SERVER}" \
    "DB_NAME=${SQL_DB}" \
    "DB_USER=fbsdbadmin" \
    "DB_PASSWORD=<YOUR_PASSWORD>" \
    "FROM_EMAIL=noreply@virginia.edu" \
    "APP_URL=https://fbs-itaudit-dev-app.azurestaticapps.net"
```

---

## Step 11: Set Up GitHub Actions

Add the deployment token as a GitHub secret:
```bash
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN \
  --repo BattenIT/fbs-itaudit \
  --body "<deployment-token-from-step-4>"
```

---

## Verification Commands

### List all resources in resource group
```bash
az resource list \
  --resource-group fbs-itaudit-dev-rg \
  --query "[].{Name:name, Type:type, Tags:tags}" \
  --output table
```

### Verify tags on all resources
```bash
az resource list \
  --resource-group fbs-itaudit-dev-rg \
  --query "[].{Name:name, Owner:tags.Owner, Project:tags.Project, Env:tags.Environment}" \
  --output table
```

### Check Static Web App URL
```bash
az staticwebapp show \
  --name fbs-itaudit-dev-app \
  --resource-group fbs-itaudit-dev-rg \
  --query "defaultHostname" -o tsv
```

---

## Cost Estimate (Development Environment)

| Resource | Monthly Cost |
|----------|-------------|
| Static Web App (Standard) | ~$9 |
| Azure SQL (S0) | ~$15 |
| Function App (Consumption) | ~$0 |
| Storage Account | ~$1 |
| App Insights (Free tier) | $0 |
| **Total** | **~$25/month** |

---

## Production Environment

For production, change `dev` to `prod` in all names:
- Resource Group: `fbs-itaudit-prod-rg`
- Static Web App: `fbs-itaudit-prod-app`
- etc.

And update Environment tag to `Production`.

---

## Support

Contact FBS IT Team for assistance with deployment or access issues.
