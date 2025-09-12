import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { CameraView as ExpoCameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../contexts/ThemeContext';

interface EnhancedCameraViewProps {
  onClose?: () => void;
  onCapture?: (media: { uri: string; type: 'photo' | 'video' }) => void;
  mode?: 'photo' | 'video';
}

const EnhancedCameraView: React.FC<EnhancedCameraViewProps> = ({
  onClose,
  onCapture,
  mode = 'photo',
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [capturedMedia, setCapturedMedia] = useState<{
    uri: string;
    type: 'photo' | 'video';
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentMode, setCurrentMode] = useState<'photo' | 'video'>(mode);
  
  const colors = useThemeColors();
  const cameraRef = useRef<any>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(status === 'granted' && audioStatus.status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      setRecordingTime(0);
      pulseAnim.setValue(1);
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (currentMode === 'photo') {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
        setCapturedMedia({ uri: photo.uri, type: 'photo' });
        if (onCapture) {
          onCapture({ uri: photo.uri, type: 'photo' });
        }
      } else {
        if (isRecording) {
          // Stop recording
          cameraRef.current.stopRecording();
          // The recording will complete and trigger the promise resolution
        } else {
          // Start recording
          setIsRecording(true);
          try {
            const video = await cameraRef.current.recordAsync({
              quality: '720p',
              maxDuration: 60, // 60 seconds max
            });
            // Video recording completed (either by time limit or manual stop)
            setIsRecording(false);
            if (video && video.uri) {
              setCapturedMedia({ uri: video.uri, type: 'video' });
              if (onCapture) {
                onCapture({ uri: video.uri, type: 'video' });
              }
            }
          } catch (recordError) {
            console.error('Recording error:', recordError);
            setIsRecording(false);
          }
        }
      }
    } catch (error) {
      console.error('Error capturing media:', error);
      setIsRecording(false);
    }
  };

  const toggleCameraType = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleMode = () => {
    if (isRecording) return; // Don't allow mode change while recording
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMode(current => (current === 'photo' ? 'video' : 'photo'));
  };

  const retakeMedia = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCapturedMedia(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.text }]}>
          No access to camera
        </Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {capturedMedia ? (
        <View style={styles.previewContainer}>
          {capturedMedia.type === 'photo' ? (
            <Image source={{ uri: capturedMedia.uri }} style={styles.preview} />
          ) : (
            <View style={styles.videoPreview}>
              <Text style={[styles.videoText, { color: colors.text }]}>
                Video captured successfully!
              </Text>
              <Ionicons name="videocam" size={64} color={colors.text} />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={retakeMedia}>
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <ExpoCameraView
            style={styles.camera}
            facing={cameraType}
            ref={cameraRef}
            mode={currentMode}
          />
          
          {/* Overlay positioned absolutely */}
          <View style={styles.overlay}>
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>

              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingTime}>
                    {formatTime(recordingTime)}
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.modeToggle} onPress={toggleMode}>
                <Text style={styles.modeText}>
                  {currentMode === 'photo' ? 'PHOTO' : 'VIDEO'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomControls}>
              <View style={styles.captureContainer}>
                <Animated.View
                  style={[
                    styles.captureButton,
                    currentMode === 'video' && isRecording && {
                      transform: [{ scale: pulseAnim }],
                      backgroundColor: '#FF4444',
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.captureButtonInner}
                    onPress={handleCapture}
                  >
                    {currentMode === 'video' && isRecording ? (
                      <View style={styles.stopIcon} />
                    ) : (
                      <View
                        style={[
                          styles.captureButtonCore,
                          currentMode === 'video' && styles.videoCaptureCore,
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={toggleCameraType}
              >
                <Ionicons name="camera-reverse" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeToggle: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  modeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 8,
  },
  recordingTime: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
  videoCaptureCore: {
    borderRadius: 8,
    backgroundColor: '#FF4444',
  },
  stopIcon: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  switchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 40,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
  },
  videoPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  videoText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default EnhancedCameraView;