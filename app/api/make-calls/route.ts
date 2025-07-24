import { NextRequest, NextResponse } from 'next/server';
import { omnidimService } from '../../../services/omnidim';
import { callTimestamps } from "@/lib/call-storage"

// Use the public URL if defined, otherwise fall back to the request origin
function getBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;
}

// Call Dispatch Configuration
const CALL_DISPATCH_CONFIG = {
  enabled: true,
  mock_mode: process.env.NODE_ENV === 'development',
  max_providers: 6,
      test_phone_number: '+16175712439',
  use_test_number: true,
};

interface DispatchCallRequest {
  providers: Array<{
    number: string;
    name: string;
    specialties?: string;
  }>;
  user_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const { providers, user_id }: DispatchCallRequest = await request.json();

    if (!providers || !Array.isArray(providers) || providers.length === 0) {
      return NextResponse.json({ error: 'No providers provided' }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Limit to maximum of 6 providers
    const limitedProviders = providers.slice(0, CALL_DISPATCH_CONFIG.max_providers);

    const callResults = [];

    if (CALL_DISPATCH_CONFIG.mock_mode) {
      // Mock implementation for development/testing
      for (const provider of limitedProviders) {
        try {
          const mockCallId = `mock_omnidim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const dispatchTimestamp = Date.now();
          
          // Store call timestamp for webhook matching
          callTimestamps.set(provider.number, {
            timestamp: dispatchTimestamp,
            phone_number: provider.number, // NPI as provider identifier
            provider_name: provider.name,
            call_id: mockCallId,
            user_id: user_id
          })
          
          // Simulate successful call dispatch
          callResults.push({
            provider_number: provider.number,
            provider_name: provider.name,
            status: 'success',
            call_id: mockCallId,
            dispatch_timestamp: dispatchTimestamp,
            message: 'Omnidim call dispatched successfully (mock mode)',
            mock_data: {
              accepting_new_patients: Math.random() > 0.3,
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
          });
        }
      }
    } else {
      // Real Omnidim integration
      try {
        const webhookUrl = `${getBaseUrl(request)}/api/webhook/call-result`;
        
        const omnidimProviders = limitedProviders.map(p => ({
          name: p.name,
          npi: p.number,
          specialties: p.specialties || 'General Healthcare'
        }));

        const omnidimCalls = await omnidimService.createBatchAppointmentCalls(
          omnidimProviders,
          user_id,
          webhookUrl
        );

        for (let i = 0; i < limitedProviders.length; i++) {
          const provider = limitedProviders[i];
          const omnidimCall = omnidimCalls[i];

          if (omnidimCall && omnidimCall.status !== 'error') {
            const dispatchTimestamp = Date.now();
            
            // Store call timestamp for webhook matching
            callTimestamps.set(provider.number, {
              timestamp: dispatchTimestamp,
              phone_number: provider.number, // NPI as provider identifier  
              provider_name: provider.name,
              call_id: omnidimCall.call_id,
              user_id: user_id
            })
            
            callResults.push({
              provider_number: provider.number,
              provider_name: provider.name,
              status: 'success',
              call_id: omnidimCall.call_id,
              dispatch_timestamp: dispatchTimestamp,
              message: 'Omnidim call dispatched successfully',
              omnidim_call_data: omnidimCall
            });
          } else {
            callResults.push({
              provider_number: provider.number,
              provider_name: provider.name,
              status: 'error',
              error: omnidimCall?.message || 'Failed to dispatch Omnidim call',
            });
          }
        }
      } catch (error) {
        console.error('Error with Omnidim integration:', error);
        return NextResponse.json({
          error: 'Failed to dispatch calls. Please try again.',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    console.log(`📊 Stored ${callTimestamps.size} call timestamps for webhook matching`)

    return NextResponse.json({
      success: true,
      results: callResults,
      call_ids: callResults
        .filter(r => r.status === 'success' && r.call_id)
        .map(r => r.call_id),
      total_providers: limitedProviders.length,
      successful_calls: callResults.filter(r => r.status === 'success').length,
      mode: CALL_DISPATCH_CONFIG.mock_mode ? 'mock' : 'production',
      max_providers_limit: CALL_DISPATCH_CONFIG.max_providers,
      service: 'omnidim',
      test_configuration: {
        using_test_number: CALL_DISPATCH_CONFIG.use_test_number,
        test_number: CALL_DISPATCH_CONFIG.use_test_number ? CALL_DISPATCH_CONFIG.test_phone_number : null
      }
    });

  } catch (error) {
    console.error('Error in make-calls API:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
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