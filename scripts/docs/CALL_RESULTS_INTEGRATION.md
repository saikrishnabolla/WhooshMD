# Call Results Integration

This documentation covers the complete implementation of AI call verification results integration with the provider search system.

## 🎯 Overview

The system now includes:
- **AI Call Dispatch**: Omnidim API integration for automated provider calls
- **Webhook Handling**: Real-time call result processing
- **Database Storage**: Persistent call results in Supabase
- **UI Components**: Enhanced provider cards showing call verification status
- **Real-time Updates**: Auto-refreshing call results

## 🏗️ Architecture

```
Provider Search → Make Calls → Omnidim API → Webhook → Database → UI Display
```

## 📋 Components

### 1. API Endpoints

#### `/api/make-calls` (POST)
Dispatches AI calls to providers using Omnidim API.

**Request:**
```json
{
  "providers": [
    {
      "number": "1234567890",
      "name": "Dr. Jane Smith",
      "specialties": "Family Medicine"
    }
  ],
  "user_id": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "provider_number": "1234567890",
      "provider_name": "Dr. Jane Smith",
      "status": "success",
      "call_id": "omnidim_12345",
      "dispatch_timestamp": 1640995200000
    }
  ]
}
```

#### `/api/call-mapping` (POST/GET)
Stores call ID to provider NPI mappings for webhook correlation.

#### `/api/call-results` (GET/POST)
Retrieves and stores call results from the database.

#### `/api/webhook/call-result` (POST)
Processes webhook events from Omnidim when calls complete.

### 2. React Components

#### `EnhancedProviderCard`
Enhanced provider card component that displays:
- Provider information
- AI verification status
- Availability details
- Call summaries
- Action buttons

```tsx
<EnhancedProviderCard
  provider={provider}
  callResult={callResult}
  onViewDetails={handleViewDetails}
/>
```

#### `ProviderSearchResults`
Complete search results component with call results integration:

```tsx
<ProviderSearchResults
  providers={providers}
  userId={userId}
  onProviderSelect={handleSelect}
/>
```

### 3. Custom Hooks

#### `useCallResults`
Hook for fetching call results with auto-refresh:

```tsx
const { callResults, loading, getCallResult } = useCallResults({
  providerNpis: ["1234567890", "0987654321"],
  autoRefresh: true,
  refreshInterval: 30000
});
```

#### `useCallResult`
Hook for fetching a single provider's call result:

```tsx
const { callResult, loading } = useCallResult("1234567890");
```

## 🗄️ Database Schema

The `call_results` table stores all call verification data:

```sql
CREATE TABLE call_results (
  id SERIAL PRIMARY KEY,
  provider_npi VARCHAR(10) NOT NULL UNIQUE,
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

## 🔧 Setup Instructions

### 1. Environment Variables

Add these to your `.env.local`:

```env
# Omnidim API
OMNIDIM_API_KEY=your_omnidim_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL for webhooks
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

### 2. Database Setup

1. Run the SQL schema in your Supabase dashboard:
   ```sql
   -- Execute the contents of scripts/sql/database-schema.sql
   ```

2. Enable Row Level Security policies for user data protection.

### 3. Webhook Configuration

Configure your Omnidim account to send webhooks to:
```
https://yourapp.com/api/webhook/call-result
```

## 🎨 UI Features

### Call Status Indicators

- 🔄 **Calling**: Blue spinner with "AI verification in progress"
- ✅ **Completed**: Green checkmark with "AI verified recently"
- ❌ **Failed**: Red alert with "Verification failed"

### Availability Display

- 🟢 **Accepting New Patients**: Green dot
- 🔴 **Not Accepting**: Red dot  
- 🟡 **Conditional**: Yellow dot

### Interactive Elements

- **Show/Hide Summary**: Expandable call summaries
- **Book Now**: Direct call-to-action buttons
- **Listen to Call**: Play call recordings (if available)
- **View Profile**: Detailed provider information

## 🔄 Data Flow

1. **User searches** for providers
2. **System dispatches** AI calls via Omnidim API
3. **Call mappings** stored for webhook correlation
4. **Omnidim AI** makes verification calls
5. **Webhook receives** call completion events
6. **Results stored** in Supabase database
7. **UI auto-refreshes** to show updated status
8. **Users see** real-time availability information

## 🚀 Usage Example

```tsx
import { ProviderSearchResults } from '@/components/ProviderSearchResults';

function SearchPage() {
  const [providers, setProviders] = useState([]);
  const { user } = useAuth();

  return (
    <div>
      <SearchForm onResults={setProviders} />
      <ProviderSearchResults
        providers={providers}
        userId={user?.id}
        onProviderSelect={handleProviderSelect}
      />
    </div>
  );
}
```

## 🐛 Debugging

### Development Mode
The system includes debug information in development:
- Provider count
- Call results count
- Loading states
- Error messages

### Logs
Check these for troubleshooting:
- Browser console for frontend errors
- Next.js logs for API issues
- Supabase logs for database problems
- Omnidim dashboard for call status

## 🔒 Security

- **Row Level Security**: Users only see their own call results
- **Service Role Access**: Webhooks use service role for data updates
- **API Key Protection**: Omnidim API key stored securely in environment variables
- **User Authentication**: All calls tied to authenticated users

## 📈 Performance

- **Auto-refresh**: 30-second intervals for real-time updates
- **Bulk Fetching**: Multiple provider results in single API calls
- **Database Indexing**: Optimized queries with proper indexes
- **Error Handling**: Graceful degradation when services are unavailable

## 🎯 Next Steps

1. **Real-time Updates**: Implement WebSocket connections for instant updates
2. **Call Analytics**: Add charts and metrics for call success rates
3. **Advanced Filtering**: Filter providers by availability status
4. **Notification System**: Alert users when calls complete
5. **Call Scheduling**: Allow users to schedule calls for specific times