# Azure Static Web Apps Deployment Issues

## Current Status
**The application builds successfully but fails to deploy to Azure Static Web Apps.**

## Problem Summary
Azure Static Web Apps has **fundamental incompatibility** with Next.js when using server-side rendering (SSR) or API routes. The deployment consistently fails with "Web app warm up timed out" after successful builds.

---

## Issues Encountered (in chronological order)

### 1. ✅ SOLVED: Tailwind CSS v4 Compatibility
**Problem**: Next.js 16 uses Tailwind v4 which has different syntax
**Solution**: Updated `app/globals.css` to use `@import "tailwindcss"` and `@theme` directive instead of v3's `@tailwind` directives

### 2. ✅ SOLVED: Node.js Version Mismatch
**Problem**: Azure was using Node.js 22, but Azure Static Web Apps runtime only supports Node 18 or 20
**Solution**:
- Added `.nvmrc` with value `20`
- Added `engines` field in `package.json` with `"node": ">=20.9.0"`
- Added `NODE_VERSION: '20'` env variable in workflow
- Set `apiRuntime: "node:20"` in `staticwebapp.config.json`

### 3. ✅ SOLVED: TypeScript Compilation Errors
**Problem**: TypeScript tried to compile Azure Functions code in `/functions` directory
**Solution**: Added `"exclude": ["node_modules", "functions", "database"]` to `tsconfig.json`

### 4. ✅ SOLVED: Invalid API Token
**Problem**: Deployment token was invalid or from wrong Static Web App
**Solution**:
- Regenerated fresh token from Azure Portal
- Updated GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN_GRAY_BUSH_0A627730F`
- Switched Azure configuration from "GitHub" auth to "Deployment token" auth

### 5. ❌ UNSOLVED: Next.js SSR Incompatibility with Azure Static Web Apps
**Problem**: Azure Static Web Apps expects fully static sites, but Next.js SSR apps require a Node.js server
**Error**: "Web app warm up timed out" (build succeeds, deployment fails)
**Root Cause**: Azure Static Web Apps cannot run Next.js server-side code

---

## What We Tried

### Attempt 1: Static Export
- Set `output: 'export'` in `next.config.ts`
- Changed `output_location` to `"out"`
- **Result**: Build failed because static export doesn't support API routes

### Attempt 2: Remove API Routes
- Deleted `/app/api` directory
- Reverted to standard Next.js build
- **Result**: Still fails with warm-up timeout (SSR still requires Node.js runtime)

---

## The Fundamental Problem

**Azure Static Web Apps is designed for:**
- Pure static HTML/CSS/JS
- Static site generators
- JAMstack apps
- Azure Functions for backend (separate from the frontend)

**Next.js with SSR requires:**
- Node.js runtime for server-side rendering
- Dynamic page generation
- Server components

**These are incompatible.**

---

## Recommended Solutions

### Option 1: Deploy to Vercel (EASIEST - 5 minutes)
**Pros:**
- Made specifically for Next.js
- Free tier
- Automatic deployments from GitHub
- Full SSR and API routes support
- Zero configuration needed

**Steps:**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import the `FBSITAudit` repository
4. Click Deploy
5. Done!

### Option 2: Azure App Service (stays in Azure ecosystem)
**Pros:**
- Full Node.js support
- SSR works perfectly
- Can connect to Azure SQL easily
- Stays within Azure

**Cons:**
- More expensive than Static Web Apps
- Requires more configuration

**Steps:**
1. Create Azure App Service (Web App)
2. Select Node 20 LTS runtime
3. Connect to GitHub repository
4. Configure build command: `npm run build`
5. Configure start command: `npm run start`
6. Deploy

### Option 3: Make Next.js Fully Static (most work)
**Requires:**
1. Remove all server-side rendering
2. Remove all API routes
3. Use only client-side data fetching
4. Set `output: 'export'` in `next.config.ts`
5. Replace API routes with:
   - Azure Functions (separate deployment)
   - AWS Lambda
   - Or external API

**This defeats the purpose of Next.js and is NOT recommended.**

---

## Current Application State

### What Works:
✅ All UI components render correctly
✅ Forms work with localStorage
✅ Admin dashboard displays saved responses
✅ Batten branding applied correctly
✅ Background image displays
✅ TypeScript compiles without errors
✅ Build process completes successfully

### What Doesn't Work:
❌ Deployment to Azure Static Web Apps
❌ Database integration (removed for deployment attempt)
❌ API endpoints (removed for deployment attempt)

### What's Missing for Production:
- Backend database (Azure SQL or AWS RDS)
- Authentication (Azure AD planned)
- Email reminders (Azure Functions planned)
- Persistence beyond localStorage

---

## Files Modified for Deployment Attempts

1. **`.nvmrc`** - Node version specification
2. **`package.json`** - Added engines field
3. **`tsconfig.json`** - Excluded functions directory
4. **`staticwebapp.config.json`** - Node runtime configuration
5. **`next.config.ts`** - Attempted static export (reverted)
6. **`.github/workflows/azure-static-web-apps-gray-bush-0a627730f.yml`** - Multiple iterations
7. **`app/api/*`** - Deleted (incompatible with static export)

---

## Next Steps (Recommended)

### Immediate (5 minutes):
1. Deploy to Vercel for quick demo/testing
2. Application will work perfectly with zero changes

### Short-term (1-2 hours):
1. Set up Azure App Service
2. Connect to Azure SQL database
3. Configure Azure AD authentication
4. Deploy via GitHub Actions

### Long-term (as needed):
1. Add Azure Functions for email reminders
2. Set up monitoring and analytics
3. Configure custom domain
4. Implement proper error handling and logging

---

## Repository Information
- **GitHub**: https://github.com/behartless67-a11y/FBSITAudit
- **Branch**: main
- **Last Successful Build**: Build succeeds, deployment fails
- **Azure Static Web App**: gray-bush-0a627730f

---

## Key Takeaway

**Azure Static Web Apps is the wrong service for this Next.js application.** The application needs server-side rendering capabilities that Azure Static Web Apps fundamentally cannot provide. The fastest path forward is either Vercel (easiest) or Azure App Service (stays in Azure).
