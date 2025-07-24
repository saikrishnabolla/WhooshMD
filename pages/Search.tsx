'use client'

import React, { useState, useEffect } from 'react';
import { Phone, Search as SearchIcon, Loader2, ChevronRight, Users, Sparkles } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import ProviderCard from '../components/ProviderCard';
import ProviderDetail from '../components/ProviderDetail';
import EmptyState from '../components/EmptyState';
import VoiceCallModal from '../components/VoiceCallModal';
import SearchHistory from '../components/SearchHistory';
import { Provider, SearchParams, SearchHistoryItem } from '../types';
import { searchProviders } from '../services/api';
import { addSearchHistory } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const RESULTS_PER_PAGE = 60;
const MAX_PAGES = 3;
const MAX_SELECTION = 5;

interface CallResult {
  provider_npi: string;
  phone_number: string;
  status: "calling" | "completed" | "failed";
  availability_status?: string;
  availability_details?: string;
  summary?: string;
  sentiment?: string;
  call_date?: string;
  recording_url?: string;
}

const Search: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    version: '2.1',
    limit: RESULTS_PER_PAGE,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>([]);
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allResults, setAllResults] = useState<Provider[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [originalSearchParams, setOriginalSearchParams] = useState<SearchParams | null>(null);
  const [callResults, setCallResults] = useState<Map<string, CallResult>>(new Map());

  // Handle URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postal_code = urlParams.get('postal_code');
    const taxonomy_description = urlParams.get('taxonomy_description');
    
    if (postal_code || taxonomy_description) {
      const params: SearchParams = {
        version: '2.1',
        limit: RESULTS_PER_PAGE,
        ...(postal_code && { postal_code }),
        ...(taxonomy_description && { taxonomy_description })
      };
      
      setSearchParams(params);
      handleSearch(params);
    }
  }, []);

  const fetchCallResults = React.useCallback(async () => {
    if (!user || allResults.length === 0) return;
    
    try {
      const providerNpis = allResults.map(p => p.number);
      const response = await fetch('/api/call-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_npis: providerNpis,
          user_id: user.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const resultsMap = new Map<string, CallResult>();
        data.results?.forEach((result: CallResult) => {
          resultsMap.set(result.provider_npi, result);
        });
        setCallResults(resultsMap);
      }
    } catch (error) {
      console.error('Error fetching call results:', error);
    }
  }, [user, allResults]);

  // Fetch call results for all providers
  useEffect(() => {
    if (allResults.length > 0 && user) {
      fetchCallResults();
    }
  }, [allResults, user, fetchCallResults]);

  const handleSearch = async (params: SearchParams, page: number = 1) => {
    setIsLoading(true);
    setError(null);
    setCurrentPage(page);
    
    // Calculate skip value for pagination
    const skip = (page - 1) * RESULTS_PER_PAGE;
    const searchParamsWithPagination = {
      ...params,
      limit: RESULTS_PER_PAGE,
      skip,
    };
    
    try {
      const response = await searchProviders(searchParamsWithPagination);
      
      if (page === 1) {
        // First page - reset everything
        setAllResults(response.results);
        setTotalResults(response.result_count);
        setOriginalSearchParams(params);
        setSearchPerformed(true);
        setSelectedProviders([]); // Clear selection on new search
        
        // Add to search history only for new searches
        if (response.result_count > 0) {
          const historyItem: SearchHistoryItem = {
            id: uuidv4(),
            params,
            timestamp: Date.now(),
            resultCount: response.result_count,
          };
          addSearchHistory(historyItem);
        }
      } else {
        // Subsequent pages - append results
        setAllResults(prev => [...prev, ...response.results]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching for providers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = (params: SearchParams) => {
    setAllResults([]);
    setCurrentPage(1);
    setSearchParams(params);
    handleSearch(params, 1);
  };

  const handleLoadMore = () => {
    if (currentPage < MAX_PAGES && originalSearchParams) {
      const nextPage = currentPage + 1;
      handleSearch(originalSearchParams, nextPage);
    }
  };

  const handleViewDetails = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const handleCloseDetails = () => {
    setSelectedProvider(null);
  };

  const handleSelectHistory = (params: SearchParams) => {
    setSearchParams(params);
    handleNewSearch(params);
  };

  const handleProviderSelection = (provider: Provider, selected: boolean) => {
    setSelectedProviders(prev => {
      if (selected) {
        if (prev.length >= MAX_SELECTION) {
          alert(`You can only select up to ${MAX_SELECTION} providers for availability checking`);
          return prev;
        }
        return [...prev, provider];
      } else {
        return prev.filter(p => p.number !== provider.number);
      }
    });
  };

  const handleStartAvailabilityCheck = () => {
    if (selectedProviders.length === 0) {
      alert('Please select at least one provider for availability checking');
      return;
    }
    setShowVoiceCallModal(true);
  };

  const handleCloseVoiceModal = () => {
    setShowVoiceCallModal(false);
    // Refresh call results after modal closes
    setTimeout(() => {
      if (user) {
        fetchCallResults();
      }
    }, 1000);
  };

  const canLoadMore = currentPage < MAX_PAGES && allResults.length < totalResults;
  const hasMoreResults = totalResults > allResults.length;

  // Sort results to show AI-verified providers first
  const sortedResults = React.useMemo(() => {
    return [...allResults].sort((a, b) => {
      const aResult = callResults.get(a.number);
      const bResult = callResults.get(b.number);
      
      // AI-verified providers first
      if (aResult?.status === 'completed' && bResult?.status !== 'completed') return -1;
      if (bResult?.status === 'completed' && aResult?.status !== 'completed') return 1;
      
      // Then providers currently being called
      if (aResult?.status === 'calling' && bResult?.status !== 'calling') return -1;
      if (bResult?.status === 'calling' && aResult?.status !== 'calling') return 1;
      
      return 0;
    });
  }, [allResults, callResults]);

  const verifiedProvidersCount = Array.from(callResults.values()).filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section - Minimal and clean */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4 tracking-tight">
              Find Healthcare
              <span className="block font-medium text-primary-600">Providers Near You</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Search thousands of verified healthcare providers and check real-time availability with AI
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <SearchForm 
              onSearch={handleNewSearch} 
              isLoading={isLoading}
              initialParams={searchParams}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        
        {/* Search History */}
        <div className="mb-8">
          <SearchHistory onSelectHistory={handleSelectHistory} />
        </div>

        {/* AI Availability Stats */}
        {verifiedProvidersCount > 0 && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  AI Verified: {verifiedProvidersCount} provider{verifiedProvidersCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="h-4 w-px bg-blue-300"></div>
              <span className="text-xs text-blue-700">
                Real-time availability checked by AI agents
              </span>
            </div>
          </div>
        )}

        {/* Selection and Action Bar */}
        {searchPerformed && totalResults > 0 && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {selectedProviders.length}/{MAX_SELECTION} selected
                  </span>
                </div>
                {selectedProviders.length > 0 && (
                  <div className="text-xs text-gray-500">
                    for availability check
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {selectedProviders.length > 0 && (
                  <button
                    onClick={() => setSelectedProviders([])}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear Selection
                  </button>
                )}
                
                <button
                  onClick={handleStartAvailabilityCheck}
                  disabled={selectedProviders.length === 0}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg
                    ${selectedProviders.length > 0
                      ? 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-xl'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Phone size={18} />
                  <span>
                    {selectedProviders.length === 0 
                      ? 'Select Providers for AI Check' 
                      : `Check Availability (${selectedProviders.length})`
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && currentPage === 1 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-lg">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
              <span className="text-lg font-medium text-gray-700">Finding providers...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <EmptyState type="error" message={error} />
        )}

        {/* Initial State */}
        {!searchPerformed && !isLoading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                <SearchIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Ready to Search</h3>
              <p className="text-gray-600">Enter your search criteria above to find healthcare providers in your area</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {searchPerformed && totalResults === 0 && !isLoading && (
          <EmptyState type="no-results" />
        )}

        {/* Results */}
        {totalResults > 0 && !isLoading && (
          <div>
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {sortedResults.map((provider) => (
                <ProviderCard 
                  key={provider.number}
                  provider={provider} 
                  onViewDetails={handleViewDetails}
                  isSelected={selectedProviders.some(p => p.number === provider.number)}
                  onSelectionChange={handleProviderSelection}
                  callResult={callResults.get(provider.number)}
                  showSelectionCheckbox={true}
                />
              ))}
            </div>

            {/* Load More / Pagination */}
            {(canLoadMore || hasMoreResults) && (
              <div className="text-center">
                {canLoadMore ? (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl border border-gray-200 font-medium shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Loading more providers...
                      </>
                    ) : (
                      <>
                        <ChevronRight size={20} />
                        Load More Providers ({Math.min(RESULTS_PER_PAGE, totalResults - allResults.length)} more)
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-600 font-medium mb-2">
                      Showing first {MAX_PAGES * RESULTS_PER_PAGE} results
                    </p>
                    <p className="text-sm text-gray-500">
                      Refine your search criteria to see more specific results
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Provider Detail Modal */}
      {selectedProvider && (
        <ProviderDetail 
          provider={selectedProvider} 
          onClose={handleCloseDetails} 
        />
      )}
      
      {/* Voice Call Modal */}
      {showVoiceCallModal && (
        <VoiceCallModal
          providers={selectedProviders}
          onClose={handleCloseVoiceModal}
        />
      )}
    </div>
  );
};

export default Search;