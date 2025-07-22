import React from 'react';
import { openInNewTab } from '../lib/utils';
import { Calendar, Clock, Phone, CheckCircle, XCircle, AlertCircle, MessageSquare, FileText, Shield, MapPin, Users, Star, X } from 'lucide-react';
import { LocalVoiceCall } from '../services/storage';

interface AvailabilityResultsProps {
  calls: LocalVoiceCall[];
  onClose?: () => void;
}

const AvailabilityResults: React.FC<AvailabilityResultsProps> = ({ calls, onClose }) => {
  const completedResults = calls.filter(call => call.status === 'completed');
  const pendingResults = calls.filter(call => call.status === 'initiated' || call.status === 'in_progress');
  
  // Group results by availability for better organization
  const acceptingResults = completedResults.filter(call => call.availability_found);
  const notAcceptingResults = completedResults.filter(call => !call.availability_found);
  
  const getStatusIcon = (call: LocalVoiceCall) => {
    if (call.status === 'completed') {
      return call.availability_found ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      );
    }
    return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
  };

  const getStatusText = (call: LocalVoiceCall) => {
    if (call.status === 'completed') {
      return call.availability_found ? 'Accepting New Patients' : 'Not Currently Accepting';
    }
    return 'Checking Availability...';
  };

  const getStatusColor = (call: LocalVoiceCall) => {
    if (call.status === 'completed') {
      return call.availability_found ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
    }
    return 'border-yellow-200 bg-yellow-50';
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const renderProviderCard = (call: LocalVoiceCall, isAccepting: boolean) => (
    <div
      key={call.id}
      className={`p-6 border rounded-lg ${getStatusColor(call)} hover:shadow-md transition-shadow`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start">
          {getStatusIcon(call)}
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-lg">
                {call.provider_name}
              </h3>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                call.availability_found 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {getStatusText(call)}
              </span>
            </div>
            
            {/* Provider Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>NPI: {call.provider_npi}</span>
              </div>
              
              {call.call_duration && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Call duration: {call.call_duration}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Verified: {formatTimeAgo(call.updated_at)}</span>
              </div>

              {call.call_id && (
                <div className="flex items-center text-sm text-gray-500">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Call ID: {call.call_id.substring(0, 8)}...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Appointment Information */}
      {isAccepting && (
        <div className="space-y-3 mb-4">
          {call.next_available && (
            <div className="bg-green-100 border border-green-200 rounded-lg p-4">
              <div className="flex items-center text-green-800 mb-2">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="font-medium">Next Available Appointment</span>
              </div>
              <p className="text-green-700 text-lg font-semibold">{call.next_available}</p>
            </div>
          )}
          
          {!call.next_available && (
            <div className="bg-green-100 border border-green-200 rounded-lg p-4">
              <div className="flex items-center text-green-800">
                <Users className="w-5 h-5 mr-2" />
                <span className="font-medium">Accepting new patients - Call to schedule</span>
              </div>
            </div>
          )}

          {/* Estimated Wait Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center text-blue-700 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-medium">Typical Wait</span>
              </div>
              <p className="text-blue-800 mt-1">2-3 weeks*</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center text-purple-700 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                <span className="font-medium">Insurance</span>
              </div>
              <p className="text-purple-800 mt-1">Call to verify*</p>
            </div>
          </div>
        </div>
      )}

      {/* Not Accepting Information */}
      {!isAccepting && call.status === 'completed' && (
        <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center text-red-800 mb-2">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Not Currently Accepting New Patients</span>
          </div>
          <p className="text-red-700 text-sm">
            Provider may have a waitlist. Consider calling directly for updates.
          </p>
        </div>
      )}

      {/* Call Notes/Message */}
      {call.message && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start text-blue-800">
            <MessageSquare className="w-4 h-4 mr-2 mt-0.5" />
            <div>
              <span className="font-medium text-sm">Call Notes:</span>
              <p className="text-blue-700 text-sm mt-1">{call.message}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-1" />
            Voice verified
          </div>
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Real-time data
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (call.provider_phone) {
                window.location.href = `tel:${call.provider_phone}`;
              }
            }}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium px-3 py-1 rounded border border-primary-300 hover:border-primary-400 transition-colors"
          >
            Call Now
          </button>
          
          <button
            onClick={() => {
              // Could implement a modal to show full call transcript
              alert('Call transcript feature coming soon!');
            }}
            className="text-gray-600 hover:text-gray-700 text-sm font-medium px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Appointment Availability Results
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Real-time verification via voice agent calls
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Summary Stats */}
      {calls.length > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">{calls.length}</div>
              <div className="text-xs text-gray-600">Total Checked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{acceptingResults.length}</div>
              <div className="text-xs text-gray-600">Accepting Patients</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{pendingResults.length}</div>
              <div className="text-xs text-gray-600">Still Checking</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {calls.length > 0 ? Math.round((acceptingResults.length / calls.length) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Calls in Progress */}
      {pendingResults.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-yellow-500" />
            Verification in Progress ({pendingResults.length})
          </h4>
          <div className="space-y-3">
            {pendingResults.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
              >
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-500 animate-spin mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{call.provider_name}</p>
                    <p className="text-sm text-gray-600">
                      NPI: {call.provider_npi} • Our voice agent is calling to verify availability...
                    </p>
                  </div>
                </div>
                <div className="text-sm text-yellow-600">
                  {formatTimeAgo(call.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accepting Patients Section */}
      {acceptingResults.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-green-700 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Accepting New Patients ({acceptingResults.length})
          </h4>
          <div className="space-y-4">
            {acceptingResults.map((call) => renderProviderCard(call, true))}
          </div>
        </div>
      )}

      {/* Not Accepting Patients Section */}
      {notAcceptingResults.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-red-700 mb-4 flex items-center">
            <XCircle className="w-5 h-5 mr-2 text-red-500" />
            Currently Not Accepting ({notAcceptingResults.length})
          </h4>
          <div className="space-y-4">
            {notAcceptingResults.map((call) => renderProviderCard(call, false))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {calls.length === 0 && (
        <div className="text-center py-12">
          <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Availability Checks Found</h3>
          <p className="text-gray-600 mb-6">
            Start searching for providers and use the voice agent to check real-time availability.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-700 text-sm">
              <strong>Tip:</strong> Our voice agent calls providers directly to get the most up-to-date 
              appointment availability, just like GoodRx but with real-time verification!
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {calls.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600">
            * Information gathered through voice verification calls. Availability may change. 
            Always confirm details when booking your appointment.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityResults;