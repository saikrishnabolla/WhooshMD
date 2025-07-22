export interface Provider {
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
  other_names?: Array<{
    organization_name?: string;
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    credential?: string;
    type?: string;
  }>;
  endpoints?: Array<{
    endpointType: string;
    endpoint: string;
    endpointDescription?: string;
    affiliation?: string;
    use?: string;
    useDescription?: string;
    contentType?: string;
    contentTypeDescription?: string;
    contentOther?: string;
  }>;
}

export interface SearchParams {
  version: string;
  number?: string;
  enumeration_type?: string;
  taxonomy_description?: string;
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  address_purpose?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country_code?: string;
  limit?: number;
  skip?: number;
}

export interface SearchResponse {
  result_count: number;
  results: Provider[];
}

export interface SearchHistoryItem {
  id: string;
  params: SearchParams;
  timestamp: number;
  resultCount: number;
}

export interface FavoriteProvider {
  id: string;
  provider: Provider;
  timestamp: number;
}

// Vapi Integration Types
export interface VapiCallRequest {
  assistantId: string;
  phoneNumberId: string;
  customer: {
    number: string;
    name?: string;
  };
  metadata?: {
    provider_npi: string;
    provider_name: string;
    user_id: string;
    appointment_type?: string;
    preferred_times?: string[];
  };
}

export interface VapiCallResponse {
  id: string;
  status: string;
  assistantId: string;
  phoneNumberId: string;
  customer: {
    number: string;
    name?: string;
  };
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface VapiWebhookEvent {
  type: 'status-update' | 'transcript' | 'function-call' | 'call-end' | 'call-start';
  call: {
    id: string;
    status: string;
    assistantId: string;
    phoneNumberId: string;
    customer: any;
    metadata?: any;
  };
  message?: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    transcript?: string;
  };
  functionCall?: {
    name: string;
    parameters: any;
  };
  timestamp: string;
}

// Enhanced Voice Call Types
export interface VoiceCallResult {
  provider_npi: string;
  provider_name: string;
  provider_phone: string;
  call_id: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'error';
  availability_found: boolean;
  next_available_slots?: AppointmentSlot[];
  appointment_types?: string[];
  call_duration?: string;
  call_summary?: string;
  transcript?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentSlot {
  date: string;
  time: string;
  appointment_type: string;
  duration?: string;
  notes?: string;
}

export interface ProviderAvailability {
  provider_npi: string;
  provider_name: string;
  provider_phone: string;
  accepting_new_patients: boolean;
  next_available_slots: AppointmentSlot[];
  appointment_types: string[];
  office_hours: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  special_notes?: string;
  verified_at: string;
}

export interface VoiceAgentConfig {
  max_providers_per_batch: number;
  call_timeout_seconds: number;
  retry_attempts: number;
  voice_assistant_id: string;
  phone_number_id: string;
  appointment_verification_prompt: string;
}