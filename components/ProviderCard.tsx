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
      className="glass-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group hover-lift h-full"
      onClick={() => onViewDetails(provider)}
    >
      <div className="p-6 cursor-pointer group h-full flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                {getProviderName()}
              </h3>
              {primaryTaxonomy && (
                <div className="flex items-center text-sm text-gray-600">
                  <Stethoscope size={16} className="mr-2 flex-shrink-0" />
                  <span className="truncate">{primaryTaxonomy.desc}</span>
                </div>
              )}
            </div>
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full flex-shrink-0 ${
                favorite 
                  ? 'text-primary-600 hover:text-primary-700' 
                  : 'text-gray-400 hover:text-primary-600'
              } transition-colors focus:outline-none`}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4 flex-1">
          {primaryAddress && (
            <div className="flex items-start">
              <MapPin size={18} className="text-gray-500 mt-1 mr-3 flex-shrink-0" />
              <div className="text-sm text-gray-700 leading-relaxed">
                <div>{primaryAddress.address_1}</div>
                {primaryAddress.address_2 && <div>{primaryAddress.address_2}</div>}
                <div>
                  {primaryAddress.city}, {primaryAddress.state} {primaryAddress.postal_code}
                </div>
              </div>
            </div>
          )}
          
          {primaryAddress?.telephone_number && (
            <div className="flex items-center">
              <Phone size={18} className="text-gray-500 mr-3 flex-shrink-0" />
              <a 
                href={`tel:${primaryAddress.telephone_number.replace(/[^\d]/g, '')}`}
                className="text-sm text-primary-600 hover:text-primary-800 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {primaryAddress.telephone_number}
              </a>
            </div>
          )}
          
          <div className="flex items-center">
            <Calendar size={18} className="text-gray-500 mr-3 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              Last Updated: {new Date(provider.basic.last_updated).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50/50 backdrop-blur-sm p-4 flex justify-between items-center rounded-xl mt-auto">
          <span className="text-xs text-gray-500">
            NPI: {provider.number}
          </span>
          <button 
            className="text-sm text-primary-600 hover:text-primary-800 flex items-center transition-colors font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(provider);
            }}
          >
            View Details <ExternalLink size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;