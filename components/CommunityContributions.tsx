'use client'

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  Shield, 
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Award,
  Edit3,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import communityService from '../services/community';
import {
  ProviderRating,
  ProviderReview,
  ProviderAvailabilityUpdate,
  ProviderInsurance
} from '../types/community';

interface CommunityContributionsProps {
  className?: string;
}

interface UserContributions {
  ratings: ProviderRating[];
  reviews: ProviderReview[];
  availability_updates: ProviderAvailabilityUpdate[];
  insurance_updates: ProviderInsurance[];
  total_contributions: number;
}

interface UserContributionStats {
  total_contributions: number;
  total_ratings: number;
  total_reviews: number;
  total_availability_updates: number;
  total_insurance_updates: number;
  avg_rating_given: number;
  most_recent_contribution: string | null;
}

const CommunityContributions: React.FC<CommunityContributionsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<UserContributions | null>(null);
  const [stats, setStats] = useState<UserContributionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchContributions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [contributionsData, statsData] = await Promise.all([
          communityService.community.getUserContributions(user.id),
          communityService.community.getUserContributionStats(user.id)
        ]);
        
        setContributions(contributionsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching community contributions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats || stats.total_contributions === 0) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Contributions</h2>
          <div className="text-center py-8">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contributions yet</h3>
            <p className="text-gray-600 mb-6">
              Start contributing to the community by rating providers, writing reviews, or sharing availability updates.
            </p>
            <a
              href="/search"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Find Providers to Review
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Community Contributions</h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Contributions</p>
                <h3 className="text-2xl font-bold text-blue-900">{stats.total_contributions}</h3>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Ratings Given</p>
                <h3 className="text-2xl font-bold text-yellow-900">{stats.total_ratings}</h3>
                {stats.avg_rating_given > 0 && (
                  <p className="text-xs text-yellow-700">Avg: {stats.avg_rating_given.toFixed(1)} ⭐</p>
                )}
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Reviews Written</p>
                <h3 className="text-2xl font-bold text-green-900">{stats.total_reviews}</h3>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Updates Shared</p>
                <h3 className="text-2xl font-bold text-purple-900">
                  {stats.total_availability_updates + stats.total_insurance_updates}
                </h3>
                <p className="text-xs text-purple-700">
                  {stats.total_availability_updates} availability, {stats.total_insurance_updates} insurance
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {stats.most_recent_contribution && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Most recent contribution:</strong>{' '}
              {communityService.format.formatRelativeTime(stats.most_recent_contribution)}
            </p>
          </div>
        )}

        {/* Detailed Contributions */}
        {showDetails && contributions && (
          <div className="space-y-4">
            {/* Ratings Section */}
            {contributions.ratings.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('ratings')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium">Ratings ({contributions.ratings.length})</span>
                  </div>
                  {expandedSection === 'ratings' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                {expandedSection === 'ratings' && (
                  <div className="border-t border-gray-200 p-4 space-y-3">
                    {contributions.ratings.map((rating) => (
                      <div key={rating.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-900">Provider NPI: {rating.provider_npi}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStarRating(rating.rating)}
                            <span className="text-sm text-gray-600">({rating.rating}/5)</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(rating.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Section */}
            {contributions.reviews.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('reviews')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Reviews ({contributions.reviews.length})</span>
                  </div>
                  {expandedSection === 'reviews' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                {expandedSection === 'reviews' && (
                  <div className="border-t border-gray-200 p-4 space-y-3">
                    {contributions.reviews.map((review) => (
                      <div key={review.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">Provider NPI: {review.provider_npi}</p>
                          <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                        </div>
                                                 <p className="text-gray-700 text-sm mb-2">&ldquo;{review.review_text}&rdquo;</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {review.would_recommend !== undefined && (
                            <span>Would recommend: {review.would_recommend ? 'Yes' : 'No'}</span>
                          )}
                          {review.helpful_count > 0 && (
                            <span>{review.helpful_count} found helpful</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Availability Updates Section */}
            {contributions.availability_updates.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('availability')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Availability Updates ({contributions.availability_updates.length})</span>
                  </div>
                  {expandedSection === 'availability' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                {expandedSection === 'availability' && (
                  <div className="border-t border-gray-200 p-4 space-y-3">
                    {contributions.availability_updates.map((update) => (
                      <div key={update.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">Provider NPI: {update.provider_npi}</p>
                          <span className="text-sm text-gray-500">{formatDate(update.created_at)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {update.accepting_new_patients !== undefined && (
                            <span className={`${
                              update.accepting_new_patients ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {update.accepting_new_patients ? 'Accepting patients' : 'Not accepting patients'}
                            </span>
                          )}
                          {update.next_available_appointment && (
                            <span>Next available: {update.next_available_appointment}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Insurance Updates Section */}
            {contributions.insurance_updates.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('insurance')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Insurance Updates ({contributions.insurance_updates.length})</span>
                  </div>
                  {expandedSection === 'insurance' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                {expandedSection === 'insurance' && (
                  <div className="border-t border-gray-200 p-4 space-y-3">
                    {contributions.insurance_updates.map((insurance) => (
                      <div key={insurance.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">Provider NPI: {insurance.provider_npi}</p>
                          <span className="text-sm text-gray-500">{formatDate(insurance.created_at)}</span>
                        </div>
                                                 <div className="text-sm text-gray-700">
                           <p><strong>Plan:</strong> {insurance.insurance_name}</p>
                           {insurance.insurance_type && (
                             <p><strong>Type:</strong> {communityService.format.formatInsuranceType(insurance.insurance_type)}</p>
                           )}
                           {insurance.copay_amount && (
                             <p><strong>Copay:</strong> ${insurance.copay_amount}</p>
                           )}
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityContributions;