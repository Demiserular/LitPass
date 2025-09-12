import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Camera, Video, Image, X, Upload } from 'lucide-react-native';
import { useTheme, useThemeColors } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onVideoPress: () => void;
  onGalleryPress: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function PostModal({
  visible,
  onClose,
  onCameraPress,
  onVideoPress,
  onGalleryPress,
}: PostModalProps) {
  const { theme } = useTheme();
  const colors = useThemeColors();
  const [scaleAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 30,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 300,
        friction: 30,
      }).start();
    }
  }, [visible]);

  const handleOptionPress = (action: () => void) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    action();
    onClose();
  };

  const handleGalleryPress = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to access your photos!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Images, ImagePicker.MediaType.Videos],
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        onGalleryPress();
        // Handle the selected media
        console.log('Selected media:', result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView
          intensity={20}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.secondaryBackground,
              borderColor: colors.separator,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Create Post
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.tertiaryBackground }]}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.option, { backgroundColor: colors.tertiaryBackground }]}
              onPress={() => handleOptionPress(onCameraPress)}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B' }]}>
                <Camera size={24} color="white" />
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>
                Take Photo
              </Text>
              <Text style={[styles.optionSubtext, { color: colors.secondaryText }]}>
                Capture a moment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: colors.tertiaryBackground }]}
              onPress={() => handleOptionPress(onVideoPress)}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#4ECDC4' }]}>
                <Video size={24} color="white" />
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>
                Record Video
              </Text>
              <Text style={[styles.optionSubtext, { color: colors.secondaryText }]}>
                Share your story
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: colors.tertiaryBackground }]}
              onPress={() => handleOptionPress(handleGalleryPress)}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#45B7D1' }]}>
                <Image size={24} color="white" />
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>
                Choose from Gallery
              </Text>
              <Text style={[styles.optionSubtext, { color: colors.secondaryText }]}>
                Select existing media
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  optionSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
});