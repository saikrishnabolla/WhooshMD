'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Phone, Calendar, Clock, AlertCircle, RefreshCw, Eye, Bell, Trash2 } from 'lucide-react';
import AvailabilityResults from '../components/AvailabilityResults';
import CommunityContributions from '../components/CommunityContributions';
import { getVoiceCalls, LocalVoiceCall, deleteVoiceCall } from '../services/storage';
import { useCallResultsByIds } from '../hooks/useCallResults';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [voiceCalls, setVoiceCalls] = useState<LocalVoiceCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [deletingCalls, setDeletingCalls] = useState<Set<string>>(new Set());
  const voiceCallsRef = useRef<LocalVoiceCall[]>([]);

  // Get call IDs for real-time updates from Supabase
  const callIds = voiceCalls.map(call => call.call_id).filter(Boolean) as string[];
  
  // Use real-time call results from Supabase
  const { callResults: realTimeCallResults, getCallResult } = useCallResultsByIds({
    callIds,
    autoRefresh: true,
    refreshInterval: 5000, // Check every 5 seconds for updates
  });

  const fetchVoiceCalls = useCallback(async () => {
    if (!user) return;
    
    try {
      const calls = getVoiceCalls(user.id);
      setVoiceCalls(calls);
      voiceCallsRef.current = calls;
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Error fetching voice calls:', error);
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVoiceCalls();
    setRefreshing(false);
  };

  const handleDeleteCall = async (callId: string) => {
    if (!user) return;
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this voice call? This action cannot be undone.')) {
      return;
    }
    
    setDeletingCalls(prev => new Set(prev).add(callId));
    
    try {
      const success = deleteVoiceCall(user.id, callId);
      if (success) {
        // Refresh the calls list
        await fetchVoiceCalls();
      } else {
        alert('Failed to delete voice call. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting voice call:', error);
      alert('Failed to delete voice call. Please try again.');
    } finally {
      setDeletingCalls(prev => {
        const newSet = new Set(prev);
        newSet.delete(callId);
        return newSet;
      });
    }
  };

  const handleClearAllCalls = async () => {
    if (!user || voiceCalls.length === 0) return;
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete all ${voiceCalls.length} voice calls? This action cannot be undone.`)) {
      return;
    }
    
    setRefreshing(true);
    
    try {
      const { clearVoiceCalls } = await import('../services/storage');
      clearVoiceCalls(user.id);
      // Refresh the calls list
      await fetchVoiceCalls();
    } catch (error) {
      console.error('Error clearing all voice calls:', error);
      alert('Failed to clear voice calls. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchVoiceCalls();
      setLoading(false);
    };
    
    loadData();
    
    // Set up auto-refresh for active calls (simplified without real-time subscription)
    if (user) {
      // console.log('Setting up auto-refresh for user:', user.id);
      
      // Auto-refresh every 30 seconds for active calls
      const interval = setInterval(() => {
        const hasActiveCalls = voiceCallsRef.current.some(call => 
          call.status === 'initiated' || call.status === 'in_progress'
        );
        
        if (hasActiveCalls) {
          // console.log('Auto-refreshing due to active calls...');
          fetchVoiceCalls();
        }
      }, 30000);

      // Request notification permission
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        // console.log('Cleaning up interval');
        clearInterval(interval);
      };
    }
  }, [user, fetchVoiceCalls]);

  // Merge local voice calls with real-time Supabase data
  const enrichedVoiceCalls = voiceCalls.map(call => {
    const realTimeResult = call.call_id ? getCallResult(call.call_id) : null;
    
    // If we have real-time data from Supabase, use it to update the call status
    if (realTimeResult && realTimeResult.status === 'completed') {
      return {
        ...call,
        status: 'completed',
        availability_found: realTimeResult.availability_status?.toLowerCase().includes('accepting') || 
                           realTimeResult.availability_status?.toLowerCase().includes('available') ||
                           false,
        next_available: realTimeResult.availability_timeframe || realTimeResult.specific_availability || null,
        // Store the full call result for detailed display
        callResult: realTimeResult,
      };
    }
    
    return call;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
      case 'initiated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'initiated':
        return 'Calling...';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'failed':
      case 'error':
        return 'Failed';
      default:
        return status;
    }
  };

  const completedCalls = enrichedVoiceCalls.filter(call => call.status === 'completed');
  const availabilityFound = enrichedVoiceCalls.filter(call => call.availability_found);
  const activeCalls = enrichedVoiceCalls.filter(call => call.status === 'initiated' || call.status === 'in_progress');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <p className="text-sm sm:text-base text-gray-600">
                Welcome back, {user?.email}
              </p>
              {activeCalls.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Bell className="w-3 h-3 mr-1" />
                    {activeCalls.length} active call{activeCalls.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdateTime.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Calls</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{enrichedVoiceCalls.length}</h3>
            </div>
            <Phone className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{completedCalls.length}</h3>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Availability Found</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{availabilityFound.length}</h3>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Calls</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{activeCalls.length}</h3>
            </div>
            <Phone className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Note about current mode */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>Cloud Mode:</strong> AI call verification results are stored securely in the database and synced across all your devices. Call data persists permanently and is available from any browser.
            </p>
          </div>
        </div>
      </div>

      {/* Availability Results Section */}
      {availabilityFound.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Appointments</h2>
            <button
              onClick={() => setShowResults(!showResults)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Eye size={16} />
              {showResults ? 'Hide' : 'Show'} Results
            </button>
          </div>
          
          {showResults && (
            <AvailabilityResults calls={availabilityFound} />
          )}
        </div>
      )}

      {/* Voice Calls History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Voice Calls History</h2>
            {enrichedVoiceCalls.length > 0 && (
              <button
                onClick={handleClearAllCalls}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
                Clear All ({enrichedVoiceCalls.length})
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading calls...</p>
            </div>
          ) : enrichedVoiceCalls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No voice calls yet</h3>
              <p className="text-gray-600 mb-6">
                Start by searching for providers and initiating voice agent calls to check their availability.
              </p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                Find Providers
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {enrichedVoiceCalls.map((call) => {
                const realTimeResult = call.callResult;
                
                return (
                  <div key={call.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {call.provider_name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                            {getStatusText(call.status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>NPI: {call.provider_npi}</p>
                          <p>Phone: {call.provider_phone}</p>
                          {call.message && (
                            <p className="text-blue-600">Message: {call.message}</p>
                          )}
                          {call.call_id && (
                            <p>Call ID: {call.call_id}</p>
                          )}
                          <p>Started: {new Date(call.created_at).toLocaleString()}</p>
                          
                          {/* Show real-time data from Supabase */}
                          {realTimeResult && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-900 mb-2">AI Verification Results:</p>
                              {realTimeResult.availability_status && (
                                <p className="text-sm text-blue-800">
                                  <strong>Status:</strong> {realTimeResult.availability_status}
                                </p>
                              )}
                              {realTimeResult.insurance_accepted && (
                                <p className="text-sm text-blue-800">
                                  <strong>Insurance:</strong> {realTimeResult.insurance_accepted}
                                </p>
                              )}
                              {realTimeResult.appointment_types_available && (
                                <p className="text-sm text-blue-800">
                                  <strong>Appointments:</strong> {realTimeResult.appointment_types_available}
                                </p>
                              )}
                              {realTimeResult.availability_timeframe && (
                                <p className="text-sm text-blue-800">
                                  <strong>Next Available:</strong> {realTimeResult.availability_timeframe}
                                </p>
                              )}
                              {realTimeResult.specific_availability && (
                                <p className="text-sm text-blue-800">
                                  <strong>Hours:</strong> {realTimeResult.specific_availability}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {call.availability_found && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        )}
                        {call.status === 'completed' && !call.availability_found && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            No Availability
                          </span>
                        )}
                        {realTimeResult?.recording_url && (
                          <button
                            onClick={() => window.open(realTimeResult.recording_url, '_blank')}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Listen to call recording"
                          >
                            <Phone size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCall(call.id)}
                          disabled={deletingCalls.has(call.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete voice call"
                        >
                          {deletingCalls.has(call.id) ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {call.next_available && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Next Available: {call.next_available}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Community Contributions Section */}
      <CommunityContributions className="mt-8" />
    </div>
  );
};

export default Dashboard;