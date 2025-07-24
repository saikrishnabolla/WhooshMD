import axios from 'axios';
import { VoiceCallResult, AppointmentSlot } from '../types';

// Omnidim Configuration
const OMNIDIM_CONFIG = {
  apiUrl: 'https://backend.omnidim.io/api/v1/calls/dispatch',
  agentId: 1060,
  testPhoneNumber: '+16175712439', // Currently hardcoded for testing
  webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://yourapp.com/api/webhook/call-result',
  apiKey: process.env.OMNIDIM_API_KEY,
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
    userId: string,
    webhookUrl?: string
  ): Promise<OmnidimCallResponse> {
    if (!OMNIDIM_CONFIG.apiKey) {
      throw new Error('Omnidim API key not configured');
    }

    const dispatchTimestamp = Date.now();
    
    const callRequest: OmnidimCallRequest = {
      agent_id: this.agentId,
      to_number: OMNIDIM_CONFIG.testPhoneNumber,
      call_context: {
        provider_name: providerName,
        provider_npi: providerNpi,
        specialties: specialties,
        purpose: "Check availability for new patients this week",
        webhook_url: webhookUrl || this.webhookUrl,
        dispatch_timestamp: dispatchTimestamp,
      },
    };

    try {
      const response = await axios.post(
        OMNIDIM_CONFIG.apiUrl,
        callRequest,
        {
          headers: {
            Authorization: `Bearer ${OMNIDIM_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Store call mapping for webhook correlation
      const callId = response.data.call_id || `omnidim_${dispatchTimestamp}`;
      await this.storeCallMapping(callId, providerNpi, userId);

      return {
        call_id: callId,
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
    userId: string,
    webhookUrl?: string
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
          userId,
          webhookUrl
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