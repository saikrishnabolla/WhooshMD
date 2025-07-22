# WhooshMD - Healthcare Provider Search with Voice Verification

A modern healthcare provider search application with real-time appointment verification using AI voice agents powered by Vapi.

## 🚀 Features

- **Provider Search**: Search healthcare providers using the NPI Registry
- **Voice Agent Integration**: AI-powered voice calls to verify appointment availability in real-time
- **Appointment Verification**: Call up to 6 providers simultaneously to check availability
- **GoodRx-Style Results**: Clean, organized display of availability information
- **Real-time Updates**: Live status updates as voice agents complete calls
- **Transcript Analysis**: Parse call transcripts for appointment details
- **Multi-Provider Support**: Select and call multiple providers in one batch

## 🎯 Voice Agent Capabilities

Our Vapi-powered voice agents can:
- Call healthcare providers professionally to inquire about appointments
- Ask about new patient availability
- Gather next available appointment dates
- Inquire about accepted insurance types
- Note special booking instructions
- Parse responses for structured data

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- A Vapi account and API key
- Supabase account (for user management)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whoosh-md
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:
   ```env
   # Vapi Configuration
   VAPI_API_KEY=your_vapi_api_key_here
   VAPI_MOCK_MODE=false
   VAPI_WEBHOOK_URL=https://your-app.com/api/vapi-webhook

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Vapi Integration Setup

### 1. Create a Vapi Account

1. Sign up at [vapi.ai](https://vapi.ai)
2. Get your API key from the dashboard
3. Add billing information to enable outbound calls

### 2. Configure Voice Agent

The application automatically creates specialized voice assistants for appointment verification with:

- **Professional greeting and inquiry script**
- **Structured data collection via function calls**
- **Appointment availability parsing**
- **Insurance and booking instruction gathering**

### 3. Webhook Configuration

Set up webhooks in your Vapi dashboard to point to:
```
https://your-app.com/api/vapi-webhook
```

This enables real-time updates for:
- Call status changes
- Live transcripts
- Function call results
- End-of-call reports

## 📋 Usage

### Searching Providers

1. Use the search form to find healthcare providers
2. Filter by location, specialty, or provider name
3. Results show provider details and contact information

### Voice Agent Verification

1. Select up to 6 providers from search results
2. Click "Start Voice Agent Calls"
3. AI agents will call each provider to verify availability
4. View real-time results as calls complete

### Results Analysis

The system provides GoodRx-style results showing:
- ✅ **Accepting Patients**: Providers currently taking new patients
- ❌ **Not Accepting**: Providers not currently accepting
- 📅 **Next Available**: Specific appointment dates when available
- 🏥 **Call Details**: Duration, transcript, and verification status

## 🏗️ Architecture

### Voice Agent Flow

```
1. User selects providers → 2. Vapi creates specialized assistant
                         ↓
4. Results parsed ← 3. Voice agent calls provider
                         ↓
5. UI updates ← Webhook receives call completion
```

### Key Components

- **VapiService**: Core integration with Vapi API
- **VoiceCallModal**: Provider selection and call initiation
- **AvailabilityResults**: Results display with appointment data
- **Webhook Handler**: Real-time updates from Vapi

## 🔒 Development vs Production

### Mock Mode

Set `VAPI_MOCK_MODE=true` to simulate voice calls during development:
- No actual calls made
- Randomized appointment availability results
- Faster testing of UI components

### Production Mode

Set `VAPI_MOCK_MODE=false` with valid `VAPI_API_KEY` for real calls:
- Actual voice agent calls to providers
- Real appointment verification
- Live transcript analysis

## 📊 Call Results Structure

Each voice agent call returns:

```typescript
{
  provider_number: string;
  provider_name: string;
  status: 'success' | 'failed' | 'no_answer' | 'busy';
  appointment_data?: {
    accepting_patients: boolean;
    next_available_date?: string;
    appointment_types?: string[];
    insurance_accepted?: string[];
    wait_time_estimate?: string;
    booking_instructions?: string;
  };
  call_duration?: string;
  transcript?: string;
}
```

## 🚀 Deployment

1. **Environment Setup**
   - Configure production environment variables
   - Set up webhook URL in Vapi dashboard
   - Ensure CORS settings allow your domain

2. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

3. **Webhook Testing**
   - Verify webhook endpoint is accessible
   - Test with Vapi webhook tester
   - Monitor logs for successful processing

## 🔍 Troubleshooting

### Common Issues

1. **Voice calls not working**
   - Check `VAPI_API_KEY` is set correctly
   - Verify Vapi account has billing configured
   - Ensure `VAPI_MOCK_MODE=false` for real calls

2. **Webhook issues**
   - Verify webhook URL is publicly accessible
   - Check webhook signature validation
   - Monitor webhook endpoint logs

3. **Provider phone numbers**
   - Some providers may not have phone numbers in NPI data
   - Invalid numbers are automatically skipped
   - Check call results for "invalid_number" status

## 📚 API Reference

### Voice Agent Endpoints

- `POST /api/voice-agent` - Initiate voice calls
- `POST /api/vapi-webhook` - Handle Vapi webhooks
- `PATCH /api/voice-agent` - Update call status

### Webhook Events

- `status-update` - Call status changes
- `transcript` - Real-time transcript updates
- `function-call` - Structured data from assistant
- `end-of-call-report` - Final call summary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add Vapi integration tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For Vapi-specific issues:
- Check [Vapi Documentation](https://docs.vapi.ai)
- Review webhook payload examples
- Test with mock mode first

For application issues:
- Check environment variables
- Review console logs
- Test voice agent functionality step-by-step
