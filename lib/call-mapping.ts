// In-memory storage for call ID to provider NPI mapping
const callMapping = new Map<string, string>()

export function storeCallMapping(callId: string, providerNpi: string): void {
  callMapping.set(String(callId), providerNpi)
}

export function getCallMapping(): Map<string, string> {
  return callMapping
}

export function getProviderNpiByCallId(callId: string): string | undefined {
  return callMapping.get(String(callId))
}

export function getAllMappings(): Array<{ call_id: string; provider_npi: string }> {
  return Array.from(callMapping.entries()).map(([call_id, provider_npi]) => ({
    call_id,
    provider_npi,
  }))
}

export function getMappingCount(): number {
  return callMapping.size
}