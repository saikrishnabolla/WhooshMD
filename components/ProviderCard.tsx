'use client'

import React from 'react';
import { Phone, MapPin, Heart, ExternalLink, Calendar, Stethoscope } from 'lucide-react';
import { Provider } from '../types';
import { isFavorite, addFavorite, removeFavorite } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { navigateToUrl } from '../lib/utils';

interface ProviderCardProps {
  provider: Provider;
  onViewDetails: (provider: Provider) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onViewDetails }) => {
  const { user } = useAuth();
  const [favorite, setFavorite] = React.useState(false);

  React.useEffect(() => {
    setFavorite(user ? isFavorite(user.id, provider.number) : false);
  }, [provider.number, user]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigateToUrl('/dashboard');
      return;
    }
    
    if (favorite) {
      removeFavorite(user.id, provider.number);
      setFavorite(false);
    } else {
      addFavorite({
        id: provider.number,
        provider,
        timestamp: Date.now(),
      }, user.id);
      setFavorite(true);
    }
  };

  const getPrimaryAddress = () => {
    return provider.addresses.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses[0];
  };

  const primaryAddress = getPrimaryAddress();
  const primaryTaxonomy = provider.taxonomies.find(tax => tax.primary) || provider.taxonomies[0];
  
  const isOrganization = provider.enumeration_type === 'NPI-2';
  
  const getProviderName = () => {
    if (isOrganization) {
      return provider.basic.organization_name;
    } else {
      const { first_name, last_name, credential } = provider.basic;
      return `${first_name} ${last_name}${credential ? `, ${credential}` : ''}`;
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden cursor-pointer group h-full"
      onClick={() => onViewDetails(provider)}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
              {getProviderName()}
            </h3>
            {primaryTaxonomy && (
              <div className="flex items-center text-sm text-gray-600">
                <Stethoscope size={16} className="mr-2 text-gray-400" />
                <span className="truncate">{primaryTaxonomy.desc}</span>
              </div>
            )}
          </div>
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full flex-shrink-0 ml-3 transition-all duration-200 ${
              favorite 
                ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        {/* Content */}
        <div className="space-y-4 flex-1">
          {primaryAddress && (
            <div className="flex items-start">
              <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <MapPin size={16} className="text-blue-600" />
              </div>
              <div className="text-sm text-gray-700 font-light leading-relaxed">
                <div className="font-medium text-gray-900">{primaryAddress.address_1}</div>
                {primaryAddress.address_2 && <div>{primaryAddress.address_2}</div>}
                <div className="text-gray-600">
                  {primaryAddress.city}, {primaryAddress.state} {primaryAddress.postal_code}
                </div>
              </div>
            </div>
          )}
          
          {primaryAddress?.telephone_number && (
            <div className="flex items-center">
              <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Phone size={16} className="text-green-600" />
              </div>
              <a 
                href={`tel:${primaryAddress.telephone_number.replace(/[^\d]/g, '')}`}
                className="text-sm text-primary-600 hover:text-primary-700 transition-colors font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {primaryAddress.telephone_number}
              </a>
            </div>
          )}
          
          <div className="flex items-center">
            <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Calendar size={16} className="text-purple-600" />
            </div>
            <span className="text-sm text-gray-600 font-light">
              Updated {new Date(provider.basic.last_updated).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-xl mt-6 flex justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">
            NPI: {provider.number}
          </span>
          <button 
            className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors group-hover:gap-2 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(provider);
            }}
          >
            View Details 
            <ExternalLink size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;