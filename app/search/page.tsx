'use client'

import React, { useState, useEffect } from 'react';
import { Suspense } from 'react'
import { Phone, Search as SearchIcon, Loader2, ChevronRight } from 'lucide-react';
import SearchForm from '../../components/SearchForm';
import ProviderCard from '../../components/ProviderCard';
import ProviderDetail from '../../components/ProviderDetail';
import EmptyState from '../../components/EmptyState';
import VoiceCallModal from '../../components/VoiceCallModal';
import SearchHistory from '../../components/SearchHistory';
import { Provider, SearchParams, SearchHistoryItem } from '../../types';
import { searchProviders } from '../../services/api';
import { addSearchHistory } from '../../services/storage';
import { v4 as uuidv4 } from 'uuid';

const RESULTS_PER_PAGE = 60;
const MAX_PAGES = 3;

export const dynamic = 'force-dynamic'

function SearchPage() {
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

  const toggleProviderSelection = (provider: Provider) => {
    setSelectedProviders(prev => {
      const isSelected = prev.some(p => p.number === provider.number);
      if (isSelected) {
        return prev.filter(p => p.number !== provider.number);
      }
      if (prev.length >= 5) {
        alert('You can only select up to 5 providers');
        return prev;
      }
      return [...prev, provider];
    });
  };

  const canLoadMore = currentPage < MAX_PAGES && allResults.length < totalResults;
  const hasMoreResults = totalResults > allResults.length;

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
              Search thousands of verified healthcare providers and book appointments instantly
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
            {/* Voice Call Button */}
            {selectedProviders.length > 0 && (
              <div className="mb-6 flex justify-center">
                <button
                  onClick={() => setShowVoiceCallModal(true)}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Phone size={18} />
                  Check Availability ({selectedProviders.length} provider{selectedProviders.length > 1 ? 's' : ''})
                </button>
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {allResults.map((provider) => (
                <div key={provider.number} className="relative group">
                  <ProviderCard 
                    provider={provider} 
                    onViewDetails={handleViewDetails}
                  />
                  <button
                    onClick={() => toggleProviderSelection(provider)}
                    className={`absolute top-4 right-4 p-3 rounded-full transition-all shadow-lg transform hover:scale-110 ${
                      selectedProviders.some(p => p.number === provider.number)
                        ? 'bg-primary-600 text-white scale-110'
                        : 'bg-white text-gray-400 hover:text-primary-600 hover:bg-primary-50 group-hover:bg-white'
                    }`}
                    title={selectedProviders.some(p => p.number === provider.number) ? 'Remove from availability check' : 'Add to availability check'}
                  >
                    <Phone size={18} />
                  </button>
                </div>
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
          onClose={() => {
            setShowVoiceCallModal(false);
            setSelectedProviders([]);
          }}
        />
      )}
    </div>
  );
}

export default function WrappedSearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  )
}