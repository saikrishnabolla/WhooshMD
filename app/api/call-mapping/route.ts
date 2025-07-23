import { type NextRequest, NextResponse } from "next/server"
import { storeCallMapping, getProviderNpiByCallId, getAllMappings, getMappingCount } from "@/lib/call-mapping"

export async function POST(request: NextRequest) {
  try {
    const { call_id, provider_npi } = await request.json()

    if (!call_id || !provider_npi) {
      return NextResponse.json({ error: "Missing call_id or provider_npi" }, { status: 400 })
    }

    storeCallMapping(call_id, provider_npi)

    return NextResponse.json({
      success: true,
      message: `Mapping stored for call_id ${call_id}`,
      total_mappings: getMappingCount(),
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
    const npi = getProviderNpiByCallId(callId)
    console.log(`🔍 Looking up call_id ${callId}, found NPI: ${npi}`)
    return NextResponse.json({ call_id: callId, provider_npi: npi })
  }

  // Return all mappings
  const mappings = getAllMappings()

  console.log(`📋 Returning ${mappings.length} total mappings`)

  return NextResponse.json({
    mappings,
    total_count: mappings.length,
  })
}