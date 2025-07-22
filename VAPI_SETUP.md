# Vapi Voice Agent Setup Guide

This guide will help you set up Vapi integration for the appointment verification voice agent functionality.

## Overview

The voice agent feature allows users to:
- Select up to 6 healthcare providers
- Automatically call providers to verify appointment availability
- Parse call results to display appointment slots like Zocdoc
- View detailed availability information in real-time

## Prerequisites

1. **Vapi Account**: Sign up at [vapi.ai](https://vapi.ai)
2. **OpenAI API Key**: Required for the AI assistant
3. **11Labs Account**: For realistic voice synthesis (optional, but recommended)

## Step 1: Vapi Account Setup

### 1.1 Create Vapi Account
1. Visit [vapi.ai](https://vapi.ai) and sign up
2. Navigate to your dashboard
3. Go to "Account" → Copy your API Key
4. Go to "Billing" → Add payment method and set usage limits

### 1.2 Purchase a Phone Number
1. Go to "Phone Numbers" in the Vapi dashboard
2. Click "Buy Number"
3. Select a US phone number
4. Copy the Phone Number ID

## Step 2: Create Voice Assistant

### 2.1 Manual Setup (Recommended)
1. Go to "Assistants" in the Vapi dashboard
2. Click "Create Assistant"
3. Use these settings:

**Basic Settings:**
- Name: "Appointment Verification Assistant"
- First Message: "Hello, I'm calling to inquire about appointment availability for a new patient. Could you please help me with this?"

**Model Configuration:**
- Provider: OpenAI
- Model: gpt-4o
- Temperature: 0.3

**System Prompt:**
```
You are a professional appointment verification assistant. Your job is to call healthcare providers to inquire about appointment availability for new patients.

INSTRUCTIONS:
1. Be polite, professional, and concise
2. Introduce yourself as calling on behalf of a patient seeking appointments
3. Ask if they are accepting new patients
4. If yes, ask about next available appointment slots
5. Ask about types of appointments they offer
6. Record all information using the record_appointment_availability function
7. Thank them and end the call

CONVERSATION FLOW:
- Start: "Hello, I'm calling to inquire about appointment availability for a new patient. Could you please help me with this?"
- Ask: "Are you currently accepting new patients?"
- If YES: "That's great! What are your next available appointment slots?"
- Ask: "What types of appointments do you offer?"
- Record information and thank them

IMPORTANT:
- Keep responses under 20 words
- If they ask for patient details, say you're doing a general availability check
- If they can't help, ask to speak with scheduling
- Always use the function to record what you learn
- Be respectful of their time

Remember: You're helping patients find available healthcare appointments efficiently.
```

**Voice Settings:**
- Provider: 11Labs (or Deepgram)
- Voice ID: `21m00Tcm4TlvDq8ikWAM` (Rachel - professional female voice)

**Advanced Settings:**
- Max Duration: 300 seconds (5 minutes)
- End Call on Function Call: true
- Recording Enabled: true

### 2.2 Add Function Tool
Add this function to your assistant:

**Function Name:** `record_appointment_availability`
**Description:** Record the appointment availability information gathered from the provider

**Parameters Schema:**
```json
{
  "type": "object",
  "properties": {
    "accepting_new_patients": {
      "type": "boolean",
      "description": "Whether the provider is accepting new patients"
    },
    "next_available_slots": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "description": "Date in YYYY-MM-DD format"
          },
          "time": {
            "type": "string",
            "description": "Time in HH:MM format"
          },
          "appointment_type": {
            "type": "string",
            "description": "Type of appointment"
          }
        }
      }
    },
    "appointment_types": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Types of appointments offered"
    },
    "special_notes": {
      "type": "string",
      "description": "Any special notes or requirements"
    }
  },
  "required": ["accepting_new_patients"]
}
```

### 2.3 Copy Assistant ID
After creating the assistant, copy the Assistant ID from the URL or assistant details.

## Step 3: Environment Configuration

### 3.1 Create Environment File
Copy `.env.example` to `.env.local` and fill in your Vapi credentials:

```env
# Vapi Voice Agent Configuration
VAPI_API_KEY=your_vapi_api_key_here
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_public_key_here
VAPI_ASSISTANT_ID=your_assistant_id_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id_here
VAPI_PHONE_NUMBER_ID=your_phone_number_id_here
NEXT_PUBLIC_VAPI_PHONE_NUMBER_ID=your_phone_number_id_here
NEXT_PUBLIC_VAPI_WEBHOOK_URL=https://your-domain.com/api/webhooks/vapi

# Other required configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3.2 Install Dependencies
```bash
npm install
```

## Step 4: Webhook Setup (Production)

### 4.1 Deploy Your Application
Deploy your application to a service like Vercel, Netlify, or your own server.

### 4.2 Configure Webhook in Vapi
1. Go to your Vapi dashboard
2. Navigate to "Webhooks" or "Integrations"
3. Add your webhook URL: `https://your-domain.com/api/webhooks/vapi`
4. Select these events:
   - `call-start`
   - `call-end`
   - `transcript`
   - `function-call`
   - `status-update`

## Step 5: Testing

### 5.1 Development Mode
In development, the system runs in mock mode automatically. You can test the UI without making real calls.

### 5.2 Production Testing
1. Search for healthcare providers
2. Select up to 6 providers with phone numbers
3. Click "Voice Agent" button
4. Choose appointment type
5. Start the voice agent calls
6. Monitor results in the dashboard

### 5.3 Test Call Flow
To test the assistant:
1. Call your Vapi phone number directly
2. The assistant should answer and ask about appointments
3. Respond as a healthcare office would
4. Check if the function is called correctly

## Step 6: Monitoring and Analytics

### 6.1 Vapi Dashboard
Monitor calls in the Vapi dashboard:
- Call recordings
- Transcripts
- Function calls
- Call analytics

### 6.2 Application Dashboard
View results in your application dashboard:
- Call status updates
- Appointment availability
- Provider information

## Troubleshooting

### Common Issues

**1. "Invalid API Key" Error**
- Check that `VAPI_API_KEY` is correctly set
- Ensure the API key is from your Vapi account

**2. "Assistant not found" Error**
- Verify `VAPI_ASSISTANT_ID` matches your created assistant
- Check the assistant is published/active

**3. "No phone number" Error**
- Confirm `VAPI_PHONE_NUMBER_ID` is correct
- Ensure the phone number is active in Vapi

**4. Function not being called**
- Check the function schema is correct
- Verify the assistant has the function tool added
- Review the system prompt

**5. Poor call quality**
- Try different voice providers (11Labs, Deepgram)
- Adjust the assistant's temperature
- Refine the system prompt

### Development Tips

1. **Test with Mock Mode**: Development mode uses mock data
2. **Start Small**: Test with 1-2 providers first
3. **Monitor Logs**: Check browser console and server logs
4. **Use Webhooks**: Set up webhooks for real-time updates
5. **Voice Optimization**: Tune the assistant for your specific use case

## Cost Considerations

- **Vapi Costs**: Approximately $0.05-0.15 per minute
- **OpenAI Costs**: Additional costs for GPT-4 usage
- **11Labs Costs**: If using premium voices

**Budget Planning**: For 100 calls averaging 2 minutes each = ~$10-30

## Advanced Configuration

### Custom Voice Training
- Upload custom voice samples to 11Labs
- Train voice for your specific use case
- Use professional healthcare terminology

### Function Enhancements
Add additional functions for:
- Scheduling appointments
- Collecting patient information
- Insurance verification
- Follow-up scheduling

### Integration Extensions
- CRM integration
- Patient management systems
- Electronic health records
- Automated follow-ups

## Security and Compliance

### Data Protection
- All calls are recorded and transcribed
- Ensure HIPAA compliance if handling patient data
- Review Vapi's security documentation

### Privacy Considerations
- Inform providers about call recording
- Follow telemarketing regulations
- Respect provider preferences

## Support

For issues specific to:
- **Vapi Integration**: Check [Vapi Documentation](https://docs.vapi.ai)
- **Application Issues**: Create an issue in this repository
- **Voice Quality**: Contact Vapi support

---

## Quick Start Checklist

- [ ] Create Vapi account and get API key
- [ ] Purchase phone number in Vapi
- [ ] Create appointment verification assistant
- [ ] Add function tool for availability recording
- [ ] Configure environment variables
- [ ] Deploy application (for webhooks)
- [ ] Set up webhook in Vapi dashboard
- [ ] Test with mock data
- [ ] Test with real providers
- [ ] Monitor results and optimize

**Estimated Setup Time**: 2-3 hours for complete configuration