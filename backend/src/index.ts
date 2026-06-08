import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import getDashboardData from './dashboard/getDashboardData.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// Middleware
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Dashboard data endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    // Initialize Google Sheets auth
    // This expects GOOGLE_APPLICATION_CREDENTIALS to point to a JSON key file
    // with credentials from Google Cloud (Service Account)
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    // Note: In production, you may want to handle credentials differently
    // See deployment guide for Railway-specific setup

    const data = await getDashboardData({
      params: {},
      user: { id: 'public' } as any,
    })

    res.json(data)
  } catch (error) {
    console.error('Dashboard API error:', error)
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CSM Dashboard Backend running on http://localhost:${PORT}`)
  console.log(`📊 API endpoint: http://localhost:${PORT}/api/dashboard`)
  console.log(`🔍 Health check: http://localhost:${PORT}/health`)
})

export default app
