import React from 'react';
import { Search, AlertCircle, Loader2, Stethoscope } from 'lucide-react';

interface EmptyStateProps {
  type: 'initial' | 'no-results' | 'error' | 'loading';
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, message }) => {
  const getIcon = () => {
    switch (type) {
      case 'initial':
        return <Stethoscope size={64} className="text-gray-300" />;
      case 'no-results':
        return <Search size={64} className="text-gray-300" />;
      case 'error':
        return <AlertCircle size={64} className="text-red-400" />;
      case 'loading':
        return <Loader2 size={64} className="text-primary-500 animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'initial':
        return 'Ready to find your healthcare provider?';
      case 'no-results':
        return 'No providers found';
      case 'error':
        return 'Something went wrong';
      case 'loading':
        return 'Searching providers...';
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'initial':
        return 'Use the search form above to find verified healthcare providers in your area. All providers are HIPAA compliant and offer real-time availability.';
      case 'no-results':
        return 'Try expanding your search criteria, checking your ZIP code, or selecting a different specialty to find more providers.';
      case 'error':
        return 'We encountered an issue while searching for providers. Please check your connection and try again.';
      case 'loading':
        return 'We\'re searching through thousands of verified healthcare providers to find the best matches for you...';
    }
  };

  const getActionButton = () => {
    if (type === 'no-results') {
      return (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Search size={16} />
          Refine Search
        </button>
      );
    }
    
    if (type === 'error') {
      return (
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Try Again
        </button>
      );
    }
    
    return null;
  };

  return (
    <div className="text-center py-16 lg:py-24">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-8 animate-fade-in">
          {getIcon()}
        </div>
        
        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-light text-gray-900 mb-4 animate-fade-in delay-100">
          {getTitle()}
        </h3>
        
        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed animate-fade-in delay-200 font-light">
          {getMessage()}
        </p>
        
        {/* Action Button */}
        {getActionButton() && (
          <div className="animate-fade-in delay-300">
            {getActionButton()}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;