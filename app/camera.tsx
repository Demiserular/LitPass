import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CameraView from '../components/CameraView';

export default function CameraScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = (photoUri: string) => {
    setCapturedImage(photoUri);
    // Here you would typically upload the image or process it further
    console.log('Photo captured:', photoUri);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Camera',
          headerShown: !showCamera,
        }} 
      />
      
      {showCamera ? (
        <CameraView 
          onClose={() => setShowCamera(false)} 
          onCapture={handleCapture} 
        />
      ) : (
        <View style={styles.content}>
          {capturedImage ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: capturedImage }} style={styles.preview} />
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => setShowCamera(true)}
              >
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.buttonText}>Take Another Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setShowCamera(true)}
            >
              <Ionicons name="add-circle" size={80} color="#007AFF" />
              <Text style={styles.addButtonText}>Add Story</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  addButtonText: {
    marginTop: 10,
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
}); 