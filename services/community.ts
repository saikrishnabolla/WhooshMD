import { supabase } from '../lib/supabase';
import {
  ProviderRating,
  ProviderReview,
  ProviderAvailabilityUpdate,
  ProviderInsurance,
  ProviderSummary,
  RatingFormData,
  ReviewFormData,
  AvailabilityFormData,
  InsuranceFormData,
  CommunityDataResponse,
  ReviewVote,
  CommunitySearchFilters
} from '../types/community';

// Provider Ratings Service
export const ratingsService = {
  async getUserRating(userId: string, providerNpi: string): Promise<ProviderRating | null> {
    const { data, error } = await supabase
      .from('provider_ratings')
      .select('*')
      .eq('user_id', userId)
      .eq('provider_npi', providerNpi)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  async createRating(userId: string, providerNpi: string, ratingData: RatingFormData): Promise<ProviderRating> {
    const { data, error } = await supabase
      .from('provider_ratings')
      .insert({
        user_id: userId,
        provider_npi: providerNpi,
        ...ratingData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRating(userId: string, providerNpi: string, ratingData: RatingFormData): Promise<ProviderRating> {
    const { data, error } = await supabase
      .from('provider_ratings')
      .update(ratingData)
      .eq('user_id', userId)
      .eq('provider_npi', providerNpi)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRating(userId: string, providerNpi: string): Promise<boolean> {
    const { error } = await supabase
      .from('provider_ratings')
      .delete()
      .eq('user_id', userId)
      .eq('provider_npi', providerNpi);

    if (error) throw error;
    return true;
  }
};

// Provider Reviews Service
export const reviewsService = {
  async getProviderReviews(providerNpi: string, limit = 10, offset = 0): Promise<ProviderReview[]> {
    const { data, error } = await supabase
      .from('provider_reviews')
      .select(`
        *,
        auth_users:user_id (email)
      `)
      .eq('provider_npi', providerNpi)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    return data.map(review => ({
      ...review,
      user_email: review.auth_users?.email,
      user_display_name: review.is_anonymous ? 'Anonymous' : review.auth_users?.email?.split('@')[0]
    }));
  },

  async createReview(userId: string, providerNpi: string, reviewData: ReviewFormData): Promise<ProviderReview> {
    const { data, error } = await supabase
      .from('provider_reviews')
      .insert({
        user_id: userId,
        provider_npi: providerNpi,
        ...reviewData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReview(reviewId: string, userId: string, reviewData: Partial<ReviewFormData>): Promise<ProviderReview> {
    const { data, error } = await supabase
      .from('provider_reviews')
      .update(reviewData)
      .eq('id', reviewId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('provider_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async voteOnReview(userId: string, reviewId: string, isHelpful: boolean): Promise<ReviewVote> {
    const { data, error } = await supabase
      .from('review_votes')
      .upsert({
        user_id: userId,
        review_id: reviewId,
        is_helpful: isHelpful
      }, {
        onConflict: 'user_id,review_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeVote(userId: string, reviewId: string): Promise<boolean> {
    const { error } = await supabase
      .from('review_votes')
      .delete()
      .eq('user_id', userId)
      .eq('review_id', reviewId);

    if (error) throw error;
    return true;
  }
};

// Provider Availability Service
export const availabilityService = {
  async getLatestAvailability(providerNpi: string): Promise<ProviderAvailabilityUpdate | null> {
    const { data, error } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_npi', providerNpi)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  async getAvailabilityHistory(providerNpi: string, limit = 5): Promise<ProviderAvailabilityUpdate[]> {
    const { data, error } = await supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_npi', providerNpi)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createAvailabilityUpdate(userId: string, providerNpi: string, availabilityData: AvailabilityFormData): Promise<ProviderAvailabilityUpdate> {
    const { data, error } = await supabase
      .from('provider_availability')
      .insert({
        user_id: userId,
        provider_npi: providerNpi,
        ...availabilityData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Provider Insurance Service
export const insuranceService = {
  async getProviderInsurance(providerNpi: string): Promise<ProviderInsurance[]> {
    const { data, error } = await supabase
      .from('provider_insurance')
      .select('*')
      .eq('provider_npi', providerNpi)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createInsuranceInfo(userId: string, providerNpi: string, insuranceData: InsuranceFormData): Promise<ProviderInsurance> {
    const { data, error } = await supabase
      .from('provider_insurance')
      .insert({
        user_id: userId,
        provider_npi: providerNpi,
        ...insuranceData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInsuranceInfo(insuranceId: string, userId: string, insuranceData: Partial<InsuranceFormData>): Promise<ProviderInsurance> {
    const { data, error } = await supabase
      .from('provider_insurance')
      .update(insuranceData)
      .eq('id', insuranceId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteInsuranceInfo(insuranceId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('provider_insurance')
      .delete()
      .eq('id', insuranceId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }
};

// Community Summary Service
export const communityService = {
  async getProviderSummary(providerNpi: string): Promise<ProviderSummary | null> {
    try {
      const { data, error } = await supabase
        .from('provider_summary')
        .select('*')
        .eq('provider_npi', providerNpi)
        .single();

      if (error && error.code !== 'PGRST116') {
        // If it's a 406 error (Not Acceptable) or view doesn't exist, return null gracefully
        if (error.message?.includes('406') || error.message?.includes('relation "provider_summary" does not exist')) {
          console.warn('Community features not yet set up or no data available for provider:', providerNpi);
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.warn('Error fetching provider summary for NPI', providerNpi, ':', error);
      return null;
    }
  },

  async getFullCommunityData(providerNpi: string, userId?: string): Promise<CommunityDataResponse> {
    try {
      const [summary, reviews, availability, insurance, userRating] = await Promise.allSettled([
        this.getProviderSummary(providerNpi),
        reviewsService.getProviderReviews(providerNpi),
        availabilityService.getLatestAvailability(providerNpi),
        insuranceService.getProviderInsurance(providerNpi),
        userId ? ratingsService.getUserRating(userId, providerNpi) : Promise.resolve(null)
      ]);

      return {
        summary: summary.status === 'fulfilled' ? summary.value : null,
        reviews: reviews.status === 'fulfilled' ? reviews.value : [],
        latest_availability: availability.status === 'fulfilled' ? availability.value : null,
        insurance_plans: insurance.status === 'fulfilled' ? insurance.value : [],
        user_rating: userRating.status === 'fulfilled' ? userRating.value : null
      };
    } catch (error) {
      console.error('Error fetching full community data:', error);
      // Return empty structure instead of throwing
      return {
        summary: null,
        reviews: [],
        latest_availability: null,
        insurance_plans: [],
        user_rating: null
      };
    }
  },

  async searchProvidersWithCommunityData(filters: CommunitySearchFilters): Promise<ProviderSummary[]> {
    let query = supabase.from('provider_summary').select('*');

    if (filters.min_rating) {
      query = query.gte('avg_rating', filters.min_rating);
    }

    if (filters.accepting_patients !== undefined) {
      query = query.eq('latest_accepting_patients', filters.accepting_patients);
    }

    if (filters.has_reviews) {
      query = query.gt('total_reviews', 0);
    }

    // Note: Insurance filtering would require a join or separate query
    // This is a simplified version
    query = query.order('avg_rating', { ascending: false, nullsFirst: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // User-specific contribution methods
  async getUserContributions(userId: string): Promise<{
    ratings: ProviderRating[];
    reviews: ProviderReview[];
    availability_updates: ProviderAvailabilityUpdate[];
    insurance_updates: ProviderInsurance[];
    total_contributions: number;
  }> {
    try {
      const [ratings, reviews, availability, insurance] = await Promise.allSettled([
        supabase
          .from('provider_ratings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('provider_reviews')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('provider_availability_updates')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('provider_insurance')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      ]);

      const ratingsData = ratings.status === 'fulfilled' ? (ratings.value.data || []) : [];
      const reviewsData = reviews.status === 'fulfilled' ? (reviews.value.data || []) : [];
      const availabilityData = availability.status === 'fulfilled' ? (availability.value.data || []) : [];
      const insuranceData = insurance.status === 'fulfilled' ? (insurance.value.data || []) : [];

      return {
        ratings: ratingsData,
        reviews: reviewsData,
        availability_updates: availabilityData,
        insurance_updates: insuranceData,
        total_contributions: ratingsData.length + reviewsData.length + availabilityData.length + insuranceData.length
      };
    } catch (error) {
      console.error('Error fetching user contributions:', error);
      return {
        ratings: [],
        reviews: [],
        availability_updates: [],
        insurance_updates: [],
        total_contributions: 0
      };
    }
  },

  async getUserContributionStats(userId: string): Promise<{
    total_contributions: number;
    total_ratings: number;
    total_reviews: number;
    total_availability_updates: number;
    total_insurance_updates: number;
    avg_rating_given: number;
    most_recent_contribution: string | null;
  }> {
    try {
      const contributions = await this.getUserContributions(userId);
      
      const avgRating = contributions.ratings.length > 0
        ? contributions.ratings.reduce((sum, rating) => sum + rating.rating, 0) / contributions.ratings.length
        : 0;

      const allContributions = [
        ...contributions.ratings.map(r => ({ created_at: r.created_at })),
        ...contributions.reviews.map(r => ({ created_at: r.created_at })),
        ...contributions.availability_updates.map(r => ({ created_at: r.created_at })),
        ...contributions.insurance_updates.map(r => ({ created_at: r.created_at }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return {
        total_contributions: contributions.total_contributions,
        total_ratings: contributions.ratings.length,
        total_reviews: contributions.reviews.length,
        total_availability_updates: contributions.availability_updates.length,
        total_insurance_updates: contributions.insurance_updates.length,
        avg_rating_given: avgRating,
        most_recent_contribution: allContributions.length > 0 ? allContributions[0].created_at : null
      };
    } catch (error) {
      console.error('Error fetching user contribution stats:', error);
      return {
        total_contributions: 0,
        total_ratings: 0,
        total_reviews: 0,
        total_availability_updates: 0,
        total_insurance_updates: 0,
        avg_rating_given: 0,
        most_recent_contribution: null
      };
    }
  }
};

// Utility functions for displaying data
export const formatHelpers = {
  formatRating(rating?: number): string {
    if (!rating) return 'No rating';
    return `${rating.toFixed(1)} ⭐`;
  },

  formatWaitTime(waitTime?: string): string {
    if (!waitTime) return 'Unknown wait time';
    return waitTime.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  getRecommendationPercentage(recommendCount: number, totalReviews: number): number {
    if (totalReviews === 0) return 0;
    return Math.round((recommendCount / totalReviews) * 100);
  },

  formatConfidenceLevel(level: number): string {
    const labels = ['', 'Very Uncertain', 'Somewhat Uncertain', 'Neutral', 'Pretty Confident', 'Very Confident'];
    return labels[level] || 'Unknown';
  },

  formatInsuranceType(type?: string): string {
    if (!type) return '';
    return type.replace(/_/g, ' ').toUpperCase();
  },

  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }
};

export default {
  ratings: ratingsService,
  reviews: reviewsService,
  availability: availabilityService,
  insurance: insuranceService,
  community: communityService,
  format: formatHelpers
};