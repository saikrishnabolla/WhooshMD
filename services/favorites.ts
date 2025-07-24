import { FavoriteProvider } from '../types';
import { supabase } from '../lib/supabase';

export interface DatabaseFavorite {
  id: string;
  user_id: string;
  provider_npi: string;
  provider_data: FavoriteProvider;
  created_at: string;
  updated_at: string;
}

// Get all favorites for a user from Supabase
export const getFavorites = async (userId: string): Promise<FavoriteProvider[]> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('provider_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites from Supabase:', error);
      return [];
    }

    return data?.map(item => item.provider_data) || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

// Add a favorite to Supabase
export const addFavorite = async (provider: FavoriteProvider, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        provider_npi: provider.id,
        provider_data: provider
      });

    if (error) {
      // Check if it's a unique constraint violation (favorite already exists)
      if (error.code === '23505') {
        console.log('Favorite already exists');
        return true;
      }
      console.error('Error adding favorite to Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
};

// Remove a favorite from Supabase
export const removeFavorite = async (userId: string, providerId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('provider_npi', providerId);

    if (error) {
      console.error('Error removing favorite from Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};

// Check if a provider is favorited by a user
export const isFavorite = async (userId: string, providerId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('provider_npi', providerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, not a favorite
        return false;
      }
      console.error('Error checking favorite status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

// Get favorites count for a user
export const getFavoritesCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting favorites count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting favorites count:', error);
    return 0;
  }
};

// Sync localStorage favorites to Supabase (migration helper)
export const syncLocalStorageToSupabase = async (userId: string): Promise<void> => {
  try {
    // Get localStorage favorites
    const localStorageKey = `whoosh_md_favorites_${userId}`;
    const localFavorites = localStorage.getItem(localStorageKey);
    
    if (!localFavorites) {
      return;
    }

    const favorites: FavoriteProvider[] = JSON.parse(localFavorites);
    
    // Add each favorite to Supabase
    for (const favorite of favorites) {
      await addFavorite(favorite, userId);
    }

    // Clear localStorage after successful sync
    localStorage.removeItem(localStorageKey);
    console.log('Successfully synced localStorage favorites to Supabase');
  } catch (error) {
    console.error('Error syncing localStorage to Supabase:', error);
  }
};