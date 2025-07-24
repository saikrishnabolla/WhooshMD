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
          // Include all extracted variables
          extracted_variables: row.extracted_variables,
          clinic_name: row.clinic_name,
          contact_person: row.contact_person,
          insurance_accepted: row.insurance_accepted,
          appointment_types_available: row.appointment_types_available,
          availability_timeframe: row.availability_timeframe,
          specific_availability: row.specific_availability,
          call_outcome_quality: row.call_outcome_quality,
          clinic_phone_verified: row.clinic_phone_verified,
          follow_up_needed: row.follow_up_needed,
          callback_instructions: row.callback_instructions,
          additional_requirements: row.additional_requirements,
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
        // Include all extracted variables
        extracted_variables: row.extracted_variables,
        clinic_name: row.clinic_name,
        contact_person: row.contact_person,
        insurance_accepted: row.insurance_accepted,
        appointment_types_available: row.appointment_types_available,
        availability_timeframe: row.availability_timeframe,
        specific_availability: row.specific_availability,
        call_outcome_quality: row.call_outcome_quality,
        clinic_phone_verified: row.clinic_phone_verified,
        follow_up_needed: row.follow_up_needed,
        callback_instructions: row.callback_instructions,
        additional_requirements: row.additional_requirements,
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

// Add GET method for single provider or user-based queries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider_npi = searchParams.get('provider_npi')
    const user_id = searchParams.get('user_id')

    if (provider_npi) {
      // Fetch single provider result
      const { data, error } = await supabaseAdmin
        .from("call_results")
        .select("*")
        .eq("provider_npi", provider_npi)
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ error: "Failed to fetch call result" }, { status: 500 })
      }

      const result = data?.[0] ? {
        provider_npi: data[0].provider_npi,
        phone_number: data[0].phone_number,
        status: data[0].status,
        availability_status: data[0].availability_status,
        availability_details: data[0].availability_details,
        summary: data[0].summary,
        sentiment: data[0].sentiment,
        call_date: data[0].call_date,
        recording_url: data[0].recording_url,
        // Include all extracted variables
        extracted_variables: data[0].extracted_variables,
        clinic_name: data[0].clinic_name,
        contact_person: data[0].contact_person,
        insurance_accepted: data[0].insurance_accepted,
        appointment_types_available: data[0].appointment_types_available,
        availability_timeframe: data[0].availability_timeframe,
        specific_availability: data[0].specific_availability,
        call_outcome_quality: data[0].call_outcome_quality,
        clinic_phone_verified: data[0].clinic_phone_verified,
        follow_up_needed: data[0].follow_up_needed,
        callback_instructions: data[0].callback_instructions,
        additional_requirements: data[0].additional_requirements,
      } : null

      return NextResponse.json({
        success: true,
        result,
      })
    }

    if (user_id) {
      // Fetch all results for user
      const { data, error } = await supabaseAdmin
        .from("call_results")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ error: "Failed to fetch call results" }, { status: 500 })
      }

      const results = data?.map((row) => ({
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
        // Include all extracted variables
        extracted_variables: row.extracted_variables,
        clinic_name: row.clinic_name,
        contact_person: row.contact_person,
        insurance_accepted: row.insurance_accepted,
        appointment_types_available: row.appointment_types_available,
        availability_timeframe: row.availability_timeframe,
        specific_availability: row.specific_availability,
        call_outcome_quality: row.call_outcome_quality,
        clinic_phone_verified: row.clinic_phone_verified,
        follow_up_needed: row.follow_up_needed,
        callback_instructions: row.callback_instructions,
        additional_requirements: row.additional_requirements,
      })) ?? []

      return NextResponse.json({
        success: true,
        results,
      })
    }

    return NextResponse.json({ error: "Missing provider_npi or user_id parameter" }, { status: 400 })
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