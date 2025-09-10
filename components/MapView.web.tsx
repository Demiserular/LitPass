import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useEvents } from '@/hooks/useEvents';

interface MapViewProps {
  events?: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }>;
}

interface VenueMapViewProps {
  onClose: () => void;
}

export function MapView({ events = [] }: MapViewProps) {
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          #map { width: 100%; height: 100%; }
          body { margin: 0; }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
        <script>
          function initMap() {
            const map = new google.maps.Map(document.getElementById('map'), {
              center: { lat: 0, lng: 0 },
              zoom: 2
            });
            
            const events = ${JSON.stringify(events)};
            events.forEach(event => {
              new google.maps.Marker({
                position: { lat: event.latitude, lng: event.longitude },
                map: map,
                title: event.name
              });
            });
          }
        </script>
      </head>
      <body onload="initMap()">
        <div id="map"></div>
      </body>
    </html>
  `;

  return (
    <div style={styles.container}>
      <iframe
        srcDoc={mapHtml}
        style={styles.map}
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}

// Add VenueMapView component for web
export function VenueMapView({ onClose }: VenueMapViewProps) {
  const { events, loading, error } = useEvents();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error loading events</Text>;
  }

  return (
    <View style={styles.venueContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Venues</Text>
      </View>
      <MapView events={events} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
  venueContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
});