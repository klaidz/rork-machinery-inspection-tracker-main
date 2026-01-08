import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  useColorScheme,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { MapPin, Check, Navigation } from 'lucide-react-native';
import * as ExpoLocation from 'expo-location';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';
import { Location } from '@/types';
import NativeMapView from '@/components/NativeMapView';



export default function NewLocationScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { addLocation } = useFleet();
  const { currentUser, isManagerOrAdmin } = useAuth();

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    (async () => {
      console.log('Location screen: checking permissions for user:', currentUser?.name, 'role:', currentUser?.role);
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          setIsLoadingLocation(true);
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              console.log('Web location obtained:', lat, lng);
              setLatitude(lat);
              setLongitude(lng);
              setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);

              setIsLoadingLocation(false);
            },
            (error) => {
              console.log('Location permission status:', error.code === 1 ? 'denied' : 'unavailable');
              setIsLoadingLocation(false);
              
              const defaultLat = 51.5074;
              const defaultLng = -0.1278;
              setLatitude(defaultLat);
              setLongitude(defaultLng);
              setAddress(`${defaultLat.toFixed(6)}, ${defaultLng.toFixed(6)}`);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        } else {
          console.log('Geolocation not available in this browser');
          const defaultLat = 51.5074;
          const defaultLng = -0.1278;
          setLatitude(defaultLat);
          setLongitude(defaultLng);
          setAddress(`${defaultLat.toFixed(6)}, ${defaultLng.toFixed(6)}`);
        }
      } else {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        console.log('Mobile location permission status:', status);
        if (status === 'granted') {
          try {
            setIsLoadingLocation(true);
            const location = await ExpoLocation.getCurrentPositionAsync({
              accuracy: ExpoLocation.Accuracy.Balanced,
              timeInterval: 5000,
              distanceInterval: 0,
            });
            const lat = location.coords.latitude;
            const lng = location.coords.longitude;
            console.log('Mobile location obtained:', lat, lng);
            
            setLatitude(lat);
            setLongitude(lng);
            
            const geocode = await ExpoLocation.reverseGeocodeAsync({
              latitude: lat,
              longitude: lng,
            });
            
            if (geocode[0]) {
              const addr = [
                geocode[0].street,
                geocode[0].city,
                geocode[0].region,
                geocode[0].postalCode,
              ]
                .filter(Boolean)
                .join(', ');
              setAddress(addr || 'Location marked on map');
            }
          } catch (error) {
            console.error('Error getting location:', error);
          } finally {
            setIsLoadingLocation(false);
          }
        }
      }
    })();
  }, [currentUser]);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              setLatitude(lat);
              setLongitude(lng);
              setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
              setIsLoadingLocation(false);
            },
            (error) => {
              console.log('Error getting location:', error.message);
              let userMessage = 'Could not get your current location. ';
              
              switch (error.code) {
                case 1:
                  userMessage += 'Please set the location manually on the map or enable location access in your browser.';
                  break;
                case 2:
                  userMessage += 'Please set the location manually on the map.';
                  break;
                case 3:
                  userMessage += 'Request timed out. Please try again or set the location manually.';
                  break;
                default:
                  userMessage += 'Please set the location manually on the map.';
              }
              
              Alert.alert('Location Info', userMessage);
              setIsLoadingLocation(false);
            },
            { enableHighAccuracy: true }
          );
        } else {
          Alert.alert('Error', 'Geolocation is not supported by this browser');
          setIsLoadingLocation(false);
        }
      } else {
        const { status } = await ExpoLocation.getForegroundPermissionsAsync();
        console.log('Current location permission status:', status);
        
        if (status !== 'granted') {
          const { status: newStatus } = await ExpoLocation.requestForegroundPermissionsAsync();
          console.log('Requested permission status:', newStatus);
          
          if (newStatus !== 'granted') {
            Alert.alert(
              'Permission Required',
              'Location permission is required to get your current location. Please enable it in Settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => ExpoLocation.requestForegroundPermissionsAsync() }
              ]
            );
            setIsLoadingLocation(false);
            return;
          }
        }
        
        const location = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 0,
        });
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;
        
        setLatitude(lat);
        setLongitude(lng);
        
        const geocode = await ExpoLocation.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });
        
        if (geocode[0]) {
          const addr = [
            geocode[0].street,
            geocode[0].city,
            geocode[0].region,
            geocode[0].postalCode,
          ]
            .filter(Boolean)
            .join(', ');
          setAddress(addr || 'Location marked on map');
        }
        setIsLoadingLocation(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', `Could not get current location: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoadingLocation(false);
    }
  };



  const openMapView = async () => {
    if (latitude === null || longitude === null) {
      await getCurrentLocation();
    }
    setShowMap(true);
  };

  const closeMapView = () => {
    setShowMap(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    if (latitude === null || longitude === null) {
      Alert.alert('Error', 'Please set a location on the map');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    const newLocation: Location = {
      id: Date.now().toString(),
      name: name.trim(),
      latitude,
      longitude,
      address: address || undefined,
      notes: notes.trim() || undefined,
      createdBy: currentUser.name,
      createdDate: new Date().toISOString(),
    };

    await addLocation(newLocation);
    Alert.alert('Success', 'Location added successfully');
    router.back();
  };

  if (!isManagerOrAdmin) {
    console.log('User does not have permission. Current role:', currentUser?.role, 'isManagerOrAdmin:', isManagerOrAdmin);
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'New Location', headerShown: true }} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Only admins and managers can create locations
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: 'New Location',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleSubmit} style={styles.headerButton}>
              <Check color={colors.tint} size={24} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        keyboardDismissMode="on-drag"
      >
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Location Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., Main Warehouse, Site A"
              placeholderTextColor={colors.secondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Additional information about this location..."
              placeholderTextColor={colors.secondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.mapHeader}>
            <MapPin color={colors.tint} size={20} />
            <Text style={[styles.mapTitle, { color: colors.text }]}>Location Pin</Text>
          </View>

          {isLoadingLocation ? (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text style={[styles.mapPlaceholderText, { color: colors.secondary }]}>
                Getting your location...
              </Text>
            </View>
          ) : latitude !== null && longitude !== null ? (
            <View style={styles.locationInfo}>
              <View style={[styles.locationBadge, { backgroundColor: colors.tint + '20' }]}>
                <MapPin color={colors.tint} size={16} />
                <Text style={[styles.locationBadgeText, { color: colors.tint }]}>
                  Location Set
                </Text>
              </View>
              
              <View style={styles.coordsContainer}>
                <Text style={[styles.coordsLabel, { color: colors.secondary }]}>Coordinates:</Text>
                <Text style={[styles.coordsText, { color: colors.text }]}>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </Text>
              </View>

              {address ? (
                <View style={styles.addressContainer}>
                  <Text style={[styles.coordsLabel, { color: colors.secondary }]}>Address:</Text>
                  <Text style={[styles.addressText, { color: colors.text }]}>{address}</Text>
                </View>
              ) : null}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.mapButton, { backgroundColor: colors.tint }]}
                  onPress={openMapView}
                >
                  <MapPin color="#FFFFFF" size={20} />
                  <Text style={styles.mapButtonText}>Open Map</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.refreshButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={getCurrentLocation}
                >
                  <Navigation color={colors.tint} size={20} />
                  <Text style={[styles.refreshButtonText, { color: colors.tint }]}>My Location</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.mapPlaceholder}>
              <MapPin color={colors.secondary} size={48} />
              <Text style={[styles.mapPlaceholderText, { color: colors.secondary }]}>
                Set location on map
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.setLocationButton, { backgroundColor: colors.tint }]}
                  onPress={openMapView}
                >
                  <Text style={styles.setLocationButtonText}>Open Map</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.setLocationButton, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }]}
                  onPress={getCurrentLocation}
                >
                  <Text style={[styles.setLocationButtonText, { color: colors.tint }]}>Use Current</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.tint }]}
          onPress={handleSubmit}
        >
          <Check color="#FFFFFF" size={20} />
          <Text style={styles.submitButtonText}>Create Location</Text>
        </TouchableOpacity>
      </ScrollView>

      {showMap && latitude !== null && longitude !== null && (
        <View style={StyleSheet.absoluteFill}>
          <View style={[styles.mapContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.mapHeader2, { backgroundColor: colors.cardBackground }]}>
              <TouchableOpacity onPress={closeMapView} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.tint }]}>Done</Text>
              </TouchableOpacity>
              <Text style={[styles.mapHeaderTitle, { color: colors.text }]}>Drop Pin on Map</Text>
              <TouchableOpacity onPress={getCurrentLocation} style={styles.myLocationButton}>
                <Navigation color={colors.tint} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.map}>
              <NativeMapView
                latitude={latitude}
                longitude={longitude}
                onLocationChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                  setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                }}
              />
            </View>

            <View style={[styles.mapInstructions, { backgroundColor: colors.cardBackground }]}>
              <MapPin color={colors.tint} size={16} />
              <Text style={[styles.mapInstructionsText, { color: colors.secondary }]}>
                Tap map to drop pin or drag marker to move it
              </Text>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  locationInfo: {
    gap: 16,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  locationBadgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  coordsContainer: {
    gap: 4,
  },
  coordsLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  coordsText: {
    fontSize: 14,
    fontWeight: '600' as const,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  addressContainer: {
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  setLocationButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  setLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  headerButton: {
    padding: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  mapContainer: {
    flex: 1,
  },
  mapHeader2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  closeButton: {
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  myLocationButton: {
    padding: 8,
  },
  map: {
    flex: 1,
  },
  mapInstructions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  mapInstructionsText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  webMapText: {
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  webCoordinatesDisplay: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
});
