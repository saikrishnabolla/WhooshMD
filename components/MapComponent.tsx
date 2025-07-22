'use client'

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Provider } from '../types';
import { Phone, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  coordinates: Array<{
    provider: Provider;
    lat: number;
    lng: number;
  }>;
  onProviderSelect: (provider: Provider) => void;
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ coordinates, onProviderSelect, className = '' }) => {
  const getProviderName = (provider: Provider) => {
    if (provider.enumeration_type === 'NPI-2') {
      return provider.basic.organization_name;
    } else {
      const { first_name, last_name, credential } = provider.basic;
      return `${first_name} ${last_name}${credential ? `, ${credential}` : ''}`;
    }
  };

  const getPrimaryAddress = (provider: Provider) => {
    return provider.addresses.find(addr => addr.address_purpose === 'LOCATION') || provider.addresses[0];
  };

  const getPrimaryTaxonomy = (provider: Provider) => {
    return provider.taxonomies.find(tax => tax.primary) || provider.taxonomies[0];
  };

  // Calculate center of map based on provider locations
  const getMapCenter = (): [number, number] => {
    if (coordinates.length === 0) {
      return [39.8283, -98.5795]; // Center of US
    }
    
    if (coordinates.length === 1) {
      return [coordinates[0].lat, coordinates[0].lng];
    }

    const avgLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0) / coordinates.length;
    const avgLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0) / coordinates.length;
    
    return [avgLat, avgLng];
  };

  // Calculate appropriate zoom level
  const getZoomLevel = (): number => {
    if (coordinates.length <= 1) return 12;
    
    const lats = coordinates.map(c => c.lat);
    const lngs = coordinates.map(c => c.lng);
    
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);
    
    if (maxRange > 10) return 5;
    if (maxRange > 5) return 7;
    if (maxRange > 2) return 9;
    if (maxRange > 1) return 10;
    if (maxRange > 0.5) return 11;
    return 12;
  };

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg border border-gray-200 ${className}`}>
      <MapContainer
        center={getMapCenter()}
        zoom={getZoomLevel()}
        className="w-full h-full min-h-[400px]"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {coordinates.map(({ provider, lat, lng }) => {
          const primaryAddress = getPrimaryAddress(provider);
          const primaryTaxonomy = getPrimaryTaxonomy(provider);
          
          return (
            <Marker key={provider.number} position={[lat, lng]}>
              <Popup className="provider-popup">
                <div className="max-w-xs">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                    {getProviderName(provider)}
                  </h3>
                  
                  {primaryTaxonomy && (
                    <p className="text-xs text-gray-600 mb-2">
                      {primaryTaxonomy.desc}
                    </p>
                  )}
                  
                  {primaryAddress && (
                    <div className="text-xs text-gray-700 mb-3">
                      <div>{primaryAddress.address_1}</div>
                      {primaryAddress.address_2 && <div>{primaryAddress.address_2}</div>}
                      <div>
                        {primaryAddress.city}, {primaryAddress.state} {primaryAddress.postal_code}
                      </div>
                      {primaryAddress.telephone_number && (
                        <div className="flex items-center mt-1 text-primary-600">
                          <Phone size={12} className="mr-1" />
                          {primaryAddress.telephone_number}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={() => onProviderSelect(provider)}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors"
                  >
                    View Details
                    <ExternalLink size={12} />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;