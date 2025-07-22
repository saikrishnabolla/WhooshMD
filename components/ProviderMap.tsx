'use client'

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Provider } from '../types';
import { MapPin, Loader2 } from 'lucide-react';

// Dynamically import the Map component to avoid SSR issues
const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-2xl flex items-center justify-center h-[400px]">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

interface ProviderMapProps {
  providers: Provider[];
  onProviderSelect: (provider: Provider) => void;
  className?: string;
}

const ProviderMap: React.FC<ProviderMapProps> = ({ 
  providers, 
  onProviderSelect, 
  className = '' 
}) => {
  const [coordinates, setCoordinates] = useState<Array<{
    provider: Provider;
    lat: number;
    lng: number;
  }>>([]);
  const [isClient, setIsClient] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Geocoding function to get coordinates from address
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Using Nominatim (OpenStreetMap) free geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  useEffect(() => {
    const geocodeProviders = async () => {
      if (providers.length === 0) return;
      
      setIsGeocoding(true);
      setGeocodingProgress({ current: 0, total: providers.length });
      
      const geocodedProviders: Array<{
        provider: Provider;
        lat: number;
        lng: number;
      }> = [];

      for (let i = 0; i < providers.length; i++) {
        const provider = providers[i];
        setGeocodingProgress({ current: i + 1, total: providers.length });
        
        const primaryAddress = provider.addresses.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses[0];
        if (primaryAddress) {
          const fullAddress = `${primaryAddress.address_1}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postal_code}`;
          const coords = await geocodeAddress(fullAddress);
          
          if (coords) {
            geocodedProviders.push({
              provider,
              lat: coords.lat,
              lng: coords.lng
            });
          }
        }
        
        // Add a small delay to be respectful to the free geocoding service
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setCoordinates(geocodedProviders);
      setIsGeocoding(false);
    };

    if (providers.length > 0) {
      geocodeProviders();
    } else {
      setCoordinates([]);
      setIsGeocoding(false);
    }
  }, [providers]);



  if (!isClient) {
    return (
      <div className={`bg-gray-100 rounded-2xl flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  if (isGeocoding) {
    return (
      <div className={`bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Mapping Provider Locations</h3>
          <p className="text-gray-500 mb-3">
            Processing {geocodingProgress.current} of {geocodingProgress.total} providers...
          </p>
          <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(geocodingProgress.current / geocodingProgress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (coordinates.length === 0 && providers.length > 0) {
    return (
      <div className={`bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Map Locations</h3>
          <p className="text-gray-500">
            Couldn't determine geographic coordinates for the provider addresses.
            Please use the grid view to see provider details.
          </p>
        </div>
      </div>
    );
  }

  if (coordinates.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map View</h3>
          <p className="text-gray-500">Provider locations will appear here once search results are loaded</p>
        </div>
      </div>
    );
  }

  return (
    <DynamicMap
      coordinates={coordinates}
      onProviderSelect={onProviderSelect}
      className={className}
    />
  );
};

export default ProviderMap;