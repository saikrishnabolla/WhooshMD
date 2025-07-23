import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for call ID to provider NPI mapping
const callMapping = new Map<string, string>()

export async function POST(request: NextRequest) {
  try {
    const { call_id, provider_npi } = await request.json()

    if (!call_id || !provider_npi) {
      return NextResponse.json({ error: "Missing call_id or provider_npi" }, { status: 400 })
    }

    callMapping.set(String(call_id), provider_npi)
    console.log(`✅ Stored mapping: call_id ${call_id} -> provider_npi ${provider_npi}`)
    console.log(`📊 Total mappings stored: ${callMapping.size}`)

    return NextResponse.json({
      success: true,
      message: `Mapping stored for call_id ${call_id}`,
      total_mappings: callMapping.size,
    })
  } catch (error) {
    console.error("❌ Error storing call mapping:", error)
    return NextResponse.json({ error: "Failed to store mapping" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const callId = searchParams.get("call_id")

  if (callId) {
    const npi = callMapping.get(String(callId))
    console.log(`🔍 Looking up call_id ${callId}, found NPI: ${npi}`)
    return NextResponse.json({ call_id: callId, provider_npi: npi })
  }

  // Return all mappings
  const mappings = Array.from(callMapping.entries()).map(([call_id, provider_npi]) => ({
    call_id,
    provider_npi,
  }))

  console.log(`📋 Returning ${mappings.length} total mappings`)

  return NextResponse.json({
    mappings,
    total_count: mappings.length,
  })
}

// Export the mapping for use in other modules
export { callMapping }