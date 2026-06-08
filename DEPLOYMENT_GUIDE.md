# CSM Account Planning Dashboard — Deployment Guide

## Overview

This guide walks you through deploying a full-stack CSM Account Planning Dashboard to production:
- **Frontend**: React + Vite → Hosted on **Vercel** (free)
- **Backend**: Node.js + Express → Hosted on **Railway** (~$7/month)
- **Data**: Google Sheets (via service account authentication)

**Total cost**: ~$7/month after one-time setup.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Browser                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  https://your-dashboard.vercel.app (React Frontend)         │
│  ↓                                                           │
│  Fetch → https://your-api.railway.app/api/dashboard         │
│                 (Node.js Backend / Express)                 │
│                 ↓                                            │
│                 Google Sheets API                           │
│                 ↓                                            │
│                 Your Google Sheet with dashboard data       │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before you start, you'll need:

1. **GitHub account** (free) — to host code and connect to Vercel
2. **Vercel account** (free) — to deploy frontend
3. **Railway account** (free) — to deploy backend
4. **Google Cloud account** (free tier) — to set up service account for Sheets API
5. **Git installed locally** (if working locally)

---

## Step 1: Set Up GitHub Repository

### 1.1 Create a GitHub repo

1. Go to **github.com** and click "New" (top left)
2. Name it: `csm-dashboard` (or whatever you prefer)
3. Choose **Public** (so you can deploy with Vercel free tier)
4. Click **Create repository**

### 1.2 Push code to GitHub

You have two options: **CLI or web upload**.

#### Option A: Via Command Line (Recommended)

```bash
cd walmart-dashboard-deployment
git init
git add .
git commit -m "Initial commit: CSM dashboard full stack"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/csm-dashboard.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

#### Option B: Upload files via GitHub web interface

1. On your new GitHub repo, click **Add file** → **Upload files**
2. Drag and drop your entire `walmart-dashboard-deployment` folder
3. Click **Commit changes**

---

## Step 2: Set Up Google Sheets API & Service Account

This allows your backend to read from your Google Sheet without manual authentication.

### 2.1 Create a Google Cloud project

1. Go to **console.cloud.google.com**
2. Click the project dropdown at the top (may say "Select a project")
3. Click **New Project**
4. Name it: `CSM Dashboard`
5. Click **Create**

### 2.2 Enable the Sheets API

1. Go to **APIs & Services** (left sidebar)
2. Click **+ Enable APIs and Services**
3. Search for **Google Sheets API**
4. Click it, then click **Enable**

### 2.3 Create a service account

1. Click **APIs & Services** → **Credentials** (left sidebar)
2. Click **+ Create Credentials** → **Service Account**
3. Fill in:
   - **Service account name**: `csm-dashboard-backend`
   - **Service account ID**: (auto-filled)
   - Click **Create and Continue**
4. Leave roles blank, click **Continue**
5. Click **Create Key** (bottom) → **JSON**
   - A `.json` file will download. **Save this file safely** — it's your credential.

### 2.4 Give the service account access to your Google Sheet

1. Open your Google Sheet (the one with the dashboard data)
2. Click **Share** (top right)
3. In the downloaded JSON file, find the `client_email` field
4. Paste that email into the share dialog
5. Give it **Editor** access
6. Click **Share**

**You now have:**
- A service account JSON credential file (keep this safe!)
- Your Google Sheet is accessible to the backend

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect your GitHub repo to Vercel

1. Go to **vercel.com** and sign up (or sign in)
2. Click **Add New...** → **Project**
3. Click **Import Git Repository**
4. Search for and select `csm-dashboard`
5. Click **Import**

### 3.2 Configure environment variables

Vercel will now ask for environment setup.

1. Click **Environment Variables**
2. Add one variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-railway-url.railway.app` (you'll get this from Railway in Step 4)
   - For now, set it to a placeholder: `https://api.railway.app` (you'll update this later)
3. Click **Deploy**

Vercel will build and deploy your frontend. You'll get a URL like:
```
https://csm-dashboard-abc123.vercel.app
```

**✅ Frontend is now live!** (But won't work yet — backend is pending)

---

## Step 4: Deploy Backend to Railway

### 4.1 Create a Railway project

1. Go to **railway.app** and sign up (or sign in)
2. Click **New Project** (or **Create**)
3. Select **GitHub Repo**
4. Choose your `csm-dashboard` repo
5. Select the root `/backend` directory (Railway will ask for the "root directory")

### 4.2 Set environment variables in Railway

Once your project is created:

1. Click **Variables** in the Railway dashboard
2. Add these variables:

```
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-vercel-url.vercel.app
GOOGLE_SERVICE_ACCOUNT_EMAIL=<copy from your JSON file>
GOOGLE_SERVICE_ACCOUNT_KEY=<copy the entire "private_key" field from your JSON>
```

**How to extract from the JSON file:**

Open your downloaded service account JSON file in a text editor:

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhk...",
  "client_email": "csm-dashboard-backend@your-project.iam.gserviceaccount.com",
  ...
}
```

- **GOOGLE_SERVICE_ACCOUNT_EMAIL**: Copy the `client_email` field
- **GOOGLE_SERVICE_ACCOUNT_KEY**: Copy the entire `private_key` field (including the `-----BEGIN` and `-----END` lines)

### 4.3 Deploy on Railway

1. Once variables are set, Railway automatically builds and deploys
2. Go to the **Deployments** tab to watch the build
3. Once live, you'll see a public URL like:
   ```
   https://csm-dashboard-backend-prod.railway.app
   ```

**Copy this URL — you need it for the next step.**

---

## Step 5: Connect Frontend to Backend

### 5.1 Update Vercel environment variable

1. Go back to **vercel.com** → Your `csm-dashboard` project
2. Click **Settings** → **Environment Variables**
3. Edit the `VITE_API_URL` variable:
   - Change from placeholder to your Railway URL:
   ```
   https://your-railway-app.railway.app
   ```
4. Vercel will automatically redeploy

### 5.2 Verify the connection

1. Go to your Vercel frontend URL
2. You should see the dashboard populate with data from Google Sheets
3. If it's blank, check the browser console (F12 → Console) for errors

---

## Step 6: Testing & Troubleshooting

### Test the backend directly

Open this in your browser:
```
https://your-railway-url.railway.app/health
```

Should return:
```json
{ "status": "ok", "timestamp": "2026-06-07T..." }
```

### Test the API endpoint

```
https://your-railway-url.railway.app/api/dashboard
```

Should return a large JSON object with account data.

### Common issues

| Issue | Solution |
|-------|----------|
| Frontend shows blank dashboard | Check browser console (F12) for CORS or fetch errors. Verify `VITE_API_URL` in Vercel is correct. |
| "Failed to fetch" error | Backend might not be running. Check Railway Deployments tab — look for build errors. |
| Google Sheets returns 403 error | The service account email hasn't been shared on the Google Sheet, or the email is wrong. |
| Backend crashes on startup | Check Railway logs. Likely missing environment variables or typo in credentials. |

---

## Step 7: Update Your Google Sheet

The dashboard reads from two sheets in your Google Sheet:

1. **Dashboard Data** (key-value pairs)
   - Column A: Field name (e.g., "Account Name", "ACV")
   - Column B: Value (e.g., "Walmart Pharmacy", "$1.5M")

2. **Revenue Tracker** (time series data)
   - Columns: Month, Renewal Revenue Actual, Renewal Cumulative, Expansion Revenue Actual, Expansion Cumulative

Update these sheets anytime, and your live dashboard reflects changes immediately (data fetches on page load).

---

## Step 8: Custom Domain (Optional)

To make the URL prettier:

### For Vercel:
1. Go to **vercel.com** → Project Settings → Domains
2. Add your custom domain (e.g., `dashboard.yourdomain.com`)
3. Follow Vercel's DNS setup instructions

### For Railway:
Railway doesn't offer free custom domains. Stick with the `railway.app` URL, or set up a reverse proxy.

---

## Ongoing Maintenance

### Updating the dashboard

1. Make changes locally or in the code
2. Push to GitHub (`git push`)
3. Vercel & Railway auto-redeploy (takes ~2 min)

### Monitoring

- **Vercel**: Go to **Analytics** to see traffic
- **Railway**: Check **Metrics** for CPU/memory usage and **Logs** for errors

### Costs

- **Vercel**: Free forever (unless you exceed bandwidth limits — unlikely)
- **Railway**: ~$7/month for a basic Node.js instance
- **Google Sheets API**: Free (1M queries/month)

---

## Summary Checklist

- [ ] GitHub repo created with code pushed
- [ ] Google Cloud project created
- [ ] Sheets API enabled
- [ ] Service account created & JSON downloaded
- [ ] Service account email added to your Google Sheet (shared)
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway with environment variables
- [ ] Frontend `VITE_API_URL` updated to Railway URL
- [ ] Verified dashboard loads with real data
- [ ] Sent deployed URL to stakeholders

---

## Client Teaching Version

When explaining this to clients, emphasize:

1. **Separation of concerns**: Frontend (presentation) separate from backend (logic)
2. **Scalability**: Each layer can be swapped out (e.g., different database, different frontend framework)
3. **Cost efficiency**: Vercel + Railway is <$10/month vs. Retool's $50+
4. **Transparency**: They own the code; nothing locked into a SaaS tool
5. **Customization**: Any part can be modified without vendor constraints

---

## Support & Next Steps

- **Need to modify the dashboard?** Edit the React components in `/frontend/pages/Dashboard.tsx`
- **Need to change data source?** Update the backend in `/backend/src/dashboard/getDashboardData.ts`
- **Need more backend features?** Add Express routes to `/backend/src/index.ts`

This architecture becomes your template for client deployments.
