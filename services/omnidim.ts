import axios from 'axios';
import { VoiceCallResult, AppointmentSlot } from '../types';

// Omnidim Configuration
const OMNIDIM_CONFIG = {
  apiUrl: 'https://backend.omnidim.io/api/v1/calls/dispatch',
  agentId: 1060,
  testPhoneNumber: '+14153790645', // Currently hardcoded for testing
  webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://yourapp.com/api/webhook/call-result',
};

export interface OmnidimCallRequest {
  agent_id: number;
  to_number: string;
  call_context: {
    provider_name: string;
    provider_npi: string;
    specialties: string;
    purpose: string;
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

export class OmnidimService {
  private agentId: number;
  private webhookUrl: string;

  constructor() {
    this.agentId = OMNIDIM_CONFIG.agentId;
    this.webhookUrl = OMNIDIM_CONFIG.webhookUrl;
  }

  /**
   * Create an outbound call to verify appointment availability
   */
  async createAppointmentVerificationCall(
    providerName: string,
    providerNpi: string,
    specialties: string,
    userId: string
  ): Promise<OmnidimCallResponse> {
    const dispatchTimestamp = Date.now();
    
    const callRequest: OmnidimCallRequest = {
      agent_id: this.agentId,
      to_number: OMNIDIM_CONFIG.testPhoneNumber,
      call_context: {
        provider_name: providerName,
        provider_npi: providerNpi,
        specialties: specialties,
        purpose: "Check availability for new patients this week",
        webhook_url: this.webhookUrl,
        dispatch_timestamp: dispatchTimestamp,
      },
    };

    try {
      const response = await axios.post(
        OMNIDIM_CONFIG.apiUrl,
        callRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Store dispatch timestamp for webhook matching
      this.storeDispatchTimestamp(providerNpi, dispatchTimestamp);

      return {
        call_id: response.data.call_id || `omnidim_${dispatchTimestamp}`,
        status: 'dispatched',
        dispatch_timestamp: dispatchTimestamp,
        message: 'Call dispatched successfully',
      };
    } catch (error) {
      console.error('Error creating Omnidim call:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Create multiple calls for batch appointment verification
   */
  async createBatchAppointmentCalls(
    providers: Array<{
      name: string;
      npi: string;
      specialties: string;
    }>,
    userId: string
  ): Promise<OmnidimCallResponse[]> {
    const calls: OmnidimCallResponse[] = [];
    const maxBatchSize = 6; // Limit to 6 providers

    // Limit providers to maximum batch size
    const limitedProviders = providers.slice(0, maxBatchSize);

    for (const provider of limitedProviders) {
      try {
        const call = await this.createAppointmentVerificationCall(
          provider.name,
          provider.npi,
          provider.specialties,
          userId
        );
        calls.push(call);
        
        // Add delay between calls to avoid rate limiting
        await this.delay(2000);
      } catch (error) {
        console.error(`Error creating call for provider ${provider.name}:`, error);
        // Continue with other providers even if one fails
        calls.push({
          call_id: `error_${Date.now()}`,
          status: 'error',
          dispatch_timestamp: Date.now(),
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return calls;
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
        provider_phone: OMNIDIM_CONFIG.testPhoneNumber,
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
   * Store dispatch timestamp for webhook matching
   */
  private storeDispatchTimestamp(providerNpi: string, timestamp: number): void {
    // Store in browser localStorage for now, will be replaced with Supabase
    const key = `omnidim_dispatch_${providerNpi}`;
    localStorage.setItem(key, timestamp.toString());
  }

  /**
   * Get stored dispatch timestamp for webhook matching
   */
  static getDispatchTimestamp(providerNpi: string): number | null {
    const key = `omnidim_dispatch_${providerNpi}`;
    const timestamp = localStorage.getItem(key);
    return timestamp ? parseInt(timestamp) : null;
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