# Call ID-Based Polling Implementation

## Overview
This document explains the implementation of call_id-based polling for real-time call results, as requested. The system now supports both the original provider_npi-based polling and the new call_id-based polling.

## How It Works

### 1. Call Dispatch Returns Call IDs
When you dispatch calls via `/api/make-calls`, the response now includes `call_ids`:

```javascript
// POST /api/make-calls
{
  "providers": [
    { "number": "1234567890", "name": "Dr. Smith" },
    { "number": "9876543210", "name": "Dr. Jones" }
  ],
  "user_id": "user123"
}

// Response:
{
  "success": true,
  "results": [...],
  "call_ids": [38395, 38396],  // ← New field for polling
  "total_providers": 2,
  "successful_calls": 2
}
```

### 2. Frontend Polls Using Call IDs
The frontend can now poll every 5 seconds using the new `useCallResultsByIds` hook:

```javascript
import { useCallResultsByIds } from '../hooks/useCallResults';

function CallResultsComponent({ callIds }) {
  const { callResults, loading, error, getCallResult } = useCallResultsByIds({
    callIds: [38395, 38396],
    autoRefresh: true,
    refreshInterval: 5000  // 5 seconds as specified
  });

  // Get specific call result
  const call38395Result = getCallResult('38395');
  
  return (
    <div>
      {callIds.map(callId => {
        const result = getCallResult(callId);
        return (
          <div key={callId}>
            <h3>Call {callId}</h3>
            {result ? (
              <div>
                <p>Provider: {result.provider_npi}</p>
                <p>Status: {result.availability_status}</p>
                <p>Details: {result.availability_details}</p>
              </div>
            ) : (
              <p>Still calling...</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### 3. API Polling Pattern
The frontend makes these requests every 5 seconds:

```javascript
// Every 5 seconds, frontend asks:
POST /api/call-results
{
  "call_ids": [38395, 38396]
}

// Response:
{
  "success": true,
  "results": [{
    "call_id": 38395,
    "provider_npi": "1234567890",
    "availability_status": "available", 
    "availability_details": "New patients can schedule appointments within 1-3 weeks. Both general consultations and specific procedures are available.",
    "summary": "The clinic confirms it accepts new patients...",
    "sentiment": "Neutral",
    "call_date": "2025-07-04 01:56:45",
    "recording_url": "http://backend.omnidim.io/..."
  }],
  "debug": {
    "requested_call_ids": [38395, 38396],
    "found_results": 1,
    "source": "supabase"
  }
}
```

### 4. Omnidim Webhook Processing
When Omnidim sends webhook data, it's processed as follows:

```javascript
// Omnidim sends (actual format):
{
  "call_id": 38395,
  "phone_number": "+13373799906",
  "call_date": "2025-07-04 01:56:45",
  "call_report": {
    "extracted_variables": {
      "availability_status": "available",
      "availability_details": "New patients can schedule appointments within 1-3 weeks...",
      "clinic_phone": "Not provided"
    },
    "summary": "The clinic confirms it accepts new patients...",
    "sentiment": "Neutral",
    "recording_url": "http://backend.omnidim.io/...",
    "full_conversation": "..."
  }
}

// Our system processes and stores:
{
  "call_id": 38395,
  "provider_npi": "1234567890",  // ← Looked up from call mapping
  "phone_number": "+13373799906",
  "status": "completed",
  "availability_status": "available",
  "availability_details": "New patients can schedule appointments within 1-3 weeks...",
  "summary": "The clinic confirms it accepts new patients...",
  "sentiment": "Neutral",
  "call_date": "2025-07-04 01:56:45",
  "recording_url": "http://backend.omnidim.io/..."
}
```

## Database Schema Changes

The database now uses `call_id` as the primary key:

```sql
CREATE TABLE call_results (
  id SERIAL,
  call_id VARCHAR(50) PRIMARY KEY,  -- ← New primary key
  provider_npi VARCHAR(10) NOT NULL,  -- ← No longer unique
  phone_number VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  availability_status TEXT,
  availability_details TEXT,
  summary TEXT,
  sentiment VARCHAR(20),
  call_date TIMESTAMP WITH TIME ZONE,
  recording_url TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Key Benefits

1. **Real-time Results**: 5-second polling provides near real-time updates
2. **Call Correlation**: Direct mapping from call_id to results
3. **Multiple Calls**: Can make multiple calls to same provider (different call_ids)
4. **Backward Compatibility**: Original provider_npi polling still works
5. **Accurate Matching**: No timestamp-based correlation needed

## Usage Examples

### Example 1: Dispatch and Poll
```javascript
// 1. Dispatch calls
const response = await fetch('/api/make-calls', {
  method: 'POST',
  body: JSON.stringify({
    providers: [{ number: "1234567890", name: "Dr. Smith" }],
    user_id: "user123"
  })
});
const { call_ids } = await response.json();

// 2. Start polling
const { callResults } = useCallResultsByIds({
  callIds: call_ids,  // [38395]
  autoRefresh: true,
  refreshInterval: 5000
});
```

### Example 2: Check Single Call Status
```javascript
// Check if call 38395 is complete
const result = getCallResult('38395');
if (result) {
  console.log(`Call completed: ${result.availability_status}`);
  console.log(`Details: ${result.availability_details}`);
}
```

This implementation provides the exact polling pattern you described while maintaining backward compatibility with the existing system.