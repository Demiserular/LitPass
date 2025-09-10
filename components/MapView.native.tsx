import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { useEvents } from '@/hooks/useEvents';

// Platform-specific imports to avoid native module errors
let RNMapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    const maps = require('react-native-maps');
    RNMapView = maps.default;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (error) {
    console.warn('Failed to load react-native-maps:', error);
  }
}
import { X } from 'lucide-react-native';

interface Event {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapViewProps {
  onClose: () => void;
}

const DEFAULT_REGION = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 180,
  longitudeDelta: 180,
};

export function MapView({ onClose }: MapViewProps) {
  const { events, loading, error } = useEvents();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error loading events</Text>
      </View>
    );
  }

  const renderMap = () => {
    // This component is native-only, no need for web check
    return (
      <RNMapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
      >
        {events.map(event => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.latitude,
              longitude: event.longitude
            }}
            title={event.name}
            description={event.address}
          />
        ))}      
      </RNMapView>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Venues</Text>
      </View>
      {renderMap()}
    </View>
  );
}

// Add VenueMapView export (identical to MapView for now)
export const VenueMapView = MapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  map: {
    flex: 1,
  },
});