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
    urgency: 'This week'
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
    <div className="p-6 space-y-6">
      {/* HIPAA Compliance Notice */}
      {showHipaaNotice && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-900">Privacy Protected</h3>
              <p className="text-sm text-blue-800">
                We only collect basic scheduling information. We never ask for medical details, 
                last names, or other protected health information.
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
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Phone className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
          </div>
          <p className="text-sm text-gray-600">
            Help us find the right appointments for you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Patient Name */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
              <p className="text-xs text-gray-500">
                First name only for privacy
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select insurance (optional)</option>
                <option value="Medicare">Medicare</option>
                <option value="Medicaid">Medicaid</option>
                <option value="Private Insurance">Private Insurance</option>
                <option value="Self-Pay">Self-Pay</option>
                <option value="Other">Other</option>
                <option value="Not Sure">Not Sure</option>
              </select>
            </div>

            {/* Appointment Type */}
            <div className="space-y-2">
              <label htmlFor="appointment_type" className="block text-sm font-medium text-gray-700">
                Appointment Type
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="appointment_type"
                value={formData.appointment_type}
                onChange={(e) => updateField('appointment_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Select appointment type</option>
                <option value="General checkup">General checkup</option>
                <option value="New patient consultation">New patient visit</option>
                <option value="Specialist referral">Specialist referral</option>
                <option value="Follow-up care">Follow-up visit</option>
              </select>
            </div>

            {/* Combined Timeframe & Urgency */}
            <div className="space-y-2">
              <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4 inline mr-1" />
                When do you need to be seen?
              </label>
              <select
                id="urgency"
                value={formData.urgency}
                onChange={(e) => {
                  updateField('urgency', e.target.value);
                  updateField('preferred_date', e.target.value); // Keep both fields in sync
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="ASAP">ASAP (urgent)</option>
                <option value="This week">This week</option>
                <option value="Next week">Next week</option>
                <option value="Within 2 weeks">Within 2 weeks</option>
                <option value="Flexible">Flexible timing</option>
              </select>
            </div>

          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Checking Availability...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Check Availability
                </>
              )}
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg text-center">
            <strong>Privacy:</strong> Information is encrypted and used only for availability checking. 
            No medical details are shared with providers.
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreCallDataForm;