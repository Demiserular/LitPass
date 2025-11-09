import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform, TextInput, ScrollView, Share } from 'react-native';
import { useEvents } from '@/hooks/useEvents';
import * as Location from 'expo-location';
import { 
  searchRestaurants, 
  searchPartyVenues, 
  GeoapifyPlace,
  reverseGeocode,
  createLocationShare,
  formatLocationShareText,
  getAutocompleteSuggestions
} from '@/utils/geoapifyService';

// Platform-specific imports to avoid native module errors
let RNMapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    const maps = require('react-native-maps');
    RNMapView = maps.default;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (error) {
    console.warn('Failed to load react-native-maps:', error);
  }
}
import { X, Search, MapPin, Share2, Navigation } from 'lucide-react-native';

interface Event {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapViewProps {
  onClose: () => void;
}

type SearchCategory = 'all' | 'restaurants' | 'parties';

const DEFAULT_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export function MapView({ onClose }: MapViewProps) {
  const { events, loading, error } = useEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('all');
  const [searchResults, setSearchResults] = useState<GeoapifyPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<GeoapifyPlace | null>(null);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [suggestions, setSuggestions] = useState<GeoapifyPlace[]>([]);

  useEffect(() => {
    // Get user's current location
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (err) {
        console.error('Error getting location:', err);
      }
    })();
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchQuery.length > 2) {
        const results = await getAutocompleteSuggestions(
          searchQuery,
          userLocation?.coords.latitude,
          userLocation?.coords.longitude
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
      const { latitude, longitude } = userLocation.coords;

      if (searchCategory === 'restaurants') {
        results = await searchRestaurants(latitude, longitude, 5000);
      } else if (searchCategory === 'parties') {
        results = await searchPartyVenues(latitude, longitude, 5000);
      } else {
        // Search both
        const [restaurants, parties] = await Promise.all([
          searchRestaurants(latitude, longitude, 5000),
          searchPartyVenues(latitude, longitude, 5000),
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
        const address = await reverseGeocode(
          userLocation.coords.latitude,
          userLocation.coords.longitude
        );
        shareData = createLocationShare(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          address,
          'My Location'
        );
      } else {
        alert('Location not available');
        return;
      }

      const shareText = formatLocationShareText(shareData);
      await Share.share({
        message: shareText,
      });
    } catch (err) {
      console.error('Error sharing location:', err);
    }
  };

  const handleSuggestionSelect = (suggestion: GeoapifyPlace) => {
    setSelectedPlace(suggestion);
    setRegion({
      latitude: suggestion.lat,
      longitude: suggestion.lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setSuggestions([]);
    setSearchQuery(suggestion.name);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error loading events</Text>
      </View>
    );
  }

  const renderMap = () => {
    return (
      <RNMapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="You are here"
            pinColor="blue"
          />
        )}

        {/* Events markers */}
        {events.map((event: any) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude || 0,
              longitude: event.longitude || 0,
            }}
            title={event.name || 'Event'}
            description={event.address}
            pinColor="red"
          />
        ))}

        {/* Search results markers */}
        {searchResults.map((place) => (
          <Marker
            key={place.place_id}
            coordinate={{
              latitude: place.lat,
              longitude: place.lon,
            }}
            title={place.name}
            description={place.formatted}
            pinColor="green"
            onPress={() => setSelectedPlace(place)}
          />
        ))}

        {/* Selected place marker */}
        {selectedPlace && (
          <Marker
            coordinate={{
              latitude: selectedPlace.lat,
              longitude: selectedPlace.lon,
            }}
            title={selectedPlace.name}
            description={selectedPlace.formatted}
            pinColor="purple"
          />
        )}
      </RNMapView>
    );
  };

  return (
    <View style={styles.container}>
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
              onPress={() => {
                setRegion({
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                });
              }}
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
          {searching ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Search Nearby</Text>
          )}
        </TouchableOpacity>
      </View>

      {renderMap()}

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

// Add VenueMapView export (identical to MapView for now)
export const VenueMapView = MapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  map: {
    flex: 1,
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