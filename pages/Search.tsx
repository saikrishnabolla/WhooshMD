'use client'

import React, { useState, useEffect } from 'react';
import { Phone, Shield, Award, Search as SearchIcon, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-white">
      {/* Hero Section - Apple-inspired minimal design */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-200 rounded-full animate-pulse opacity-40" />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-green-300 rounded-full animate-pulse opacity-30 delay-1000" />
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse opacity-50 delay-2000" />
        </div>
        
        <div className="container relative mx-auto px-6 lg:px-8 max-w-6xl py-16 lg:py-24">
          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-2 rounded-full text-green-700">
              <Shield size={14} />
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full text-blue-700">
              <Award size={14} />
              <span className="text-sm font-medium">Verified Providers</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 px-4 py-2 rounded-full text-purple-700">
              <SearchIcon size={14} />
              <span className="text-sm font-medium">Real-time Availability</span>
            </div>
          </div>
          
          <div className="text-center max-w-4xl mx-auto">
            {/* Main headline - Apple-style typography */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight tracking-tight animate-fade-scale">
              Find your perfect
              <span className="block font-medium text-primary-600">
                healthcare provider
              </span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-200 font-light">
              Search verified healthcare providers with real-time availability
              <span className="block">in your area — all HIPAA compliant and secure.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Search Form Section */}
      <section className="relative py-8 lg:py-12">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <SearchForm 
            onSearch={handleSearch} 
            isLoading={isLoading}
            initialParams={searchParams}
          />
        </div>
      </section>

      {/* Search History Section */}
      <section className="pb-8">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          <SearchHistory onSelectHistory={handleSelectHistory} />
        </div>
      </section>

      {/* Results Section */}
      <section className="pb-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
          {isLoading ? (
            <EmptyState type="loading" />
          ) : error ? (
            <EmptyState type="error" message={error} />
          ) : !searchPerformed ? (
            <EmptyState type="initial" />
          ) : searchResponse && searchResponse.result_count === 0 ? (
            <EmptyState type="no-results" />
          ) : searchResponse ? (
            <div className="space-y-8">
              {/* Results Header */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">
                    {searchResponse.result_count.toLocaleString()} 
                    <span className="font-medium"> provider{searchResponse.result_count === 1 ? '' : 's'} found</span>
                  </h2>
                  <p className="text-gray-600">
                    All providers are verified and HIPAA compliant
                  </p>
                </div>
                
                {selectedProviders.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="text-center sm:text-right">
                      <div className="text-sm text-gray-500">
                        {selectedProviders.length} provider{selectedProviders.length === 1 ? '' : 's'} selected
                      </div>
                      <div className="text-xs text-gray-400">
                        Maximum 5 providers
                      </div>
                    </div>
                    <button
                      onClick={() => setShowVoiceCallModal(true)}
                      className="group bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Phone size={18} />
                      Check Availability
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Provider Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResponse.results.map((provider) => (
                  <div key={provider.number} className="relative group">
                    <ProviderCard 
                      provider={provider} 
                      onViewDetails={handleViewDetails}
                    />
                    <button
                      onClick={() => toggleProviderSelection(provider)}
                      className={`absolute top-4 right-4 p-2.5 rounded-full transition-all duration-300 ${
                        selectedProviders.some(p => p.number === provider.number)
                          ? 'bg-primary-600 text-white shadow-lg scale-110'
                          : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-primary-600 hover:bg-white shadow-sm group-hover:shadow-md'
                      }`}
                      title={selectedProviders.some(p => p.number === provider.number) ? 'Remove from selection' : 'Add to selection'}
                    >
                      <Phone size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
      
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