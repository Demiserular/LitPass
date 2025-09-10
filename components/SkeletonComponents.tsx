import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

// Base shimmer animation hook
function useShimmerAnimation() {
  const colorScheme = useColorScheme();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const shimmerColor = colorScheme === 'dark' ? '#444' : '#e0e0e0';

  return { shimmerOpacity, shimmerColor };
}

// Header skeleton
export function SkeletonHeader() {
  const { shimmerOpacity, shimmerColor } = useShimmerAnimation();
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.headerContainer, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.headerContent}>
        <Animated.View style={[styles.headerAvatar, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <View style={styles.headerCenter}>
          <Animated.View style={[styles.headerTitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.headerSubtitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        </View>
        <Animated.View style={[styles.headerIcon, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      </View>
    </View>
  );
}

// Wallet view skeleton
export function SkeletonWallet() {
  const { shimmerOpacity, shimmerColor } = useShimmerAnimation();
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.walletContainer, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={styles.walletCard}>
        <Animated.View style={[styles.walletBalance, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.walletCurrency, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        
        <View style={styles.walletActions}>
          <Animated.View style={[styles.walletButton, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.walletButton, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.walletButton, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        </View>
      </View>
    </View>
  );
}

// Transaction history skeleton
export function SkeletonTransaction() {
  const { shimmerOpacity, shimmerColor } = useShimmerAnimation();

  return (
    <View style={styles.transactionItem}>
      <Animated.View style={[styles.transactionIcon, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      <View style={styles.transactionContent}>
        <Animated.View style={[styles.transactionTitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.transactionDate, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      </View>
      <View style={styles.transactionAmount}>
        <Animated.View style={[styles.transactionPrice, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.transactionStatus, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      </View>
    </View>
  );
}

// Transaction history list skeleton
export function SkeletonTransactionHistory() {
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.transactionHistory, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' }]}>
      <SkeletonTransaction />
      <SkeletonTransaction />
      <SkeletonTransaction />
      <SkeletonTransaction />
      <SkeletonTransaction />
    </View>
  );
}

// Profile skeleton
export function SkeletonProfile() {
  const { shimmerOpacity, shimmerColor } = useShimmerAnimation();
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.profileContainer, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.profileHeader}>
        <Animated.View style={[styles.profileAvatar, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.profileName, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      </View>
      
      <View style={styles.profileInfo}>
        <Animated.View style={[styles.profileInfoItem, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.profileInfoItem, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      </View>
      
      <View style={styles.profileActions}>
        <Animated.View style={[styles.profileAction, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.profileAction, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.profileAction, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      </View>
    </View>
  );
}

// Search results skeleton
export function SkeletonSearchResult() {
  const { shimmerOpacity, shimmerColor } = useShimmerAnimation();

  return (
    <View style={styles.searchResult}>
      <Animated.View style={[styles.searchResultImage, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      <View style={styles.searchResultContent}>
        <Animated.View style={[styles.searchResultTitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.searchResultSubtitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.searchResultPrice, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      </View>
    </View>
  );
}

// Search page skeleton
export function SkeletonSearchPage() {
  const { shimmerOpacity, shimmerColor } = useShimmerAnimation();
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.searchPage, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      {/* Search bar skeleton */}
      <Animated.View style={[styles.searchBar, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      
      {/* Search suggestions skeleton */}
      <View style={styles.searchSuggestions}>
        <Animated.View style={[styles.suggestionItem, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.suggestionItem, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.suggestionItem, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      </View>
      
      {/* Search results skeleton */}
      <View style={styles.searchResults}>
        <SkeletonSearchResult />
        <SkeletonSearchResult />
        <SkeletonSearchResult />
        <SkeletonSearchResult />
      </View>
    </View>
  );
}

// Messages/Chat skeleton
export function SkeletonMessage({ isOwn = false }: { isOwn?: boolean }) {
  const { shimmerOpacity, shimmerColor } = useShimmerAnimation();

  return (
    <View style={[styles.messageContainer, isOwn && styles.ownMessage]}>
      {!isOwn && (
        <Animated.View style={[styles.messageAvatar, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      )}
      <View style={[styles.messageBubble, isOwn && styles.ownMessageBubble]}>
        <Animated.View style={[styles.messageText, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.messageTime, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      </View>
    </View>
  );
}

// Chat screen skeleton
export function SkeletonChat() {
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.chatContainer, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <SkeletonMessage isOwn={false} />
      <SkeletonMessage isOwn={true} />
      <SkeletonMessage isOwn={false} />
      <SkeletonMessage isOwn={false} />
      <SkeletonMessage isOwn={true} />
      <SkeletonMessage isOwn={false} />
    </View>
  );
}

// Settings skeleton
export function SkeletonSettings() {
  const { shimmerOpacity, shimmerColor } = useShimmerAnimation();
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.settingsContainer, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <View style={styles.settingsSection}>
        <Animated.View style={[styles.settingsSectionTitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <View style={styles.settingsItems}>
          <SkeletonSettingItem />
          <SkeletonSettingItem />
          <SkeletonSettingItem />
        </View>
      </View>
      
      <View style={styles.settingsSection}>
        <Animated.View style={[styles.settingsSectionTitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <View style={styles.settingsItems}>
          <SkeletonSettingItem />
          <SkeletonSettingItem />
        </View>
      </View>
    </View>
  );
}

// Individual setting item skeleton
export function SkeletonSettingItem() {
  const { shimmerOpacity, shimmerColor } = useShimmerAnimation();

  return (
    <View style={styles.settingItem}>
      <Animated.View style={[styles.settingIcon, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      <View style={styles.settingContent}>
        <Animated.View style={[styles.settingTitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.settingSubtitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      </View>
      <Animated.View style={[styles.settingToggle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
    </View>
  );
}

// Map skeleton
export function SkeletonMap() {
  const { shimmerOpacity, shimmerColor } = useShimmerAnimation();
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.mapContainer, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f0f0f0' }]}>
      <Animated.View style={[styles.mapArea, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      <View style={styles.mapControls}>
        <Animated.View style={[styles.mapControl, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.mapControl, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header Skeleton Styles
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitle: {
    height: 20,
    width: 120,
    borderRadius: 4,
    marginBottom: 5,
  },
  headerSubtitle: {
    height: 14,
    width: 80,
    borderRadius: 4,
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },

  // Wallet Skeleton Styles
  walletContainer: {
    padding: 20,
    borderRadius: 15,
    margin: 20,
  },
  walletCard: {
    alignItems: 'center',
    padding: 30,
  },
  walletBalance: {
    height: 40,
    width: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  walletCurrency: {
    height: 16,
    width: 60,
    borderRadius: 4,
    marginBottom: 30,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 15,
  },
  walletButton: {
    height: 40,
    width: 80,
    borderRadius: 8,
  },

  // Transaction Skeleton Styles
  transactionHistory: {
    padding: 20,
    borderRadius: 15,
    margin: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    height: 16,
    width: '70%',
    borderRadius: 4,
    marginBottom: 5,
  },
  transactionDate: {
    height: 12,
    width: '40%',
    borderRadius: 4,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionPrice: {
    height: 16,
    width: 60,
    borderRadius: 4,
    marginBottom: 5,
  },
  transactionStatus: {
    height: 12,
    width: 40,
    borderRadius: 4,
  },

  // Profile Skeleton Styles
  profileContainer: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileName: {
    height: 24,
    width: 150,
    borderRadius: 4,
  },
  profileInfo: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  profileInfoItem: {
    height: 16,
    width: '100%',
    borderRadius: 4,
    marginBottom: 10,
  },
  profileActions: {
    gap: 15,
  },
  profileAction: {
    height: 50,
    borderRadius: 8,
  },

  // Search Skeleton Styles
  searchPage: {
    flex: 1,
    padding: 20,
  },
  searchBar: {
    height: 50,
    borderRadius: 25,
    marginBottom: 20,
  },
  searchSuggestions: {
    marginBottom: 20,
    gap: 10,
  },
  suggestionItem: {
    height: 40,
    borderRadius: 8,
  },
  searchResults: {
    flex: 1,
    gap: 15,
  },
  searchResult: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    borderRadius: 12,
  },
  searchResultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    height: 16,
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  searchResultSubtitle: {
    height: 14,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  searchResultPrice: {
    height: 14,
    width: 50,
    borderRadius: 4,
  },

  // Messages Skeleton Styles
  chatContainer: {
    flex: 1,
    padding: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  messageBubble: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 15,
    padding: 12,
    maxWidth: '70%',
  },
  ownMessageBubble: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  messageText: {
    height: 16,
    width: 120,
    borderRadius: 4,
    marginBottom: 5,
  },
  messageTime: {
    height: 10,
    width: 40,
    borderRadius: 4,
  },

  // Settings Skeleton Styles
  settingsContainer: {
    flex: 1,
    padding: 20,
  },
  settingsSection: {
    marginBottom: 30,
  },
  settingsSectionTitle: {
    height: 20,
    width: 120,
    borderRadius: 4,
    marginBottom: 15,
  },
  settingsItems: {
    backgroundColor: 'rgba(150, 150, 150, 0.05)',
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  settingIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    height: 16,
    width: '60%',
    borderRadius: 4,
    marginBottom: 5,
  },
  settingSubtitle: {
    height: 12,
    width: '80%',
    borderRadius: 4,
  },
  settingToggle: {
    width: 40,
    height: 20,
    borderRadius: 10,
  },

  // Map Skeleton Styles
  mapContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    margin: 20,
  },
  mapArea: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 10,
  },
  mapControl: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});