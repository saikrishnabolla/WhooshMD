import { type NextRequest, NextResponse } from "next/server"
import { callResults, callMapping } from "@/lib/call-storage"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const callIds = searchParams.get("call_ids")?.split(",").map(Number) || []

  console.log("🧪 Test polling endpoint called")
  console.log("📋 Requested call IDs:", callIds)
  console.log("🗂️ Available mappings:", Array.from(callMapping.entries()))
  console.log("📊 Available results:", Array.from(callResults.entries()))

  const results = []

  for (const callId of callIds) {
    const result = callResults.get(callId)
    if (result) {
      results.push({
        call_id: callId,
        found: true,
        result: result,
      })
    } else {
      const mapping = callMapping.get(callId)
      results.push({
        call_id: callId,
        found: false,
        has_mapping: !!mapping,
        provider_npi: mapping || null,
      })
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    requested_call_ids: callIds,
    results: results,
    debug: {
      total_mappings: callMapping.size,
      total_results: callResults.size,
      all_mappings: Array.from(callMapping.entries()),
      all_results: Array.from(callResults.keys()),
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { call_ids } = await request.json()

    console.log("🧪 Test polling POST endpoint called")
    console.log("📋 Requested call IDs:", call_ids)

    // Simulate the same logic as the real endpoint
    const response = await fetch(`${request.nextUrl.origin}/api/call-results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ call_ids }),
    })

    const data = await response.json()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      proxy_response: data,
      direct_check: {
        mappings: Array.from(callMapping.entries()),
        results: Array.from(callResults.entries()),
      },
    })
  } catch (error) {
    console.error("❌ Error in test polling:", error)
    return NextResponse.json({ error: "Test polling failed" }, { status: 500 })
  }
}