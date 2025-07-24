import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900">Privacy Protected</h3>
                <p className="text-sm text-blue-800">
                  We only collect basic scheduling information. We never ask for medical details, 
                  last names, or other protected health information. This keeps your information 
                  safe and HIPAA compliant.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowHipaaNotice(false)}
                  className="text-blue-700 border-blue-300"
                >
                  Got it
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Clinic Availability Check
          </CardTitle>
          <p className="text-sm text-gray-600">
            Help us find clinics that match your needs. We'll check availability without sharing personal medical information.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Name (First Name Only) */}
            <div className="space-y-2">
              <Label htmlFor="patient_name" className="flex items-center gap-2">
                Preferred Name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="patient_name"
                value={formData.patient_name}
                onChange={(e) => updateField('patient_name', e.target.value)}
                placeholder="First name or preferred name"
                className="max-w-sm"
                required
              />
              <p className="text-xs text-gray-500">
                First name only - we don't need your last name for privacy reasons
              </p>
            </div>

            {/* Insurance Type */}
            <div className="space-y-2">
              <Label>Insurance Type</Label>
              <Select onValueChange={(value) => updateField('insurance_type', value)}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Select insurance type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicare">Medicare</SelectItem>
                  <SelectItem value="Medicaid">Medicaid</SelectItem>
                  <SelectItem value="Private Insurance">Private Insurance</SelectItem>
                  <SelectItem value="Self-Pay">Self-Pay</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Not Sure">Not Sure</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                This helps us check which clinics accept your insurance
              </p>
            </div>

            {/* Appointment Type */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                Appointment Type
                <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.appointment_type}
                onValueChange={(value) => updateField('appointment_type', value)}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="General checkup" id="general" />
                  <Label htmlFor="general" className="cursor-pointer">
                    General checkup/physical
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="New patient consultation" id="consultation" />
                  <Label htmlFor="consultation" className="cursor-pointer">
                    New patient consultation
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Specialist referral" id="specialist" />
                  <Label htmlFor="specialist" className="cursor-pointer">
                    Specialist referral
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="Follow-up care" id="followup" />
                  <Label htmlFor="followup" className="cursor-pointer">
                    Follow-up care
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Preferred Timeframe */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Preferred Timeframe
              </Label>
              <Select onValueChange={(value) => updateField('preferred_date', value)}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="When would you like to be seen?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="This week">This week</SelectItem>
                  <SelectItem value="Next week">Next week</SelectItem>
                  <SelectItem value="Within 2 weeks">Within 2 weeks</SelectItem>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Urgency Level */}
            <div className="space-y-3">
              <Label>How urgent is this appointment?</Label>
              <RadioGroup
                value={formData.urgency}
                onValueChange={(value) => updateField('urgency', value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Routine" id="routine" />
                  <Label htmlFor="routine" className="cursor-pointer">Routine</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Within 2 weeks" id="soon" />
                  <Label htmlFor="soon" className="cursor-pointer">Within 2 weeks</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ASAP" id="urgent" />
                  <Label htmlFor="urgent" className="cursor-pointer">ASAP</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking Clinics...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Start Availability Check
                  </>
                )}
              </Button>
            </div>

            {/* Privacy Notice */}
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <strong>Privacy Note:</strong> We only use this information to check clinic availability. 
              We never share medical details or personal information with clinics. 
              All data is encrypted and automatically deleted after your search.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreCallDataForm;