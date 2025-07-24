import { useState, useEffect, useCallback } from 'react'

interface CallResult {
  call_id?: string
  provider_npi: string
  phone_number: string
  status: "calling" | "completed" | "failed"
  availability_status?: string
  availability_details?: string
  summary?: string
  sentiment?: string
  call_date?: string
  recording_url?: string
  // User-relevant extracted variables only (not internal technical details)
  insurance_accepted?: string
  appointment_types_available?: string
  availability_timeframe?: string
  specific_availability?: string
}

interface UseCallResultsOptions {
  providerNpis?: string[]
  userId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseCallResultsByIdOptions {
  callIds?: string[]
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseCallResultsReturn {
  callResults: Map<string, CallResult>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getCallResult: (providerNpi: string) => CallResult | undefined
}

interface UseCallResultsByIdReturn {
  callResults: Map<string, CallResult>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getCallResult: (callId: string) => CallResult | undefined
}

// New hook for call_id-based polling (for real-time dashboard updates)
export function useCallResultsByIds({
  callIds = [],
  autoRefresh = true,
  refreshInterval = 5000, // 5 seconds for real-time updates
}: UseCallResultsByIdOptions = {}): UseCallResultsByIdReturn {
  const [callResults, setCallResults] = useState<Map<string, CallResult>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCallResults = useCallback(async () => {
    if (callIds.length === 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/call-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ call_ids: callIds }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch call results: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.results) {
        const newResults = new Map<string, CallResult>()
        
        data.results.forEach((result: CallResult) => {
          if (result.call_id) {
            newResults.set(result.call_id, result)
          }
        })
        
        setCallResults(newResults)
      } else {
        console.warn('No call results found or invalid response format')
        setCallResults(new Map())
      }
    } catch (err) {
      console.error('Error fetching call results by IDs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch call results')
    } finally {
      setLoading(false)
    }
  }, [callIds])

  const getCallResult = useCallback((callId: string): CallResult | undefined => {
    return callResults.get(callId)
  }, [callResults])

  // Initial fetch
  useEffect(() => {
    fetchCallResults()
  }, [fetchCallResults])

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchCallResults()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchCallResults])

  return {
    callResults,
    loading,
    error,
    refetch: fetchCallResults,
    getCallResult,
  }
}

// Hook for provider_npi-based polling (for provider search)
export function useCallResults({
  providerNpis = [],
  userId,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds for provider search
}: UseCallResultsOptions = {}): UseCallResultsReturn {
  const [callResults, setCallResults] = useState<Map<string, CallResult>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCallResults = useCallback(async () => {
    if (providerNpis.length === 0 && !userId) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      let response: Response

      if (providerNpis.length > 0) {
        // Bulk fetch for specific providers
        response = await fetch('/api/call-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ provider_npis: providerNpis }),
        })
      } else if (userId) {
        // Fetch all results for user
        response = await fetch(`/api/call-results?user_id=${userId}`)
      } else {
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch call results: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.results) {
        const newResults = new Map<string, CallResult>()
        
        data.results.forEach((result: CallResult) => {
          newResults.set(result.provider_npi, result)
        })
        
        setCallResults(newResults)
      } else {
        console.warn('No call results found or invalid response format')
        setCallResults(new Map())
      }
    } catch (err) {
      console.error('Error fetching call results:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch call results')
    } finally {
      setLoading(false)
    }
  }, [providerNpis, userId])

  const getCallResult = useCallback((providerNpi: string): CallResult | undefined => {
    return callResults.get(providerNpi)
  }, [callResults])

  // Initial fetch
  useEffect(() => {
    fetchCallResults()
  }, [fetchCallResults])

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchCallResults()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchCallResults])

  return {
    callResults,
    loading,
    error,
    refetch: fetchCallResults,
    getCallResult,
  }
}

// Hook for fetching a single provider's call result
export function useCallResult(providerNpi: string) {
  const [callResult, setCallResult] = useState<CallResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCallResult = useCallback(async () => {
    if (!providerNpi) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/call-results?provider_npi=${providerNpi}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch call result: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.result) {
        setCallResult(data.result)
      } else {
        setCallResult(null)
      }
    } catch (err) {
      console.error('Error fetching call result:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch call result')
      setCallResult(null)
    } finally {
      setLoading(false)
    }
  }, [providerNpi])

  useEffect(() => {
    fetchCallResult()
  }, [fetchCallResult])

  return {
    callResult,
    loading,
    error,
    refetch: fetchCallResult,
  }
}