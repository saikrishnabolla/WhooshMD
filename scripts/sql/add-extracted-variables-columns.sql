-- Add extracted variables columns to call_results table
-- This script adds columns to store all the extracted variables from the AI call analysis

ALTER TABLE call_results 
ADD COLUMN IF NOT EXISTS extracted_variables JSONB,
ADD COLUMN IF NOT EXISTS clinic_name TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS insurance_accepted TEXT,
ADD COLUMN IF NOT EXISTS appointment_types_available TEXT,
ADD COLUMN IF NOT EXISTS availability_timeframe TEXT,
ADD COLUMN IF NOT EXISTS specific_availability TEXT,
ADD COLUMN IF NOT EXISTS call_outcome_quality TEXT,
ADD COLUMN IF NOT EXISTS clinic_phone_verified TEXT,
ADD COLUMN IF NOT EXISTS follow_up_needed TEXT,
ADD COLUMN IF NOT EXISTS callback_instructions TEXT,
ADD COLUMN IF NOT EXISTS additional_requirements TEXT;

-- Add indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_call_results_clinic_name ON call_results(clinic_name);
CREATE INDEX IF NOT EXISTS idx_call_results_insurance_accepted ON call_results(insurance_accepted);
CREATE INDEX IF NOT EXISTS idx_call_results_availability_timeframe ON call_results(availability_timeframe);
CREATE INDEX IF NOT EXISTS idx_call_results_call_outcome_quality ON call_results(call_outcome_quality);

-- Add comment to table explaining the new structure
COMMENT ON TABLE call_results IS 'Stores AI call verification results with detailed extracted variables';
COMMENT ON COLUMN call_results.extracted_variables IS 'Full JSON of all extracted variables from AI analysis';
COMMENT ON COLUMN call_results.clinic_name IS 'Name of the clinic/practice from call';
COMMENT ON COLUMN call_results.contact_person IS 'Contact person mentioned during call';
COMMENT ON COLUMN call_results.insurance_accepted IS 'Insurance acceptance information';
COMMENT ON COLUMN call_results.appointment_types_available IS 'Types of appointments available';
COMMENT ON COLUMN call_results.availability_timeframe IS 'When appointments are available';
COMMENT ON COLUMN call_results.specific_availability IS 'Specific hours/days of operation';
COMMENT ON COLUMN call_results.call_outcome_quality IS 'Quality assessment of the call';
COMMENT ON COLUMN call_results.clinic_phone_verified IS 'Phone verification status';
COMMENT ON COLUMN call_results.follow_up_needed IS 'Whether follow-up is needed';
COMMENT ON COLUMN call_results.callback_instructions IS 'Instructions for callbacks';
COMMENT ON COLUMN call_results.additional_requirements IS 'Any additional requirements mentioned';