import { View, StyleSheet, TouchableOpacity, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload';
import { Mail, Phone, Edit2, Settings, LogOut, User, Shield, Bell } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useSafeToast } from '@/hooks/useErrorHandler';
import { ComponentErrorBoundary } from '@/components/ErrorBoundaries';
import { SkeletonProfile } from '@/components/SkeletonComponents';
import { useSimulatedLoading } from '@/hooks/useSkeletonLoader';
import { ScreenTransition } from '@/components/PageTransition';
import { useTheme, useThemeColors } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUser } from '@/store/slices/userSlice';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const colors = useThemeColors();
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const { showToast } = useSafeToast();
  const dispatch = useAppDispatch();
  const userState = useAppSelector((state) => state.user);
  const { isLoading } = userState;

  useEffect(() => {
    // In a real app, you would get the userId from your auth context
    dispatch(fetchUser('user-id-placeholder'));
  }, [dispatch]);

  const handleImageSelected = (uri: string) => {
    setProfileImage(uri);
    console.log('Profile picture updated:', uri);
    showToast('Profile picture updated!', 'success');
    // Here you would typically upload to your backend
  };

  const handleEditProfile = () => {
    showToast('Edit profile feature coming soon!', 'info');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleLogout = () => {
    showToast('Logged out successfully', 'success');
    // Add logout logic here
  };

  if (isLoading) {
    return (
      <ComponentErrorBoundary componentName="ProfilePage">
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          <SkeletonProfile />
        </SafeAreaView>
      </ComponentErrorBoundary>
    );
  }

  // Don't block the screen on error; render with graceful fallbacks

  return (
    <ScreenTransition transitionType="scale" duration={320}>
      <ComponentErrorBoundary componentName="ProfileScreen">
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
            </View>

            {/* Profile Section */}
            <View style={[styles.profileSection, { backgroundColor: colors.secondaryBackground }]}>
              <BlurView 
                intensity={theme === 'dark' ? 20 : 10} 
                tint={theme === 'dark' ? 'dark' : 'light'} 
                style={styles.profileBlur}
              >
                <ComponentErrorBoundary componentName="ProfilePictureUpload">
                  <ProfilePictureUpload
                    currentImage={profileImage}
                    onImageSelected={handleImageSelected}
                    size={100}
                  />
                </ComponentErrorBoundary>
                <Text style={[styles.name, { color: colors.text }]}>{userState?.name}</Text>
                <Text style={[styles.subtitle, { color: colors.secondaryText }]}>LitPass Member</Text>
              </BlurView>
            </View>

            {/* Contact Info */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
              <View style={[styles.infoCard, { backgroundColor: colors.secondaryBackground }]}>
                <View style={styles.infoItem}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Mail size={20} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Email</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{userState?.email}</Text>
                  </View>
                </View>
                
                <View style={[styles.divider, { backgroundColor: colors.separator }]} />
                
                <View style={styles.infoItem}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Phone size={20} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>Phone</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>+1 (555) 999-999</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
              <View style={[styles.actionsCard, { backgroundColor: colors.secondaryBackground }]}>
                <TouchableOpacity style={styles.actionItem} onPress={handleEditProfile}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Edit2 size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.actionText, { color: colors.text }]}>Edit Profile</Text>
                </TouchableOpacity>
                
                <View style={[styles.divider, { backgroundColor: colors.separator }]} />
                
                <TouchableOpacity style={styles.actionItem} onPress={handleSettings}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <Settings size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.actionText, { color: colors.text }]}>Settings</Text>
                </TouchableOpacity>
                
                <View style={[styles.divider, { backgroundColor: colors.separator }]} />
                
                <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
                    <LogOut size={20} color={colors.accent} />
                  </View>
                  <Text style={[styles.actionText, { color: colors.accent }]}>Logout</Text>
                </TouchableOpacity>
              </View>
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  profileSection: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  profileBlur: {
    padding: 32,
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  infoCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  actionsCard: {
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
    letterSpacing: -0.1,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});