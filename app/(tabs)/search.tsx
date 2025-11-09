import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Beer, Martini, Building2, Disc, Music as MusicIcon, TrendingUp, MapPin } from 'lucide-react-native';
import { SearchSuggestions } from '@/components/SearchSuggestions';
import { SkeletonSearchPage } from '@/components/SkeletonComponents';
import { useSimulatedLoading } from '@/hooks/useSkeletonLoader';
import { ComponentErrorBoundary } from '@/components/ErrorBoundaries';
import { ScreenTransition } from '@/components/PageTransition';
import { useTheme, useThemeColors } from '@/contexts/ThemeContext';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import {
  searchRestaurants,
  searchPartyVenues,
  GeoapifyPlace,
  getAutocompleteSuggestions,
  searchPlaces,
  geocodeCity
} from '@/utils/geoapifyService';

const categories = [
  { name: 'Beer', icon: Beer, category: 'catering.pub' },
  { name: 'Pubs', icon: Martini, category: 'catering.pub' },
  { name: 'Bars', icon: Martini, category: 'catering.bar' },
  { name: 'Restaurants', icon: Building2, category: 'catering.restaurant' },
  { name: 'Disco', icon: Disc, category: 'entertainment.nightclub' },
  { name: 'Music', icon: MusicIcon, category: 'entertainment.culture' },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('Milan, Italy');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<GeoapifyPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [suggestions, setSuggestions] = useState<GeoapifyPlace[]>([]);
  const [searchRadius, setSearchRadius] = useState(5000); // Default 5km
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { isLoading } = useSimulatedLoading(1500);
  const { theme } = useTheme();
  const colors = useThemeColors();

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
      } catch (err) {
        console.error('Error getting location:', err);
      }
    })();

    // Geocode Milan, Italy as default location
    (async () => {
      const milanCoords = await geocodeCity('Milan, Italy');
      if (milanCoords) {
        setSearchLocation({
          lat: milanCoords.lat,
          lon: milanCoords.lon,
          name: milanCoords.formatted,
        });
      }
    })();
  }, []);

  // Autocomplete suggestions using Geoapify
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchQuery.length > 2) {
        const coords = searchLocation || (userLocation ? {
          lat: userLocation.coords.latitude,
          lon: userLocation.coords.longitude
        } : undefined);

        const results = await getAutocompleteSuggestions(
          searchQuery,
          coords?.lat,
          coords?.lon
        );
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchLocation, userLocation]);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowSuggestions(text.length > 0 || text === '');
  };

  const handleSuggestionPress = (suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  const handleClearHistory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Search history cleared');
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setShowSuggestions(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    // Delay hiding suggestions to allow for suggestion selection
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleLocationChange = async (text: string) => {
    setLocationQuery(text);

    // Debounced geocoding
    if (text.length > 3) {
      const coords = await geocodeCity(text);
      if (coords) {
        setSearchLocation({
          lat: coords.lat,
          lon: coords.lon,
          name: coords.formatted,
        });
      }
    }
  };

  const useMyLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (userLocation) {
      setSearchLocation({
        lat: userLocation.coords.latitude,
        lon: userLocation.coords.longitude,
        name: 'Your Location',
      });
      setLocationQuery('My Location');
    } else {
      alert('Location not available. Please enable location services.');
    }
  };

  const performSearch = async (query?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const coords = searchLocation || (userLocation ? {
      lat: userLocation.coords.latitude,
      lon: userLocation.coords.longitude
    } : null);

    if (!coords) {
      alert('Please specify a location or enable location services.');
      return;
    }

    setSearching(true);
    try {
      const searchText = query || searchQuery;
      const results = await searchPlaces({
        text: searchText,
        lat: coords.lat,
        lon: coords.lon,
        radius: searchRadius,
        limit: 50,
      });
      setSearchResults(results);
      setShowSuggestions(false);
    } catch (err) {
      console.error('Error searching:', err);
      alert('Failed to search. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleCategoryPress = async (categoryName: string, categoryType: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const coords = searchLocation || (userLocation ? {
      lat: userLocation.coords.latitude,
      lon: userLocation.coords.longitude
    } : null);

    if (!coords) {
      alert('Please specify a location or enable location services.');
      return;
    }

    setSearching(true);
    try {
      let results: GeoapifyPlace[] = [];

      if (categoryName === 'Restaurants') {
        results = await searchRestaurants(
          coords.lat,
          coords.lon,
          searchRadius
        );
      } else if (categoryName === 'Disco' || categoryName === 'Bars' || categoryName === 'Pubs') {
        results = await searchPartyVenues(
          coords.lat,
          coords.lon,
          searchRadius
        );
      } else {
        results = await searchPlaces({
          lat: coords.lat,
          lon: coords.lon,
          radius: searchRadius,
          categories: [categoryType],
          limit: 50,
        });
      }

      setSearchResults(results);
      setSearchQuery(categoryName);
    } catch (err) {
      console.error('Error searching category:', err);
      alert('Failed to search. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  if (isLoading) {
    return (
      <ComponentErrorBoundary componentName="SearchPage">
        <SkeletonSearchPage />
      </ComponentErrorBoundary>
    );
  }

  return (
    <ScreenTransition transitionType="fade" duration={250}>
      <ComponentErrorBoundary componentName="SearchScreen">
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Discover</Text>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.secondaryBackground }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <TrendingUp size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchWrapper}>
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: colors.secondaryBackground,
                  borderWidth: isSearchFocused ? 2 : 1,
                  borderColor: isSearchFocused ? colors.primary : colors.separator,
                }
              ]}
            >
              <Search size={20} color={colors.secondaryText} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchBar, { color: colors.text }]}
                placeholder="What are you looking for?"
                placeholderTextColor={colors.secondaryText}
                value={searchQuery}
                onChangeText={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onSubmitEditing={() => performSearch()}
              />
            </View>
          </View>

          {/* Location Input */}
          <View style={[styles.locationContainer, { backgroundColor: colors.secondaryBackground }]}>
            <MapPin size={18} color={colors.primary} style={styles.locationIcon} />
            <TextInput
              style={[styles.locationInput, { color: colors.text }]}
              placeholder="Location (e.g., Milan, Italy)"
              placeholderTextColor={colors.secondaryText}
              value={locationQuery}
              onChangeText={handleLocationChange}
            />
            <TouchableOpacity onPress={useMyLocation} style={styles.myLocationButton}>
              <Text style={[styles.myLocationText, { color: colors.primary }]}>My Location</Text>
            </TouchableOpacity>
          </View>

          {/* Radius Control - Compact Buttons Only */}
          <View style={styles.radiusContainer}>
            <Text style={[styles.radiusLabel, { color: colors.secondaryText }]}>
              Search Radius
            </Text>
            <View style={styles.radiusButtons}>
              {[1000, 5000, 10000, 20000].map((radius) => (
                <TouchableOpacity
                  key={radius}
                  style={[
                    styles.radiusButton,
                    {
                      backgroundColor: searchRadius === radius ? colors.primary : colors.secondaryBackground,
                      borderColor: colors.separator
                    }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSearchRadius(radius);
                  }}
                >
                  <Text
                    style={[
                      styles.radiusButtonText,
                      { color: searchRadius === radius ? '#fff' : colors.text }
                    ]}
                  >
                    {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Search Location Info */}
          {searchLocation && (
            <View style={[styles.searchLocationInfo, { backgroundColor: colors.secondaryBackground }]}>
              <Text style={[styles.searchLocationText, { color: colors.secondaryText }]}>
                📍 Searching in: {searchLocation.name}
              </Text>
            </View>
          )}

          {/* SearchSuggestions - Outside ScrollView, positioned absolutely */}
          {showSuggestions && (
            <View style={styles.suggestionsWrapper}>
              <SearchSuggestions
                searchQuery={searchQuery}
                onSuggestionPress={handleSuggestionPress}
                onClearHistory={handleClearHistory}
                visible={showSuggestions}
              />
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* Categories Section */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
            </View>

            <View style={styles.gridContainer}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={category.name}
                  style={[
                    styles.card,
                    { backgroundColor: colors.secondaryBackground }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleCategoryPress(category.name, category.category, index)}
                >
                  <View style={styles.cardContent}>
                    <View style={[
                      styles.iconCircle,
                      { backgroundColor: colors.primary + '15' }
                    ]}>
                      <category.icon size={32} color={colors.primary} strokeWidth={2.2} />
                    </View>
                    <Text style={[styles.cardText, { color: colors.text }]}>{category.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search Results with Circular Loading */}
            {searching && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
                  Searching nearby...
                </Text>
              </View>
            )}

            {searchResults.length > 0 && !searching && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Results ({searchResults.length})
                  </Text>
                </View>

                {searchResults.map((place, index) => (
                  <TouchableOpacity
                    key={place.place_id}
                    style={[styles.resultCard, { backgroundColor: colors.secondaryBackground }]}
                    activeOpacity={0.7}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <View style={styles.resultHeader}>
                      <MapPin size={20} color={colors.primary} />
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultName, { color: colors.text }]}>
                          {place.name}
                        </Text>
                        <Text style={[styles.resultAddress, { color: colors.secondaryText }]} numberOfLines={2}>
                          {place.formatted}
                        </Text>
                        {place.distance && (
                          <Text style={[styles.resultDistance, { color: colors.primary }]}>
                            📍 {(place.distance / 1000).toFixed(2)} km away
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Trending Section */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Now</Text>
            </View>

            <View style={styles.trendingContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScrollContent}>
                {['Live Music', 'Happy Hour', 'Rooftop Bars', 'Craft Beer'].map((trend, index) => (
                  <TouchableOpacity
                    key={trend}
                    style={[
                      styles.trendingCard,
                      { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }
                    ]}
                  >
                    <Text style={[styles.trendingText, { color: colors.primary }]}># {trend}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ComponentErrorBoundary>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  searchWrapper: {
    marginHorizontal: 20,
    marginBottom: 16,
    position: 'relative',
  },
  searchGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    zIndex: -1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionsWrapper: {
    position: 'absolute',
    top: 240, // Adjusted to be below header, search bar, location input, and radius controls
    left: 20,
    right: 20,
    zIndex: 1000,
    maxHeight: '45%',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchBar: {
    flex: 1,
    height: 52,
    fontSize: 16,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  myLocationButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  myLocationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  radiusContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  radiusLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  radiusButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  searchLocationInfo: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchLocationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  card: {
    width: '48%',
    borderRadius: 20,
    marginBottom: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  trendingContainer: {
    marginBottom: 20,
    height: 50,
  },
  trendingScrollContent: {
    paddingRight: 20,
  },
  trendingCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  trendingText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultAddress: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  resultDistance: {
    fontSize: 12,
    fontWeight: '600',
  },
});