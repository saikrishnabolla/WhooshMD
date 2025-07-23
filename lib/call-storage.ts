// Shared storage for call mappings and results
// This file contains the in-memory maps that need to be shared across API routes

// In-memory storage for call ID to provider NPI mapping
export const callMapping = new Map<number, string>()

// Interface for call results
export interface CallResult {
  call_id: string | number
  provider_npi?: string
  phone_number?: string
  status: string
  availability_status?: string
  availability_details?: string
  summary?: string
  sentiment?: string
  call_date?: string
  recording_url?: string
  user_id?: string | null
  [key: string]: unknown
}

// In-memory cache for call results
export const callResults = new Map<number, CallResult>()

// Interface for call timestamps
export interface CallTimestamp {
  timestamp: number
  phone_number: string
  provider_name: string
  call_id: string
  user_id: string
}

// Call timestamps storage for webhook matching
export const callTimestamps = new Map<string, CallTimestamp>()

// Store call result function for persistence
export async function storeCallResult(result: CallResult) {
  const { supabaseAdmin } = await import("@/lib/supabase")
  
  // Update memory cache (legacy)
  callResults.set(Date.now(), result)

  const { error } = await supabaseAdmin.from("call_results").upsert(
    {
      call_id: result.call_id,
      provider_npi: result.provider_npi || null,
      phone_number: result.phone_number || null,
      status: result.status,
      availability_status: result.availability_status,
      availability_details: result.availability_details,
      summary: result.summary,
      sentiment: result.sentiment,
      call_date: result.call_date,
      recording_url: result.recording_url,
      user_id: result.user_id || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "call_id", ignoreDuplicates: false },
  )

  if (error) {
    console.error("Supabase upsert error:", error)
    return false
  }
  return true
}