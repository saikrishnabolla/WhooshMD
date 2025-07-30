'use client'

import React, { useState } from 'react';
import { Phone, X, Check, AlertCircle, Loader2, Users } from 'lucide-react';
import { Provider } from '../types';
import { useAuth } from '../context/AuthContext';
import { addVoiceCall } from '../services/storage';

interface PreCallData {
  patient_name: string;
  insurance_type: string;
  preferred_date: string;
  appointment_type: string;
  urgency: string;
}

interface VoiceCallModalProps {
  providers: Provider[];
  preCallData: PreCallData | null;
  onClose: () => void;
}

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ providers, preCallData, onClose }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'initiating' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    provider_number: string;
    provider_name: string;
    status: string;
    call_id?: string;
    phone?: string;
    original_phone?: string;
    message?: string;
    error?: string;
  }[]>([]);
  const [currentCallProgress, setCurrentCallProgress] = useState<{
    current: number;
    total: number;
    currentProvider?: string;
  }>({ current: 0, total: 0 });

  // Limit to 6 providers max
  const limitedProviders = providers.slice(0, 6);
  const maxProviders = 6;

  const initiateVoiceCalls = async () => {
    if (!user) {
      setError('User not authenticated');
      setStatus('error');
      return;
    }
    
    setStatus('initiating');
    setError(null);
    setCurrentCallProgress({ current: 0, total: limitedProviders.length });
    
    try {
      // Prepare provider data with phone numbers
      const providerData = limitedProviders.map(provider => {
        const primaryAddress = provider.addresses.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses[0];
        return {
          number: provider.number,
          name: provider.basic.organization_name || `${provider.basic.first_name} ${provider.basic.last_name}`,
          phone: primaryAddress?.telephone_number || '',
        };
      });
      
      const apiUrl = '/api/make-calls';
      
      const requestBody = {
        providers: providerData.map(p => ({
          number: p.number,
          name: p.name,
          specialties: 'General Healthcare'
        })),
        user_id: user.id,
        pre_call_data: preCallData ? {
          patient_name: preCallData.patient_name,
          insurance_type: preCallData.insurance_type,
          preferred_date: preCallData.preferred_date,
          appointment_type: preCallData.appointment_type,
          urgency: preCallData.urgency
        } : null
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
      
      setResults(data.results || []);
      
      // Store successful calls - will transition to Supabase
      if (data.results && Array.isArray(data.results)) {
        for (const result of data.results) {
          if (result.status === 'success') {
            try {
              addVoiceCall({
                provider_npi: result.provider_number,
                provider_name: result.provider_name,
                provider_phone: '+16175712439', // Test number
                status: 'initiated',
                availability_found: false,
                call_id: result.call_id,
                dispatch_timestamp: result.dispatch_timestamp,
                message: result.message,
              }, user.id);
            } catch (storageError) {
              console.error('Error storing call:', storageError);
            }
          }
        }
      }
      
      setStatus('success');
      setTimeout(onClose, 4000);
    } catch (err) {
      console.error('Error initiating voice calls:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to initiate calls. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-scale">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-primary-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              AI Appointment Verification
            </h3>
            
            {limitedProviders.length < providers.length && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-amber-600 mr-2" />
                  <span className="text-sm text-amber-700">
                    Limited to {maxProviders} providers per batch. {providers.length - limitedProviders.length} providers will be excluded.
                  </span>
                </div>
              </div>
            )}
            
            {status === 'idle' && (
              <div>
                <p className="text-gray-600 mb-4">
                  Our AI agent will call {limitedProviders.length} provider{limitedProviders.length > 1 ? 's' : ''} to verify appointment availability in real-time.
                </p>

                {/* Display collected pre-call information */}
                {preCallData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-green-900 mb-2">Search Details:</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <div><strong>Patient:</strong> {preCallData.patient_name}</div>
                      <div><strong>Appointment Type:</strong> {preCallData.appointment_type}</div>
                      {preCallData.insurance_type && (
                        <div><strong>Insurance:</strong> {preCallData.insurance_type}</div>
                      )}
                      {preCallData.preferred_date && (
                        <div><strong>Preferred Timeframe:</strong> {preCallData.preferred_date}</div>
                      )}
                      <div><strong>Urgency:</strong> {preCallData.urgency}</div>
                    </div>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-700 space-y-1 text-left">
                    <li>• AI agent calls each provider&apos;s office</li>
                    <li>• Asks about {preCallData?.appointment_type || 'appointment'} availability{preCallData?.preferred_date ? ` for ${preCallData.preferred_date.toLowerCase()}` : ''}</li>
                    {preCallData?.insurance_type && (
                      <li>• Verifies {preCallData.insurance_type} acceptance</li>
                    )}
                    <li>• Records available appointment slots and types</li>
                    <li>• Provides you with a detailed availability report</li>
                  </ul>
                </div>
              </div>
            )}
            
            {status === 'initiating' && (
              <div>
                <p className="text-gray-600 mb-4">
                  Calling providers to verify appointment availability...
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Phone className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-700">
                      AI agent is active
                    </span>
                  </div>
                  <div className="text-xs text-blue-600">
                    Dispatching calls to {currentCallProgress.total} providers
                  </div>
                </div>
              </div>
            )}
            
            {status === 'success' && (
              <div>
                <p className="text-green-600 mb-4">
                  Successfully initiated appointment verification calls!
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-green-700">
                      {results.filter(r => r.status === 'success').length} calls initiated successfully
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-700">
                    <strong>What&apos;s next:</strong> Check your dashboard in a few minutes for availability results. You&apos;ll see detailed appointment slots and provider information.
                  </p>
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mb-6">
                <p className="text-red-600 mb-2">Error occurred:</p>
                <p className="text-sm text-gray-600 bg-red-50 p-3 rounded border">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Provider List */}
          <div className="space-y-3 mb-6">
            <h4 className="font-medium text-gray-700 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Providers to Contact ({limitedProviders.length})
            </h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {limitedProviders.map((provider, index) => {
                const primaryAddress = provider.addresses.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses[0];
                const phoneNumber = primaryAddress?.telephone_number;
                const result = results.find(r => r.provider_number === provider.number);
                
                return (
                  <div key={provider.number} className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 text-sm">
                        {provider.basic.organization_name || 
                          `${provider.basic.first_name} ${provider.basic.last_name}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        NPI: {provider.number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {phoneNumber || 'No phone number available'}
                      </p>
                    </div>
                    <div className="ml-2">
                      {status === 'initiating' && index <= currentCallProgress.current && (
                        <Loader2 size={16} className="text-blue-500 animate-spin" />
                      )}
                      {status === 'success' && result && (
                        result.status === 'success' ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <AlertCircle size={16} className="text-red-500" />
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          {status === 'idle' && (
                          <button
                onClick={initiateVoiceCalls}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <Phone size={20} className="inline mr-2" />
                Start AI Appointment Verification
              </button>
          )}

          {status === 'initiating' && (
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Dispatching AI calls...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(currentCallProgress.current / currentCallProgress.total) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <Check size={32} className="mx-auto mb-2 text-green-500" />
              <p className="font-medium text-green-600">Calls initiated successfully!</p>
              <p className="text-sm text-gray-600 mt-2">
                Redirecting to dashboard for real-time updates...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <AlertCircle size={32} className="mx-auto mb-2 text-red-500" />
              <button
                onClick={initiateVoiceCalls}
                className="mt-4 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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