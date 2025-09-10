import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search, Clock, TrendingUp, X } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
  timestamp?: number;
}

interface SearchSuggestionsProps {
  searchQuery: string;
  onSuggestionPress: (suggestion: string) => void;
  onClearHistory: () => void;
  visible: boolean;
}

const TRENDING_SEARCHES = [
  'Live Music',
  'Happy Hour',
  'Rooftop Bar',
  'Comedy Show',
  'Dance Club',
  'Craft Beer',
  'Wine Tasting',
  'Karaoke Night',
];

const STORAGE_KEY = '@search_history';

export function SearchSuggestions({ 
  searchQuery, 
  onSuggestionPress, 
  onClearHistory,
  visible 
}: SearchSuggestionsProps) {
  const colorScheme = useColorScheme();
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    generateSuggestions();
  }, [searchQuery, recentSearches]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentSearches(parsed);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveSearchHistory = async (newHistory: SearchSuggestion[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const addToHistory = (searchText: string) => {
    if (!searchText.trim()) return;

    const newSearch: SearchSuggestion = {
      id: Date.now().toString(),
      text: searchText.trim(),
      type: 'recent',
      timestamp: Date.now(),
    };

    const updatedHistory = [
      newSearch,
      ...recentSearches.filter(item => item.text !== searchText.trim())
    ].slice(0, 10); // Keep only last 10 searches

    setRecentSearches(updatedHistory);
    saveSearchHistory(updatedHistory);
  };

  const removeFromHistory = (id: string) => {
    const updatedHistory = recentSearches.filter(item => item.id !== id);
    setRecentSearches(updatedHistory);
    saveSearchHistory(updatedHistory);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clearAllHistory = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
    onClearHistory();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const generateSuggestions = () => {
    let allSuggestions: SearchSuggestion[] = [];

    if (searchQuery.trim()) {
      // Filter trending searches based on query
      const filteredTrending = TRENDING_SEARCHES
        .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((item, index) => ({
          id: `trending-${index}`,
          text: item,
          type: 'trending' as const,
        }));

      // Filter recent searches based on query
      const filteredRecent = recentSearches
        .filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()));

      allSuggestions = [...filteredRecent, ...filteredTrending];
    } else {
      // Show recent searches and trending when no query
      const trendingSuggestions = TRENDING_SEARCHES.slice(0, 5).map((item, index) => ({
        id: `trending-${index}`,
        text: item,
        type: 'trending' as const,
      }));

      allSuggestions = [...recentSearches.slice(0, 5), ...trendingSuggestions];
    }

    setSuggestions(allSuggestions);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    addToHistory(suggestion.text);
    onSuggestionPress(suggestion.text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => {
    const getIcon = () => {
      switch (item.type) {
        case 'recent':
          return <Clock size={18} color={colorScheme === 'dark' ? '#888' : '#666'} />;
        case 'trending':
          return <TrendingUp size={18} color={colorScheme === 'dark' ? '#888' : '#666'} />;
        default:
          return <Search size={18} color={colorScheme === 'dark' ? '#888' : '#666'} />;
      }
    };

    return (
      <TouchableOpacity
        style={[styles.suggestionItem, {
          backgroundColor: colorScheme === 'dark' ? '#222' : '#f8f8f8',
        }]}
        onPress={() => handleSuggestionPress(item)}
      >
        <View style={styles.suggestionContent}>
          {getIcon()}
          <Text style={[styles.suggestionText, {
            color: colorScheme === 'dark' ? '#fff' : '#000',
          }]}>
            {item.text}
          </Text>
        </View>
        {item.type === 'recent' && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromHistory(item.id)}
          >
            <X size={16} color={colorScheme === 'dark' ? '#666' : '#999'} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <View style={[styles.container, {
      backgroundColor: colorScheme === 'dark' ? '#111' : '#fff',
    }]}>
      {recentSearches.length > 0 && !searchQuery && (
        <View style={styles.header}>
          <Text style={[styles.headerText, {
            color: colorScheme === 'dark' ? '#fff' : '#000',
          }]}>
            Recent Searches
          </Text>
          <TouchableOpacity onPress={clearAllHistory}>
            <Text style={[styles.clearText, {
              color: colorScheme === 'dark' ? '#888' : '#666',
            }]}>
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {searchQuery && suggestions.length === 0 && (
        <View style={styles.noResults}>
          <Text style={[styles.noResultsText, {
            color: colorScheme === 'dark' ? '#888' : '#666',
          }]}>
            No suggestions found
          </Text>
        </View>
      )}

      <FlatList
        data={suggestions}
        renderItem={renderSuggestion}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.suggestionsList}
      />

      {!searchQuery && suggestions.length > 0 && (
        <View style={styles.trendingSection}>
          <Text style={[styles.sectionTitle, {
            color: colorScheme === 'dark' ? '#fff' : '#000',
          }]}>
            Trending Searches
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    maxHeight: 400,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  trendingSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
});