import { FavoriteProvider, SearchHistoryItem } from '../types';

// Constants for localStorage keys
const getFavoritesKey = (userId: string) => `whoosh_md_favorites_${userId}`;
const getVoiceCallsKey = (userId: string) => `whoosh_md_voice_calls_${userId}`;
const SEARCH_HISTORY_KEY = 'whoosh_md_search_history';
const MAX_HISTORY_ITEMS = 10;

// Voice Call interface for local storage
export interface LocalVoiceCall {
  id: string;
  provider_npi: string;
  provider_name: string;
  provider_phone: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'error';
  call_duration?: string;
  availability_found: boolean;
  next_available?: string;
  created_at: string;
  updated_at: string;
  call_id?: string;
  message?: string;
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