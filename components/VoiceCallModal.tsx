'use client'

import React, { useState } from 'react';
import { Phone, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Provider } from '../types';
import { useAuth } from '../context/AuthContext';
import { addVoiceCall } from '../services/storage';

interface VoiceCallModalProps {
  providers: Provider[];
  onClose: () => void;
}

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ providers, onClose }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'initiating' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const initiateVoiceCalls = async () => {
    if (!user) {
      setError('User not authenticated');
      setStatus('error');
      return;
    }
    
    // console.log('Starting voice calls for providers:', providers);
    setStatus('initiating');
    setError(null);
    
    try {
      // Prepare provider data with phone numbers
      const providerData = providers.map(provider => {
        const primaryAddress = provider.addresses.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses[0];
        return {
          number: provider.number,
          name: provider.basic.organization_name || `${provider.basic.first_name} ${provider.basic.last_name}`,
          phone: primaryAddress?.telephone_number || '',
        };
      });
      
      // console.log('Provider data prepared:', providerData);
      
      const apiUrl = '/api/voice-agent';
      // console.log('Making request to:', apiUrl);
      
      const requestBody = {
        providers: providerData,
        user_id: user.id,
      };
      
      // console.log('Request body:', requestBody);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      // console.log('Response status:', response.status);
      // console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      // console.log('Response text:', responseText);
      
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
      
      // console.log('Parsed response data:', data);
      setResults(data.results || []);
      
      // Store successful voice calls in local storage
      if (data.results && Array.isArray(data.results)) {
        for (const result of data.results) {
          if (result.status === 'success') {
            try {
              addVoiceCall({
                provider_npi: result.provider_number,
                provider_name: result.provider_name,
                provider_phone: result.phone,
                status: 'initiated',
                availability_found: false,
                call_id: result.call_id,
                message: result.message,
              }, user.id);
            } catch (storageError) {
              console.error('Error storing voice call:', storageError);
            }
          }
        }
      }
      
      setStatus('success');
      setTimeout(onClose, 3000);
    } catch (err) {
      console.error('Error initiating voice calls:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to initiate calls. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative animate-fade-scale">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-primary-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Voice Agent Availability Check
          </h3>
          
          {status === 'idle' && (
            <p className="text-gray-600 mb-6">
              Our voice agent will call {providers.length} provider{providers.length > 1 ? 's' : ''} to check for available appointments.
            </p>
          )}
          
          {status === 'initiating' && (
            <p className="text-gray-600 mb-6">
              Initiating calls to {providers.length} provider{providers.length > 1 ? 's' : ''}...
            </p>
          )}
          
          {status === 'success' && (
            <div>
              <p className="text-green-600 mb-4">
                Successfully initiated calls! Voice calls are stored locally in your browser.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> In mock mode, calls are simulated for demonstration purposes.
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

          <div className="space-y-4 mb-6">
            {providers.map(provider => {
              const primaryAddress = provider.addresses.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses[0];
              const phoneNumber = primaryAddress?.telephone_number;
              
              return (
                <div key={provider.number} className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">
                      {provider.basic.organization_name || 
                        `${provider.basic.first_name} ${provider.basic.last_name}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      NPI: {provider.number}
                    </p>
                    <p className="text-sm text-gray-500">
                      {phoneNumber || 'No phone number available'}
                    </p>
                  </div>
                  {status === 'success' && results.length > 0 && (
                    <div className="ml-2">
                      {results.find(r => r.provider_number === provider.number)?.status === 'success' ? (
                        <Check size={20} className="text-green-500" />
                      ) : (
                        <AlertCircle size={20} className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {status === 'idle' && (
            <button
              onClick={initiateVoiceCalls}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Phone size={20} className="inline mr-2" />
              Start Voice Agent Calls
            </button>
          )}

          {status === 'initiating' && (
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Setting up voice agent calls...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center text-green-600">
              <Check size={32} className="mx-auto mb-2" />
              <p className="font-medium">Calls initiated successfully!</p>
              <p className="text-sm text-gray-600 mt-2">
                Check your dashboard for call status updates
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