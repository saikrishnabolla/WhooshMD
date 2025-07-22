// Vapi-specific types for appointment verification
export interface VapiCallRequest {
  providers: VapiProvider[];
  user_id: string;
}

export interface VapiProvider {
  number: string;
  name: string;
  phone: string;
  specialties?: string[];
  address?: string;
}

export interface VapiCallResult {
  provider_number: string;
  provider_name: string;
  status: 'success' | 'failed' | 'no_answer' | 'busy' | 'invalid_number';
  call_id?: string;
  phone: string;
  message?: string;
  appointment_data?: AppointmentData;
  call_duration?: string;
  transcript?: string;
  error?: string;
}

export interface AppointmentData {
  accepting_patients: boolean;
  next_available_date?: string;
  appointment_types?: string[];
  insurance_accepted?: string[];
  wait_time_estimate?: string;
  office_hours?: OfficeHours;
  booking_instructions?: string;
  additional_notes?: string;
}

export interface OfficeHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface VapiAssistantConfig {
  name: string;
  model: {
    provider: string;
    model: string;
    messages: Array<{
      role: string;
      content: string;
    }>;
    functions?: VapiFunction[];
  };
  voice: {
    provider: string;
    voiceId: string;
  };
  firstMessage?: string;
  recordingEnabled?: boolean;
  endCallFunctionEnabled?: boolean;
  phoneNumber?: string;
}

export interface VapiFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface VapiOutboundCall {
  phoneNumber: string;
  assistantId?: string;
  assistant?: VapiAssistantConfig;
  metadata?: Record<string, any>;
}

export interface VapiCallStatus {
  id: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'forwarding' | 'ended';
  type: 'outboundPhoneCall';
  phoneNumber: string;
  assistantId?: string;
  cost?: number;
  costBreakdown?: {
    transport: number;
    stt: number;
    llm: number;
    tts: number;
    vapi: number;
    total: number;
  };
  messages?: VapiMessage[];
  transcript?: string;
  recordingUrl?: string;
  summary?: string;
  endedReason?: string;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
}

export interface VapiMessage {
  role: 'assistant' | 'user' | 'system' | 'function';
  message: string;
  time: number;
  endTime?: number;
  secondsFromStart: number;
}

export interface VapiWebhookPayload {
  message: {
    type: string;
    call?: VapiCallStatus;
    transcript?: string;
    role?: string;
  };
}