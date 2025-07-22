import { NextRequest, NextResponse } from 'next/server';
import { VapiWebhookPayload, VapiCallStatus } from '../../../types/vapi';
import { VapiService } from '../../../services/vapi';

const vapiService = new VapiService();

export async function POST(request: NextRequest) {
  try {
    const payload: VapiWebhookPayload = await request.json();
    console.log('Received Vapi webhook:', payload);

    const { message } = payload;

    switch (message.type) {
      case 'status-update':
        await handleStatusUpdate(message.call);
        break;
      
      case 'transcript':
        await handleTranscriptUpdate(message);
        break;
      
      case 'function-call':
        await handleFunctionCall(message);
        break;
      
      case 'end-of-call-report':
        await handleEndOfCallReport(message.call);
        break;
      
      default:
        console.log('Unhandled webhook type:', message.type);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });

  } catch (error) {
    console.error('Error processing Vapi webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleStatusUpdate(call: VapiCallStatus | undefined) {
  if (!call) return;
  
  console.log(`Call ${call.id} status updated to: ${call.status}`);
  
  // Here you would typically update your database with the call status
  // For now, we'll just log it since we're using localStorage on the client
  
  // You could also trigger real-time updates to connected clients via WebSocket
  // or push notifications
}

async function handleTranscriptUpdate(message: any) {
  console.log('Transcript update:', {
    callId: message.call?.id,
    role: message.role,
    transcript: message.transcript
  });
  
  // Store transcript updates for later retrieval
  // This would typically go to a database
}

async function handleFunctionCall(message: any) {
  console.log('Function call received:', message);
  
  // Handle function calls from the assistant
  // This is where appointment data would be processed and stored
  if (message.functionCall?.name === 'report_appointment_info') {
    console.log('Appointment info reported:', message.functionCall.parameters);
    
    // Process and store the appointment information
    // This would update the call record with structured appointment data
  }
}

async function handleEndOfCallReport(call: VapiCallStatus | undefined) {
  if (!call) return;
  
  console.log(`Call ${call.id} ended. Processing final report...`);
  
  try {
    // Get the full call details
    const callDetails = await vapiService.getCallStatus(call.id);
    
    if (callDetails) {
      // Parse appointment data from the call
      const appointmentData = vapiService.parseAppointmentData(callDetails);
      
      console.log('Final appointment data:', appointmentData);
      
      // Here you would update your database with the final call results
      // Including transcript, appointment data, call duration, etc.
      
      // For a production app, you might:
      // 1. Update the call status in the database
      // 2. Send notifications to the user
      // 3. Update any caching layers
      // 4. Trigger analytics events
    }
  } catch (error) {
    console.error('Error processing end of call report:', error);
  }
}

// Verify webhook signature (recommended for production)
function verifyWebhookSignature(request: NextRequest): boolean {
  // In production, you should verify the webhook signature
  // to ensure it's coming from Vapi
  
  const signature = request.headers.get('x-vapi-signature');
  const timestamp = request.headers.get('x-vapi-timestamp');
  
  // Implement signature verification logic here
  // See Vapi documentation for details
  
  return true; // For now, accept all webhooks
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-vapi-signature, x-vapi-timestamp',
    },
  });
}