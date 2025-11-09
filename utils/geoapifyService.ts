const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
const BASE_URL = 'https://api.geoapify.com/v2';

export interface GeoapifyPlace {
  place_id: string;
  name: string;
  formatted: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  country?: string;
  lat: number;
  lon: number;
  categories?: string[];
  distance?: number;
}

export interface SearchParams {
  text?: string;
  lat?: number;
  lon?: number;
  radius?: number; // in meters
  categories?: string[];
  limit?: number;
}

export interface LocationShareData {
  latitude: number;
  longitude: number;
  address?: string;
  placeName?: string;
  timestamp: number;
}

/**
 * Get map tile URL for Geoapify
 */
export function getGeoapifyTileUrl(z: number, x: number, y: number): string {
  return `https://maps.geoapify.com/v1/tile/carto/${z}/${x}/${y}.png?&apiKey=${GEOAPIFY_API_KEY}`;
}

/**
 * Search for places by text and optional location/radius
 */
export async function searchPlaces(params: SearchParams): Promise<GeoapifyPlace[]> {
  try {
    const { text, lat, lon, radius = 5000, categories = [], limit = 20 } = params;

    const queryParams = new URLSearchParams();

    if (text) {
      queryParams.append('text', text);
    }

    if (lat !== undefined && lon !== undefined) {
      queryParams.append('filter', `circle:${lon},${lat},${radius}`);
      queryParams.append('bias', `proximity:${lon},${lat}`);
    }

    if (categories.length > 0) {
      queryParams.append('categories', categories.join(','));
    }

    queryParams.append('limit', limit.toString());
    queryParams.append('apiKey', GEOAPIFY_API_KEY!);

    const url = `${BASE_URL}/places?${queryParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.features.map((feature: any) => ({
      place_id: feature.properties.place_id,
      name: feature.properties.name || feature.properties.street || 'Unnamed',
      formatted: feature.properties.formatted,
      address_line1: feature.properties.address_line1,
      address_line2: feature.properties.address_line2,
      city: feature.properties.city,
      country: feature.properties.country,
      lat: feature.properties.lat,
      lon: feature.properties.lon,
      categories: feature.properties.categories,
      distance: feature.properties.distance,
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
}

/**
 * Search for restaurants near a location
 */
export async function searchRestaurants(lat: number, lon: number, radius: number = 5000): Promise<GeoapifyPlace[]> {
  return searchPlaces({
    lat,
    lon,
    radius,
    categories: ['catering.restaurant', 'catering.cafe', 'catering.fast_food'],
    limit: 50,
  });
}

/**
 * Search for bars, clubs, and party venues near a location
 */
export async function searchPartyVenues(lat: number, lon: number, radius: number = 5000): Promise<GeoapifyPlace[]> {
  return searchPlaces({
    lat,
    lon,
    radius,
    categories: [
      'entertainment.nightclub',
      'catering.bar',
      'catering.pub',
      'entertainment.activity',
      'entertainment.culture',
    ],
    limit: 50,
  });
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${GEOAPIFY_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geoapify reverse geocode error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].properties.formatted;
    }

    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  }
}

/**
 * Geocode text to get coordinates
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geoapify geocode error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const { lat, lon } = data.features[0].properties;
      return { lat, lon };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Create a shareable location object
 */
export function createLocationShare(
  latitude: number,
  longitude: number,
  address?: string,
  placeName?: string
): LocationShareData {
  return {
    latitude,
    longitude,
    address,
    placeName,
    timestamp: Date.now(),
  };
}

/**
 * Format location share as text for sharing
 */
export function formatLocationShareText(locationData: LocationShareData): string {
  const { latitude, longitude, address, placeName } = locationData;

  let text = placeName ? `📍 ${placeName}\n` : '📍 Shared Location\n';

  if (address) {
    text += `${address}\n`;
  }

  text += `\nCoordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n`;
  text += `Google Maps: https://www.google.com/maps?q=${latitude},${longitude}\n`;
  text += `\nShared via LitPass`;

  return text;
}

/**
 * Geocode a city/location name to get coordinates
 */
export async function geocodeCity(cityName: string): Promise<{ lat: number; lon: number; formatted: string } | null> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('text', cityName);
    queryParams.append('type', 'city');
    queryParams.append('limit', '1');
    queryParams.append('apiKey', GEOAPIFY_API_KEY!);

    const url = `https://api.geoapify.com/v1/geocode/search?${queryParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geoapify geocode error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        lat: feature.properties.lat,
        lon: feature.properties.lon,
        formatted: feature.properties.formatted || cityName,
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding city:', error);
    return null;
  }
}

/**
 * Get autocomplete suggestions for places
 */
export async function getAutocompleteSuggestions(
  text: string,
  lat?: number,
  lon?: number
): Promise<GeoapifyPlace[]> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('text', text);
    queryParams.append('limit', '10');
    queryParams.append('apiKey', GEOAPIFY_API_KEY!);

    if (lat !== undefined && lon !== undefined) {
      queryParams.append('bias', `proximity:${lon},${lat}`);
    }

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?${queryParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geoapify autocomplete error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.features.map((feature: any) => ({
      place_id: feature.properties.place_id,
      name: feature.properties.name || feature.properties.street || 'Unnamed',
      formatted: feature.properties.formatted,
      address_line1: feature.properties.address_line1,
      address_line2: feature.properties.address_line2,
      city: feature.properties.city,
      country: feature.properties.country,
      lat: feature.properties.lat,
      lon: feature.properties.lon,
      categories: feature.properties.categories,
    }));
  } catch (error) {
    console.error('Error getting autocomplete suggestions:', error);
    return [];
  }
}
