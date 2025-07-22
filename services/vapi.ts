import { 
  VapiCallRequest, 
  VapiCallResult, 
  VapiAssistantConfig, 
  VapiOutboundCall,
  VapiCallStatus,
  AppointmentData,
  VapiProvider
} from '../types/vapi';

// Vapi configuration
const VAPI_BASE_URL = 'https://api.vapi.ai';
const VAPI_API_KEY = process.env.VAPI_API_KEY;

export class VapiService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || VAPI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('VAPI_API_KEY not found. Ensure it is set in environment variables.');
    }
  }

  /**
   * Create a specialized assistant for appointment verification
   */
  private createAppointmentAssistant(providerName: string, providerPhone: string): VapiAssistantConfig {
    return {
      name: `Appointment Checker for ${providerName}`,
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional appointment inquiry assistant. You are calling ${providerName} at ${providerPhone} to check for appointment availability for a new patient.

Your goals:
1. Be polite, professional, and brief
2. Identify yourself as calling on behalf of a patient seeking an appointment
3. Ask about current availability for new patients
4. If available, ask about the next available appointment date
5. Inquire about accepted insurance types
6. Ask about appointment types offered (consultation, follow-up, etc.)
7. Note any special instructions for booking
8. Thank them and end the call professionally

Important guidelines:
- Keep the call under 3 minutes
- Be understanding if they're busy
- Don't provide any medical information
- Simply gather availability information
- Use the report_appointment_info function to record findings

If the office is closed, a machine answers, or no one is available, still report what you discovered.`
          }
        ],
        functions: [
          {
            name: 'report_appointment_info',
            description: 'Report the appointment availability information gathered from the call',
            parameters: {
              type: 'object',
              properties: {
                accepting_patients: {
                  type: 'boolean',
                  description: 'Whether the provider is currently accepting new patients'
                },
                next_available_date: {
                  type: 'string',
                  description: 'Next available appointment date if accepting patients'
                },
                appointment_types: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Types of appointments available (e.g., consultation, follow-up)'
                },
                insurance_accepted: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Insurance types accepted'
                },
                wait_time_estimate: {
                  type: 'string',
                  description: 'Estimated wait time for appointment'
                },
                booking_instructions: {
                  type: 'string',
                  description: 'Special instructions for booking appointments'
                },
                additional_notes: {
                  type: 'string',
                  description: 'Any additional relevant information'
                },
                call_outcome: {
                  type: 'string',
                  description: 'Overall outcome of the call (answered, voicemail, busy, etc.)'
                }
              },
              required: ['accepting_patients', 'call_outcome']
            }
          }
        ]
      },
      voice: {
        provider: '11labs',
        voiceId: 'sarah'
      },
      firstMessage: `Hello, I'm calling on behalf of a patient who is looking for an appointment. Could you please let me know if you're currently accepting new patients?`,
      recordingEnabled: true,
      endCallFunctionEnabled: true
    };
  }

  /**
   * Make an outbound call to a provider
   */
  async makeOutboundCall(provider: VapiProvider): Promise<VapiCallResult> {
    if (!this.apiKey) {
      throw new Error('Vapi API key is required');
    }

    try {
      // Create the assistant configuration for this specific provider
      const assistant = this.createAppointmentAssistant(provider.name, provider.phone);

      const callData: VapiOutboundCall = {
        phoneNumber: provider.phone,
        assistant,
        metadata: {
          provider_npi: provider.number,
          provider_name: provider.name,
          purpose: 'appointment_verification'
        }
      };

      const response = await fetch(`${VAPI_BASE_URL}/call/phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Vapi API error: ${response.status} - ${error}`);
      }

      const callResult = await response.json();

      return {
        provider_number: provider.number,
        provider_name: provider.name,
        status: 'success',
        call_id: callResult.id,
        phone: provider.phone,
        message: 'Call initiated successfully'
      };

    } catch (error) {
      console.error(`Error making call to ${provider.name}:`, error);
      return {
        provider_number: provider.number,
        provider_name: provider.name,
        status: 'failed',
        phone: provider.phone,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get call status and results
   */
  async getCallStatus(callId: string): Promise<VapiCallStatus | null> {
    if (!this.apiKey) {
      throw new Error('Vapi API key is required');
    }

    try {
      const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get call status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting call status:', error);
      return null;
    }
  }

  /**
   * Parse appointment data from call transcript and function calls
   */
  parseAppointmentData(callStatus: VapiCallStatus): AppointmentData | null {
    try {
      // Look for function call results first
      if (callStatus.messages) {
        const functionCalls = callStatus.messages.filter(
          msg => msg.role === 'function' && msg.message.includes('report_appointment_info')
        );

        if (functionCalls.length > 0) {
          const lastFunctionCall = functionCalls[functionCalls.length - 1];
          try {
            const functionData = JSON.parse(lastFunctionCall.message);
            if (functionData.arguments) {
              const args = JSON.parse(functionData.arguments);
              return {
                accepting_patients: args.accepting_patients || false,
                next_available_date: args.next_available_date,
                appointment_types: args.appointment_types || [],
                insurance_accepted: args.insurance_accepted || [],
                wait_time_estimate: args.wait_time_estimate,
                booking_instructions: args.booking_instructions,
                additional_notes: args.additional_notes
              };
            }
          } catch (parseError) {
            console.error('Error parsing function call data:', parseError);
          }
        }
      }

      // Fallback to transcript parsing
      if (callStatus.transcript) {
        return this.parseTranscriptForAppointmentInfo(callStatus.transcript);
      }

      return null;
    } catch (error) {
      console.error('Error parsing appointment data:', error);
      return null;
    }
  }

  /**
   * Parse transcript text for appointment information using keyword analysis
   */
  private parseTranscriptForAppointmentInfo(transcript: string): AppointmentData {
    const lowerTranscript = transcript.toLowerCase();
    
    // Keywords for accepting patients
    const acceptingKeywords = [
      'accepting new patients',
      'taking new patients',
      'have availability',
      'can schedule',
      'yes, we are',
      'available appointments'
    ];

    const notAcceptingKeywords = [
      'not accepting',
      'not taking new',
      'fully booked',
      'no availability',
      'wait list',
      'waitlist'
    ];

    let accepting_patients = false;
    
    // Check if accepting patients
    if (acceptingKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      accepting_patients = true;
    } else if (notAcceptingKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      accepting_patients = false;
    }

    // Extract next available date (simple pattern matching)
    const datePatterns = [
      /next\s+(?:available\s+)?(?:appointment\s+)?(?:is\s+)?(?:on\s+)?([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?)/gi,
      /available\s+(?:on\s+)?([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?)/gi,
      /schedule\s+(?:for\s+)?([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?)/gi
    ];

    let next_available_date: string | undefined;
    for (const pattern of datePatterns) {
      const match = pattern.exec(transcript);
      if (match) {
        next_available_date = match[1];
        break;
      }
    }

    return {
      accepting_patients,
      next_available_date,
      appointment_types: this.extractAppointmentTypes(transcript),
      insurance_accepted: this.extractInsuranceTypes(transcript),
      additional_notes: transcript.length > 500 ? transcript.substring(0, 500) + '...' : transcript
    };
  }

  private extractAppointmentTypes(transcript: string): string[] {
    const appointmentTypes: string[] = [];
    const lowerTranscript = transcript.toLowerCase();

    const typeKeywords = [
      'consultation',
      'follow-up',
      'initial visit',
      'physical exam',
      'check-up',
      'screening',
      'routine visit'
    ];

    typeKeywords.forEach(type => {
      if (lowerTranscript.includes(type)) {
        appointmentTypes.push(type);
      }
    });

    return appointmentTypes;
  }

  private extractInsuranceTypes(transcript: string): string[] {
    const insuranceTypes: string[] = [];
    const lowerTranscript = transcript.toLowerCase();

    const insuranceKeywords = [
      'medicare',
      'medicaid',
      'blue cross',
      'aetna',
      'cigna',
      'united healthcare',
      'humana',
      'kaiser',
      'all insurance',
      'most insurance'
    ];

    insuranceKeywords.forEach(insurance => {
      if (lowerTranscript.includes(insurance)) {
        insuranceTypes.push(insurance);
      }
    });

    return insuranceTypes;
  }

  /**
   * Batch process multiple provider calls
   */
  async makeBatchCalls(providers: VapiProvider[]): Promise<VapiCallResult[]> {
    if (providers.length > 6) {
      throw new Error('Maximum 6 providers allowed per batch');
    }

    const results: VapiCallResult[] = [];
    
    // Process calls sequentially to avoid rate limiting
    for (const provider of providers) {
      try {
        const result = await this.makeOutboundCall(provider);
        results.push(result);
        
        // Add a small delay between calls
        if (providers.indexOf(provider) < providers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Failed to call ${provider.name}:`, error);
        results.push({
          provider_number: provider.number,
          provider_name: provider.name,
          status: 'failed',
          phone: provider.phone,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }
}

// Export a default instance
export const vapiService = new VapiService();