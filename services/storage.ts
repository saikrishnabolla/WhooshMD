import { FavoriteProvider, SearchHistoryItem, AppointmentSlot } from '../types';

// Constants for localStorage keys
const getFavoritesKey = (userId: string) => `whoosh_md_favorites_${userId}`;
const getVoiceCallsKey = (userId: string) => `whoosh_md_voice_calls_${userId}`;
const SEARCH_HISTORY_KEY = 'whoosh_md_search_history';
const MAX_HISTORY_ITEMS = 10;

// Enhanced Voice Call interface for local storage with appointment data
export interface LocalVoiceCall {
  id: string;
  provider_npi: string;
  provider_name: string;
  provider_phone: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'error';
  call_duration?: string;
  availability_found: boolean;
  next_available?: string; // Legacy field for backward compatibility
  next_available_slots?: AppointmentSlot[]; // New enhanced slot data
  appointment_types?: string[];
  accepting_new_patients?: boolean;
  office_hours?: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  special_notes?: string;
  call_summary?: string;
  transcript?: string;
  created_at: string;
  updated_at: string;
  call_id?: string;
  message?: string;
  appointment_type_requested?: string; // What type was requested
  verified_at?: string;
  dispatch_timestamp?: number; // Omnidim dispatch timestamp for webhook correlation
}

// Voice Calls management
export const getVoiceCalls = (userId: string): LocalVoiceCall[] => {
  try {
    const calls = localStorage.getItem(getVoiceCallsKey(userId));
    return calls ? JSON.parse(calls) : [];
  } catch (error) {
    console.error('Error retrieving voice calls:', error);
    return [];
  }
};

export const addVoiceCall = (call: Omit<LocalVoiceCall, 'id' | 'created_at' | 'updated_at'>, userId: string): LocalVoiceCall => {
  try {
    const calls = getVoiceCalls(userId);
    const newCall: LocalVoiceCall = {
      ...call,
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
    };
    
    const updatedCalls = [newCall, ...calls];
    localStorage.setItem(getVoiceCallsKey(userId), JSON.stringify(updatedCalls));
    return newCall;
  } catch (error) {
    console.error('Error adding voice call:', error);
    throw error;
  }
};

export const updateVoiceCall = (userId: string, callId: string, updates: Partial<LocalVoiceCall>): LocalVoiceCall | null => {
  try {
    const calls = getVoiceCalls(userId);
    const callIndex = calls.findIndex(call => call.id === callId);
    
    if (callIndex === -1) {
      console.error('Voice call not found:', callId);
      return null;
    }
    
    const updatedCall = {
      ...calls[callIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    calls[callIndex] = updatedCall;
    localStorage.setItem(getVoiceCallsKey(userId), JSON.stringify(calls));
    return updatedCall;
  } catch (error) {
    console.error('Error updating voice call:', error);
    return null;
  }
};

// Enhanced method to update call with appointment data
export const updateVoiceCallWithAvailability = (
  userId: string, 
  callId: string, 
  availabilityData: {
    availability_found: boolean;
    accepting_new_patients?: boolean;
    next_available_slots?: AppointmentSlot[];
    appointment_types?: string[];
    special_notes?: string;
    call_duration?: string;
    call_summary?: string;
    transcript?: string;
  }
): LocalVoiceCall | null => {
  return updateVoiceCall(userId, callId, {
    ...availabilityData,
    status: 'completed',
  });
};

// Get calls by status
export const getVoiceCallsByStatus = (userId: string, status: LocalVoiceCall['status']): LocalVoiceCall[] => {
  try {
    const calls = getVoiceCalls(userId);
    return calls.filter(call => call.status === status);
  } catch (error) {
    console.error('Error retrieving voice calls by status:', error);
    return [];
  }
};

// Get available providers (calls with availability found)
export const getAvailableProviders = (userId: string): LocalVoiceCall[] => {
  try {
    const calls = getVoiceCalls(userId);
    return calls.filter(call => call.availability_found && call.status === 'completed');
  } catch (error) {
    console.error('Error retrieving available providers:', error);
    return [];
  }
};

// Get providers by appointment type
export const getProvidersByAppointmentType = (userId: string, appointmentType: string): LocalVoiceCall[] => {
  try {
    const calls = getVoiceCalls(userId);
    return calls.filter(call => 
      call.availability_found && 
      call.appointment_types?.some(type => 
        type.toLowerCase().includes(appointmentType.toLowerCase())
      )
    );
  } catch (error) {
    console.error('Error retrieving providers by appointment type:', error);
    return [];
  }
};

// Get next available appointment across all providers
export const getNextAvailableAppointment = (userId: string): {
  provider: LocalVoiceCall;
  slot: AppointmentSlot;
} | null => {
  try {
    const availableProviders = getAvailableProviders(userId);
    let nextSlot: { provider: LocalVoiceCall; slot: AppointmentSlot; date: Date } | null = null;

    for (const provider of availableProviders) {
      if (provider.next_available_slots) {
        for (const slot of provider.next_available_slots) {
          const slotDate = new Date(`${slot.date}T${slot.time}`);
          if (!nextSlot || slotDate < nextSlot.date) {
            nextSlot = { provider, slot, date: slotDate };
          }
        }
      }
    }

    return nextSlot ? { provider: nextSlot.provider, slot: nextSlot.slot } : null;
  } catch (error) {
    console.error('Error getting next available appointment:', error);
    return null;
  }
};

// Get appointment statistics
export const getAppointmentStats = (userId: string) => {
  try {
    const calls = getVoiceCalls(userId);
    const completedCalls = calls.filter(call => call.status === 'completed');
    const availableProviders = calls.filter(call => call.availability_found);
    
    const totalSlots = availableProviders.reduce((total, provider) => {
      return total + (provider.next_available_slots?.length || 0);
    }, 0);

    const appointmentTypes = new Set<string>();
    availableProviders.forEach(provider => {
      provider.appointment_types?.forEach(type => appointmentTypes.add(type));
    });

    return {
      total_calls: calls.length,
      completed_calls: completedCalls.length,
      available_providers: availableProviders.length,
      success_rate: calls.length > 0 ? Math.round((availableProviders.length / calls.length) * 100) : 0,
      total_available_slots: totalSlots,
      unique_appointment_types: Array.from(appointmentTypes),
      last_update: calls.length > 0 ? Math.max(...calls.map(call => new Date(call.updated_at).getTime())) : null
    };
  } catch (error) {
    console.error('Error calculating appointment stats:', error);
    return {
      total_calls: 0,
      completed_calls: 0,
      available_providers: 0,
      success_rate: 0,
      total_available_slots: 0,
      unique_appointment_types: [],
      last_update: null
    };
  }
};

export const clearVoiceCalls = (userId: string): void => {
  try {
    localStorage.removeItem(getVoiceCallsKey(userId));
  } catch (error) {
    console.error('Error clearing voice calls:', error);
  }
};

// Favorites management
export const getFavorites = (userId: string): FavoriteProvider[] => {
  try {
    const favorites = localStorage.getItem(getFavoritesKey(userId));
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error retrieving favorites:', error);
    return [];
  }
};

export const addFavorite = (provider: FavoriteProvider, userId: string): void => {
  try {
    const favorites = getFavorites(userId);
    // Check if already exists
    if (!favorites.some(fav => fav.id === provider.id)) {
      const updatedFavorites = [...favorites, provider];
      localStorage.setItem(getFavoritesKey(userId), JSON.stringify(updatedFavorites));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
};

export const removeFavorite = (userId: string, id: string): void => {
  try {
    const favorites = getFavorites(userId);
    const updatedFavorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem(getFavoritesKey(userId), JSON.stringify(updatedFavorites));
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
};

export const isFavorite = (userId: string, id: string): boolean => {
  try {
    const favorites = getFavorites(userId);
    return favorites.some(fav => fav.id === id);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Search history management
export const getSearchHistory = (): SearchHistoryItem[] => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error retrieving search history:', error);
    return [];
  }
};

export const addSearchHistory = (item: SearchHistoryItem): void => {
  try {
    const history = getSearchHistory();
    // Remove if already exists
    const filteredHistory = history.filter(h => h.id !== item.id);
    // Add new item at the beginning
    const updatedHistory = [item, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error adding search history:', error);
  }
};

export const clearSearchHistory = (): void => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};