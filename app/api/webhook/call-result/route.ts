import { type NextRequest, NextResponse } from "next/server"
import { callResults, callTimestamps, storeCallResult } from "@/lib/call-storage"

// Add GET method for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
    url: request.url,
    stored_results: callResults.size,
    stored_timestamps: callTimestamps.size,
  })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { call_id, phone_number, call_date, call_report } = payload

    if (!call_report) {
      console.error("No call_report in webhook payload")
      return NextResponse.json({ error: "Invalid payload - missing call_report" }, { status: 400 })
    }

    const { recording_url, summary, sentiment, extracted_variables, full_conversation } = call_report

    // Find the provider NPI by matching call timestamp
    let provider_npi: string | undefined
    let matchedTimestamp: number | undefined
    let matchedCallData: import("@/lib/call-storage").CallTimestamp | undefined

    // Parse the webhook call date
    const webhookTime = new Date(call_date).getTime()

    // Find the call that was dispatched closest to this webhook time
    // Look for calls within 15 minutes before the webhook time (calls should complete within 15 mins)
    const fifteenMinutesBefore = webhookTime - 15 * 60 * 1000
    const fiveMinutesAfter = webhookTime + 5 * 60 * 1000 // Small buffer for clock differences

    let closestTimeDiff = Number.POSITIVE_INFINITY

    for (const [npi, callData] of Array.from(callTimestamps.entries())) {
      // Check if this call was dispatched in the right time window
      if (callData.timestamp >= fifteenMinutesBefore && callData.timestamp <= fiveMinutesAfter) {
        const timeDiff = Math.abs(webhookTime - callData.timestamp)

        // Find the closest timestamp match
        if (timeDiff < closestTimeDiff) {
          closestTimeDiff = timeDiff
          provider_npi = npi
          matchedTimestamp = callData.timestamp
          matchedCallData = callData
        }
      }
    }

    if (!provider_npi) {
      console.warn(`No provider NPI found for webhook time ${new Date(webhookTime).toISOString()}`)
    }

    // Process the call result with all extracted variables
    const processedCallResult = {
      call_id,
      provider_npi,
      phone_number, // This is the actual provider's phone number from webhook
      status: "completed",
      availability_status: extracted_variables?.availability_status,
      availability_details: extracted_variables?.availability_details,
      summary,
      sentiment,
      call_date,
      recording_url,
      full_conversation,
      user_id: matchedCallData?.user_id || null,
      matched_timestamp: matchedTimestamp,
      time_difference_seconds: closestTimeDiff !== Number.POSITIVE_INFINITY ? Math.round(closestTimeDiff / 1000) : null,
      // Store all extracted variables as JSON
      extracted_variables: extracted_variables ? JSON.stringify(extracted_variables) : null,
      // Store specific useful fields for easier querying
      clinic_name: extracted_variables?.clinic_name,
      contact_person: extracted_variables?.contact_person,
      insurance_accepted: extracted_variables?.insurance_accepted,
      appointment_types_available: extracted_variables?.appointment_types_available,
      availability_timeframe: extracted_variables?.availability_timeframe,
      specific_availability: extracted_variables?.specific_availability,
      call_outcome_quality: extracted_variables?.call_outcome_quality,
      clinic_phone_verified: extracted_variables?.clinic_phone_verified,
      follow_up_needed: extracted_variables?.follow_up_needed,
      callback_instructions: extracted_variables?.callback_instructions,
      additional_requirements: extracted_variables?.additional_requirements,
      debug_info: {
        webhook_received_at: new Date().toISOString(),
        webhook_call_time: new Date(webhookTime).toISOString(),
        matched_by: provider_npi ? "timestamp" : "none",
        search_window: {
          start: new Date(fifteenMinutesBefore).toISOString(),
          end: new Date(fiveMinutesAfter).toISOString(),
        },
      },
    }

    // Store the call result using call_id as key
    callResults.set(call_id, processedCallResult)

    // Store in Supabase
    const stored = await storeCallResult(processedCallResult)

    if (!stored) {
      console.error("Failed to store call result in Supabase")
      return NextResponse.json({ error: "Failed to store call result" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Call result stored successfully",
      provider_npi: processedCallResult.provider_npi,
    })
  } catch (error) {
    console.error("Error processing call result webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

// Handle other HTTP methods
export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
