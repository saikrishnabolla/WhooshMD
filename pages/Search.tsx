'use client'

import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import SearchForm from '../components/SearchForm';
import ProviderCard from '../components/ProviderCard';
import ProviderDetail from '../components/ProviderDetail';
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Find Healthcare Providers</h1>
        <p className="text-gray-600">Search for healthcare providers in your area</p>
      </div>
      
      <SearchForm 
        onSearch={handleSearch} 
        isLoading={isLoading}
        initialParams={searchParams}
      />
      
      <div className="mt-8">
        <SearchHistory onSelectHistory={handleSelectHistory} />
        
        {isLoading ? (
          <EmptyState type="loading" />
        ) : error ? (
          <EmptyState type="error" message={error} />
        ) : !searchPerformed ? (
          <EmptyState type="initial" />
        ) : searchResponse && searchResponse.result_count === 0 ? (
          <EmptyState type="no-results" />
        ) : searchResponse ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-medium text-gray-700">
                {searchResponse.result_count} {searchResponse.result_count === 1 ? 'Provider' : 'Providers'} Found
              </h2>
              {selectedProviders.length > 0 && (
                <button
                  onClick={() => setShowVoiceCallModal(true)}
                  className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto"
                >
                  <Phone size={16} />
                  Check Availability ({selectedProviders.length})
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {searchResponse.results.map((provider) => (
                <div key={provider.number} className="relative">
                  <ProviderCard 
                    provider={provider} 
                    onViewDetails={handleViewDetails}
                  />
                  <button
                    onClick={() => toggleProviderSelection(provider)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                      selectedProviders.some(p => p.number === provider.number)
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-400 hover:text-primary-600'
                    }`}
                  >
                    <Phone size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      
      {selectedProvider && (
        <ProviderDetail 
          provider={selectedProvider} 
          onClose={handleCloseDetails} 
        />
      )}
      
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