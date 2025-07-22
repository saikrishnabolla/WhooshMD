'use client'

import React, { useState, useEffect } from 'react';
import { Phone, Grid3X3, Map, Filter, MapPin, Search as SearchIcon, Loader2 } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import ProviderCard from '../components/ProviderCard';
import ProviderDetail from '../components/ProviderDetail';
import ProviderMap from '../components/ProviderMap';
import EmptyState from '../components/EmptyState';
import VoiceCallModal from '../components/VoiceCallModal';
import SearchHistory from '../components/SearchHistory';
import { Provider, SearchParams, SearchResponse, SearchHistoryItem } from '../types';
import { searchProviders } from '../services/api';
import { addSearchHistory } from '../services/storage';
import { v4 as uuidv4 } from 'uuid';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    version: '2.1',
    limit: 20,
  });
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>([]);
  const [showVoiceCallModal, setShowVoiceCallModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Handle URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postal_code = urlParams.get('postal_code');
    const taxonomy_description = urlParams.get('taxonomy_description');
    
    if (postal_code || taxonomy_description) {
      const params: SearchParams = {
        version: '2.1',
        limit: 50,
        ...(postal_code && { postal_code }),
        ...(taxonomy_description && { taxonomy_description })
      };
      
      setSearchParams(params);
      handleSearch(params);
    }
  }, []);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setSearchResponse(null);
    setSearchPerformed(true);
    
    try {
      const response = await searchProviders(params);
      setSearchResponse(response);
      
      // Add to search history
      if (response.result_count > 0) {
        const historyItem: SearchHistoryItem = {
          id: uuidv4(),
          params,
          timestamp: Date.now(),
          resultCount: response.result_count,
        };
        addSearchHistory(historyItem);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching for providers');
    } finally {
      setIsLoading(false);
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
    handleSearch(params);
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

  const getSearchSummary = () => {
    const parts = [];
    if (searchParams.taxonomy_description) {
      parts.push(searchParams.taxonomy_description);
    }
    if (searchParams.postal_code) {
      parts.push(`near ${searchParams.postal_code}`);
    }
    if (searchParams.city && searchParams.state) {
      parts.push(`in ${searchParams.city}, ${searchParams.state}`);
    }
    return parts.join(' ');
  };

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
              onSearch={handleSearch} 
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
        {isLoading && (
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
        {searchPerformed && searchResponse && searchResponse.result_count === 0 && !isLoading && (
          <EmptyState type="no-results" />
        )}

        {/* Results */}
        {searchResponse && searchResponse.result_count > 0 && !isLoading && (
          <div>
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-2">
                    {searchResponse.result_count.toLocaleString()} 
                    {searchResponse.result_count === 1 ? ' Provider' : ' Providers'} Found
                  </h2>
                  {getSearchSummary() && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <MapPin size={16} />
                      {getSearchSummary()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid3X3 size={16} />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        viewMode === 'map'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Map size={16} />
                      Map
                    </button>
                  </div>

                  {/* Voice Call Button */}
                  {selectedProviders.length > 0 && (
                    <button
                      onClick={() => setShowVoiceCallModal(true)}
                      className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Phone size={16} />
                      Check Availability ({selectedProviders.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results Content */}
            <div className="relative">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {searchResponse.results.map((provider) => (
                    <div key={provider.number} className="relative">
                      <ProviderCard 
                        provider={provider} 
                        onViewDetails={handleViewDetails}
                      />
                      <button
                        onClick={() => toggleProviderSelection(provider)}
                        className={`absolute top-4 right-4 p-2.5 rounded-full transition-all shadow-lg ${
                          selectedProviders.some(p => p.number === provider.number)
                            ? 'bg-primary-600 text-white scale-110'
                            : 'bg-white text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                      >
                        <Phone size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <ProviderMap
                    providers={searchResponse.results}
                    onProviderSelect={handleViewDetails}
                    className="h-[600px]"
                  />
                  
                  {/* Compact provider list below map */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Providers on Map</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResponse.results.slice(0, 12).map((provider) => {
                        const primaryAddress = provider.addresses.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses[0];
                        const primaryTaxonomy = provider.taxonomies.find(tax => tax.primary) || provider.taxonomies[0];
                        const providerName = provider.enumeration_type === 'NPI-2' 
                          ? provider.basic.organization_name
                          : `${provider.basic.first_name} ${provider.basic.last_name}${provider.basic.credential ? `, ${provider.basic.credential}` : ''}`;
                          
                        return (
                          <div
                            key={provider.number}
                            onClick={() => handleViewDetails(provider)}
                            className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all cursor-pointer group"
                          >
                            <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-primary-700 transition-colors">
                              {providerName}
                            </h4>
                            {primaryTaxonomy && (
                              <p className="text-xs text-gray-600 mb-2">{primaryTaxonomy.desc}</p>
                            )}
                            {primaryAddress && (
                              <p className="text-xs text-gray-500">
                                {primaryAddress.city}, {primaryAddress.state}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {searchResponse.results.length > 12 && (
                      <p className="text-center text-gray-500 text-sm mt-4">
                        +{searchResponse.results.length - 12} more providers
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
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
};

export default Search;