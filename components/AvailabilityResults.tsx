import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare, 
  Stethoscope,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { LocalVoiceCall } from '../services/storage';

interface AvailabilityResultsProps {
  calls: LocalVoiceCall[];
  onClose?: () => void;
}

const AvailabilityResults: React.FC<AvailabilityResultsProps> = ({ calls, onClose }) => {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  
  const completedResults = calls.filter(call => call.status === 'completed');
  const pendingResults = calls.filter(call => call.status === 'initiated' || call.status === 'in_progress');
  const availableProviders = completedResults.filter(call => call.availability_found);
  
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

  const formatAppointmentDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    let dayLabel = '';
    if (date.toDateString() === today.toDateString()) {
      dayLabel = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dayLabel = 'Tomorrow';
    } else {
      dayLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
    
    return { dayLabel, timeLabel: timeStr };
  };

  const toggleProviderExpansion = (providerId: string) => {
    setExpandedProvider(expandedProvider === providerId ? null : providerId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Appointment Availability Results
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Providers</p>
              <p className="text-2xl font-bold text-gray-900">{calls.length}</p>
            </div>
            <Phone className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{availableProviders.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                {calls.length > 0 ? Math.round((availableProviders.length / calls.length) * 100) : 0}%
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Available Providers - Zocdoc Style */}
      {availableProviders.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-500" />
            Providers with Available Appointments ({availableProviders.length})
          </h4>
          
          <div className="space-y-4">
            {availableProviders.map((call) => {
              const isExpanded = expandedProvider === call.id;
              // Parse mock data if available
              const mockData = call.message && call.message.includes('mock_data') ? 
                JSON.parse(call.message.split('mock_data: ')[1] || '{}') : null;
              
              return (
                <div
                  key={call.id}
                  className="bg-white border border-green-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Provider Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {call.provider_name}
                            </h3>
                            <p className="text-sm text-gray-600">NPI: {call.provider_npi}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{call.provider_phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Verified {formatTimeAgo(call.updated_at)}</span>
                          </div>
                        </div>

                        {/* Quick Appointment Slots Preview */}
                        {(call.next_available_slots || mockData?.next_available_slots) && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(call.next_available_slots || mockData?.next_available_slots)?.slice(0, 3).map((slot: { date: string; time: string; appointment_type?: string; duration?: string }, idx: number) => {
                              const { dayLabel, timeLabel } = formatAppointmentDate(slot.date, slot.time);
                              return (
                                <div
                                  key={idx}
                                  className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm"
                                >
                                  <div className="font-medium text-green-800">{dayLabel}</div>
                                  <div className="text-green-600">{timeLabel}</div>
                                </div>
                              );
                            })}
                            {(call.next_available_slots || mockData?.next_available_slots)?.length > 3 && (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center">
                                +{(call.next_available_slots || mockData?.next_available_slots).length - 3} more
                              </div>
                            )}
                          </div>
                        )}

                        {/* Appointment Types */}
                        {(call.appointment_types || mockData?.appointment_types) && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(call.appointment_types || mockData?.appointment_types)?.map((type: string, idx: number) => (
                              <span
                                key={idx}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Available
                        </span>
                        <button
                          onClick={() => toggleProviderExpansion(call.id)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          {isExpanded ? 'Less details' : 'More details'}
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* All Available Slots */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              All Available Slots
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {(call.next_available_slots || mockData?.next_available_slots)?.map((slot: { date: string; time: string; appointment_type?: string; duration?: string }, idx: number) => {
                                const { dayLabel, timeLabel } = formatAppointmentDate(slot.date, slot.time);
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div>
                                      <div className="font-medium text-gray-900">{dayLabel}</div>
                                      <div className="text-sm text-gray-600">{slot.appointment_type}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium text-gray-900">{timeLabel}</div>
                                      {slot.duration && (
                                        <div className="text-sm text-gray-600">{slot.duration}</div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Call Summary */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Call Summary
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-700">
                                {call.call_summary || call.message || 'Successfully verified appointment availability'}
                              </p>
                              {call.call_duration && (
                                <div className="mt-2 text-xs text-gray-500">
                                  Call duration: {call.call_duration}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex gap-3">
                          <button
                            onClick={() => window.open(`tel:${call.provider_phone}`, '_self')}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            Call to Book
                          </button>
                          <button
                            onClick={() => {
                              // Could implement provider detail view or external link
                              alert('Provider directory feature coming soon!');
                            }}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Profile
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Calls */}
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
                    <p className="font-medium text-gray-900">{call.provider_name}</p>
                    <p className="text-sm text-gray-600">NPI: {call.provider_npi}</p>
                    <p className="text-sm text-gray-600">AI agent is checking availability...</p>
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

      {/* Providers without availability */}
      {completedResults.filter(call => !call.availability_found).length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <XCircle className="w-4 h-4 mr-2 text-red-500" />
            No Current Availability ({completedResults.filter(call => !call.availability_found).length})
          </h4>
          <div className="space-y-3">
            {completedResults.filter(call => !call.availability_found).map((call) => (
              <div
                key={call.id}
                className={`p-4 border rounded-lg ${getStatusColor(call)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    {getStatusIcon(call)}
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">
                          {call.provider_name}
                        </p>
                        <span className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">
                          No Availability
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>NPI: {call.provider_npi}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Verified: {formatTimeAgo(call.updated_at)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-red-100 rounded-lg">
                        <div className="flex items-center text-sm text-red-700">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">Not currently accepting new patients</span>
                        </div>
                      </div>

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
              </div>
            ))}
          </div>
        </div>
      )}

      {calls.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No availability checks found</h3>
          <p className="text-gray-600">Start searching for providers and use the AI call feature to check availability.</p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityResults;