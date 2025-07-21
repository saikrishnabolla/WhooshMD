import { NextRequest, NextResponse } from 'next/server';

// Generic Voice Agent Configuration (placeholder for future Vapi integration)
const VOICE_AGENT_CONFIG = {
  // This will be replaced with Vapi configuration later
  enabled: true,
  mock_mode: true, // Set to false when integrating with real voice agent
};

interface DispatchCallRequest {
  providers: Array<{
    number: string;
    name: string;
    phone: string;
  }>;
  user_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const { providers, user_id }: DispatchCallRequest = await request.json();

    // console.log('Received voice agent request:', { providers, user_id });

    if (!providers || !Array.isArray(providers) || providers.length === 0) {
      return NextResponse.json({ error: 'No providers provided' }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const callResults = [];

    // Process each provider (mock implementation for now)
    for (const provider of providers) {
      try {
        // Check if phone number exists and is valid
        if (!provider.phone || provider.phone.length < 10) {
          // console.log(`Skipping provider ${provider.name} - invalid phone number: ${provider.phone}`);
          callResults.push({
            provider_number: provider.number,
            provider_name: provider.name,
            status: 'skipped',
            reason: 'Invalid phone number',
            phone: provider.phone
          });
          continue;
        }

        // console.log(`Processing provider: ${provider.name} (${provider.phone})`);

        if (VOICE_AGENT_CONFIG.mock_mode) {
          // Mock voice agent response
          const mockCallId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Simulate successful call initiation
          callResults.push({
            provider_number: provider.number,
            provider_name: provider.name,
            status: 'success',
            call_id: mockCallId,
            phone: provider.phone,
            message: 'Voice agent call initiated (mock mode)'
          });
        } else {
          // TODO: Replace with actual Vapi integration
          // const voiceAgentResponse = await initiateVapiCall({
          //   phone_number: provider.phone,
          //   provider_name: provider.name,
          //   user_data: { user_id }
          // });
          
          callResults.push({
            provider_number: provider.number,
            provider_name: provider.name,
            status: 'error',
            error: 'Voice agent integration not implemented yet',
            phone: provider.phone
          });
        }

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

    return NextResponse.json({
      success: true,
      results: callResults,
      total_providers: providers.length,
      successful_calls: callResults.filter(r => r.status === 'success').length,
      mode: VOICE_AGENT_CONFIG.mock_mode ? 'mock' : 'production'
    });

  } catch (error) {
    console.error('Error in voice agent API:', error);
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