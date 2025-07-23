import { NextRequest, NextResponse } from 'next/server';
import { OmnidimService } from '../../../../services/omnidim';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Received Omnidim webhook event:', body);

    // Process the webhook event using timestamp correlation
    const processedResult = OmnidimService.processWebhookEvent(body);
    
    if (processedResult) {
      console.log('Processed call result:', processedResult);
      
      // TODO: Store result in Supabase
      // await saveCallResultToSupabase(processedResult);
      
      // TODO: Send real-time update to frontend
      // await sendRealTimeUpdate(processedResult);
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