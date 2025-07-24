# HIPAA Compliance Guide for Whoosh MD Voice Agent

## What We CAN Collect (HIPAA-Safe)

### ✅ SAFE Pre-Call Information:
1. **First name only** or preferred name (no last names)
2. **General insurance type** (Medicare, Medicaid, Private, Self-Pay)
3. **Appointment type preference** (General checkup, Consultation, Physical)
4. **Preferred timeframe** (This week, Next week, Flexible)
5. **General urgency** (Routine, Within 2 weeks, ASAP)

### ✅ SAFE During-Call Questions:
- "Do you accept [insurance type]?"
- "What's your general availability for new patients?"
- "Do you have openings this week/next week?"
- "What types of appointments do you offer for new patients?"

## What We CANNOT Collect (HIPAA Violations)

### ❌ NEVER COLLECT:
1. **Full names** (last names are PHI)
2. **Specific medical conditions** or symptoms
3. **Date of birth** or age
4. **Social Security numbers**
5. **Address or specific location details**
6. **Phone numbers** (unless for callback purposes)
7. **Specific medical history**
8. **Prescription information**
9. **Previous medical providers**
10. **Family medical history**

### ❌ NEVER ASK DURING CALLS:
- "What medical condition does the patient have?"
- "Why do they need to see a doctor?"
- "What's their full name and address?"
- "What medications are they taking?"
- "Do they have any specific health concerns?"

## Safe Data Handling Practices

### Data Collection:
- Use generic identifiers ("Patient #1234" instead of names in logs)
- Collect only the minimum necessary information
- Clear data after successful appointment booking
- Never store sensitive information longer than necessary

### Voice Agent Training:
- Train agent to redirect medical questions: "I'm just checking availability, not medical details"
- Avoid asking follow-up questions about health conditions
- Keep conversations focused on scheduling logistics only

### Data Storage:
- Encrypt all stored data
- Use separate databases for different data types
- Implement automatic data purging after 30 days
- Audit trail for all data access

## Red Flags to Avoid

### If Clinic Asks Medical Questions:
**Clinic**: "What's the patient's condition?"
**Agent**: "I'm just checking general availability - they'll discuss their medical needs directly when they call to schedule."

### If Patient Provides Too Much Information:
**Patient**: "I have diabetes and need..."
**Platform**: Redirect to basic appointment type selection without storing medical details

### If System Captures Medical Information:
- Immediately flag for manual review
- Remove medical details from stored data
- Retrain voice agent if needed

## Implementation Checklist

- [ ] Pre-call form limited to safe fields only
- [ ] Voice agent trained to avoid medical discussions
- [ ] Data storage encrypted and time-limited
- [ ] Regular HIPAA compliance audits
- [ ] Staff training on PHI handling
- [ ] Clear data retention policies
- [ ] Incident response plan for potential violations

## Legal Safeguards

1. **Business Associate Agreement** with Omnidimension
2. **Clear privacy policies** for patients
3. **Data processing agreements** with all vendors
4. **Regular compliance training** for all staff
5. **Audit logs** for all system access
6. **Encryption** for data in transit and at rest