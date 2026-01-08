import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

interface NativeMapViewProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function NativeMapView({ latitude, longitude, onLocationChange }: NativeMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const [pinPosition, setPinPosition] = useState({ latitude, longitude });
  const [initialRegion] = useState<Region>({
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 300);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    setPinPosition({ latitude, longitude });
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  }, [latitude, longitude]);

  const handleMapPress = (event: any) => {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
    console.log('Map tapped at:', lat, lng);
    setPinPosition({ latitude: lat, longitude: lng });
    onLocationChange(lat, lng);
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        mapType="satellite"
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={Platform.OS === 'android'}
        loadingEnabled={true}
        loadingIndicatorColor="#007AFF"
        loadingBackgroundColor="#F5F5F5"
        pitchEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        onPress={handleMapPress}
      >
        <Marker
          coordinate={pinPosition}
          draggable
          onDragEnd={handleMapPress}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({});
void styles;
