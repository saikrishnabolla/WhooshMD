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
    <div className="p-8 space-y-8">
      {/* HIPAA Compliance Notice */}
      {showHipaaNotice && (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-primary-900">Privacy Protected</h3>
              <p className="text-sm text-primary-800 leading-relaxed">
                We only collect basic scheduling information. We never ask for medical details, 
                last names, or other protected health information.
              </p>
              <button 
                onClick={() => setShowHipaaNotice(false)}
                className="text-primary-700 bg-white border border-primary-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition-all duration-200 shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Appointment Details</h2>
          </div>
          <p className="text-gray-600 max-w-md mx-auto">
            Help us find the right appointments for you with our AI-powered search
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Patient Name */}
            <div className="space-y-3">
              <label htmlFor="patient_name" className="block text-sm font-semibold text-gray-800">
                Preferred Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="patient_name"
                type="text"
                value={formData.patient_name}
                onChange={(e) => updateField('patient_name', e.target.value)}
                placeholder="First name or preferred name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                required
              />
              <p className="text-xs text-gray-500 ml-1">
                First name only for privacy
              </p>
            </div>

            {/* Insurance Type */}
            <div className="space-y-3">
              <label htmlFor="insurance_type" className="block text-sm font-semibold text-gray-800">
                Insurance Type
              </label>
              <select
                id="insurance_type"
                value={formData.insurance_type}
                onChange={(e) => updateField('insurance_type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 bg-white"
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
            <div className="space-y-3">
              <label htmlFor="appointment_type" className="block text-sm font-semibold text-gray-800">
                Appointment Type
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="appointment_type"
                value={formData.appointment_type}
                onChange={(e) => updateField('appointment_type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 bg-white"
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
            <div className="space-y-3">
              <label htmlFor="urgency" className="block text-sm font-semibold text-gray-800">
                <Clock className="h-4 w-4 inline mr-2" />
                When do you need to be seen?
              </label>
              <select
                id="urgency"
                value={formData.urgency}
                onChange={(e) => {
                  updateField('urgency', e.target.value);
                  updateField('preferred_date', e.target.value); // Keep both fields in sync
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 bg-white"
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
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-10 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-primary-500/25 transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Checking Availability...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Check Availability
                </>
              )}
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-800">Privacy:</span> Information is encrypted and used only for availability checking. 
              No medical details are shared with providers.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreCallDataForm;