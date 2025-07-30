import { NextRequest, NextResponse } from 'next/server';
import { omnidimService } from '../../../services/omnidim';
import { callTimestamps } from "@/lib/call-storage"

// Call Dispatch Configuration
const CALL_DISPATCH_CONFIG = {
  mock_mode: process.env.NEXT_PUBLIC_CALL_DISPATCH_MOCK === 'true',
  max_providers: 6,
  call_delay_ms: 2000,
  success_rate: 0.8, // 80% success rate for mock calls
};

interface PreCallData {
  patient_name: string;
  insurance_type: string;
  preferred_date: string;
  appointment_type: string;
  urgency: string;
}

interface DispatchCallRequest {
  providers: Array<{
    number: string;
    name: string;
    specialties?: string;
  }>;
  user_id: string;
  pre_call_data?: PreCallData | null;
}

export async function POST(request: NextRequest) {
  try {
    const { providers, user_id, pre_call_data }: DispatchCallRequest = await request.json();

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

          // Enhanced mock data with pre-call context
          const mockCallData = {
            call_id: mockCallId,
            provider_number: provider.number,
            provider_name: provider.name,
            phone_number: '+16175712439', // Test number
            status: Math.random() < CALL_DISPATCH_CONFIG.success_rate ? 'success' : 'failed',
            dispatch_timestamp: dispatchTimestamp,
            message: `Mock call initiated for ${provider.name}`,
            appointment_context: pre_call_data ? {
              requested_appointment_type: pre_call_data.appointment_type,
              preferred_timeframe: pre_call_data.preferred_date,
              insurance_inquiry: pre_call_data.insurance_type || 'No insurance specified',
              urgency_level: pre_call_data.urgency
            } : null,
            // Enhanced mock appointment slots based on pre-call data
            next_available_slots: generateContextualAppointmentSlots(pre_call_data),
            appointment_types: getRelevantAppointmentTypes(pre_call_data?.appointment_type)
          };
          
          // Store call timestamp for webhook matching
          callTimestamps.set(provider.number, {
            timestamp: dispatchTimestamp,
            phone_number: provider.number, // NPI as provider identifier
            provider_name: provider.name,
            call_id: mockCallId,
            user_id: user_id
          })
          
          // Simulate successful call dispatch
          callResults.push(mockCallData);
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
      // Real Omnidim API implementation
      const omnidimCalls = await omnidimService.createBatchAppointmentCalls(
        limitedProviders.map(provider => ({
          providerNpi: provider.number,
          providerName: provider.name,
          userId: user_id,
          preCallData: pre_call_data
        }))
      );

      for (const omnidimCall of omnidimCalls) {
        if (omnidimCall.success) {
          callResults.push({
            provider_number: omnidimCall.providerNpi,
            provider_name: omnidimCall.providerName || 'Unknown Provider',
            status: 'success',
            call_id: omnidimCall.callId,
            dispatch_timestamp: Date.now(),
            message: 'Call initiated successfully',
            appointment_context: pre_call_data ? {
              requested_appointment_type: pre_call_data.appointment_type,
              preferred_timeframe: pre_call_data.preferred_date,
              insurance_inquiry: pre_call_data.insurance_type || 'No insurance specified',
              urgency_level: pre_call_data.urgency
            } : null
          });
        } else {
          callResults.push({
            provider_number: omnidimCall.providerNpi,
            provider_name: omnidimCall.providerName || 'Unknown Provider',
            status: 'failed',
            error: omnidimCall?.message || 'Failed to dispatch Omnidim call',
            dispatch_timestamp: Date.now(),
            message: omnidimCall?.message || 'Call dispatch failed'
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      results: callResults,
      pre_call_context: pre_call_data
    });

  } catch (error) {
    console.error('Error in make-calls:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to dispatch calls. Please try again.',
    }, { status: 500 });
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

// Helper function to generate contextual appointment slots based on pre-call data
function generateContextualAppointmentSlots(preCallData?: PreCallData | null) {
  const baseDate = new Date();
  const slots = [];

  // Adjust slot generation based on preferred timeframe
  let startOffset = 1; // Default: tomorrow
  let dayRange = 7; // Default: next week

  if (preCallData?.preferred_date) {
    switch (preCallData.preferred_date.toLowerCase()) {
      case 'this week':
        startOffset = 1;
        dayRange = 5;
        break;
      case 'next week':
        startOffset = 7;
        dayRange = 7;
        break;
      case 'within 2 weeks':
        startOffset = 1;
        dayRange = 14;
        break;
      case 'flexible':
        startOffset = 1;
        dayRange = 30;
        break;
    }
  }

  // Adjust number of slots based on urgency
  let numSlots = 3;
  if (preCallData?.urgency === 'ASAP') {
    numSlots = 5; // More slots for urgent requests
  } else if (preCallData?.urgency === 'Flexible') {
    numSlots = 2; // Fewer slots for flexible requests
  }

  for (let i = 0; i < numSlots; i++) {
    const slotDate = new Date(baseDate);
    slotDate.setDate(baseDate.getDate() + startOffset + Math.floor(Math.random() * dayRange));
    
    const hours = [9, 10, 11, 14, 15, 16]; // Business hours
    const selectedHour = hours[Math.floor(Math.random() * hours.length)];
    const minutes = [0, 15, 30, 45];
    const selectedMinute = minutes[Math.floor(Math.random() * minutes.length)];
    
    slots.push({
      date: slotDate.toISOString().split('T')[0],
      time: `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`,
      appointment_type: preCallData?.appointment_type || ['General Consultation', 'Follow-up', 'Physical Exam'][Math.floor(Math.random() * 3)],
      available: Math.random() > 0.2 // 80% availability rate
    });
  }

  return slots;
}

// Helper function to get relevant appointment types based on requested type
function getRelevantAppointmentTypes(requestedType?: string) {
  if (!requestedType) {
    return ['General Consultation', 'Follow-up', 'Physical Exam'];
  }

  const typeMapping: { [key: string]: string[] } = {
    'general consultation': ['General Consultation', 'New Patient Consultation', 'Wellness Check'],
    'physical exam': ['Physical Exam', 'Annual Physical', 'Sports Physical'],
    'follow-up': ['Follow-up Visit', 'Post-Treatment Follow-up', 'Monitoring Visit'],
    'specialist consultation': ['Specialist Consultation', 'Referral Visit', 'Expert Opinion'],
    'urgent care': ['Urgent Care', 'Same-Day Appointment', 'Acute Care'],
    'preventive care': ['Preventive Care', 'Wellness Check', 'Screening Visit']
  };

  const normalizedType = requestedType.toLowerCase();
  return typeMapping[normalizedType] || [requestedType, 'General Consultation', 'Follow-up'];
}