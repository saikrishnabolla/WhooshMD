import axios from 'axios';
import { VapiCallRequest, VapiCallResponse, VoiceCallResult, ProviderAvailability, AppointmentSlot } from '../types';

// Vapi Configuration
const VAPI_CONFIG = {
  apiKey: process.env.VAPI_API_KEY || process.env.NEXT_PUBLIC_VAPI_API_KEY,
  baseUrl: 'https://api.vapi.ai',
  assistantId: process.env.VAPI_ASSISTANT_ID || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
  phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID || process.env.NEXT_PUBLIC_VAPI_PHONE_NUMBER_ID,
  webhookUrl: process.env.NEXT_PUBLIC_VAPI_WEBHOOK_URL || 'https://your-domain.com/api/webhooks/vapi',
};

export class VapiService {
  private apiKey: string;
  private baseUrl: string;
  private assistantId: string;
  private phoneNumberId: string;

  constructor() {
    this.apiKey = VAPI_CONFIG.apiKey!;
    this.baseUrl = VAPI_CONFIG.baseUrl;
    this.assistantId = VAPI_CONFIG.assistantId!;
    this.phoneNumberId = VAPI_CONFIG.phoneNumberId!;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create an outbound call to verify appointment availability
   */
  async createAppointmentVerificationCall(
    providerPhone: string,
    providerName: string,
    providerNpi: string,
    userId: string,
    appointmentType?: string
  ): Promise<VapiCallResponse> {
    const callRequest: VapiCallRequest = {
      assistantId: this.assistantId,
      phoneNumberId: this.phoneNumberId,
      customer: {
        number: providerPhone,
        name: providerName,
      },
      metadata: {
        provider_npi: providerNpi,
        provider_name: providerName,
        user_id: userId,
        appointment_type: appointmentType || 'general consultation',
        call_type: 'appointment_verification',
        preferred_times: this.getDefaultPreferredTimes(),
      },
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/call/phone`,
        callRequest,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating Vapi call:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Create multiple calls for batch appointment verification
   */
  async createBatchAppointmentCalls(
    providers: Array<{
      phone: string;
      name: string;
      npi: string;
    }>,
    userId: string,
    appointmentType?: string
  ): Promise<VapiCallResponse[]> {
    const calls: VapiCallResponse[] = [];
    const maxBatchSize = 6; // Limit to 6 providers as requested

    // Limit providers to maximum batch size
    const limitedProviders = providers.slice(0, maxBatchSize);

    for (const provider of limitedProviders) {
      try {
        const call = await this.createAppointmentVerificationCall(
          provider.phone,
          provider.name,
          provider.npi,
          userId,
          appointmentType
        );
        calls.push(call);
        
        // Add delay between calls to avoid rate limiting
        await this.delay(2000);
      } catch (error) {
        console.error(`Error creating call for provider ${provider.name}:`, error);
        // Continue with other providers even if one fails
      }
    }

    return calls;
  }

  /**
   * Get call status and details
   */
  async getCall(callId: string): Promise<VapiCallResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/call/${callId}`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching call details:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Get all calls for a user
   */
  async getUserCalls(userId: string): Promise<VapiCallResponse[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/call`,
        { 
          headers: this.getHeaders(),
          params: {
            // Filter by user metadata if Vapi supports it
            limit: 100,
          }
        }
      );

      // Filter calls by user_id in metadata
      return response.data.filter((call: VapiCallResponse) => 
        call.metadata?.user_id === userId
      );
    } catch (error) {
      console.error('Error fetching user calls:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Create or update assistant with appointment verification instructions
   */
  async createAppointmentVerificationAssistant(): Promise<any> {
    const assistantConfig = {
      name: "Appointment Verification Assistant",
      firstMessage: "Hello, I'm calling to inquire about appointment availability for a new patient. Could you please help me with this?",
      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.3,
        messages: [{
          role: "system",
          content: this.getAppointmentVerificationPrompt()
        }]
      },
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM" // Rachel voice
      },
      tools: [{
        type: "function",
        function: {
          name: "record_appointment_availability",
          description: "Record the appointment availability information gathered from the provider",
          parameters: {
            type: "object",
            properties: {
              accepting_new_patients: {
                type: "boolean",
                description: "Whether the provider is accepting new patients"
              },
              next_available_slots: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string", description: "Date in YYYY-MM-DD format" },
                    time: { type: "string", description: "Time in HH:MM format" },
                    appointment_type: { type: "string", description: "Type of appointment" }
                  }
                }
              },
              appointment_types: {
                type: "array",
                items: { type: "string" },
                description: "Types of appointments offered"
              },
              special_notes: {
                type: "string",
                description: "Any special notes or requirements"
              }
            },
            required: ["accepting_new_patients"]
          }
        }
      }],
      endCallOnFunctionCall: true,
      maxDurationSeconds: 300, // 5 minutes max
      waitForUserInput: false,
      recordingEnabled: true
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/assistant`,
        assistantConfig,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating assistant:', error);
      throw new Error(this.handleApiError(error));
    }
  }

  /**
   * Process webhook events from Vapi
   */
  static processWebhookEvent(event: any): VoiceCallResult | null {
    try {
      if (event.type === 'function-call' && event.functionCall?.name === 'record_appointment_availability') {
        const params = event.functionCall.parameters;
        const call = event.call;
        
        return {
          provider_npi: call.metadata?.provider_npi || '',
          provider_name: call.metadata?.provider_name || '',
          provider_phone: call.customer?.number || '',
          call_id: call.id,
          status: 'completed',
          availability_found: params.accepting_new_patients,
          next_available_slots: params.next_available_slots || [],
          appointment_types: params.appointment_types || [],
          call_summary: params.special_notes || '',
          created_at: call.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      if (event.type === 'call-end') {
        const call = event.call;
        return {
          provider_npi: call.metadata?.provider_npi || '',
          provider_name: call.metadata?.provider_name || '',
          provider_phone: call.customer?.number || '',
          call_id: call.id,
          status: call.status === 'ended' ? 'completed' : 'failed',
          availability_found: false, // Default to false if no function call was made
          next_available_slots: [],
          appointment_types: [],
          call_summary: 'Call ended without availability information',
          created_at: call.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return null;
    }
  }

  private getAppointmentVerificationPrompt(): string {
    return `You are a professional appointment verification assistant. Your job is to call healthcare providers to inquire about appointment availability for new patients.

INSTRUCTIONS:
1. Be polite, professional, and concise
2. Introduce yourself as calling on behalf of a patient seeking appointments
3. Ask if they are accepting new patients
4. If yes, ask about next available appointment slots
5. Ask about types of appointments they offer
6. Record all information using the record_appointment_availability function
7. Thank them and end the call

CONVERSATION FLOW:
- Start: "Hello, I'm calling to inquire about appointment availability for a new patient. Could you please help me with this?"
- Ask: "Are you currently accepting new patients?"
- If YES: "That's great! What are your next available appointment slots?"
- Ask: "What types of appointments do you offer?"
- Record information and thank them

IMPORTANT:
- Keep responses under 20 words
- If they ask for patient details, say you're doing a general availability check
- If they can't help, ask to speak with scheduling
- Always use the function to record what you learn
- Be respectful of their time

Remember: You're helping patients find available healthcare appointments efficiently.`;
  }

  private getDefaultPreferredTimes(): string[] {
    return [
      'Morning (8 AM - 12 PM)',
      'Afternoon (12 PM - 5 PM)', 
      'Any weekday',
      'Within 2 weeks'
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleApiError(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return 'Invalid Vapi API key. Please check your configuration.';
      }
      if (error.response?.status === 429) {
        return 'Rate limit exceeded. Please try again later.';
      }
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
    }
    return 'An error occurred while communicating with the voice agent service.';
  }
}

export const vapiService = new VapiService();