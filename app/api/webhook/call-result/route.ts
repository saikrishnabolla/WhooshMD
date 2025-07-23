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
    console.log("📞 Received call result webhook")

    const payload = await request.json()
    const { call_id, phone_number, call_date, call_report } = payload

    console.log(`📞 Processing webhook for call_id: ${call_id}`)
    console.log(`📞 Phone number: ${phone_number}`)
    console.log(`📞 Call date: ${call_date}`)

    if (!call_report) {
      console.error("❌ No call_report in webhook payload")
      return NextResponse.json({ error: "Invalid payload - missing call_report" }, { status: 400 })
    }

    const { recording_url, summary, sentiment, extracted_variables, full_conversation } = call_report

    // 🕐 TIMESTAMP-ONLY MATCHING: Find the provider NPI by matching call timestamp
    let provider_npi: string | undefined
    let matchedTimestamp: number | undefined
         let matchedCallData: import("@/lib/call-storage").CallTimestamp | undefined

    console.log(`🔍 Looking for provider by timestamp matching`)
    console.log(`📋 Available timestamps:`, Array.from(callTimestamps.entries()))

    // Parse the webhook call date
    const webhookTime = new Date(call_date).getTime()
    console.log(`🕐 Webhook call time: ${new Date(webhookTime).toISOString()}`)

    // Find the call that was dispatched closest to this webhook time
    // Look for calls within 15 minutes before the webhook time (calls should complete within 15 mins)
    const fifteenMinutesBefore = webhookTime - 15 * 60 * 1000
    const fiveMinutesAfter = webhookTime + 5 * 60 * 1000 // Small buffer for clock differences

    console.log(`🕐 Looking for calls between:`)
    console.log(`   📅 ${new Date(fifteenMinutesBefore).toISOString()} (15 min before)`)
    console.log(`   📅 ${new Date(fiveMinutesAfter).toISOString()} (5 min after)`)

    let closestTimeDiff = Number.POSITIVE_INFINITY

    for (const [npi, callData] of Array.from(callTimestamps.entries())) {
      console.log(`🔍 Checking NPI ${npi}:`)
      console.log(`  🕐 Dispatch time: ${new Date(callData.timestamp).toISOString()}`)
      console.log(`  📱 Provider phone: ${callData.phone_number}`)
      console.log(`  👤 Provider name: ${callData.provider_name}`)

      // Check if this call was dispatched in the right time window
      if (callData.timestamp >= fifteenMinutesBefore && callData.timestamp <= fiveMinutesAfter) {
        const timeDiff = Math.abs(webhookTime - callData.timestamp)
        console.log(`  ✅ Time window match! Diff: ${timeDiff}ms (${Math.round(timeDiff / 1000)}s)`)

        // Find the closest timestamp match
        if (timeDiff < closestTimeDiff) {
          closestTimeDiff = timeDiff
          provider_npi = npi
          matchedTimestamp = callData.timestamp
          matchedCallData = callData
          console.log(`  🎯 New closest match: ${Math.round(timeDiff / 1000)}s difference`)
        }
      } else {
        console.log(`  ❌ Outside time window`)
      }
    }

    console.log(`🎯 Final matched provider_npi: ${provider_npi}`)
    console.log(`🕐 Final matched timestamp: ${matchedTimestamp ? new Date(matchedTimestamp).toISOString() : "none"}`)
    console.log(
      `⏱️ Time difference: ${closestTimeDiff !== Number.POSITIVE_INFINITY ? Math.round(closestTimeDiff / 1000) : "N/A"}s`,
    )

    if (!provider_npi) {
      console.warn(`⚠️ No provider NPI found for webhook time ${new Date(webhookTime).toISOString()}`)
      console.warn(`⚠️ This might be because:`)
      console.warn(`   1. No call was dispatched in the expected time window`)
      console.warn(`   2. Clock synchronization issues between systems`)
      console.warn(`   3. Call took longer than 15 minutes to complete`)

      // List all available timestamps for debugging
      console.warn(`⚠️ Available dispatch times:`)
      for (const [npi, callData] of Array.from(callTimestamps.entries())) {
        const diff = webhookTime - callData.timestamp
        console.warn(
          `   📅 NPI ${npi}: ${new Date(callData.timestamp).toISOString()} (${Math.round(diff / 1000)}s ${diff > 0 ? "ago" : "in future"})`,
        )
      }
    }

    // Process the call result
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
      console.error("❌ Failed to store call result in Supabase")
      return NextResponse.json({ error: "Failed to store call result" }, { status: 500 })
    }

    console.log(`✅ Processed and stored call result for call_id ${call_id}:`, {
      call_id,
      provider_npi,
      availability_status: processedCallResult.availability_status,
      has_details: !!processedCallResult.availability_details,
      matched_by_timestamp: !!matchedTimestamp,
      time_diff_seconds: processedCallResult.time_difference_seconds,
    })

    return NextResponse.json({
      success: true,
      message: "Call result stored successfully",
      provider_npi: processedCallResult.provider_npi,
    })
  } catch (error) {
    console.error("❌ Error processing call result webhook:", error)
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