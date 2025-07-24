// Community Contribution Types

export interface ProviderRating {
  id: string;
  user_id: string;
  provider_npi: string;
  rating: number; // 1-5
  wait_time_rating?: number; // 1-5
  communication_rating?: number; // 1-5
  facility_rating?: number; // 1-5
  created_at: string;
  updated_at: string;
}

export interface ProviderReview {
  id: string;
  user_id: string;
  provider_npi: string;
  review_text: string;
  visit_date?: string;
  appointment_type?: string;
  would_recommend?: boolean;
  is_anonymous: boolean;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  // Virtual fields that may be joined
  user_email?: string;
  user_display_name?: string;
  user_has_voted?: boolean;
  user_vote_helpful?: boolean;
}

export interface ProviderAvailabilityUpdate {
  id: string;
  user_id: string;
  provider_npi: string;
  accepting_new_patients?: boolean;
  next_available_appointment?: string;
  appointment_types?: string[];
  office_hours?: OfficeHours;
  wait_time_estimate?: string;
  notes?: string;
  last_contacted_date?: string;
  contact_method?: string;
  confidence_level: number; // 1-5
  verified_by_office: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderInsurance {
  id: string;
  user_id: string;
  provider_npi: string;
  insurance_name: string;
  insurance_type?: string;
  plan_specific_details?: string;
  copay_amount?: number;
  deductible_applies?: boolean;
  is_in_network?: boolean;
  verification_date?: string;
  notes?: string;
  confidence_level: number; // 1-5
  created_at: string;
  updated_at: string;
}

export interface ReviewVote {
  id: string;
  user_id: string;
  review_id: string;
  is_helpful: boolean;
  created_at: string;
}

export interface OfficeHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string; // e.g., "09:00"
  close: string; // e.g., "17:00"
  closed?: boolean;
  notes?: string;
}

export interface ProviderSummary {
  provider_npi: string;
  avg_rating?: number;
  total_ratings: number;
  avg_wait_time_rating?: number;
  avg_communication_rating?: number;
  avg_facility_rating?: number;
  total_reviews: number;
  recommend_count: number;
  latest_accepting_patients?: boolean;
  latest_next_appointment?: string;
  latest_wait_time?: string;
  insurance_plans_count: number;
  last_community_update?: string;
}

// Form types for creating/updating contributions
export interface RatingFormData {
  rating: number;
  wait_time_rating?: number;
  communication_rating?: number;
  facility_rating?: number;
}

export interface ReviewFormData {
  review_text: string;
  visit_date?: string | null;
  appointment_type?: string;
  would_recommend?: boolean;
  is_anonymous?: boolean;
}

export interface AvailabilityFormData {
  accepting_new_patients?: boolean;
  next_available_appointment?: string | null;
  appointment_types?: string[];
  office_hours?: OfficeHours;
  wait_time_estimate?: string;
  notes?: string;
  last_contacted_date?: string | null;
  contact_method?: string;
  confidence_level: number;
  verified_by_office?: boolean;
}

export interface InsuranceFormData {
  insurance_name: string;
  insurance_type?: string;
  plan_specific_details?: string;
  copay_amount?: number;
  deductible_applies?: boolean;
  is_in_network?: boolean;
  verification_date?: string | null;
  notes?: string;
  confidence_level: number;
}

// Common insurance types
export const INSURANCE_TYPES = [
  'medicaid',
  'medicare',
  'private',
  'hmo',
  'ppo',
  'epo',
  'pos',
  'high_deductible',
  'other'
] as const;

export type InsuranceType = typeof INSURANCE_TYPES[number];

// Common appointment types
export const APPOINTMENT_TYPES = [
  'new_patient',
  'follow_up',
  'annual_checkup',
  'urgent_care',
  'preventive_care',
  'consultation',
  'procedure',
  'telehealth',
  'mental_health',
  'physical_therapy',
  'other'
] as const;

export type AppointmentType = typeof APPOINTMENT_TYPES[number];

// Contact methods
export const CONTACT_METHODS = [
  'phone',
  'website',
  'in_person',
  'email',
  'patient_portal',
  'other'
] as const;

export type ContactMethod = typeof CONTACT_METHODS[number];

// Wait time estimates
export const WAIT_TIME_OPTIONS = [
  'same_day',
  '1-3_days',
  '1_week',
  '2_weeks',
  '3-4_weeks',
  '1-2_months',
  '3+_months',
  'not_accepting'
] as const;

export type WaitTimeOption = typeof WAIT_TIME_OPTIONS[number];

// Confidence levels
export const CONFIDENCE_LEVELS = [
  { value: 1, label: 'Very Uncertain' },
  { value: 2, label: 'Somewhat Uncertain' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Pretty Confident' },
  { value: 5, label: 'Very Confident' }
] as const;

// Enhanced Provider type with community data
export interface EnhancedProvider {
  // Original provider data
  number: string;
  enumeration_type: string;
  basic: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    name?: string;
    organization_name?: string;
    gender?: string;
    sole_proprietor?: string;
    status: string;
    credential?: string;
    last_updated: string;
  };
  taxonomies: Array<{
    code: string;
    desc: string;
    primary: boolean;
    state?: string;
    license?: string;
  }>;
  addresses: Array<{
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country_code: string;
    telephone_number?: string;
    fax_number?: string;
    address_type: string;
    address_purpose: string;
  }>;
  
  // Community data
  community_summary?: ProviderSummary;
  recent_reviews?: ProviderReview[];
  latest_availability?: ProviderAvailabilityUpdate;
  accepted_insurance?: ProviderInsurance[];
  user_rating?: ProviderRating;
}

// API Response types
export interface CommunityDataResponse {
  summary: ProviderSummary | null;
  reviews: ProviderReview[];
  latest_availability: ProviderAvailabilityUpdate | null;
  insurance_plans: ProviderInsurance[];
  user_rating: ProviderRating | null;
}

// Search and filter types
export interface CommunitySearchFilters {
  min_rating?: number;
  accepting_patients?: boolean;
  insurance_name?: string;
  has_reviews?: boolean;
  max_wait_time?: WaitTimeOption;
}