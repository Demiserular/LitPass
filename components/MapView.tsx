// components/MapView.tsx
// This file acts as an entry point for the platform-specific map views.
// React Native's bundler (Metro) will automatically resolve the correct file
// based on the platform extension (.native.tsx or .web.tsx).

// The bundler will import MapView from MapView.native.tsx on native
// and MapView from MapView.web.tsx on web

// Re-export the component from the platform-specific files.
// The bundler handles the resolution based on the platform.
export { MapView, VenueMapView } from './MapView.native';