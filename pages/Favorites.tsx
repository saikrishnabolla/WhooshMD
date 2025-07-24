'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Trash2, Loader2 } from 'lucide-react';
import ProviderCard from '../components/ProviderCard';
import ProviderDetail from '../components/ProviderDetail';
import { Provider, FavoriteProvider } from '../types';
import { ProviderSummary } from '../types/community';
import { getFavorites, removeFavorite, syncLocalStorageToSupabase } from '../services/favorites';
import { Link } from '../components/ui/Link';
import { useAuth } from '../context/AuthContext';
import AuthUI from '../components/AuthUI';
import communityService from '../services/community';

const Favorites: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [communitySummaries, setCommunitySummaries] = useState<Record<string, ProviderSummary>>({});

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Sync any existing localStorage favorites first
      await syncLocalStorageToSupabase(user.id);
      
      // Load favorites from Supabase
      const userFavorites = await getFavorites(user.id);
      setFavorites(userFavorites);
      
      // Load community summaries for each favorite
      const summaries: Record<string, ProviderSummary> = {};
      for (const favorite of userFavorites) {
        try {
          const summary = await communityService.community.getProviderSummary(favorite.provider.number);
          if (summary) {
            summaries[favorite.provider.number] = summary;
          }
        } catch (err) {
          console.error(`Error loading community summary for provider ${favorite.provider.number}:`, err);
        }
      }
      setCommunitySummaries(summaries);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Sign in to view favorites</h1>
        <AuthUI />
      </div>
    );
  }

  const handleViewDetails = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const handleCloseDetails = () => {
    setSelectedProvider(null);
  };

  const handleRemoveFavorite = async (id: string) => {
    if (!user) return;
    
    try {
      const success = await removeFavorite(user.id, id);
      if (success) {
        setFavorites(favorites.filter(fav => fav.id !== id));
      } else {
        setError('Failed to remove favorite. Please try again.');
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove favorite. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <Heart size={24} className="text-red-500" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Favorite Providers</h1>
        {loading && <Loader2 size={20} className="animate-spin text-gray-500" />}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button 
            onClick={loadFavorites} 
            className="mt-2 text-red-800 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={32} className="animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading favorites...</span>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <Heart size={48} className="text-gray-300" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No favorites yet</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            When you find providers you want to save, click the heart icon to add them to your favorites.
          </p>
          <Link 
            href="/search" 
            className="inline-flex items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            Find Providers
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
            <p className="text-sm sm:text-base text-gray-600">
              {favorites.length} {favorites.length === 1 ? 'provider' : 'providers'} saved
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {favorites.map(favorite => (
              <div key={favorite.id} className="relative group">
                <ProviderCard 
                  provider={favorite.provider} 
                  onViewDetails={handleViewDetails}
                  communitySummary={communitySummaries[favorite.provider.number] || null}
                  showSelectionCheckbox={false}
                />
                <button
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  aria-label="Remove from favorites"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedProvider && (
        <ProviderDetail 
          provider={selectedProvider} 
          onClose={handleCloseDetails} 
        />
      )}
    </div>
  );
};

export default Favorites;