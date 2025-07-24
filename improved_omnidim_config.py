from omnidimension import Client

# Pre-call data collection (HIPAA-compliant)
# This would be collected via your platform's UI before the call
PRE_CALL_DATA = {
    "patient_name": "",  # First name only or preferred name
    "insurance_type": "",  # e.g., "Medicare", "Medicaid", "Private Insurance", "Self-Pay"
    "preferred_date": "",  # Optional: "This week", "Next week", "Flexible"
    "appointment_type": "",  # e.g., "General checkup", "New patient visit", "Specialist consultation"
    "urgency": ""  # Optional: "Routine", "Within 2 weeks", "ASAP"
}

def create_improved_agent(api_key, pre_call_data=None):
    """
    Create an improved Omnidimension agent with better context and data extraction
    """
    client = Client(api_key)
    
    # Construct dynamic welcome message based on pre-call data
    welcome_parts = [
        "Hi, this is Sarah calling from Whoosh MD. We help patients find clinics accepting new patients."
    ]
    
    if pre_call_data and pre_call_data.get("patient_name"):
        welcome_parts.append(f"I'm calling on behalf of {pre_call_data['patient_name']} who is looking for a new patient appointment.")
    
    if pre_call_data and pre_call_data.get("appointment_type"):
        welcome_parts.append(f"They're specifically looking for {pre_call_data['appointment_type'].lower()}.")
    
    welcome_parts.append("Are you currently accepting new patients?")
    
    welcome_message = " ".join(welcome_parts)

    response = client.agent.create(
        name="Whoosh MD Availability Checker",
        welcome_message=welcome_message,
        context_breakdown=[
            {
                "title": "Opening and Introduction", 
                "body": """
                Start with a warm, professional greeting identifying yourself as Sarah from Whoosh MD. 
                Clearly state your purpose: checking new patient availability. If you have patient information, 
                mention you're calling on behalf of someone specific.
                
                Example: 'Hi, this is Sarah from Whoosh MD. We help patients find clinics accepting new patients. 
                I'm calling on behalf of [patient name if provided] who is looking for a new patient appointment. 
                Are you currently accepting new patients?'
                
                Always end with a direct yes/no question about new patient acceptance.
                """, 
                "is_enabled": True
            },
            {
                "title": "Handling Initial Questions About Purpose", 
                "body": """
                If the clinic asks for clarification about your role or purpose, explain that:
                1. You work with Whoosh MD to help patients find available clinics
                2. You're checking availability, not booking appointments
                3. This helps patients know which clinics are currently accepting new patients
                
                Example: 'I work with Whoosh MD - we help patients quickly find clinics that have availability. 
                I'm just checking if you're taking new patients right now, not booking anything yet. 
                This helps patients know which clinics they can contact directly.'
                """, 
                "is_enabled": True
            },
            {
                "title": "When Clinic Accepts New Patients", 
                "body": """
                If they confirm they accept new patients, gather specific availability information:
                1. Ask about general timeframe (this week, next week, etc.)
                2. If they provide specific days/times, confirm them
                3. Ask about insurance acceptance if patient has specific insurance
                4. Inquire about appointment types if relevant
                
                Example: 'That's great! What's your general availability like for new patients? 
                Do you have any openings this week or next week?'
                
                Follow up with: 'And do you accept [insurance type] if the patient has that?'
                
                Always confirm any specific information they provide.
                """, 
                "is_enabled": True
            },
            {
                "title": "Insurance and Payment Inquiry", 
                "body": """
                If pre-call data includes insurance information, ask about acceptance:
                'Do you accept [specific insurance type] for new patients?'
                
                If no specific insurance provided, ask generally:
                'What types of insurance do you typically accept for new patients?'
                
                Also inquire about self-pay options if relevant:
                'Do you also see self-pay patients?'
                """, 
                "is_enabled": True
            },
            {
                "title": "Appointment Type Clarification", 
                "body": """
                If the patient has a specific appointment need, confirm availability:
                'They're looking for [appointment type] - do you have availability for that type of visit?'
                
                Common types to ask about:
                - General checkup/physical
                - New patient consultation
                - Specialist referral
                - Follow-up care
                
                Don't get into specific medical details - keep it general.
                """, 
                "is_enabled": True
            },
            {
                "title": "When Clinic is Not Accepting New Patients", 
                "body": """
                If they say no to new patients, acknowledge professionally and ask about future availability:
                'I understand. Do you know when you might be accepting new patients again? 
                Should they check back in a few weeks?'
                
                Then close politely: 'No problem at all. Thanks for letting me know. Have a great day!'
                
                End the call professionally without pushing further.
                """, 
                "is_enabled": True
            },
            {
                "title": "Handling Voicemail and Unresponsive Calls", 
                "body": """
                If you reach voicemail or no one answers:
                - Do not leave a message
                - Mark as 'unresponsive' in your notes
                - End the call after appropriate wait time
                
                If transferred multiple times or put on long hold:
                - Politely end the call after 2-3 transfers
                - Mark as 'unable to connect' rather than 'unresponsive'
                """, 
                "is_enabled": True
            },
            {
                "title": "Professional Call Closure", 
                "body": """
                End every call professionally regardless of outcome:
                
                For positive responses: 'Perfect, that's exactly what I needed to know. 
                Thanks so much for your help. Have a great day!'
                
                For negative responses: 'I understand completely. Thanks for taking the time 
                to let me know. Have a wonderful day!'
                
                Keep closings brief and don't ask additional questions at the end.
                """, 
                "is_enabled": True
            },
            {
                "title": "Communication Style and Tone Guidelines", 
                "body": """
                Maintain throughout the call:
                - Professional but friendly tone (like an experienced medical office coordinator)
                - Clear, concise language
                - Respectful of their time
                - Confident but not pushy
                
                Avoid:
                - Medical jargon or clinical terms
                - Repetitive phrases
                - Over-explaining your purpose
                - Getting into specific medical details
                - Arguing if they say no
                
                Stay focused on the simple goal: availability and basic logistics.
                """, 
                "is_enabled": True
            }
        ],
        transcriber={
            "provider": "deepgram_stream",
            "silence_timeout_ms": 600,  # Increased for better conversation flow
            "model": "nova-3",
            "numerals": True,
            "punctuate": True,
            "smart_format": True,  # Changed to True for better formatting
            "diarize": False
        },
        model={
            "model": "claude-opus-4-0",
            "temperature": 0.6  # Slightly reduced for more consistent responses
        },
        voice={
            "provider": "deepgram",
            "voice_id": "aura-luna-en"
        },
        post_call_actions={
            "email": {
                "enabled": True,
                "recipients": ["availability@whooshmd.com"],  # Update with actual email
                "include": ["summary", "extracted_variables", "call_recording"]
            },
            "extracted_variables": [
                {
                    "key": "clinic_name", 
                    "prompt": "Extract the name of the clinic or medical practice from the conversation. If not explicitly stated, extract from context clues."
                },
                {
                    "key": "availability_status", 
                    "prompt": "Determine the clinic's new patient acceptance status. Return exactly one of: 'accepting', 'not_accepting', 'waitlist', 'unresponsive', 'unclear'"
                },
                {
                    "key": "availability_timeframe", 
                    "prompt": "Extract when the clinic has availability for new patients. Examples: 'this week', 'next week', 'within 2 weeks', '2-3 weeks out', 'no specific timeframe given'. If not accepting, return 'n/a'."
                },
                {
                    "key": "specific_availability", 
                    "prompt": "Capture any specific days, times, or appointment slots mentioned. Examples: 'Tuesday 9 AM', 'Thursdays in the afternoon', 'Monday-Wednesday mornings'. If none specified, return 'general availability only'."
                },
                {
                    "key": "insurance_accepted", 
                    "prompt": "List the types of insurance accepted for new patients as mentioned in the call. Format as comma-separated list. Examples: 'Medicare, Medicaid, most private insurance', 'self-pay only', 'most major insurances'. If not discussed, return 'not specified'."
                },
                {
                    "key": "appointment_types_available", 
                    "prompt": "Extract what types of appointments they accept for new patients. Examples: 'general checkups, physicals', 'all appointment types', 'consultations only', 'routine care'. If not specified, return 'standard new patient visits'."
                },
                {
                    "key": "contact_person", 
                    "prompt": "Extract the name and role of the person you spoke with, if provided. Format as 'Name - Role' or just 'Role' if name not given. Examples: 'Jennifer - Receptionist', 'Office Manager', 'Front desk staff'."
                },
                {
                    "key": "callback_instructions", 
                    "prompt": "Extract any specific instructions given for patients to schedule appointments. Examples: 'call back Monday-Friday 8-5', 'ask for scheduling department', 'mention new patient when calling'. If none given, return 'standard callback'."
                },
                {
                    "key": "additional_requirements", 
                    "prompt": "Extract any special requirements mentioned for new patients. Examples: 'referral required', 'must be local resident', 'insurance verification needed first'. If none mentioned, return 'none specified'."
                },
                {
                    "key": "call_outcome_quality", 
                    "prompt": "Assess the overall quality of information obtained. Return one of: 'excellent_info', 'good_basic_info', 'limited_info', 'unclear_response', 'no_connection'"
                },
                {
                    "key": "clinic_phone_verified", 
                    "prompt": "Confirm the phone number called reached the intended clinic. Return 'verified' if correct clinic, 'wrong_number' if different business, 'unclear' if uncertain."
                },
                {
                    "key": "follow_up_needed", 
                    "prompt": "Determine if any follow-up action is needed. Examples: 'none', 'verify insurance details', 'check back in 2 weeks', 'confirm appointment availability'. Base on conversation context."
                }
            ]
        },
    )

    return response

# Example usage with pre-call data
if __name__ == "__main__":
    # Sample pre-call data (HIPAA-compliant)
    sample_data = {
        "patient_name": "Jennifer",  # First name only
        "insurance_type": "Medicare",
        "preferred_date": "This week",
        "appointment_type": "General checkup",
        "urgency": "Routine"
    }
    
    # API key would come from environment variable
    api_key = "your_api_key_here"
    
    response = create_improved_agent(api_key, sample_data)
    
    print(f"Status: {response['status']}")
    print(f"Created Agent: {response['json']}")
    
    # Store the agent ID for later use
    agent_id = response['json'].get('id')
    print(f"Agent ID: {agent_id}")