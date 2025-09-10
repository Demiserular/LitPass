import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Beer, Martini, Building2, Disc, Music as MusicIcon, TrendingUp } from 'lucide-react-native';
import { SearchSuggestions } from '@/components/SearchSuggestions';
import { SkeletonSearchPage } from '@/components/SkeletonComponents';
import { useSimulatedLoading } from '@/hooks/useSkeletonLoader';
import { ComponentErrorBoundary } from '@/components/ErrorBoundaries';
import { ScreenTransition } from '@/components/PageTransition';
import { useTheme, useThemeColors } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';

const categories = [
  { name: 'Beer', icon: Beer },
  { name: 'Pubs', icon: Martini },
  { name: 'Bars', icon: Martini }, // Using Martini again, consider a different icon if available/needed
  { name: 'Restaurants', icon: Building2 },
  { name: 'Disco', icon: Disc },
  { name: 'Music', icon: MusicIcon },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { isLoading } = useSimulatedLoading(1500);
  const { theme } = useTheme();
  const colors = useThemeColors();

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowSuggestions(text.length > 0 || text === '');
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Perform search with suggestion
    console.log('Searching for:', suggestion);
  };

  const handleClearHistory = () => {
    console.log('Search history cleared');
  };

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow for suggestion selection
    setTimeout(() => setShowSuggestions(false), 200);
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
            <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.secondaryBackground }]}>
              <TrendingUp size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.secondaryBackground }]}>
              <Search size={20} color={colors.secondaryText} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchBar, { color: colors.text }]}
                placeholder="What are you looking for?"
                placeholderTextColor={colors.secondaryText}
                value={searchQuery}
                onChangeText={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
            </View>

            <SearchSuggestions
              searchQuery={searchQuery}
              onSuggestionPress={handleSuggestionPress}
              onClearHistory={handleClearHistory}
              visible={showSuggestions}
            />

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
                  activeOpacity={0.8}
                >
                  <BlurView 
                    intensity={theme === 'dark' ? 20 : 10} 
                    tint={theme === 'dark' ? 'dark' : 'light'} 
                    style={styles.cardBlur}
                  >
                    <View style={[
                      styles.iconCircle,
                      { backgroundColor: colors.primary + '20' }
                    ]}>
                      <category.icon size={28} color={colors.primary} strokeWidth={2} />
                    </View>
                    <Text style={[styles.cardText, { color: colors.text }]}>{category.name}</Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </View>

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
    paddingTop: 8,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  sectionHeader: {
    marginBottom: 16,
    marginTop: 8,
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
    marginBottom: 32,
  },
  card: {
    width: '48%',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardBlur: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.2,
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
});