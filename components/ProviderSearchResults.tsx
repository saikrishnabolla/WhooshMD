"use client"

import React from 'react'
import { EnhancedProviderCard } from './EnhancedProviderCard'
import { useCallResults } from '../hooks/useCallResults'

interface Provider {
  number: string
  enumeration_type: string
  basic: {
    first_name?: string
    last_name?: string
    organization_name?: string
    credential?: string
    sole_proprietor?: string
    gender?: string
    enumeration_date?: string
    last_updated?: string
    status?: string
  }
  addresses: Array<{
    country_code: string
    country_name: string
    address_purpose: string
    address_type: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postal_code: string
    telephone_number?: string
    fax_number?: string
  }>
  taxonomies: Array<{
    code: string
    desc: string
    primary: boolean
    state?: string
    license?: string
    taxonomy_group?: string
  }>
}

interface ProviderSearchResultsProps {
  providers: Provider[]
  userId?: string
  onProviderSelect?: (provider: Provider) => void
}

export function ProviderSearchResults({ providers, userId, onProviderSelect }: ProviderSearchResultsProps) {
  // Get NPIs from providers for call results lookup
  const providerNpis = providers.map(p => p.number)
  
  // Fetch call results for all providers with auto-refresh
  const { callResults, loading, error, getCallResult } = useCallResults({
    providerNpis,
    userId,
    autoRefresh: true, // Auto-refresh to get real-time updates
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  const handleViewDetails = (provider: Provider) => {
    if (onProviderSelect) {
      onProviderSelect(provider)
    }
    console.log('View details for provider:', provider.number)
  }

  if (error) {
    console.warn('Error loading call results:', error)
    // Still show providers even if call results fail to load
  }

  return (
    <div className="space-y-4">
      {/* Loading indicator for call results */}
      {loading && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-600">Loading AI verification results...</span>
        </div>
      )}

      {/* Provider cards with call results */}
      {providers.map((provider) => {
        const callResult = getCallResult(provider.number)
        
        return (
          <EnhancedProviderCard
            key={provider.number}
            provider={provider}
            callResult={callResult}
            onViewDetails={handleViewDetails}
          />
        )
      })}

      {/* No providers message */}
      {providers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No providers found. Try a different search.</p>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <p>Providers: {providers.length}</p>
          <p>Call Results: {callResults.size}</p>
          <p>Call Results Loading: {loading ? 'Yes' : 'No'}</p>
          {error && <p className="text-red-600">Error: {error}</p>}
        </div>
      )}
    </div>
  )
}

export default ProviderSearchResults