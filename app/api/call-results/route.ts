import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle call_ids polling (for frontend polling)
    if (body.call_ids && Array.isArray(body.call_ids)) {
      const { call_ids } = body

      if (call_ids.length === 0) {
        return NextResponse.json({ error: "Invalid call_ids" }, { status: 400 })
      }

      // Fetch results by call_id from Supabase
      const { data, error } = await supabaseAdmin
        .from("call_results")
        .select("*")
        .in("call_id", call_ids)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ error: "Failed to fetch call results" }, { status: 500 })
      }

      const results =
        data?.map((row) => ({
          call_id: row.call_id,
          provider_npi: row.provider_npi,
          phone_number: row.phone_number,
          status: row.status,
          availability_status: row.availability_status,
          availability_details: row.availability_details,
          summary: row.summary,
          sentiment: row.sentiment,
          call_date: row.call_date,
          recording_url: row.recording_url,
        })) ?? []

      return NextResponse.json({
        success: true,
        results,
        debug: {
          requested_call_ids: call_ids,
          found_results: results.length,
          source: "supabase",
        },
      })
    }

    // Handle provider_npis bulk fetch (existing functionality)
    const { provider_npis } = body
    
    if (!Array.isArray(provider_npis) || provider_npis.length === 0) {
      return NextResponse.json({ error: "Invalid provider_npis" }, { status: 400 })
    }

    // Fetch from Supabase (most up-to-date, persistent)
    const { data, error } = await supabaseAdmin
      .from("call_results")
      .select("*")
      .in("provider_npi", provider_npis)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch call results" }, { status: 500 })
    }

    const results =
      data?.map((row) => ({
        provider_npi: row.provider_npi,
        phone_number: row.phone_number,
        status: row.status,
        availability_status: row.availability_status,
        availability_details: row.availability_details,
        summary: row.summary,
        sentiment: row.sentiment,
        call_date: row.call_date,
        recording_url: row.recording_url,
      })) ?? []

    return NextResponse.json({
      success: true,
      results,
      debug: {
        requested_provider_npis: provider_npis,
        found_results: results.length,
        source: "supabase",
      },
    })
  } catch (err) {
    console.error("Unexpected error:", err)
    return NextResponse.json({ error: "Failed to fetch call results" }, { status: 500 })
  }
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