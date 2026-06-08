# CSM Account Planning Dashboard

A full-stack React + Node.js dashboard for CSM account planning, pulling live data from Google Sheets.

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm/pnpm
- Google Sheets API service account credentials (see DEPLOYMENT_GUIDE.md)

### 1. Set up environment variables

**Frontend** (`frontend/.env.local`):
```env
VITE_API_URL=http://localhost:3000
```

**Backend** (`backend/.env`):
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
GOOGLE_SERVICE_ACCOUNT_EMAIL=<your-service-account-email>
GOOGLE_SERVICE_ACCOUNT_KEY=<your-private-key>
```

### 2. Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend (in a new terminal)
cd backend && npm install
```

### 3. Start the servers

**Backend** (runs on port 3000):
```bash
cd backend
npm run dev
```

**Frontend** (runs on port 5173):
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Project Structure

```
.
├── frontend/                 # React app (Vite)
│   ├── pages/
│   │   └── Dashboard.tsx      # Main dashboard component
│   ├── components/
│   ├── App.tsx
│   └── package.json
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── index.ts          # Express server
│   │   └── dashboard/
│   │       └── getDashboardData.ts  # Google Sheets data fetcher
│   └── package.json
├── DEPLOYMENT_GUIDE.md       # Full deployment instructions
└── README.md                 # This file
```

---

## Deployment

See **DEPLOYMENT_GUIDE.md** for:
- Deploying frontend to Vercel
- Deploying backend to Railway
- Setting up Google Sheets authentication
- Configuring production environment variables

**TL;DR:**
1. Push to GitHub
2. Connect repo to Vercel (frontend) & Railway (backend)
3. Add environment variables
4. Done ✨

---

## Data Structure

The dashboard reads from two sheets in your Google Sheets workbook:

### Dashboard Data (Key-Value Pairs)
Two columns:
- Column A: Field name (e.g., "Account Name", "ACV")
- Column B: Value

Examples:
```
Account Name    | Walmart Pharmacy
ACV             | $1,500,000
Tier Level      | Strategic/Enterprise
Overall Health Score | 8.5
```

### Revenue Tracker
Time-series data:
- Month
- Renewal Revenue Actual
- Renewal Cumulative
- Expansion Revenue Actual
- Expansion Cumulative

---

## Updating the Dashboard Data

Edit your Google Sheet → Changes appear live on the next page refresh.

No need to redeploy code unless you change the dashboard UI or backend logic.

---

## Tech Stack

**Frontend:**
- React 19
- Vite (fast builds)
- TypeScript
- Tailwind CSS
- Recharts (graphs)
- Radix UI (accessible components)

**Backend:**
- Node.js + Express
- TypeScript
- google-spreadsheet (Sheets API client)
- CORS-enabled for cross-origin requests

---

## Support

For detailed deployment steps, infrastructure diagrams, and troubleshooting:
→ See **DEPLOYMENT_GUIDE.md**

For customization questions or issues:
→ Check the frontend components in `/pages/Dashboard.tsx`
→ Update data fetching in `/backend/src/dashboard/getDashboardData.ts`
