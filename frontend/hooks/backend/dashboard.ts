import { useState, useCallback, useEffect } from 'react'

export interface DashboardData {
  accountOverview: Record<string, any>
  healthAdoption: Record<string, any>
  strategicOpportunities: Record<string, any>
  relationships: Record<string, any>
  execution: Record<string, any>
  revenueTracker: Array<Record<string, any>>
}

interface UseGetDashboardDataReturn {
  data: DashboardData | null
  loading: boolean
  error: Error | null
  trigger: () => Promise<void>
}

export function useGetDashboardData(): UseGetDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Get the API URL from environment (set in .env.local or via Vercel)
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiUrl}/api/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const dashboardData = (await response.json()) as DashboardData
      setData(dashboardData)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [apiUrl])

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    data,
    loading,
    error,
    trigger: fetchDashboardData,
  }
}
