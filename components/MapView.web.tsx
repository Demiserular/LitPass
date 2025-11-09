import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Share } from 'react-native';
import { useEvents } from '@/hooks/useEvents';
import { 
  searchRestaurants, 
  searchPartyVenues, 
  GeoapifyPlace,
  reverseGeocode,
  createLocationShare,
  formatLocationShareText,
  getAutocompleteSuggestions,
  getGeoapifyTileUrl
} from '@/utils/geoapifyService';
import { X, Search, MapPin, Share2, Navigation } from 'lucide-react-native';

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

interface MapViewProps {
  events?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }>;
  searchResults?: GeoapifyPlace[];
  userLocation?: { lat: number; lon: number };
  selectedPlace?: GeoapifyPlace | null;
}

interface VenueMapViewProps {
  onClose: () => void;
}

type SearchCategory = 'all' | 'restaurants' | 'parties';

export function MapView({ events = [], searchResults = [], userLocation, selectedPlace }: MapViewProps) {
  const [mapCenter, setMapCenter] = useState({ lat: userLocation?.lat || 0, lon: userLocation?.lon || 0 });
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    if (selectedPlace) {
      setMapCenter({ lat: selectedPlace.lat, lon: selectedPlace.lon });
      setZoom(15);
    } else if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [selectedPlace, userLocation]);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          #map { width: 100%; height: 100%; }
          body { margin: 0; }
          .leaflet-container {
            width: 100%;
            height: 100%;
          }
        </style>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          function initMap() {
            const map = L.map('map').setView([${mapCenter.lat}, ${mapCenter.lon}], ${zoom});
            
            // Add Geoapify tiles
            L.tileLayer('https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}', {
              attribution: '© <a href="https://www.geoapify.com/">Geoapify</a> | © OpenStreetMap contributors',
              maxZoom: 20
            }).addTo(map);
            
            // User location marker
            ${userLocation ? `
              const userIcon = L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background: #007AFF; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              });
              L.marker([${userLocation.lat}, ${userLocation.lon}], { icon: userIcon })
                .bindPopup('You are here')
                .addTo(map);
            ` : ''}
            
            // Events markers
            const events = ${JSON.stringify(events)};
            events.forEach(event => {
              if (event.latitude && event.longitude) {
                L.marker([event.latitude, event.longitude])
                  .bindPopup('<b>' + event.name + '</b><br>' + (event.address || ''))
                  .addTo(map);
              }
            });
            
            // Search results markers
            const searchResults = ${JSON.stringify(searchResults)};
            const greenIcon = L.divIcon({
              className: 'search-result-marker',
              html: '<div style="background: #34C759; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });
            searchResults.forEach(place => {
              L.marker([place.lat, place.lon], { icon: greenIcon })
                .bindPopup('<b>' + place.name + '</b><br>' + place.formatted)
                .addTo(map);
            });
            
            // Selected place marker
            ${selectedPlace ? `
              const selectedIcon = L.divIcon({
                className: 'selected-place-marker',
                html: '<div style="background: #AF52DE; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              });
              L.marker([${selectedPlace.lat}, ${selectedPlace.lon}], { icon: selectedIcon })
                .bindPopup('<b>' + '${selectedPlace.name}' + '</b><br>' + '${selectedPlace.formatted}')
                .openPopup()
                .addTo(map);
            ` : ''}
          }
        </script>
      </head>
      <body onload="initMap()">
        <div id="map"></div>
      </body>
    </html>
  `;

  return (
    <div style={styles.container}>
      <iframe
        srcDoc={mapHtml}
        style={styles.map}
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}

// Add VenueMapView component for web
export function VenueMapView({ onClose }: VenueMapViewProps) {
  const { events, loading, error } = useEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('all');
  const [searchResults, setSearchResults] = useState<GeoapifyPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<GeoapifyPlace | null>(null);
  const [suggestions, setSuggestions] = useState<GeoapifyPlace[]>([]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchQuery.length > 2) {
        const results = await getAutocompleteSuggestions(
          searchQuery,
          userLocation?.lat,
          userLocation?.lon
        );
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, userLocation]);

  const handleSearch = async () => {
    if (!userLocation) {
      alert('Location not available. Please enable location services.');
      return;
    }

    setSearching(true);
    try {
      let results: GeoapifyPlace[] = [];
      const { lat, lon } = userLocation;

      if (searchCategory === 'restaurants') {
        results = await searchRestaurants(lat, lon, 5000);
      } else if (searchCategory === 'parties') {
        results = await searchPartyVenues(lat, lon, 5000);
      } else {
        // Search both
        const [restaurants, parties] = await Promise.all([
          searchRestaurants(lat, lon, 5000),
          searchPartyVenues(lat, lon, 5000),
        ]);
        results = [...restaurants, ...parties];
      }

      setSearchResults(results);
    } catch (err) {
      console.error('Error searching:', err);
      alert('Failed to search. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleShareLocation = async (place?: GeoapifyPlace) => {
    try {
      let shareData;
      
      if (place) {
        shareData = createLocationShare(
          place.lat,
          place.lon,
          place.formatted,
          place.name
        );
      } else if (userLocation) {
        const address = await reverseGeocode(userLocation.lat, userLocation.lon);
        shareData = createLocationShare(
          userLocation.lat,
          userLocation.lon,
          address,
          'My Location'
        );
      } else {
        alert('Location not available');
        return;
      }

      const shareText = formatLocationShareText(shareData);
      
      // For web, use Web Share API if available, otherwise copy to clipboard
      if (navigator.share) {
        await navigator.share({
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('Location copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing location:', err);
    }
  };

  const handleSuggestionSelect = (suggestion: GeoapifyPlace) => {
    setSelectedPlace(suggestion);
    setSuggestions([]);
    setSearchQuery(suggestion.name);
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error loading events</Text>;
  }

  return (
    <View style={styles.venueContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Explore Places</Text>
        <TouchableOpacity 
          onPress={() => handleShareLocation()} 
          style={styles.shareButton}
        >
          <Share2 size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, bars, parties..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {userLocation && (
            <TouchableOpacity 
              onPress={() => setSelectedPlace(null)}
              style={styles.locationButton}
            >
              <Navigation size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <ScrollView style={styles.suggestionsContainer}>
            {suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.place_id}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(suggestion)}
              >
                <MapPin size={16} color="#666" />
                <View style={styles.suggestionText}>
                  <Text style={styles.suggestionName}>{suggestion.name}</Text>
                  <Text style={styles.suggestionAddress} numberOfLines={1}>
                    {suggestion.formatted}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Category filters */}
        <View style={styles.categoryContainer}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              searchCategory === 'all' && styles.categoryButtonActive,
            ]}
            onPress={() => setSearchCategory('all')}
          >
            <Text
              style={[
                styles.categoryText,
                searchCategory === 'all' && styles.categoryTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              searchCategory === 'restaurants' && styles.categoryButtonActive,
            ]}
            onPress={() => setSearchCategory('restaurants')}
          >
            <Text
              style={[
                styles.categoryText,
                searchCategory === 'restaurants' && styles.categoryTextActive,
              ]}
            >
              Restaurants
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              searchCategory === 'parties' && styles.categoryButtonActive,
            ]}
            onPress={() => setSearchCategory('parties')}
          >
            <Text
              style={[
                styles.categoryText,
                searchCategory === 'parties' && styles.categoryTextActive,
              ]}
            >
              Parties
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={searching}
        >
          <Text style={styles.searchButtonText}>
            {searching ? 'Searching...' : 'Search Nearby'}
          </Text>
        </TouchableOpacity>
      </View>

      <MapView 
        events={events as any} 
        searchResults={searchResults}
        userLocation={userLocation || undefined}
        selectedPlace={selectedPlace}
      />

      {/* Selected place details */}
      {selectedPlace && (
        <View style={styles.placeDetailsContainer}>
          <View style={styles.placeDetailsHeader}>
            <View style={styles.placeDetailsInfo}>
              <Text style={styles.placeDetailsName}>{selectedPlace.name}</Text>
              <Text style={styles.placeDetailsAddress} numberOfLines={2}>
                {selectedPlace.formatted}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleShareLocation(selectedPlace)}
              style={styles.sharePlaceButton}
            >
              <Share2 size={20} color="#007AFF" />
              <Text style={styles.sharePlaceText}>Share</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => setSelectedPlace(null)}
            style={styles.closePlaceDetails}
          >
            <X size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
  venueContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  locationButton: {
    padding: 8,
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    flex: 1,
    marginLeft: 8,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 14,
    color: '#666',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeDetailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  placeDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeDetailsInfo: {
    flex: 1,
    marginRight: 12,
  },
  placeDetailsName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  placeDetailsAddress: {
    fontSize: 14,
    color: '#666',
  },
  sharePlaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  sharePlaceText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closePlaceDetails: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
  },
});