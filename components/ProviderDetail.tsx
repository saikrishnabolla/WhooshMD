'use client'

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Globe, Heart, Calendar, Stethoscope, ArrowLeft, Star } from 'lucide-react';
import { Provider } from '../types';
import { useAuth } from '../context/AuthContext';
import { navigateToUrl } from '../lib/utils';
import { isFavorite, addFavorite, removeFavorite } from '../services/favorites';
import CommunityInfo from './CommunityInfo';
import ContributionModal from './ContributionModal';

interface ProviderDetailProps {
  provider: Provider;
  onClose: () => void;
}

const ProviderDetail: React.FC<ProviderDetailProps> = ({ provider, onClose }) => {
  const { user } = useAuth();
  const [favorite, setFavorite] = React.useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [communityData, setCommunityData] = useState<{
    summary?: { avg_rating?: number; total_ratings?: number } | null;
  } | null>(null);

  React.useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user) {
        const favoriteStatus = await isFavorite(user.id, provider.number);
        setFavorite(favoriteStatus);
      } else {
        setFavorite(false);
      }
    };
    
    checkFavoriteStatus();
  }, [provider.number, user]);

  const toggleFavorite = async () => {
    if (!user) return;
    
    try {
      if (favorite) {
        const success = await removeFavorite(user.id, provider.number);
        if (success) {
          setFavorite(false);
        }
      } else {
        const success = await addFavorite({
          id: provider.number,
          provider,
          timestamp: Date.now(),
        }, user.id);
        if (success) {
          setFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isOrganization = provider.enumeration_type === 'NPI-2';
  
  const getProviderName = () => {
    if (isOrganization) {
      return provider.basic.organization_name;
    } else {
      const { first_name, last_name, middle_name, credential } = provider.basic;
      return `${first_name}${middle_name ? ` ${middle_name}` : ''} ${last_name}${credential ? `, ${credential}` : ''}`;
    }
  };

  const primaryLocation = provider.addresses.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses[0];
  const mailingAddress = provider.addresses.find(addr => addr.address_purpose === 'MAILING');
  
  const getPrimaryTaxonomy = () => {
    return provider.taxonomies.find(tax => tax.primary) || provider.taxonomies[0];
  };

  const getWebsite = () => {
    if (!provider.endpoints) return null;
    return provider.endpoints.find(ep => 
      ep.endpointType?.toLowerCase().includes('web') || 
      ep.endpointType?.toLowerCase().includes('url')
    );
  };

  const getEmailAddress = () => {
    if (!provider.endpoints) return null;
    return provider.endpoints.find(ep => 
      ep.endpointType?.toLowerCase().includes('email') || 
      ep.endpoint?.includes('@')
    );
  };



  const getGoogleMapsUrl = (address: typeof primaryLocation) => {
    if (!address) return '';
    
    const query = encodeURIComponent(
      `${address.address_1}, ${address.city}, ${address.state} ${address.postal_code}`
    );
    
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-fade-scale backdrop-blur-sm">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none flex items-center transition-colors hover:bg-gray-50 px-2 py-1 rounded-md"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>
          
          <button
            onClick={user ? toggleFavorite : () => navigateToUrl('/dashboard')}
            className={`px-3 py-2 rounded-lg flex items-center ${
              favorite 
                ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            } transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200`}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={20} fill={favorite ? 'currentColor' : 'none'} className="mr-1" />
            <span className="text-sm font-medium">{user ? (favorite ? 'Saved' : 'Save') : 'Sign in to save'}</span>
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{getProviderName()}</h2>
            <div className="flex flex-wrap items-center mt-2">
              {getPrimaryTaxonomy() && (
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full flex items-center mr-2 mb-2 shadow-sm">
                  <Stethoscope size={14} className="mr-1" />
                  {getPrimaryTaxonomy().desc}
                </span>
              )}
              <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full flex items-center mb-2 shadow-sm">
                {isOrganization ? '🏢 Organization' : '👤 Individual Provider'}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="text-sm text-gray-600 flex items-center bg-gray-50 px-2 py-1 rounded-md">
                <Calendar size={14} className="mr-1 text-gray-500" />
                Last Updated: {new Date(provider.basic.last_updated).toLocaleDateString()}
              </div>
              
              {/* Community Rating Snippet */}
              {communityData?.summary?.avg_rating && (
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-md border border-yellow-200">
                  <Star size={16} className="text-yellow-500 fill-current mr-1" />
                  <span className="text-sm font-medium text-yellow-800">
                    {communityData.summary.avg_rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-yellow-600 ml-1">
                    ({communityData.summary.total_ratings} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {primaryLocation && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Practice Location</h3>
                <div className="flex items-start mb-3">
                  <MapPin size={18} className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                  <div>
                    <div>{primaryLocation.address_1}</div>
                    {primaryLocation.address_2 && <div>{primaryLocation.address_2}</div>}
                    <div>
                      {primaryLocation.city}, {primaryLocation.state} {primaryLocation.postal_code}
                    </div>
                  </div>
                </div>
                
                <div className="ml-7 mb-3">
                  <a 
                    href={getGoogleMapsUrl(primaryLocation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 transition-colors hover:bg-primary-50 px-2 py-1 rounded-md"
                  >
                    📍 View on Google Maps
                  </a>
                </div>
                
                {primaryLocation.telephone_number && (
                  <div className="flex items-center mb-3">
                    <Phone size={18} className="text-gray-500 mr-2 flex-shrink-0" />
                    <a 
                      href={`tel:${primaryLocation.telephone_number.replace(/[^\d]/g, '')}`}
                      className="text-primary-600 hover:text-primary-800 transition-colors hover:bg-primary-50 px-2 py-1 rounded-md -ml-2"
                    >
                      {primaryLocation.telephone_number}
                    </a>
                  </div>
                )}
                
                {primaryLocation.fax_number && (
                  <div className="flex items-start mb-3">
                    <span className="text-gray-500 mr-2 flex-shrink-0 font-medium">Fax:</span>
                    <span>{primaryLocation.fax_number}</span>
                  </div>
                )}
              </div>
            )}
            
            <div>
              {mailingAddress && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Mailing Address</h3>
                  <div className="flex items-start">
                    <MapPin size={18} className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <div>{mailingAddress.address_1}</div>
                      {mailingAddress.address_2 && <div>{mailingAddress.address_2}</div>}
                      <div>
                        {mailingAddress.city}, {mailingAddress.state} {mailingAddress.postal_code}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                
                {getEmailAddress() && (
                  <div className="flex items-center mb-3">
                    <Mail size={18} className="text-gray-500 mr-2 flex-shrink-0" />
                    <a 
                      href={`mailto:${getEmailAddress()?.endpoint}`}
                      className="text-primary-600 hover:text-primary-800 transition-colors hover:bg-primary-50 px-2 py-1 rounded-md -ml-2"
                    >
                      {getEmailAddress()?.endpoint}
                    </a>
                  </div>
                )}
                
                {getWebsite() && (
                  <div className="flex items-center mb-3">
                    <Globe size={18} className="text-gray-500 mr-2 flex-shrink-0" />
                    <a 
                      href={getWebsite()?.endpoint || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 transition-colors hover:bg-primary-50 px-2 py-1 rounded-md -ml-2"
                    >
                      {getWebsite()?.endpoint}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {provider.taxonomies.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Specialties & Licenses</h3>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 font-semibold text-gray-800">Specialty</th>
                      <th className="text-left py-3 font-semibold text-gray-800">License</th>
                      <th className="text-left py-3 font-semibold text-gray-800">State</th>
                      <th className="text-left py-3 font-semibold text-gray-800">Primary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provider.taxonomies.map((taxonomy, index) => (
                      <tr key={index} className={`${index < provider.taxonomies.length - 1 ? 'border-b border-gray-200' : ''} hover:bg-white/50 transition-colors`}>
                        <td className="py-3 font-medium text-gray-900">{taxonomy.desc}</td>
                        <td className="py-3 text-gray-700">{taxonomy.license || '-'}</td>
                        <td className="py-3 text-gray-700">{taxonomy.state || '-'}</td>
                        <td className="py-3">
                          {taxonomy.primary ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Primary</span>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {provider.other_names && provider.other_names.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Other Names</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {provider.other_names.map((name, index) => (
                    <li key={index} className="text-gray-700">
                      {isOrganization ? name.organization_name : `${name.first_name} ${name.last_name}`}
                      {name.type && <span className="text-sm text-gray-500 ml-2">({name.type})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Community Information Section - Only show if there's actual data */}
          <div className="mt-8">
            <CommunityInfo 
              provider={provider} 
              onContribute={() => setShowContributionModal(true)}
              onDataLoad={setCommunityData}
            />
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500 flex flex-wrap items-center justify-between">
              <div>
                <span>NPI: {provider.number}</span>
                <span className="mx-2">•</span>
                <span>Status: {provider.basic.status}</span>
              </div>
              
              <div className="mt-2 sm:mt-0">
                <a 
                  href={`https://npiregistry.cms.hhs.gov/provider-view/${provider.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors hover:bg-primary-50 px-2 py-1 rounded-md text-sm"
                >
                  🔗 View on NPI Registry
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contribution Modal */}
      <ContributionModal
        provider={provider}
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        onSuccess={() => {
          // Could trigger a refresh of community data here if needed
          console.log('Contribution submitted successfully');
        }}
      />
    </div>
  );
};

export default ProviderDetail;