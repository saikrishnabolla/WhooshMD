'use client'

import React, { useState } from 'react';
import { Clock, X, Search, ChevronDown } from 'lucide-react';
import { SearchHistoryItem, SearchParams } from '../types';
import { getSearchHistory, clearSearchHistory } from '../services/storage';

interface SearchHistoryProps {
  onSelectHistory: (params: SearchParams) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ onSelectHistory }) => {
  const [history, setHistory] = React.useState<SearchHistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  React.useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  if (history.length === 0) {
    return null;
  }

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  const getSearchSummary = (params: SearchParams): string => {
    const parts = [];
    
    if (params.first_name || params.last_name) {
      const name = [params.first_name, params.last_name].filter(Boolean).join(' ');
      parts.push(`Name: ${name}`);
    }
    
    if (params.organization_name) {
      parts.push(`Org: ${params.organization_name}`);
    }
    
    if (params.taxonomy_description) {
      parts.push(`Specialty: ${params.taxonomy_description}`);
    }
    
    if (params.city) {
      parts.push(`City: ${params.city}`);
    }
    
    if (params.state) {
      parts.push(`State: ${params.state}`);
    }
    
    if (params.postal_code) {
      parts.push(`ZIP: ${params.postal_code}`);
    }
    
    return parts.join(' | ') || 'Generic search';
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
      >
        <h3 className="text-lg font-medium text-gray-800 flex items-center">
          <Clock size={18} className="mr-2" />
          Recent Searches
        </h3>
        <ChevronDown
          size={20}
          className={`text-gray-500 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-end mb-2">
            <button
              onClick={handleClearHistory}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear History
            </button>
          </div>
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectHistory(item.params)}
              className="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors flex justify-between items-center group"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">{getSearchSummary(item.params)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(item.timestamp).toLocaleString()} • {item.resultCount} results
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Search size={16} className="text-primary-600" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchHistory;