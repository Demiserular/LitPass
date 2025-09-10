import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useToast } from '@/components/Toast';
import { router } from 'expo-router';
import { ScreenErrorBoundary } from '@/components/ErrorBoundaries';
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  Shield,
  Smartphone,
  Volume2,
  Eye,
  Download,
  Trash2,
  HelpCircle,
  Info,
  ChevronRight,
} from 'lucide-react-native';

// Settings storage keys
const SETTINGS_KEYS = {
  THEME: 'app_theme',
  NOTIFICATIONS: 'notifications_enabled',
  PUSH_NOTIFICATIONS: 'push_notifications',
  SOUND_EFFECTS: 'sound_effects',
  HAPTIC_FEEDBACK: 'haptic_feedback',
  BIOMETRIC_AUTH: 'biometric_auth',
  AUTO_DOWNLOAD: 'auto_download',
  PRIVACY_MODE: 'privacy_mode',
  ANALYTICS: 'analytics_enabled',
};

interface SettingsState {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  pushNotifications: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  biometricAuth: boolean;
  autoDownload: boolean;
  privacyMode: boolean;
  analytics: boolean;
}

const defaultSettings: SettingsState = {
  theme: 'auto',
  notifications: true,
  pushNotifications: true,
  soundEffects: true,
  hapticFeedback: true,
  biometricAuth: false,
  autoDownload: true,
  privacyMode: false,
  analytics: true,
};

function SettingsScreenContent() {
  const colorScheme = useColorScheme();
  const { showToast } = useToast();
  const isDark = colorScheme === 'dark';
  
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = { ...defaultSettings };
      
      // Load each setting from AsyncStorage
      for (const [key, storageKey] of Object.entries(SETTINGS_KEYS)) {
        const value = await AsyncStorage.getItem(storageKey);
        if (value !== null) {
          const settingKey = key.toLowerCase() as keyof SettingsState;
          if (settingKey === 'theme') {
            loadedSettings[settingKey] = value as 'light' | 'dark' | 'auto';
          } else {
            loadedSettings[settingKey] = JSON.parse(value);
          }
        }
      }
      
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      showToast('Failed to load settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSetting = async (key: keyof SettingsState, value: any) => {
    try {
      const storageKey = SETTINGS_KEYS[key.toUpperCase() as keyof typeof SETTINGS_KEYS];
      await AsyncStorage.setItem(storageKey, typeof value === 'string' ? value : JSON.stringify(value));
      
      setSettings(prev => ({ ...prev, [key]: value }));
      showToast('Setting saved', 'success', 1500);
    } catch (error) {
      console.error('Failed to save setting:', error);
      showToast('Failed to save setting', 'error');
    }
  };

  const handleThemeChange = () => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['auto', 'light', 'dark'];
    const currentIndex = themes.indexOf(settings.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    saveSetting('theme', nextTheme);
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all app data including settings, search history, and cached content. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setSettings(defaultSettings);
              showToast('All data cleared', 'success');
            } catch (error) {
              showToast('Failed to clear data', 'error');
            }
          },
        },
      ]
    );
  };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light': return <Sun size={24} color={isDark ? '#fff' : '#000'} />;
      case 'dark': return <Moon size={24} color={isDark ? '#fff' : '#000'} />;
      default: return <Smartphone size={24} color={isDark ? '#fff' : '#000'} />;
    }
  };

  const getThemeText = () => {
    switch (settings.theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      default: return 'Auto';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>
            Loading settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
          Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Appearance
          </Text>
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem} onPress={handleThemeChange}>
              {getThemeIcon()}
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Theme
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  {getThemeText()}
                </Text>
              </View>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Notifications
          </Text>
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <Bell size={24} color={isDark ? '#fff' : '#000'} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Notifications
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Enable app notifications
                </Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => saveSetting('notifications', value)}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={settings.notifications ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingItem}>
              <Smartphone size={24} color={isDark ? '#fff' : '#000'} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Push Notifications
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Receive push notifications
                </Text>
              </View>
              <Switch
                value={settings.pushNotifications}
                onValueChange={(value) => saveSetting('pushNotifications', value)}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={settings.pushNotifications ? '#fff' : '#f4f3f4'}
              />
            </View>
          </BlurView>
        </View>

        {/* Experience Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Experience
          </Text>
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <Volume2 size={24} color={isDark ? '#fff' : '#000'} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Sound Effects
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Play sounds for interactions
                </Text>
              </View>
              <Switch
                value={settings.soundEffects}
                onValueChange={(value) => saveSetting('soundEffects', value)}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={settings.soundEffects ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingItem}>
              <Smartphone size={24} color={isDark ? '#fff' : '#000'} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Haptic Feedback
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Feel vibrations for actions
                </Text>
              </View>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(value) => saveSetting('hapticFeedback', value)}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={settings.hapticFeedback ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingItem}>
              <Download size={24} color={isDark ? '#fff' : '#000'} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Auto Download
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Download content automatically
                </Text>
              </View>
              <Switch
                value={settings.autoDownload}
                onValueChange={(value) => saveSetting('autoDownload', value)}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={settings.autoDownload ? '#fff' : '#f4f3f4'}
              />
            </View>
          </BlurView>
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Privacy & Security
          </Text>
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <Shield size={24} color={isDark ? '#fff' : '#000'} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Biometric Authentication
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Use fingerprint or face ID
                </Text>
              </View>
              <Switch
                value={settings.biometricAuth}
                onValueChange={(value) => saveSetting('biometricAuth', value)}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={settings.biometricAuth ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingItem}>
              <Eye size={24} color={isDark ? '#fff' : '#000'} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Privacy Mode
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Hide sensitive information
                </Text>
              </View>
              <Switch
                value={settings.privacyMode}
                onValueChange={(value) => saveSetting('privacyMode', value)}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={settings.privacyMode ? '#fff' : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingItem}>
              <Info size={24} color={isDark ? '#fff' : '#000'} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Analytics
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Help improve the app
                </Text>
              </View>
              <Switch
                value={settings.analytics}
                onValueChange={(value) => saveSetting('analytics', value)}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={settings.analytics ? '#fff' : '#f4f3f4'}
              />
            </View>
          </BlurView>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Support
          </Text>
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem}>
              <HelpCircle size={24} color={isDark ? '#fff' : '#000'} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Help & Support
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Get help and contact support
                </Text>
              </View>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <Info size={24} color={isDark ? '#fff' : '#000'} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  About
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  App version and information
                </Text>
              </View>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#FF3B30' }]}>
            Danger Zone
          </Text>
          <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem} onPress={clearAllData}>
              <Trash2 size={24} color="#FF3B30" />
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: '#FF3B30' }]}>
                  Clear All Data
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Remove all app data and settings
                </Text>
              </View>
              <ChevronRight size={20} color={isDark ? '#666' : '#999'} />
            </TouchableOpacity>
          </BlurView>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDark ? '#666' : '#999' }]}>
            LitPass v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 34, // Compensate for back button width
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  settingsCard: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginLeft: 59, // Align with text content
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
  },
});

export default function SettingsScreen() {
  return (
    <ScreenErrorBoundary screenName="Settings">
      <SettingsScreenContent />
    </ScreenErrorBoundary>
  );
}