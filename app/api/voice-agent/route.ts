import { NextRequest, NextResponse } from 'next/server';
import { vapiService } from '../../../services/vapi';

// Voice Agent Configuration
const VOICE_AGENT_CONFIG = {
  enabled: true,
  mock_mode: process.env.NODE_ENV === 'development' && !process.env.VAPI_API_KEY,
  max_providers: 6, // Limit to 6 providers as requested
};

interface DispatchCallRequest {
  providers: Array<{
    number: string;
    name: string;
    phone: string;
  }>;
  user_id: string;
  appointment_type?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { providers, user_id, appointment_type }: DispatchCallRequest = await request.json();

    if (!providers || !Array.isArray(providers) || providers.length === 0) {
      return NextResponse.json({ error: 'No providers provided' }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Limit to maximum of 6 providers
    const limitedProviders = providers.slice(0, VOICE_AGENT_CONFIG.max_providers);

    const callResults = [];

    if (VOICE_AGENT_CONFIG.mock_mode) {
      // Mock implementation for development/testing
      for (const provider of limitedProviders) {
        try {
          if (!provider.phone || provider.phone.length < 10) {
            callResults.push({
              provider_number: provider.number,
              provider_name: provider.name,
              status: 'skipped',
              reason: 'Invalid phone number',
              phone: provider.phone
            });
            continue;
          }

          const mockCallId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Simulate successful call initiation
          callResults.push({
            provider_number: provider.number,
            provider_name: provider.name,
            status: 'success',
            call_id: mockCallId,
            phone: provider.phone,
            message: 'Voice agent call initiated (mock mode)',
            mock_data: {
              accepting_new_patients: Math.random() > 0.3, // 70% chance of accepting
              next_available_slots: generateMockAppointmentSlots(),
              appointment_types: ['General Consultation', 'Follow-up', 'Physical Exam']
            }
          });
        } catch (error) {
          console.error(`Error processing provider ${provider.name}:`, error);
          callResults.push({
            provider_number: provider.number,
            provider_name: provider.name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            phone: provider.phone
          });
        }
      }
    } else {
      // Real Vapi integration
      try {
        const vapiProviders = limitedProviders
          .filter(p => p.phone && p.phone.length >= 10)
          .map(p => ({
            phone: p.phone,
            name: p.name,
            npi: p.number
          }));

        if (vapiProviders.length === 0) {
          return NextResponse.json({ 
            error: 'No providers with valid phone numbers found' 
          }, { status: 400 });
        }

        const vapiCalls = await vapiService.createBatchAppointmentCalls(
          vapiProviders,
          user_id,
          appointment_type
        );

        for (let i = 0; i < vapiProviders.length; i++) {
          const provider = limitedProviders[i];
          const vapiCall = vapiCalls[i];

          if (vapiCall) {
            callResults.push({
              provider_number: provider.number,
              provider_name: provider.name,
              status: 'success',
              call_id: vapiCall.id,
              phone: provider.phone,
              message: 'Voice agent call initiated successfully',
              vapi_call_data: vapiCall
            });
          } else {
            callResults.push({
              provider_number: provider.number,
              provider_name: provider.name,
              status: 'error',
              error: 'Failed to initiate Vapi call',
              phone: provider.phone
            });
          }
        }
      } catch (error) {
        console.error('Error with Vapi integration:', error);
        return NextResponse.json({
          error: 'Failed to initiate voice agent calls. Please try again.',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      results: callResults,
      total_providers: limitedProviders.length,
      successful_calls: callResults.filter(r => r.status === 'success').length,
      mode: VOICE_AGENT_CONFIG.mock_mode ? 'mock' : 'production',
      max_providers_limit: VOICE_AGENT_CONFIG.max_providers,
      appointment_type: appointment_type || 'general consultation'
    });

  } catch (error) {
    console.error('Error in voice agent API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const callId = searchParams.get('call_id');

    if (callId) {
      // Get specific call details
      if (VOICE_AGENT_CONFIG.mock_mode) {
        return NextResponse.json({
          call_id: callId,
          status: 'completed',
          message: 'Mock call completed',
          mock_mode: true
        });
      } else {
        const callDetails = await vapiService.getCall(callId);
        return NextResponse.json(callDetails);
      }
    }

    if (userId) {
      // Get all calls for user
      if (VOICE_AGENT_CONFIG.mock_mode) {
        return NextResponse.json({
          calls: [],
          message: 'Mock mode - no real calls to retrieve',
          mock_mode: true
        });
      } else {
        const userCalls = await vapiService.getUserCalls(userId);
        return NextResponse.json({ calls: userCalls });
      }
    }

    return NextResponse.json({ 
      status: 'Voice Agent API is running',
      config: {
        enabled: VOICE_AGENT_CONFIG.enabled,
        mock_mode: VOICE_AGENT_CONFIG.mock_mode,
        max_providers: VOICE_AGENT_CONFIG.max_providers
      }
    });

  } catch (error) {
    console.error('Error in voice agent GET API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Helper function to generate mock appointment slots for development
function generateMockAppointmentSlots() {
  const slots = [];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Add 2-3 random slots per day
    const slotsPerDay = Math.floor(Math.random() * 2) + 2;
    for (let j = 0; j < slotsPerDay; j++) {
      const hour = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
      const minute = Math.random() > 0.5 ? 0 : 30;
      
      slots.push({
        date: date.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        appointment_type: ['General Consultation', 'Follow-up', 'Physical Exam'][Math.floor(Math.random() * 3)],
        duration: '30 minutes'
      });
    }
  }
  
  return slots.slice(0, 5); // Return up to 5 slots
}