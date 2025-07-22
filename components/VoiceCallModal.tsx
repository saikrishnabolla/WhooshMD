'use client'

import React, { useState } from 'react';
import { Phone, X, Check, AlertCircle, Loader2, Calendar, Clock, Users, Building2 } from 'lucide-react';
import { Provider } from '../types';
import { useAuth } from '../context/AuthContext';
import { addVoiceCall } from '../services/storage';

interface VoiceCallModalProps {
  providers: Provider[];
  onClose: () => void;
}

interface CallResult {
  provider_number: string;
  provider_name: string;
  status: 'success' | 'failed' | 'no_answer' | 'busy' | 'invalid_number';
  call_id?: string;
  phone: string;
  message?: string;
  appointment_data?: {
    accepting_patients: boolean;
    next_available_date?: string;
    appointment_types?: string[];
    insurance_accepted?: string[];
    wait_time_estimate?: string;
    booking_instructions?: string;
    additional_notes?: string;
  };
  error?: string;
}

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ providers, onClose }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'initiating' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CallResult[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<Provider[]>(providers.slice(0, 6));
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const maxProviders = 6;

  const toggleProviderSelection = (provider: Provider) => {
    setSelectedProviders(prev => {
      const isSelected = prev.some(p => p.number === provider.number);
      if (isSelected) {
        return prev.filter(p => p.number !== provider.number);
      } else if (prev.length < maxProviders) {
        return [...prev, provider];
      }
      return prev;
    });
  };

  const initiateVoiceCalls = async () => {
    if (!user) {
      setError('User not authenticated');
      setStatus('error');
      return;
    }
    
    if (selectedProviders.length === 0) {
      setError('Please select at least one provider');
      setStatus('error');
      return;
    }
    
    setStatus('initiating');
    setError(null);
    setProgress({ current: 0, total: selectedProviders.length });
    
    try {
      // Prepare provider data with phone numbers
      const providerData = selectedProviders.map(provider => {
        const primaryAddress = provider.addresses.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses[0];
        const specialties = provider.taxonomies?.map(tax => tax.desc).slice(0, 3) || [];
        
        return {
          number: provider.number,
          name: provider.basic.organization_name || `${provider.basic.first_name} ${provider.basic.last_name}`,
          phone: primaryAddress?.telephone_number || '',
          specialties,
          address: `${primaryAddress?.city}, ${primaryAddress?.state}` || ''
        };
      });
      
      console.log('Starting voice agent calls for providers:', providerData);
      
      const apiUrl = '/api/voice-agent';
      const requestBody = {
        providers: providerData,
        user_id: user.id,
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('Voice agent response:', data);
      setResults(data.results || []);
      
      // Store successful voice calls in local storage
      if (data.results && Array.isArray(data.results)) {
        for (const result of data.results) {
          try {
            addVoiceCall({
              provider_npi: result.provider_number,
              provider_name: result.provider_name,
              provider_phone: result.phone,
              status: result.status === 'success' ? 'initiated' : 'failed',
              availability_found: result.appointment_data?.accepting_patients || false,
              call_id: result.call_id,
              message: result.message,
              next_available: result.appointment_data?.next_available_date,
              call_duration: undefined, // Will be updated by webhook
            }, user.id);
          } catch (storageError) {
            console.error('Error storing voice call:', storageError);
          }
        }
      }
      
      setStatus('success');
    } catch (err) {
      console.error('Error initiating voice calls:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to initiate calls. Please try again.');
    }
  };

  const getStatusIcon = (result: CallResult) => {
    switch (result.status) {
      case 'success':
        return result.appointment_data?.accepting_patients ? 
          <Check className="w-5 h-5 text-green-500" /> : 
          <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'invalid_number':
        return <X className="w-5 h-5 text-red-500" />;
      case 'no_answer':
      case 'busy':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (result: CallResult) => {
    switch (result.status) {
      case 'success':
        return result.appointment_data?.accepting_patients ? 'Accepting Patients!' : 'Call Completed';
      case 'failed':
        return 'Call Failed';
      case 'no_answer':
        return 'No Answer';
      case 'busy':
        return 'Line Busy';
      case 'invalid_number':
        return 'Invalid Number';
      default:
        return 'Unknown Status';
    }
  };

  const getStatusColor = (result: CallResult) => {
    switch (result.status) {
      case 'success':
        return result.appointment_data?.accepting_patients ? 
          'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50';
      case 'failed':
      case 'invalid_number':
        return 'border-red-200 bg-red-50';
      case 'no_answer':
      case 'busy':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
              <Phone className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Voice Agent Availability Check
              </h3>
              <p className="text-sm text-gray-600">
                Select up to {maxProviders} providers for appointment verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {status === 'idle' && (
            <>
              {/* Provider Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Select Providers</h4>
                  <span className="text-sm text-gray-500">
                    {selectedProviders.length} of {maxProviders} selected
                  </span>
                </div>
                
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {providers.map(provider => {
                    const primaryAddress = provider.addresses.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses[0];
                    const phoneNumber = primaryAddress?.telephone_number;
                    const isSelected = selectedProviders.some(p => p.number === provider.number);
                    const canSelect = selectedProviders.length < maxProviders || isSelected;
                    
                    return (
                      <div
                        key={provider.number}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-primary-300 bg-primary-50' 
                            : canSelect 
                              ? 'border-gray-200 bg-white hover:border-gray-300' 
                              : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                        }`}
                        onClick={() => canSelect && toggleProviderSelection(provider)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <p className="font-medium text-gray-900">
                              {provider.basic.organization_name || 
                                `${provider.basic.first_name} ${provider.basic.last_name}`}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            NPI: {provider.number} • {phoneNumber || 'No phone available'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {primaryAddress?.city}, {primaryAddress?.state}
                          </p>
                        </div>
                        <div className="ml-2">
                          {isSelected ? (
                            <Check size={20} className="text-primary-600" />
                          ) : (
                            <div className={`w-5 h-5 border-2 rounded ${
                              canSelect ? 'border-gray-300' : 'border-gray-200'
                            }`} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={initiateVoiceCalls}
                disabled={selectedProviders.length === 0}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Phone size={20} className="inline mr-2" />
                Start Voice Agent Calls ({selectedProviders.length} providers)
              </button>
            </>
          )}

          {status === 'initiating' && (
            <div className="text-center py-8">
              <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Initiating Voice Agent Calls
              </h4>
              <p className="text-gray-600 mb-4">
                Our AI agent is calling {selectedProviders.length} provider{selectedProviders.length > 1 ? 's' : ''} to check availability...
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> This may take 2-5 minutes per provider as our agent conducts professional inquiries.
                </p>
              </div>
            </div>
          )}

          {status === 'success' && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-medium text-gray-900">Call Results</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  {results.filter(r => r.appointment_data?.accepting_patients).length} accepting patients
                </div>
              </div>

              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={result.provider_number}
                    className={`p-4 border rounded-lg ${getStatusColor(result)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        {getStatusIcon(result)}
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900">
                              {result.provider_name}
                            </p>
                            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                              result.appointment_data?.accepting_patients 
                                ? 'bg-green-100 text-green-700' 
                                : result.status === 'success'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {getStatusText(result)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div>NPI: {result.provider_number}</div>
                            <div>Phone: {result.phone}</div>
                          </div>

                          {result.appointment_data && (
                            <div className="space-y-2">
                              {result.appointment_data.next_available_date && (
                                <div className="flex items-center text-sm text-green-700 bg-green-100 px-3 py-2 rounded">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Next available: {result.appointment_data.next_available_date}
                                </div>
                              )}
                              
                              {result.appointment_data.wait_time_estimate && (
                                <div className="flex items-center text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded">
                                  <Clock className="w-4 h-4 mr-2" />
                                  Wait time: {result.appointment_data.wait_time_estimate}
                                </div>
                              )}

                              {result.appointment_data.insurance_accepted && result.appointment_data.insurance_accepted.length > 0 && (
                                <div className="text-sm text-gray-600">
                                  <strong>Insurance:</strong> {result.appointment_data.insurance_accepted.join(', ')}
                                </div>
                              )}

                              {result.appointment_data.booking_instructions && (
                                <div className="text-sm text-gray-600 italic">
                                  "{result.appointment_data.booking_instructions}"
                                </div>
                              )}
                            </div>
                          )}

                          {result.message && !result.appointment_data && (
                            <div className="text-sm text-gray-600 mt-2">
                              {result.message}
                            </div>
                          )}

                          {result.error && (
                            <div className="text-sm text-red-600 mt-2">
                              Error: {result.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={onClose}
                  className="bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Error Occurred</h4>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setStatus('idle');
                  setError(null);
                }}
                className="bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceCallModal;