import { NextRequest, NextResponse } from 'next/server';
import { VapiService } from '../../../../services/vapi';
import { VapiWebhookEvent } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event: VapiWebhookEvent = body;

    console.log('Received Vapi webhook event:', event.type, event.call?.id);

    // Process the webhook event
    const processedResult = VapiService.processWebhookEvent(event);
    
    if (processedResult) {
      // Here you could save the result to your database
      // For now, we'll just log it
      console.log('Processed call result:', processedResult);
      
      // In a real implementation, you might want to:
      // 1. Save to database
      // 2. Trigger real-time updates to the frontend
      // 3. Send notifications to users
      
      // Example: Save to Supabase or your preferred database
      // await saveCallResult(processedResult);
      
      // Example: Send real-time update via WebSocket or Server-Sent Events
      // await sendRealTimeUpdate(processedResult);
    }

    // Handle different event types
    switch (event.type) {
      case 'call-start':
        console.log(`Call ${event.call.id} started`);
        // You could update the call status to 'in_progress' here
        break;

      case 'call-end':
        console.log(`Call ${event.call.id} ended`);
        // Final processing and cleanup
        break;

      case 'transcript':
        console.log(`Transcript from ${event.call.id}:`, event.message?.content);
        // You could save transcripts for analysis
        break;

      case 'function-call':
        console.log(`Function call in ${event.call.id}:`, event.functionCall?.name);
        // This is where appointment availability is recorded
        break;

      case 'status-update':
        console.log(`Status update for ${event.call.id}:`, event.call.status);
        break;

      default:
        console.log('Unknown event type:', event.type);
    }

    // Respond with success
    return NextResponse.json({ 
      received: true, 
      processed: !!processedResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing Vapi webhook:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({ 
    status: 'Vapi webhook endpoint is active',
    timestamp: new Date().toISOString()
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