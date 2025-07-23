import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { storeCallResult } from "@/lib/call-results"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const providerNpi = searchParams.get('provider_npi')
    
    if (providerNpi) {
      // Get specific provider's call result
      const { data, error } = await supabaseAdmin
        .from("call_results")
        .select("*")
        .eq("provider_npi", providerNpi)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error("Supabase error:", error)
        return NextResponse.json({ error: "Failed to fetch call result" }, { status: 500 })
      }

      if (!data) {
        return NextResponse.json({
          provider_npi: providerNpi,
          status: 'not_found',
          message: 'No call results found for this provider'
        })
      }

      return NextResponse.json({
        success: true,
        result: {
          provider_npi: data.provider_npi,
          phone_number: data.phone_number,
          status: data.status,
          availability_status: data.availability_status,
          availability_details: data.availability_details,
          summary: data.summary,
          sentiment: data.sentiment,
          call_date: data.call_date,
          recording_url: data.recording_url,
        },
        source: "supabase"
      })
    }

    if (userId) {
      // Get all call results for user
      const { data, error } = await supabaseAdmin
        .from("call_results")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ error: "Failed to fetch call results" }, { status: 500 })
      }

      const results = data?.map((row) => ({
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
        user_id: userId,
        source: "supabase"
      })
    }

    return NextResponse.json({
      status: 'Call results API is active',
      message: 'Use ?user_id=<id> or ?provider_npi=<npi> to retrieve specific results',
      endpoints: {
        single_provider: '/api/call-results?provider_npi=<npi>',
        user_results: '/api/call-results?user_id=<id>',
        bulk_providers: 'POST /api/call-results with { provider_npis: [...] }'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in call-results API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle bulk fetch request
    if (body.provider_npis && Array.isArray(body.provider_npis)) {
      const { provider_npis } = body

      if (provider_npis.length === 0) {
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
    }

    // Handle single call result storage
    const result = body
    console.log('Received call result to store:', result)
    
    // Store in Supabase and memory cache
    const stored = await storeCallResult(result)
    
    if (!stored) {
      return NextResponse.json({ error: "Failed to store call result" }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Call result stored successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in call-results API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
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