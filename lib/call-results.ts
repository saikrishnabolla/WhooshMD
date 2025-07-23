import { supabaseAdmin } from "@/lib/supabase"

/**
 * In-memory cache (kept for backward compatibility with other modules
 * that still import { callResults }).
 */
export const callResults = new Map<number, any>()

/**
 * Persists a call result in Supabase **and** the in-memory map.
 */
export async function storeCallResult(result: any) {
  // Update memory cache (legacy)
  callResults.set(Date.now(), result)

  const { error } = await supabaseAdmin.from("call_results").upsert(
    {
      provider_npi: result.provider_npi,
      phone_number: result.phone_number,
      status: result.status,
      availability_status: result.availability_status,
      availability_details: result.availability_details,
      summary: result.summary,
      sentiment: result.sentiment,
      call_date: result.call_date,
      recording_url: result.recording_url,
      user_id: result.user_id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider_npi", ignoreDuplicates: false },
  )

  if (error) {
    console.error("Supabase upsert error:", error)
    return false
  }
  return true
}