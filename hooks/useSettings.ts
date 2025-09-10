import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface SettingsState {
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

export function useSettings() {
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof SettingsState, value: any) => {
    try {
      const storageKey = SETTINGS_KEYS[key.toUpperCase() as keyof typeof SETTINGS_KEYS];
      await AsyncStorage.setItem(storageKey, typeof value === 'string' ? value : JSON.stringify(value));
      
      setSettings(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (error) {
      console.error('Failed to save setting:', error);
      return false;
    }
  };

  const resetSettings = async () => {
    try {
      // Clear all settings from storage
      for (const storageKey of Object.values(SETTINGS_KEYS)) {
        await AsyncStorage.removeItem(storageKey);
      }
      setSettings(defaultSettings);
      return true;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      return false;
    }
  };

  const getSetting = (key: keyof SettingsState) => {
    return settings[key];
  };

  return {
    settings,
    isLoading,
    updateSetting,
    resetSettings,
    getSetting,
    loadSettings,
  };
}