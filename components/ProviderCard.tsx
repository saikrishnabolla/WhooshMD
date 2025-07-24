'use client'

import React from 'react';
import { Phone, MapPin, Heart, ExternalLink, Calendar, Stethoscope, CheckCircle, Clock, AlertCircle, Loader2, Star, Users } from 'lucide-react';
import { Provider } from '../types';
import { isFavorite, addFavorite, removeFavorite } from '../services/favorites';
import { useAuth } from '../context/AuthContext';
import { navigateToUrl } from '../lib/utils';
import { ProviderSummary } from '../types/community';
import { formatHelpers } from '../services/community';

interface CallResult {
  provider_npi: string;
  phone_number: string;
  status: "calling" | "completed" | "failed";
  availability_status?: string;
  availability_details?: string;
  summary?: string;
  sentiment?: string;
  call_date?: string;
  recording_url?: string;
  // Additional Omnidim fields
  insurance_accepted?: string;
  appointment_types_available?: string;
  availability_timeframe?: string;
  specific_availability?: string;
}

interface ProviderCardProps {
  provider: Provider;
  onViewDetails: (provider: Provider) => void;
  isSelected?: boolean;
  onSelectionChange?: (provider: Provider, selected: boolean) => void;
  callResult?: CallResult;
  showSelectionCheckbox?: boolean;
  communitySummary?: ProviderSummary | null;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ 
  provider, 
  onViewDetails, 
  isSelected = false,
  onSelectionChange,
  callResult,
  showSelectionCheckbox = true,
  communitySummary
}) => {
  const { user } = useAuth();
  const [favorite, setFavorite] = React.useState(false);

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

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigateToUrl('/dashboard');
      return;
    }
    
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

  const handleSelectionChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectionChange) {
      onSelectionChange(provider, !isSelected);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(provider);
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

  // Parse availability for display
  const getAvailabilityInfo = () => {
    if (!callResult || callResult.status !== 'completed') return null;
    
    const isAccepting = callResult.availability_status && 
      !callResult.availability_status.toLowerCase().includes('not') &&
      !callResult.availability_status.toLowerCase().includes("n't");
    
    return {
      accepting: isAccepting,
      status: callResult.availability_status,
      summary: callResult.summary
    };
  };

  const availabilityInfo = getAvailabilityInfo();

  return (
    <div className={`
      relative glass-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full
      ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
    `}>
      
      {/* Selection Checkbox & Favorite - Top Row */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        {showSelectionCheckbox && (
          <div className="flex items-center">
            <button
              onClick={handleSelectionChange}
              className={`
                relative w-7 h-7 rounded-lg border-2 transition-all duration-200 flex items-center justify-center shadow-sm
                ${isSelected 
                  ? 'bg-primary-600 border-primary-600 text-white scale-105' 
                  : 'bg-white/90 border-gray-300 hover:border-primary-400 hover:bg-white hover:scale-105'
                }
              `}
              title="Select for AI availability check"
            >
              {isSelected ? (
                <CheckCircle size={16} className="text-white" />
              ) : (
                <div className="w-3 h-3 border-2 border-gray-400 rounded opacity-60"></div>
              )}
            </button>
            {isSelected && (
              <span className="ml-2 text-xs font-medium text-primary-600 bg-white/95 px-2 py-1 rounded-full shadow-sm border border-primary-200">
                Selected
              </span>
            )}
          </div>
        )}
        
        <button
          onClick={toggleFavorite}
          className={`
            p-2 rounded-full transition-all duration-200 backdrop-blur-sm
            ${favorite 
              ? 'text-red-500 bg-white/90 hover:bg-white' 
              : 'text-gray-400 bg-white/70 hover:bg-white/90 hover:text-red-500'
            }
          `}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* AI Verification Status Banner */}
      {callResult && (
        <div className="absolute top-16 left-4 right-4 z-10">
          <div className={`
            px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 backdrop-blur-sm
            ${callResult.status === 'calling' 
              ? 'bg-blue-100/90 text-blue-700 border border-blue-200' 
              : callResult.status === 'completed'
              ? availabilityInfo?.accepting
                ? 'bg-green-100/90 text-green-700 border border-green-200'
                : 'bg-yellow-100/90 text-yellow-700 border border-yellow-200'
              : 'bg-red-100/90 text-red-700 border border-red-200'
            }
          `}>
            {callResult.status === 'calling' && (
              <>
                <Loader2 size={12} className="animate-spin" />
                AI Verifying...
              </>
            )}
            {callResult.status === 'completed' && (
              <>
                <CheckCircle size={12} />
                {availabilityInfo?.accepting ? 'Accepting Patients' : 'Limited Availability'}
              </>
            )}
            {callResult.status === 'failed' && (
              <>
                <AlertCircle size={12} />
                Verification Failed
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Card Content */}
      <div 
        className={`p-6 ${callResult ? 'pt-24' : 'pt-16'} h-full flex flex-col cursor-pointer`}
        onClick={handleSelectionChange}
      >
        
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
            {getProviderName()}
          </h3>
          
          {primaryTaxonomy && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Stethoscope size={16} className="mr-2 flex-shrink-0" />
              <span className="truncate">{primaryTaxonomy.desc}</span>
            </div>
          )}
          
          {/* Community Rating */}
          {communitySummary && communitySummary.avg_rating && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Star size={14} className="mr-1 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-gray-900">
                {communitySummary.avg_rating.toFixed(1)}
              </span>
              <span className="ml-1">({communitySummary.total_ratings} reviews)</span>
              {communitySummary.total_reviews > 0 && (
                <span className="ml-2 text-green-600">
                  {formatHelpers.getRecommendationPercentage(communitySummary.recommend_count, communitySummary.total_reviews)}% recommend
                </span>
              )}
            </div>
          )}
          

          
          {/* Community Availability */}
          {communitySummary && communitySummary.latest_accepting_patients !== null && (
            <div className="flex items-center text-xs text-gray-600 mb-2">
              {communitySummary.latest_accepting_patients ? (
                <CheckCircle size={12} className="mr-1 text-green-500" />
              ) : (
                <AlertCircle size={12} className="mr-1 text-red-500" />
              )}
              <span>
                {communitySummary.latest_accepting_patients ? 'Accepting patients' : 'Not accepting patients'}
              </span>
              {communitySummary.latest_wait_time && (
                <span className="ml-2">
                  • {formatHelpers.formatWaitTime(communitySummary.latest_wait_time)}
                </span>
              )}
            </div>
          )}
          
          {/* NPI Badge and Community Badge */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
              NPI: {provider.number}
            </div>
            {communitySummary && (communitySummary.total_ratings > 0 || communitySummary.total_reviews > 0) && (
              <div className="inline-flex items-center px-2 py-1 bg-blue-100 rounded-full text-xs text-blue-700">
                <Users size={10} className="mr-1" />
                Community verified
              </div>
            )}
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="space-y-3 flex-1 mb-4">
          {primaryAddress && (
            <div className="flex items-start">
              <MapPin size={16} className="text-gray-500 mt-1 mr-3 flex-shrink-0" />
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
              <Phone size={16} className="text-gray-500 mr-3 flex-shrink-0" />
              <a 
                href={`tel:${primaryAddress.telephone_number.replace(/[^\d]/g, '')}`}
                className="text-sm text-primary-600 hover:text-primary-800 transition-colors font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {primaryAddress.telephone_number}
              </a>
            </div>
          )}
          
          <div className="flex items-center">
            <Calendar size={16} className="text-gray-500 mr-3 flex-shrink-0" />
            <span className="text-sm text-gray-600">
              Updated: {new Date(provider.basic.last_updated).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* AI Availability Details */}
        {availabilityInfo && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center mb-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                availabilityInfo.accepting ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium text-gray-900">
                {availabilityInfo.status}
              </span>
            </div>
            
            {/* Detailed Omnidim Information */}
            <div className="space-y-2 mt-3">
              {callResult?.insurance_accepted && (
                <div className="text-xs">
                  <span className="font-medium text-gray-700">Insurance:</span>
                  <span className="ml-1 text-gray-600">{callResult.insurance_accepted}</span>
                </div>
              )}
              
              {callResult?.appointment_types_available && (
                <div className="text-xs">
                  <span className="font-medium text-gray-700">Appointments:</span>
                  <span className="ml-1 text-gray-600">{callResult.appointment_types_available}</span>
                </div>
              )}
              
              {callResult?.availability_timeframe && (
                <div className="text-xs">
                  <span className="font-medium text-gray-700">Next Available:</span>
                  <span className="ml-1 text-gray-600">{callResult.availability_timeframe}</span>
                </div>
              )}
              
              {callResult?.specific_availability && (
                <div className="text-xs">
                  <span className="font-medium text-gray-700">Hours:</span>
                  <span className="ml-1 text-gray-600">{callResult.specific_availability}</span>
                </div>
              )}
            </div>
            
            {availabilityInfo.summary && (
              <p className="text-xs text-gray-600 line-clamp-2 mt-2 pt-2 border-t border-gray-200">
                {availabilityInfo.summary}
              </p>
            )}
            {callResult?.call_date && (
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Clock size={12} className="mr-1" />
                Verified {new Date(callResult.call_date).toLocaleDateString()}
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          {primaryAddress?.telephone_number && (
            <a
              href={`tel:${primaryAddress.telephone_number.replace(/[^\d]/g, '')}`}
              className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone size={16} className="mr-2" />
              Call
            </a>
          )}
          
          <button 
            className="flex items-center justify-center px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(e);
            }}
          >
            <ExternalLink size={16} className="mr-2" />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;