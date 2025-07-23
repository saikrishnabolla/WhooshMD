'use client'

import React, { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import ProviderCard from '../components/ProviderCard';
import ProviderDetail from '../components/ProviderDetail';
import { Provider, FavoriteProvider } from '../types';
import { getFavorites, removeFavorite } from '../services/storage';
import { Link } from '../components/ui/Link';
import { useAuth } from '../context/AuthContext';
import AuthUI from '../components/AuthUI';

const Favorites: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  useEffect(() => {
    if (user) {
      setFavorites(getFavorites(user.id));
    }
  }, [user]);

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

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(user?.id || '', id);
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <Heart size={24} className="text-red-500" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Favorite Providers</h1>
      </div>
      
      {favorites.length === 0 ? (
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