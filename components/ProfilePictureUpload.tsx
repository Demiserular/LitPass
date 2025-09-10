import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Modal, Text } from 'react-native';
import { Image } from 'expo-image';
import { Camera, ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageSelected: (uri: string) => void;
  size?: number;
}

export function ProfilePictureUpload({ 
  currentImage, 
  onImageSelected, 
  size = 120 
}: ProfilePictureUploadProps) {
  const colorScheme = useColorScheme();
  const [showOptions, setShowOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to upload a profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const processImage = async (uri: string) => {
    setIsProcessing(true);
    try {
      // Crop and resize the image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 400, height: 400 } }, // Resize to reasonable size
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      onImageSelected(manipulatedImage.uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process the image. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowOptions(false);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[
          0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowOptions(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.imageContainer, { width: size, height: size }]}
        onPress={handlePress}
        disabled={isProcessing}
      >
        {currentImage ? (
          <Image
            source={{ uri: currentImage }}
            style={[styles.profileImage, { width: size, height: size }]}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.placeholderContainer, { 
            width: size, 
            height: size,
            backgroundColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
          }]}>
            <ImageIcon 
              size={size * 0.4} 
              color={colorScheme === 'dark' ? '#666' : '#999'} 
            />
          </View>
        )}
        
        <View style={[styles.editOverlay, {
          backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
        }]}>
          <Camera 
            size={20} 
            color={colorScheme === 'dark' ? '#fff' : '#000'} 
          />
        </View>

        {isProcessing && (
          <View style={[styles.processingOverlay, { 
            width: size, 
            height: size,
          }]}>
            <BlurView intensity={80} style={StyleSheet.absoluteFill} />
            <Text style={[styles.processingText, {
              color: colorScheme === 'dark' ? '#fff' : '#000',
            }]}>
              Processing...
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} style={StyleSheet.absoluteFill} />
          <View style={[styles.optionsContainer, {
            backgroundColor: colorScheme === 'dark' ? '#222' : '#fff',
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {
                color: colorScheme === 'dark' ? '#fff' : '#000',
              }]}>
                Update Profile Picture
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowOptions(false)}
              >
                <X size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.optionButton, {
                backgroundColor: colorScheme === 'dark' ? '#333' : '#f8f8f8',
              }]}
              onPress={takePhoto}
            >
              <Camera size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
              <Text style={[styles.optionText, {
                color: colorScheme === 'dark' ? '#fff' : '#000',
              }]}>
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, {
                backgroundColor: colorScheme === 'dark' ? '#333' : '#f8f8f8',
              }]}
              onPress={pickFromLibrary}
            >
              <ImageIcon size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
              <Text style={[styles.optionText, {
                color: colorScheme === 'dark' ? '#fff' : '#000',
              }]}>
                Choose from Library
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
  },
  profileImage: {
    borderRadius: 60,
  },
  placeholderContainer: {
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  optionsContainer: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});