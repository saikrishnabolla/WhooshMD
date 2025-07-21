import { SearchParams, SearchResponse } from '../types';

export async function searchProviders(params: SearchParams): Promise<SearchResponse> {
  // Always ensure version is set to 2.1
  const searchParams = new URLSearchParams();
  
  // Add all defined parameters
  Object.entries({ ...params, version: '2.1' }).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  try {
    const response = await fetch(`/api/npi-search?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data as SearchResponse;
  } catch (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }
}

export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      }
    );
  });
}

// This function would convert coordinates to a postal code using a geocoding service
// For the MVP, we'll implement a simplified version
export async function getPostalCodeFromCoordinates(
  lat: number,
  lng: number
): Promise<string | null> {
  // In a real implementation, this would use a geocoding API
  // For the demo, we'll return a mock postal code
  return '20001'; // Example: Washington DC
}