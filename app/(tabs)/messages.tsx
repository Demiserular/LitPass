import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Search, Plus, MoreHorizontal } from 'lucide-react-native';
import { SkeletonChat } from '@/components/SkeletonComponents';
import { useSimulatedLoading } from '@/hooks/useSkeletonLoader';
import { ComponentErrorBoundary } from '@/components/ErrorBoundaries';
import { ScreenTransition } from '@/components/PageTransition';
import { useTheme, useThemeColors } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';

const mockChats = [
  { id: '1', name: 'Sarah Johnson', lastMessage: 'See you at the pub tonight!', time: '2m', unread: 2, avatar: '👩‍💼' },
  { id: '2', name: 'Mike Chen', lastMessage: 'The concert was amazing 🎵', time: '15m', unread: 0, avatar: '👨‍💻' },
  { id: '3', name: 'Party Squad', lastMessage: 'Who\'s joining for drinks?', time: '1h', unread: 5, avatar: '🎉' },
  { id: '4', name: 'Emma Wilson', lastMessage: 'Thanks for the recommendation!', time: '3h', unread: 0, avatar: '👩‍🎨' },
  { id: '5', name: 'Weekend Crew', lastMessage: 'Planning this Saturday...', time: '1d', unread: 1, avatar: '🍻' },
];

export default function MessagesScreen() {
  const { isLoading } = useSimulatedLoading(1800);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <ComponentErrorBoundary componentName="MessagesPage">
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          <SkeletonChat />
        </SafeAreaView>
      </ComponentErrorBoundary>
    );
  }

  return (
    <ScreenTransition transitionType="slideDown" duration={300}>
      <ComponentErrorBoundary componentName="MessagesScreen">
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
            <TouchableOpacity style={[styles.newMessageButton, { backgroundColor: colors.primary }]}>
              <Plus size={20} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.secondaryBackground }]}>
            <Search size={18} color={colors.secondaryText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search conversations..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Chat List */}
          <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
            {mockChats.map((chat) => (
              <TouchableOpacity 
                key={chat.id} 
                style={[styles.chatItem, { backgroundColor: colors.background }]}
                activeOpacity={0.7}
              >
                <BlurView 
                  intensity={theme === 'dark' ? 15 : 8} 
                  tint={theme === 'dark' ? 'dark' : 'light'} 
                  style={styles.chatItemBlur}
                >
                  <View style={[styles.avatar, { backgroundColor: colors.secondaryBackground }]}>
                    <Text style={styles.avatarText}>{chat.avatar}</Text>
                  </View>
                  
                  <View style={styles.chatContent}>
                    <View style={styles.chatHeader}>
                      <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
                        {chat.name}
                      </Text>
                      <Text style={[styles.chatTime, { color: colors.secondaryText }]}>
                        {chat.time}
                      </Text>
                    </View>
                    
                    <View style={styles.chatFooter}>
                      <Text 
                        style={[
                          styles.lastMessage, 
                          { color: colors.secondaryText }
                        ]} 
                        numberOfLines={1}
                      >
                        {chat.lastMessage}
                      </Text>
                      {chat.unread > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.unreadText}>{chat.unread}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
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
  newMessageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  chatList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatItem: {
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  chatItemBlur: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    letterSpacing: -0.2,
  },
  chatTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});