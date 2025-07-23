import { NextRequest, NextResponse } from 'next/server';
import { OmnidimService } from '../../../../services/omnidim';
import { storeCallResult } from '@/lib/call-results';
import { getProviderNpiByCallId } from '@/lib/call-mapping';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🎯 Received Omnidim webhook event:', body);

    // Get provider NPI from call mapping if available
    let providerNpi = body.call_context?.provider_npi;
    
    if (!providerNpi && body.call_id) {
      // Try to find provider NPI from call mapping
      providerNpi = getProviderNpiByCallId(body.call_id);
      console.log(`🔍 Found provider NPI from mapping: ${providerNpi}`);
    }

    // Process the webhook event using timestamp correlation
    const processedResult = OmnidimService.processWebhookEvent(body);
    
    if (processedResult) {
      console.log('✅ Processed call result:', processedResult);
      
      // Store result in Supabase
      const stored = await storeCallResult(processedResult);
      
      if (stored) {
        console.log('💾 Successfully stored call result in Supabase');
      } else {
        console.error('❌ Failed to store call result in Supabase');
      }
      
      // TODO: Send real-time update to frontend
      // await sendRealTimeUpdate(processedResult);
    } else {
      console.warn('⚠️ Failed to process webhook event - missing required data');
    }

    // Handle different types of call results
    const callStatus = body.status;
    const callId = body.call_id;
    
    switch (callStatus) {
      case 'in-progress':
        console.log(`Call ${callId} is in progress`);
        break;

      case 'completed':
        console.log(`Call ${callId} completed successfully`);
        break;

      case 'failed':
        console.log(`Call ${callId} failed`);
        break;

      case 'no-answer':
        console.log(`Call ${callId} - no answer`);
        break;

      default:
        console.log('Unknown call status:', callStatus);
    }

    // Respond with success
    return NextResponse.json({ 
      received: true, 
      processed: !!processedResult,
      timestamp: new Date().toISOString(),
      call_id: body.call_id
    });

  } catch (error) {
    console.error('Error processing Omnidim webhook:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({ 
    status: 'Omnidim webhook endpoint is active',
    timestamp: new Date().toISOString(),
    service: 'omnidim'
  });
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