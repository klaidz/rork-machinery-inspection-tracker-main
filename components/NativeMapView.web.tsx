import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface NativeMapViewProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function NativeMapView({ latitude, longitude, onLocationChange }: NativeMapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinPosition, setPinPosition] = useState({ lat: latitude, lng: longitude });

  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = () => {
      if (!isMounted || !mapRef.current) {
        console.log('LoadLeaflet: Conditions not met', { isMounted, hasMapRef: !!mapRef.current });
        return;
      }

      if (window.L) {
        initializeMap();
        return;
      }

      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssLink.crossOrigin = '';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.async = true;
      script.onload = () => {
        if (isMounted && mapRef.current) {
          setTimeout(() => {
            if (isMounted && mapRef.current) {
              initializeMap();
            }
          }, 100);
        }
      };
      script.onerror = () => {
        console.error('Failed to load Leaflet script');
        if (isMounted) {
          setError('Failed to load map library');
          setIsLoading(false);
        }
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!isMounted || !mapRef.current || !window.L) {
        console.log('Map initialization skipped: ', {
          isMounted,
          hasMapRef: !!mapRef.current,
          hasLeaflet: !!window.L
        });
        return;
      }

      try {
        if (!(mapRef.current instanceof HTMLElement)) {
          console.error('mapRef.current is not an HTMLElement');
          return;
        }

        const map = window.L.map(mapRef.current, {
          center: [latitude, longitude],
          zoom: 17,
          zoomControl: true,
        });

        window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri',
          maxZoom: 19,
        }).addTo(map);

        window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri',
          maxZoom: 19,
        }).addTo(map);

        leafletMapRef.current = map;

        const marker = window.L.marker([latitude, longitude], {
          draggable: true,
        }).addTo(map);

        markerRef.current = marker;

        marker.on('dragend', (e: any) => {
          const position = e.target.getLatLng();
          console.log('Marker dragged to:', position.lat, position.lng);
          setPinPosition({ lat: position.lat, lng: position.lng });
          onLocationChange(position.lat, position.lng);
        });

        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          console.log('Map clicked at:', lat, lng);
          marker.setLatLng([lat, lng]);
          setPinPosition({ lat, lng });
          onLocationChange(lat, lng);
        });

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        if (isMounted) {
          setError('Error initializing map');
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      if (isMounted && mapRef.current) {
        loadLeaflet();
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (leafletMapRef.current && markerRef.current) {
      const newPos = { lat: latitude, lng: longitude };
      setPinPosition(newPos);
      leafletMapRef.current.setView([latitude, longitude], 17, { animate: true });
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);




  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <div
        ref={(el) => {
          if (el instanceof HTMLElement) {
            mapRef.current = el;
          } else if (el === null) {
            mapRef.current = null;
          }
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}
      <View style={styles.instructionOverlay} pointerEvents="none">
        <Text style={styles.instructionText}>
          {pinPosition.lat.toFixed(6)}, {pinPosition.lng.toFixed(6)}
        </Text>
        <Text style={styles.instructionSubtext}>
          Tap map to drop pin or drag to move it
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8E8E8',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  instructionOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  instructionSubtext: {
    fontSize: 12,
    color: '#666',
  },
});
