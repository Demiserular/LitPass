import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  FlatList
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, useThemeColors } from '@/contexts/ThemeContext';

interface StoryCameraViewProps {
  onClose?: () => void;
  onPublish?: (data: { data: StoryData }) => void;
}

interface StoryData {
  mediaUri: string;
  text: string;
  location: string;
  fields: any[];
  tags: any[];
  description: string;
  isPublic: boolean;
}

// StoryCameraView component for camera functionality
export default function StoryCameraView({ onClose, onPublish }: StoryCameraViewProps) {
  const [hasPermission, setHasPermission] = useState(true); // Assume permission for mock
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [locationText, setLocationText] = useState<string>('');
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [showLocationInput, setShowLocationInput] = useState<boolean>(false);
  const [isReady, setIsReady] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);

  useEffect(() => {
    // Simulate camera initialization
    const timer = setTimeout(() => setIsReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const takePicture = async () => {
    // Simulate taking a picture
    setCaptureCount(captureCount + 1);
    // Generate a mock image URI with timestamp to make it unique
    const mockImageUri = `mock-story-image-${Date.now()}.jpg`;
    setCapturedImage(mockImageUri);
  };

  const handleTextToggle = () => {
    setShowTextInput(!showTextInput);
    setShowLocationInput(false);
  };

  const handleLocationToggle = () => {
    setShowLocationInput(!showLocationInput);
    setShowTextInput(false);
  };

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('Permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocationText(`📍 ${location.coords.latitude.toFixed(2)}, ${location.coords.longitude.toFixed(2)}`);
      setShowLocationInput(false);
    } catch (error) {
      setLocationText('Error getting location');
    }
  };

  const handlePublish = () => {
    if (capturedImage && onPublish) {
      onPublish({
        data: {
          mediaUri: capturedImage,
          text: text,
          location: locationText,
          fields: [],
          tags: [],
          description: text,
          isPublic: true
        }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {!capturedImage ? (
        // Camera view
        <View style={styles.cameraContainer}>
          <View style={styles.camera}>
            {/* Camera simulation view */}
            <View style={styles.simulatedCameraView}>
              <Text style={styles.simulationText}>
                {isReady ? 
                  'CAMERA SIMULATION (tap capture button)' : 
                  'Initializing camera...'
                }
              </Text>
              {!isReady && (
                <View style={styles.initializingIndicator} />
              )}
            </View>
            
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.bottomControls}>
              <TouchableOpacity 
                style={[styles.captureButton, !isReady && styles.captureButtonDisabled]} 
                onPress={isReady ? takePicture : undefined}
                disabled={!isReady}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        // Preview view
        <View style={styles.previewContainer}>
          {/* Use solid color instead of actual image since we don't have real photos */}
          <View style={styles.mockImagePreview}>
            <Text style={styles.mockImageText}>
              Image Preview {captureCount}
            </Text>
            <MaterialIcons name="photo-camera" size={64} color="rgba(255,255,255,0.3)" />
          </View>
          
          {/* Text overlay */}
          {text ? (
            <View style={styles.textOverlay}>
              <Text style={styles.textOverlayContent}>{text}</Text>
            </View>
          ) : null}
          
          {/* Location overlay */}
          {locationText ? (
            <View style={styles.locationOverlay}>
              <Text style={styles.locationText}>{locationText}</Text>
            </View>
          ) : null}
          
          {/* Controls for editing */}
          <View style={styles.editControls}>
            <TouchableOpacity style={styles.editButton} onPress={handleTextToggle}>
              <MaterialIcons name="text-fields" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.editButton} onPress={handleLocationToggle}>
              <MaterialIcons name="location-on" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Text input */}
          {showTextInput && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={text}
                onChangeText={setText}
                placeholder="Add your text here..."
                placeholderTextColor="#aaa"
                autoFocus
              />
            </View>
          )}
          
          {/* Location input */}
          {showLocationInput && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={locationText}
                onChangeText={setLocationText}
                placeholder="Add location..."
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity style={styles.getCurrentLocation} onPress={handleGetLocation}>
                <Text style={styles.getCurrentLocationText}>Get Current Location</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Bottom action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={() => setCapturedImage(null)}
            >
              <MaterialIcons name="replay" size={28} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.publishButton]} 
              onPress={handlePublish}
            >
              <MaterialIcons name="send" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  simulatedCameraView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simulationText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  initializingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5E5CE6',
    marginTop: 20,
    opacity: 0.7,
  },
  mockImagePreview: {
    flex: 1,
    backgroundColor: '#3C3C3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockImageText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 20) + 20 : 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  textOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '40%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  textOverlayContent: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  locationOverlay: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
  },
  editControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
  textInput: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  getCurrentLocation: {
    backgroundColor: '#2a52be',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  getCurrentLocationText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#555',
  },
  publishButton: {
    backgroundColor: '#2a52be',
  },
});

interface StoryProps {
  stories: Array<{
    id: string;
    title: string;
    image: any;
    hasNewContent?: boolean;
  }>;
  onStoryPress: (id: string) => void;
}

interface StoryItem {
  id: string;
  title: string;
  image: any;
  hasNewContent?: boolean;
  isCreateButton?: boolean;
}

// This is the actual Story component that's imported in HomeScreen
export function Story({ stories, onStoryPress }: StoryProps) {
  const { theme } = useTheme();
  const colors = useThemeColors();

  return (
    <View style={storyStyles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          { id: 'create', title: 'Your Story', image: null, isCreateButton: true },
          ...stories
        ] as StoryItem[]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={storyStyles.storyItem}
            onPress={() => onStoryPress(item.id)}
          >
            <View style={[
              storyStyles.storyRing,
              { borderColor: theme === 'dark' ? '#444' : '#E5E5E7' },
              item.hasNewContent ? { borderColor: colors.primary } : null
            ]}>
              {item.isCreateButton ? (
                <View style={[
                  storyStyles.createButton,
                  { backgroundColor: theme === 'dark' ? '#333' : '#F2F2F7' }
                ]}>
                  <MaterialIcons 
                    name="add" 
                    size={24} 
                    color={theme === 'dark' ? '#fff' : '#007AFF'} 
                  />
                </View>
              ) : (
                <Image
                  source={item.image}
                  style={storyStyles.storyImage}
                />
              )}
            </View>
            <Text style={[
              storyStyles.storyTitle,
              { color: colors.text }
            ]} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Styles for the Story component
const storyStyles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 80,
  },
  storyRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hasNewContent: {
    borderColor: '#5E5CE6',
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  storyTitle: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '500',
  },
  createButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});