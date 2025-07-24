'use client'

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  StarHalf, 
  Clock, 
  Calendar, 
  Shield, 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Provider } from '../types';
import { 
  CommunityDataResponse
} from '../types/community';
import communityService, { formatHelpers } from '../services/community';

interface CommunityInfoProps {
  provider: Provider;
  onContribute?: () => void;
  onDataLoad?: (data: CommunityDataResponse | null) => void;
}

const CommunityInfo: React.FC<CommunityInfoProps> = ({ provider, onContribute, onDataLoad }) => {
  const { user } = useAuth();
  const [communityData, setCommunityData] = useState<CommunityDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'availability' | 'insurance'>('overview');
  const [showAllReviews, setShowAllReviews] = useState(false);

  const loadCommunityData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communityService.community.getFullCommunityData(
        provider.number,
        user?.id
      );
      setCommunityData(data);
      onDataLoad?.(data);
    } catch (err) {
      console.error('Error loading community data:', err);
      setError('Failed to load community information');
    } finally {
      setLoading(false);
    }
  }, [provider.number, user]);

  useEffect(() => {
    loadCommunityData();
  }, [loadCommunityData]);

  const handleVoteOnReview = async (reviewId: string, isHelpful: boolean) => {
    if (!user) return;
    
    try {
      await communityService.reviews.voteOnReview(user.id, reviewId, isHelpful);
      await loadCommunityData(); // Refresh data
    } catch (err) {
      console.error('Error voting on review:', err);
    }
  };

  const renderStars = (rating: number, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={size} className="fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={size} className="fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={size} className="text-gray-300" />);
    }
    
    return stars;
  };

  const renderOverview = () => {
    const summary = communityData?.summary;
    if (!summary) {
      // Instead of showing "No Community Data Yet", return null to hide the section completely
      return null;
    }

    return (
      <div className="space-y-6">
        {/* Rating Overview */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Community Rating</h3>
            <span className="text-sm text-gray-600">{summary.total_ratings} ratings</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {summary.avg_rating?.toFixed(1) || 'N/A'}
              </div>
              <div className="flex justify-center mb-2">
                {summary.avg_rating && renderStars(summary.avg_rating, 20)}
              </div>
              <div className="text-sm text-gray-600">Overall</div>
            </div>

            {summary.avg_wait_time_rating && (
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900 mb-1">
                  {summary.avg_wait_time_rating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(summary.avg_wait_time_rating)}
                </div>
                <div className="text-sm text-gray-600">Wait Time</div>
              </div>
            )}

            {summary.avg_communication_rating && (
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900 mb-1">
                  {summary.avg_communication_rating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(summary.avg_communication_rating)}
                </div>
                <div className="text-sm text-gray-600">Communication</div>
              </div>
            )}

            {summary.avg_facility_rating && (
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900 mb-1">
                  {summary.avg_facility_rating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(summary.avg_facility_rating)}
                </div>
                <div className="text-sm text-gray-600">Facility</div>
              </div>
            )}
          </div>

          {summary.total_reviews > 0 && (
            <div className="mt-4 pt-4 border-t border-white/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {formatHelpers.getRecommendationPercentage(summary.recommend_count, summary.total_reviews)}% recommend
                </span>
                <span className="text-sm text-gray-600">
                  {summary.total_reviews} reviews
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Availability Card */}
          {communityData.latest_availability && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Calendar size={16} className="text-green-600 mr-2" />
                  <span className="font-medium text-gray-900">Availability</span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatHelpers.formatRelativeTime(communityData.latest_availability.updated_at)}
                </span>
              </div>
              <div className="space-y-1">
                {communityData.latest_availability.accepting_new_patients !== null && (
                  <div className="flex items-center">
                    {communityData.latest_availability.accepting_new_patients ? (
                      <CheckCircle size={14} className="text-green-500 mr-2" />
                    ) : (
                      <AlertCircle size={14} className="text-red-500 mr-2" />
                    )}
                    <span className="text-sm text-gray-700">
                      {communityData.latest_availability.accepting_new_patients ? 'Accepting new patients' : 'Not accepting new patients'}
                    </span>
                  </div>
                )}
                {communityData.latest_availability.wait_time_estimate && (
                  <div className="flex items-center">
                    <Clock size={14} className="text-blue-500 mr-2" />
                    <span className="text-sm text-gray-700">
                      {formatHelpers.formatWaitTime(communityData.latest_availability.wait_time_estimate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Insurance Card */}
          {summary.insurance_plans_count > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Shield size={16} className="text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">Insurance</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {summary.insurance_plans_count}
              </div>
              <div className="text-sm text-gray-600">
                Plans reported by community
              </div>
            </div>
          )}

          {/* Community Activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <TrendingUp size={16} className="text-purple-600 mr-2" />
              <span className="font-medium text-gray-900">Activity</span>
            </div>
            <div className="text-sm text-gray-600">
              Last updated {summary.last_community_update ? formatHelpers.formatRelativeTime(summary.last_community_update) : 'Never'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    const reviews = communityData?.reviews || [];
    
    if (reviews.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">Be the first to leave a review!</p>
        </div>
      );
    }

    const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

    return (
      <div className="space-y-4">
        {visibleReviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium text-gray-900">
                  {review.user_display_name || 'Anonymous'}
                </div>
                <div className="text-sm text-gray-600">
                  {formatHelpers.formatRelativeTime(review.created_at)}
                  {review.visit_date && ` • Visited ${new Date(review.visit_date).toLocaleDateString()}`}
                  {review.appointment_type && ` • ${review.appointment_type}`}
                </div>
              </div>
              {review.would_recommend !== null && (
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  review.would_recommend 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {review.would_recommend ? 'Recommends' : 'Does not recommend'}
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-4">{review.review_text}</p>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {review.helpful_count} people found this helpful
              </div>
              
              {user && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVoteOnReview(review.id, true)}
                    className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <ThumbsUp size={14} className="mr-1" />
                    Helpful
                  </button>
                  <button
                    onClick={() => handleVoteOnReview(review.id, false)}
                    className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <ThumbsDown size={14} className="mr-1" />
                    Not helpful
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {reviews.length > 3 && (
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="w-full py-2 text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center"
          >
            {showAllReviews ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                Show {reviews.length - 3} More Reviews
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  const renderAvailability = () => {
    const availability = communityData?.latest_availability;
    
    if (!availability) {
      return (
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Availability Information</h3>
          <p className="text-gray-600">Help others by sharing availability information!</p>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Latest Availability Update</h3>
          <span className="text-sm text-gray-600">
            Updated {formatHelpers.formatRelativeTime(availability.updated_at)}
          </span>
        </div>

        <div className="space-y-4">
          {availability.accepting_new_patients !== null && (
            <div className="flex items-center">
              {availability.accepting_new_patients ? (
                <CheckCircle className="text-green-500 mr-3" size={20} />
              ) : (
                <AlertCircle className="text-red-500 mr-3" size={20} />
              )}
              <span className="text-gray-900">
                {availability.accepting_new_patients ? 'Accepting new patients' : 'Not accepting new patients'}
              </span>
            </div>
          )}

          {availability.next_available_appointment && (
            <div className="flex items-center">
              <Calendar className="text-blue-500 mr-3" size={20} />
              <span className="text-gray-900">
                Next available: {new Date(availability.next_available_appointment).toLocaleDateString()}
              </span>
            </div>
          )}

          {availability.wait_time_estimate && (
            <div className="flex items-center">
              <Clock className="text-orange-500 mr-3" size={20} />
              <span className="text-gray-900">
                Typical wait: {formatHelpers.formatWaitTime(availability.wait_time_estimate)}
              </span>
            </div>
          )}

          {availability.notes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-900 mb-1">Notes:</div>
              <div className="text-sm text-gray-700">{availability.notes}</div>
            </div>
          )}

          <div className="text-xs text-gray-500 flex items-center justify-between pt-3 border-t">
            <span>
              Confidence: {formatHelpers.formatConfidenceLevel(availability.confidence_level)}
            </span>
            <span>
              Last contacted: {availability.last_contacted_date ? 
                new Date(availability.last_contacted_date).toLocaleDateString() : 
                'Not specified'
              }
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderInsurance = () => {
    const insurance = communityData?.insurance_plans || [];
    
    if (insurance.length === 0) {
      return (
        <div className="text-center py-8">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Insurance Information</h3>
          <p className="text-gray-600">Help others by sharing insurance information!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {insurance.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{plan.insurance_name}</h4>
                {plan.insurance_type && (
                  <span className="text-sm text-gray-600">
                    {formatHelpers.formatInsuranceType(plan.insurance_type)}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                {plan.is_in_network !== null && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    plan.is_in_network 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {plan.is_in_network ? 'In Network' : 'Out of Network'}
                  </span>
                )}
              </div>
            </div>

            {(plan.copay_amount || plan.plan_specific_details || plan.notes) && (
              <div className="space-y-2 text-sm text-gray-700">
                {plan.copay_amount && (
                  <div>Copay: ${plan.copay_amount}</div>
                )}
                {plan.plan_specific_details && (
                  <div>Details: {plan.plan_specific_details}</div>
                )}
                {plan.notes && (
                  <div>Notes: {plan.notes}</div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500 flex items-center justify-between pt-3 border-t mt-3">
              <span>
                Confidence: {formatHelpers.formatConfidenceLevel(plan.confidence_level)}
              </span>
              <span>
                Verified: {plan.verification_date ? 
                  new Date(plan.verification_date).toLocaleDateString() : 
                  'Not verified'
                }
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Only render the community section if there's actual community data
  const hasAnyData = communityData?.summary || 
                     (communityData?.reviews && communityData.reviews.length > 0) ||
                     communityData?.latest_availability ||
                     (communityData?.insurance_plans && communityData.insurance_plans.length > 0);

  if (!hasAnyData) {
    return null; // Hide the entire community section when no data exists
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 animate-fade-scale">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Community Information</h2>
          {user && (
            <button
              onClick={onContribute}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Contribute
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'reviews', label: 'Reviews', icon: MessageSquare },
            { key: 'availability', label: 'Availability', icon: Calendar },
            { key: 'insurance', label: 'Insurance', icon: Shield }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'overview' | 'reviews' | 'availability' | 'insurance')}
              className={`py-4 border-b-2 font-medium text-sm flex items-center ${
                activeTab === key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={16} className="mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'reviews' && renderReviews()}
        {activeTab === 'availability' && renderAvailability()}
        {activeTab === 'insurance' && renderInsurance()}
      </div>
    </div>
  );
};

export default CommunityInfo;