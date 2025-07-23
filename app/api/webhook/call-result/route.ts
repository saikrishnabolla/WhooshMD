import { NextRequest, NextResponse } from 'next/server';
import { OmnidimService } from '../../../../services/omnidim';
import { storeCallResult } from '@/lib/call-results';
import { getProviderNpiByCallId } from '@/lib/call-mapping';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🎯 Received Omnidim webhook event:', body);

    // Extract call_id from webhook
    const callId = body.call_id;
    if (!callId) {
      console.error('❌ No call_id found in webhook payload');
      return NextResponse.json({ error: 'Missing call_id' }, { status: 400 });
    }

    // Get provider NPI from call mapping
    let providerNpi = getProviderNpiByCallId(callId);
    console.log(`🔍 Found provider NPI from mapping: ${providerNpi}`);

    if (!providerNpi) {
      console.warn('⚠️ No provider NPI found for call_id:', callId);
      // Continue processing but log warning
    }

    // Process the actual Omnidim webhook format
    const callReport = body.call_report || {};
    const extractedVars = callReport.extracted_variables || {};
    
    const processedResult = {
      call_id: callId,
      provider_npi: providerNpi || '',
      phone_number: body.phone_number || '',
      status: 'completed', // Omnidim sends completed calls
      availability_status: extractedVars.availability_status || 'unknown',
      availability_details: extractedVars.availability_details || '',
      summary: callReport.summary || '',
      sentiment: callReport.sentiment || '',
      call_date: body.call_date || new Date().toISOString(),
      recording_url: callReport.recording_url || '',
      full_conversation: callReport.full_conversation || '',
      user_id: '', // TODO: Get from call mapping if available
      created_at: body.call_date || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
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

    // Handle different types of call results
    const callStatus = 'completed'; // Omnidim webhooks are for completed calls
    
    console.log(`Call ${callId} completed successfully`);

    // Respond with success
    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully',
      call_result: processedResult,
      timestamp: new Date().toISOString(),
      call_id: callId,
      debug: {
        matched_provider: !!providerNpi,
        availability_status: extractedVars.availability_status,
        availability_details: extractedVars.availability_details
      }
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