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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-all duration-200"
      >
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-3">
            <Clock size={16} className="text-blue-600" />
          </div>
          Recent Searches
        </h3>
        <ChevronDown
          size={20}
          className={`text-gray-400 transform transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {isExpanded && (
        <div className="mt-6 space-y-3">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearHistory}
              className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistory(item.params)}
                className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 flex justify-between items-center group border border-transparent hover:border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-1 truncate">
                    {getSearchSummary(item.params)}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-primary-600 font-medium">{item.resultCount} results</span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center">
                    <Search size={14} className="text-primary-600" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchHistory;