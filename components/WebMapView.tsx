import React from 'react';
import { StyleSheet } from 'react-native';

interface WebMapViewProps {
  venues: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }>;
}

export function WebMapView({ venues }: WebMapViewProps) {
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
            
            const venues = ${JSON.stringify(venues)};
            venues.forEach(venue => {
              new google.maps.Marker({
                position: { lat: venue.latitude, lng: venue.longitude },
                map: map,
                title: venue.name
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
});