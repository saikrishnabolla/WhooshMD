import { type NextRequest, NextResponse } from "next/server"
import { storeCallResult } from "@/lib/call-storage"

/**
 * Webhook endpoint to receive a batch of call-result objects.
 */
export async function POST(request: NextRequest) {
  try {
    const { results } = await request.json()

    if (!Array.isArray(results)) {
      return NextResponse.json({ error: "Invalid results format" }, { status: 400 })
    }

    const outcomes = await Promise.all(results.map(storeCallResult))
    const success = outcomes.filter(Boolean).length

    return NextResponse.json({
      success: true,
      stored: success,
      failed: results.length - success,
    })
  } catch (err) {
    console.error("Webhook processing error:", err)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}