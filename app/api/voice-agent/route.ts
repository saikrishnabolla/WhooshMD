import { NextRequest, NextResponse } from 'next/server';
import { VapiService } from '../../../services/vapi';
import { VapiProvider } from '../../../types/vapi';

// Initialize Vapi service
const vapiService = new VapiService();

// Voice Agent Configuration
const VOICE_AGENT_CONFIG = {
  enabled: true,
  mock_mode: process.env.VAPI_MOCK_MODE === 'true' || !process.env.VAPI_API_KEY, // Use mock if no API key
  max_providers_per_batch: 6,
};

interface DispatchCallRequest {
  providers: Array<{
    number: string;
    name: string;
    phone: string;
    specialties?: string[];
    address?: string;
  }>;
  user_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const { providers, user_id }: DispatchCallRequest = await request.json();

    console.log('Received voice agent request:', { 
      providersCount: providers?.length, 
      user_id, 
      mockMode: VOICE_AGENT_CONFIG.mock_mode 
    });

    if (!providers || !Array.isArray(providers) || providers.length === 0) {
      return NextResponse.json({ error: 'No providers provided' }, { status: 400 });
    }

    if (providers.length > VOICE_AGENT_CONFIG.max_providers_per_batch) {
      return NextResponse.json({ 
        error: `Maximum ${VOICE_AGENT_CONFIG.max_providers_per_batch} providers allowed per batch` 
      }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let callResults = [];

    if (VOICE_AGENT_CONFIG.mock_mode) {
      console.log('Running in mock mode - simulating Vapi calls');
      
      // Mock implementation for development/testing
      for (const provider of providers) {
        try {
          // Check if phone number exists and is valid
          if (!provider.phone || provider.phone.length < 10) {
            callResults.push({
              provider_number: provider.number,
              provider_name: provider.name,
              status: 'invalid_number',
              reason: 'Invalid or missing phone number',
              phone: provider.phone || 'N/A'
            });
            continue;
          }

          // Simulate different outcomes for demo purposes
          const outcomes = ['success', 'success', 'no_answer', 'busy'];
          const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
          
          const mockCallId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          callResults.push({
            provider_number: provider.number,
            provider_name: provider.name,
            status: randomOutcome,
            call_id: mockCallId,
            phone: provider.phone,
            message: `Mock voice agent call initiated - outcome: ${randomOutcome}`,
            appointment_data: randomOutcome === 'success' ? {
              accepting_patients: Math.random() > 0.3, // 70% chance of accepting
              next_available_date: getRandomFutureDate(),
              appointment_types: ['consultation', 'follow-up'],
              insurance_accepted: ['Medicare', 'Blue Cross', 'Aetna'],
              wait_time_estimate: '2-3 weeks'
            } : undefined
          });

        } catch (error) {
          console.error(`Error processing provider ${provider.name}:`, error);
          callResults.push({
            provider_number: provider.number,
            provider_name: provider.name,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            phone: provider.phone
          });
        }
      }
    } else {
      console.log('Using real Vapi integration');
      
      // Real Vapi implementation
      try {
        // Convert providers to VapiProvider format
        const vapiProviders: VapiProvider[] = providers.map(provider => ({
          number: provider.number,
          name: provider.name,
          phone: provider.phone,
          specialties: provider.specialties,
          address: provider.address
        }));

        // Make batch calls using Vapi service
        callResults = await vapiService.makeBatchCalls(vapiProviders);
        
        console.log('Vapi batch calls completed:', callResults.length);

      } catch (error) {
        console.error('Error with Vapi service:', error);
        return NextResponse.json({
          error: 'Failed to initiate voice agent calls',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Calculate success metrics
    const successfulCalls = callResults.filter(r => r.status === 'success').length;
    const acceptingProviders = callResults.filter(r => 
      r.appointment_data?.accepting_patients === true
    ).length;

    return NextResponse.json({
      success: true,
      results: callResults,
      total_providers: providers.length,
      successful_calls: successfulCalls,
      accepting_providers: acceptingProviders,
      mode: VOICE_AGENT_CONFIG.mock_mode ? 'mock' : 'production',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in voice agent API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Webhook endpoint for Vapi callbacks
export async function PATCH(request: NextRequest) {
  try {
    const webhookData = await request.json();
    console.log('Received Vapi webhook:', webhookData);
    
    // Process webhook data (call status updates, transcripts, etc.)
    // This would typically update a database with call results
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Vapi webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Helper function for mock mode
function getRandomFutureDate(): string {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1); // 1-30 days from now
  
  return futureDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}