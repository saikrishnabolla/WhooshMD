import React from 'react';
import { openInNewTab } from '../lib/utils';
import { Calendar, Clock, Phone, CheckCircle, XCircle, AlertCircle, MessageSquare, FileText } from 'lucide-react';
import { LocalVoiceCall } from '../services/storage';

interface AvailabilityResultsProps {
  calls: LocalVoiceCall[];
  onClose?: () => void;
}

const AvailabilityResults: React.FC<AvailabilityResultsProps> = ({ calls, onClose }) => {
  const completedResults = calls.filter(call => call.status === 'completed');
  const pendingResults = calls.filter(call => call.status === 'initiated' || call.status === 'in_progress');
  
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
      return call.availability_found ? 'Availability Found!' : 'No Availability';
    }
    return 'Checking...';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Availability Check Results
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {pendingResults.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-yellow-500" />
            Calls in Progress ({pendingResults.length})
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
                    <p className="font-medium text-gray-900">Provider: {call.provider_name}</p>
                    <p className="text-sm text-gray-600">NPI: {call.provider_npi}</p>
                    <p className="text-sm text-gray-600">Voice agent is calling to check availability...</p>
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

      {completedResults.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            Completed Calls ({completedResults.length})
          </h4>
          <div className="space-y-4">
            {completedResults.map((call) => (
              <div
                key={call.id}
                className={`p-6 border rounded-lg ${getStatusColor(call)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    {getStatusIcon(call)}
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">
                          Provider: {call.provider_name}
                        </p>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                          call.availability_found 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {getStatusText(call)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>NPI: {call.provider_npi}</span>
                        </div>
                        
                        {call.call_duration && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Duration: {call.call_duration}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Completed: {formatTimeAgo(call.updated_at)}</span>
                        </div>

                        {call.call_id && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>Call ID: {call.call_id}</span>
                          </div>
                        )}
                      </div>
                      
                      {call.availability_found && call.next_available && (
                        <div className="mt-3 p-3 bg-green-100 rounded-lg">
                          <div className="flex items-center text-sm text-green-700">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="font-medium">Next Available: {call.next_available}</span>
                          </div>
                        </div>
                      )}
                      
                      {call.availability_found && !call.next_available && (
                        <div className="mt-3 p-3 bg-green-100 rounded-lg">
                          <div className="flex items-center text-sm text-green-700">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="font-medium">Accepting new patients - call to schedule</span>
                          </div>
                        </div>
                      )}
                      
                      {!call.availability_found && call.status === 'completed' && (
                        <div className="mt-3 p-3 bg-red-100 rounded-lg">
                          <div className="flex items-center text-sm text-red-700">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <span className="font-medium">Not currently accepting new patients</span>
                          </div>
                        </div>
                      )}

                      {call.message && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center text-sm text-blue-700">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            <span>{call.message}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action buttons for viewing details */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MessageSquare className="w-4 h-4" />
                    Call recordings available in voice agent dashboard
                  </div>
                  
                  <button
                    onClick={() => {
                      // Could implement a modal to show full details
                      alert('Call details feature coming soon!');
                    }}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Full Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {calls.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No availability checks found</h3>
          <p className="text-gray-600">Start searching for providers and use the voice agent call feature to check availability.</p>
        </div>
      )}

      {/* Summary Stats */}
      {calls.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{calls.length}</div>
              <div className="text-xs text-gray-600">Total Calls</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{completedResults.length}</div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {calls.filter((call: LocalVoiceCall) => call.availability_found).length}
              </div>
              <div className="text-xs text-gray-600">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {calls.length > 0 ? Math.round((calls.filter((call: LocalVoiceCall) => call.availability_found).length / calls.length) * 100) : 0}%
              </div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityResults;