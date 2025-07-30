import axios from 'axios';
import { VoiceCallResult, AppointmentSlot } from '../types';

// Omnidim API Configuration
const OMNIDIM_CONFIG = {
  api_url: process.env.OMNIDIM_API_URL || 'https://api.omnidim.com/v1',
  api_key: process.env.OMNIDIM_API_KEY,
  test_mode: process.env.NODE_ENV === 'development',
  default_system_prompt: `You are a friendly healthcare appointment scheduler calling provider offices. 
    Your role is to inquire about appointment availability for new patients. Be professional, 
    concise, and respectful of the staff's time.`
};

interface PreCallData {
  patient_name: string;
  insurance_type: string;
  preferred_date: string;
  appointment_type: string;
  urgency: string;
}

interface ProviderCallRequest {
  providerNpi: string;
  providerName: string;
  userId: string;
  preCallData?: PreCallData | null;
}

export interface OmnidimCallRequest {
  agent_id: number;
  to_number: string;
  call_context: {
    provider_name: string;
    provider_npi: string;
    specialties: string;
    purpose: string;
    additional_context?: string;
    appointment_details?: {
      requested_type: string;
      preferred_timeframe: string;
      insurance_type: string;
      urgency_level: string;
      patient_name: string;
    } | null;
    webhook_url: string;
    dispatch_timestamp: number;
  };
}

export interface OmnidimCallResponse {
  call_id: string;
  status: string;
  dispatch_timestamp: number;
  message?: string;
}

class OmnidimService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = OMNIDIM_CONFIG.api_key || '';
    this.baseUrl = OMNIDIM_CONFIG.api_url;

    if (!this.apiKey && !OMNIDIM_CONFIG.test_mode) {
      console.warn('Omnidim API key not configured. Service will run in mock mode.');
    }
  }

  /**
   * Create an outbound call to verify appointment availability with pre-call context
   */
  async createAppointmentVerificationCall(
    providerNpi: string,
    providerName: string,
    userId: string,
    preCallData?: PreCallData | null
  ): Promise<{ success: boolean; callId?: string; message?: string }> {
    if (!this.apiKey && !OMNIDIM_CONFIG.test_mode) {
      return { success: false, message: 'Omnidim API key not configured and not in test mode.' };
    }

    const dispatchTimestamp = Date.now();
    
    // Build context-aware purpose and details based on pre-call data
    let purpose = "Check availability for new patients";
    let additionalContext = "";
    
    if (preCallData) {
      purpose = `Check availability for ${preCallData.appointment_type}`;
      
      if (preCallData.preferred_date) {
        purpose += ` ${preCallData.preferred_date.toLowerCase()}`;
      }
      
      additionalContext = [
        preCallData.insurance_type ? `Insurance: ${preCallData.insurance_type}` : null,
        preCallData.urgency !== 'Routine' ? `Urgency: ${preCallData.urgency}` : null,
        preCallData.patient_name ? `Patient: ${preCallData.patient_name}` : null
      ].filter(Boolean).join(', ');
    }
    
    const callRequest: OmnidimCallRequest = {
      agent_id: 1060, // This will need to be dynamic or passed in if agent_id is configurable
      to_number: '+16175712439', // Currently hardcoded for testing
      call_context: {
        provider_name: providerName,
        provider_npi: providerNpi,
        specialties: "General Practice", // Placeholder, can be derived from preCallData
        purpose: purpose,
        additional_context: additionalContext,
        appointment_details: preCallData ? {
          requested_type: preCallData.appointment_type,
          preferred_timeframe: preCallData.preferred_date,
          insurance_type: preCallData.insurance_type,
          urgency_level: preCallData.urgency,
          patient_name: preCallData.patient_name
        } : null,
        webhook_url: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://yourapp.com/api/webhook/call-result',
        dispatch_timestamp: dispatchTimestamp,
      },
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/calls/dispatch`, // Assuming this is the correct endpoint
        callRequest,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Store call mapping for webhook correlation
      const callId = response.data.call_id || `omnidim_${dispatchTimestamp}`;
      await this.storeCallMapping(callId, providerNpi, userId);

      return {
        success: true,
        callId: callId,
        message: 'Call dispatched successfully',
      };
    } catch (error) {
      console.error('Error creating Omnidim call:', error);
      return {
        success: false,
        message: this.handleApiError(error),
      };
    }
  }

  /**
   * Create multiple calls for batch appointment verification
   */
  async createBatchAppointmentCalls(
    requests: ProviderCallRequest[]
  ): Promise<Array<{ success: boolean; providerNpi: string; providerName?: string; callId?: string; message?: string }>> {
    const results = [];

    for (const request of requests) {
      try {
        const result = await this.createAppointmentVerificationCall(
          request.providerNpi,
          request.providerName,
          request.userId,
          request.preCallData
        );
        
        results.push({
          ...result,
          providerNpi: request.providerNpi,
          providerName: request.providerName
        });
        
        // Add delay between calls to avoid rate limiting
        await this.delay(2000);
      } catch (error) {
        console.error(`Error creating call for provider ${request.providerName}:`, error);
        results.push({
          success: false,
          providerNpi: request.providerNpi,
          providerName: request.providerName,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Process webhook events from Omnidim
   */
  static processWebhookEvent(event: any): VoiceCallResult | null {
    try {
      const dispatchTimestamp = event.call_context?.dispatch_timestamp;
      
      if (!dispatchTimestamp) {
        console.error('No dispatch timestamp found in webhook event');
        return null;
      }

      // Match webhook result with original provider request using timestamp
      const providerNpi = event.call_context?.provider_npi || '';
      const providerName = event.call_context?.provider_name || '';
      
      return {
        provider_npi: providerNpi,
        provider_name: providerName,
        provider_phone: '+16175712439', // Currently hardcoded for testing
        call_id: event.call_id || `omnidim_${dispatchTimestamp}`,
        status: event.status || 'completed',
        availability_found: event.availability?.accepting_new_patients || false,
        next_available_slots: event.availability?.next_available_slots || [],
        appointment_types: event.availability?.appointment_types || [],
        call_summary: event.summary || '',
        call_duration: event.duration || '',
        transcript: event.transcript || '',
        created_at: new Date(dispatchTimestamp).toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error processing Omnidim webhook event:', error);
      return null;
    }
  }



  /**
   * Store call mapping for webhook correlation
   */
  private async storeCallMapping(callId: string, providerNpi: string, userId?: string): Promise<void> {
    try {
      // Store in memory mapping
      const { storeCallMapping } = await import('../lib/call-mapping');
      storeCallMapping(callId, providerNpi);
      
      // Also store in database for persistence (optional enhancement)
      const response = await fetch('/api/call-mapping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_id: callId,
          provider_npi: providerNpi,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to store call mapping:', response.statusText);
      } else {
        console.log(`✅ Stored call mapping: ${callId} -> ${providerNpi}`);
      }
    } catch (error) {
      console.error('Error storing call mapping:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleApiError(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return 'Unauthorized access to Omnidim API.';
      }
      if (error.response?.status === 429) {
        return 'Rate limit exceeded. Please try again later.';
      }
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
    }
    return 'An error occurred while communicating with the Omnidim service.';
  }
}

export const omnidimService = new OmnidimService();