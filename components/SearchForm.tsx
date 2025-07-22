'use client'

import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { SearchParams } from '../types';
import { getCurrentLocation, getPostalCodeFromCoordinates } from '../services/api';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  initialParams?: SearchParams;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading, initialParams }) => {
  const [searchParams, setSearchParams] = useState<SearchParams>(
    initialParams || {
      version: '2.1',
      limit: 50,
    }
  );
  const [advancedMode, setAdvancedMode] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [providerName, setProviderName] = useState('');
  
  const specialties = [
    { value: '', label: 'All Specialties' },
    { value: 'Family Medicine', label: 'Family Medicine' },
    { value: 'Internal Medicine', label: 'Internal Medicine' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'Obstetrics/Gynecology', label: 'Obstetrics/Gynecology' },
    { value: 'Orthopedic Surgery', label: 'Orthopedic Surgery' },
    { value: 'Psychiatry', label: 'Psychiatry' },
    { value: 'Dentistry', label: 'Dentistry' },
    { value: 'Physical Therapy', label: 'Physical Therapy' },
    { value: 'Optometry', label: 'Optometry' },
    { value: 'Chiropractic', label: 'Chiropractic' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleProviderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProviderName(value);
    
    // Parse the name and update search params
    if (searchParams.enumeration_type === 'NPI-2') {
      setSearchParams(prev => ({ ...prev, organization_name: value }));
    } else {
      // For individuals, treat as last name if single word, or split first/last
      const nameParts = value.trim().split(' ');
      if (nameParts.length === 1) {
        setSearchParams(prev => ({ 
          ...prev, 
          last_name: nameParts[0],
          first_name: ''
        }));
      } else {
        setSearchParams(prev => ({ 
          ...prev, 
          first_name: nameParts[0],
          last_name: nameParts.slice(1).join(' ')
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one search parameter is provided
    const hasSearchParam = Object.entries(searchParams).some(([key, value]) => {
      return key !== 'version' && key !== 'limit' && key !== 'skip' && value;
    });
    
    if (!hasSearchParam) {
      alert('Please enter at least one search parameter');
      return;
    }
    
    onSearch(searchParams);
  };

  const handleClear = () => {
    setSearchParams({
      version: '2.1',
      limit: 50,
    });
    setProviderName('');
  };

  const handleUseCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      
      if (location) {
        const postalCode = await getPostalCodeFromCoordinates(location.lat, location.lng);
        if (postalCode) {
          setSearchParams(prev => ({ ...prev, postal_code: postalCode }));
        } else {
          alert('Unable to determine postal code from your location. Please enter it manually.');
        }
      } else {
        alert('Unable to get your current location. Please ensure location services are enabled.');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('An error occurred while trying to get your location.');
    } finally {
      setGettingLocation(false);
    }
  };

  // Update search params when initial params change
  useEffect(() => {
    if (initialParams) {
      setSearchParams(initialParams);
    }
  }, [initialParams]);

  // Update provider name display when enumeration type changes
  useEffect(() => {
    if (searchParams.enumeration_type === 'NPI-2') {
      setProviderName(searchParams.organization_name || '');
    } else {
      const firstName = searchParams.first_name || '';
      const lastName = searchParams.last_name || '';
      setProviderName([firstName, lastName].filter(Boolean).join(' '));
    }
  }, [searchParams.enumeration_type, searchParams.organization_name, searchParams.first_name, searchParams.last_name]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-300">
      <form onSubmit={handleSubmit}>
        {/* Main Search Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Specialty */}
          <div className="lg:col-span-4">
            <label htmlFor="taxonomy_description" className="block text-sm font-medium text-gray-700 mb-2">
              Specialty
            </label>
            <select
              id="taxonomy_description"
              name="taxonomy_description"
              value={searchParams.taxonomy_description || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
            >
              {specialties.map(specialty => (
                <option key={specialty.value} value={specialty.value}>
                  {specialty.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Postal Code */}
          <div className="lg:col-span-3">
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code
            </label>
            <div className="flex">
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={searchParams.postal_code || ''}
                onChange={handleInputChange}
                placeholder="Enter ZIP code"
                className="w-full px-4 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              <button 
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={gettingLocation}
                className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-r-xl border border-l-0 border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0"
                aria-label="Use current location"
              >
                {gettingLocation ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <MapPin size={18} />
                )}
              </button>
            </div>
          </div>
          
          {/* Provider Name */}
          <div className="lg:col-span-3">
            <label htmlFor="provider_name" className="block text-sm font-medium text-gray-700 mb-2">
              Provider Name (Optional)
            </label>
            <input
              type="text"
              id="provider_name"
              value={providerName}
              onChange={handleProviderNameChange}
              placeholder={searchParams.enumeration_type === 'NPI-2' ? 
                "Organization name" : 
                "First and last name"}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              aria-label="Provider or organization name"
            />
          </div>
          
          {/* Search Button */}
          <div className="lg:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Advanced Options Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setAdvancedMode(!advancedMode)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
          >
            {advancedMode ? (
              <>
                <ChevronUp size={16} />
                Hide Advanced Options
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show Advanced Options
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            <X size={16} />
            Clear All
          </button>
        </div>
        
        {/* Advanced Options */}
        {advancedMode && (
          <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="enumeration_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Type
                </label>
                <select
                  id="enumeration_type"
                  name="enumeration_type"
                  value={searchParams.enumeration_type || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                >
                  <option value="">All Types</option>
                  <option value="NPI-1">Individual</option>
                  <option value="NPI-2">Organization</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={searchParams.city || ''}
                  onChange={handleInputChange}
                  placeholder="City name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={searchParams.state || ''}
                  onChange={handleInputChange}
                  placeholder="2-letter state code (e.g., CA)"
                  maxLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 uppercase"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div>
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
                  Results per page
                </label>
                <select
                  id="limit"
                  name="limit"
                  value={searchParams.limit || 50}
                  onChange={handleInputChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchForm;