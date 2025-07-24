import React, { useState } from 'react';
import { Shield, Phone, Clock, FileText } from 'lucide-react';

interface PreCallData {
  patient_name: string;
  insurance_type: string;
  preferred_date: string;
  appointment_type: string;
  urgency: string;
}

interface PreCallDataFormProps {
  onSubmit: (data: PreCallData) => void;
  isLoading?: boolean;
}

export const PreCallDataForm: React.FC<PreCallDataFormProps> = ({ 
  onSubmit, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<PreCallData>({
    patient_name: '',
    insurance_type: '',
    preferred_date: '',
    appointment_type: '',
    urgency: 'Routine'
  });

  const [showHipaaNotice, setShowHipaaNotice] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof PreCallData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.patient_name.trim() && formData.appointment_type;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* HIPAA Compliance Notice */}
      {showHipaaNotice && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">Privacy Protected</h3>
              <p className="text-sm text-blue-800">
                We only collect basic scheduling information. We never ask for medical details, 
                last names, or other protected health information. This keeps your information 
                safe and HIPAA compliant.
              </p>
              <button 
                onClick={() => setShowHipaaNotice(false)}
                className="text-blue-700 border border-blue-300 px-3 py-1 rounded text-sm hover:bg-blue-100 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Clinic Availability Check</h2>
          </div>
          <p className="text-sm text-gray-600">
            Help us find clinics that match your needs. We&apos;ll check availability without sharing personal medical information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Name (First Name Only) */}
          <div className="space-y-2">
            <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700">
              Preferred Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="patient_name"
              type="text"
              value={formData.patient_name}
              onChange={(e) => updateField('patient_name', e.target.value)}
              placeholder="First name or preferred name"
              className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
            <p className="text-xs text-gray-500">
              First name only - we don&apos;t need your last name for privacy reasons
            </p>
          </div>

          {/* Insurance Type */}
          <div className="space-y-2">
            <label htmlFor="insurance_type" className="block text-sm font-medium text-gray-700">
              Insurance Type
            </label>
            <select
              id="insurance_type"
              value={formData.insurance_type}
              onChange={(e) => updateField('insurance_type', e.target.value)}
              className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select insurance type (optional)</option>
              <option value="Medicare">Medicare</option>
              <option value="Medicaid">Medicaid</option>
              <option value="Private Insurance">Private Insurance</option>
              <option value="Self-Pay">Self-Pay</option>
              <option value="Other">Other</option>
              <option value="Not Sure">Not Sure</option>
            </select>
            <p className="text-xs text-gray-500">
              This helps us check which clinics accept your insurance
            </p>
          </div>

          {/* Appointment Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Appointment Type
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'General checkup', label: 'General checkup/physical' },
                { value: 'New patient consultation', label: 'New patient consultation' },
                { value: 'Specialist referral', label: 'Specialist referral' },
                { value: 'Follow-up care', label: 'Follow-up care' }
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="appointment_type"
                    value={option.value}
                    checked={formData.appointment_type === option.value}
                    onChange={(e) => updateField('appointment_type', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Timeframe */}
          <div className="space-y-2">
            <label htmlFor="preferred_date" className="block text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4 inline mr-1" />
              Preferred Timeframe
            </label>
            <select
              id="preferred_date"
              value={formData.preferred_date}
              onChange={(e) => updateField('preferred_date', e.target.value)}
              className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">When would you like to be seen?</option>
              <option value="This week">This week</option>
              <option value="Next week">Next week</option>
              <option value="Within 2 weeks">Within 2 weeks</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          {/* Urgency Level */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              How urgent is this appointment?
            </label>
            <div className="flex gap-6">
              {[
                { value: 'Routine', label: 'Routine' },
                { value: 'Within 2 weeks', label: 'Within 2 weeks' },
                { value: 'ASAP', label: 'ASAP' }
              ].map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="urgency"
                    value={option.value}
                    checked={formData.urgency === option.value}
                    onChange={(e) => updateField('urgency', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Checking Clinics...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Start Availability Check
                </>
              )}
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <strong>Privacy Note:</strong> We only use this information to check clinic availability. 
            We never share medical details or personal information with clinics. 
            All data is encrypted and automatically deleted after your search.
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreCallDataForm;