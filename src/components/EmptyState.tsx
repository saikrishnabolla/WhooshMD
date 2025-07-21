import React from 'react';
import { Search, AlertCircle, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  type: 'initial' | 'no-results' | 'error' | 'loading';
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, message }) => {
  const getIcon = () => {
    switch (type) {
      case 'initial':
        return <Search size={48} className="text-gray-400" />;
      case 'no-results':
        return <Search size={48} className="text-gray-400" />;
      case 'error':
        return <AlertCircle size={48} className="text-red-500" />;
      case 'loading':
        return <Loader2 size={48} className="text-primary-500 animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'initial':
        return 'Start searching for providers';
      case 'no-results':
        return 'No providers found';
      case 'error':
        return 'Something went wrong';
      case 'loading':
        return 'Searching for providers...';
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'initial':
        return 'Use the search form above to find healthcare providers.';
      case 'no-results':
        return 'Try adjusting your search criteria or expanding your search area.';
      case 'error':
        return 'An error occurred while searching for providers. Please try again.';
      case 'loading':
        return 'Please wait while we search for healthcare providers...';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {getTitle()}
      </h3>
      <p className="text-gray-600 max-w-md">
        {getMessage()}
      </p>
    </div>
  );
};

export default EmptyState;