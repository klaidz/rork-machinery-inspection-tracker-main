import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { MapPin, Navigation, Clock, MessageSquare, Send, Edit, Trash2 } from 'lucide-react-native';
import * as ExpoLocation from 'expo-location';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';
import { LocationSubmission } from '@/types';
import NativeMapView from '@/components/NativeMapView';

export default function LocationDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { id } = useLocalSearchParams();
  const { locations, addLocationSubmission, getLocationSubmissions, updateLocation, deleteLocation } = useFleet();
  const { currentUser, isManagerOrAdmin } = useAuth();

  const location = locations.find((l) => l.id === id);
  const submissions = location ? getLocationSubmissions(location.id) : [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedNotes, setEditedNotes] = useState('');

  React.useEffect(() => {
    if (location) {
      setEditedName(location.name);
      setEditedNotes(location.notes || '');
    }
  }, [location]);

  if (!location) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Location', headerShown: true }} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.text }]}>Location not found</Text>
        </View>
      </View>
    );
  }

  const handleOpenMap = () => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
      web: 'https://maps.google.com/?q=',
    });
    
    const url = Platform.select({
      ios: `${scheme}${location.latitude},${location.longitude}`,
      android: `${scheme}${location.latitude},${location.longitude}`,
      web: `${scheme}${location.latitude},${location.longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleSubmitLocation = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    try {
      setIsSubmitting(true);

      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const submission: LocationSubmission = {
                id: Date.now().toString(),
                locationId: location.id,
                submittedBy: currentUser.name,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: new Date().toISOString(),
                comment: comment.trim() || undefined,
              };

              await addLocationSubmission(submission);
              setComment('');
              Alert.alert('Success', 'Location submitted successfully');
              setIsSubmitting(false);
            },
            (error) => {
              console.error('Error getting location:', error);
              Alert.alert('Error', 'Could not get current location. Please enable location access.');
              setIsSubmitting(false);
            },
            { enableHighAccuracy: true }
          );
        } else {
          Alert.alert('Error', 'Geolocation is not supported by this browser');
          setIsSubmitting(false);
        }
      } else {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required');
          setIsSubmitting(false);
          return;
        }

        const currentLocation = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.High,
        });

        const submission: LocationSubmission = {
          id: Date.now().toString(),
          locationId: location.id,
          submittedBy: currentUser.name,
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          timestamp: new Date().toISOString(),
          comment: comment.trim() || undefined,
        };

        await addLocationSubmission(submission);
        setComment('');
        Alert.alert('Success', 'Location submitted successfully');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting location:', error);
      Alert.alert('Error', 'Failed to submit location');
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${location.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLocation(location.id);
            Alert.alert('Success', 'Location deleted successfully');
            router.back();
          },
        },
      ]
    );
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Location name cannot be empty');
      return;
    }

    await updateLocation(location.id, {
      name: editedName.trim(),
      notes: editedNotes.trim() || undefined,
    });
    
    setIsEditing(false);
    Alert.alert('Success', 'Location updated successfully');
  };

  const handleCancelEdit = () => {
    setEditedName(location.name);
    setEditedNotes(location.notes || '');
    setIsEditing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: isEditing ? 'Edit Location' : location.name, 
          headerShown: true,
          headerRight: isManagerOrAdmin && !isEditing ? () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
                <Edit color={colors.tint} size={22} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <Trash2 color="#FF3B30" size={22} />
              </TouchableOpacity>
            </View>
          ) : undefined,
        }} 
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isEditing ? (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Edit Location</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Location Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Location name"
                placeholderTextColor={colors.secondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Notes</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={editedNotes}
                onChangeText={setEditedNotes}
                placeholder="Additional notes..."
                placeholderTextColor={colors.secondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.editButtonsRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={handleCancelEdit}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.tint }]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconLarge, { backgroundColor: colors.tint + '20' }]}>
              <MapPin color={colors.tint} size={32} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.locationName, { color: colors.text }]}>{location.name}</Text>
              {location.address ? (
                <Text style={[styles.locationAddress, { color: colors.secondary }]}>
                  {location.address}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondary }]}>Coordinates:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </View>

            {location.notes ? (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.secondary }]}>Notes:</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{location.notes}</Text>
              </View>
            ) : null}

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondary }]}>Created by:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{location.createdBy}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.secondary }]}>Created:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatDate(location.createdDate)}
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.mapButton, { backgroundColor: colors.tint }]}
              onPress={handleOpenMap}
            >
              <Navigation color="#FFFFFF" size={20} />
              <Text style={styles.mapButtonText}>Open in Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewMapButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setShowMap(true)}
            >
              <MapPin color={colors.tint} size={20} />
              <Text style={[styles.viewMapButtonText, { color: colors.tint }]}>View Pin</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Submit Your Location</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.commentHeader}>
              <MessageSquare color={colors.secondary} size={18} />
              <Text style={[styles.commentLabel, { color: colors.text }]}>Comment (Optional)</Text>
            </View>
            <TextInput
              style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Add a comment about your visit..."
              placeholderTextColor={colors.secondary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isSubmitting}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.tint },
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitLocation}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Send color="#FFFFFF" size={20} />
                <Text style={styles.submitButtonText}>Submit Current Location</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {submissions.length > 0 ? (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Location Submissions ({submissions.length})
            </Text>

            {submissions.map((submission) => (
              <View key={submission.id} style={[styles.submissionCard, { borderColor: colors.border }]}>
                <View style={styles.submissionHeader}>
                  <Text style={[styles.submissionName, { color: colors.text }]}>
                    {submission.submittedBy}
                  </Text>
                  <View style={styles.timestampContainer}>
                    <Clock color={colors.secondary} size={14} />
                    <Text style={[styles.submissionTime, { color: colors.secondary }]}>
                      {formatDate(submission.timestamp)}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.submissionCoords, { color: colors.secondary }]}>
                  {submission.latitude.toFixed(6)}, {submission.longitude.toFixed(6)}
                </Text>

                {submission.comment ? (
                  <Text style={[styles.submissionComment, { color: colors.text }]}>
                    {submission.comment}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {showMap ? (
        <View style={StyleSheet.absoluteFill}>
          <View style={[styles.mapContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.mapHeaderBar, { backgroundColor: colors.cardBackground }]}>
              <TouchableOpacity onPress={() => setShowMap(false)} style={styles.closeMapButton}>
                <Text style={[styles.closeMapButtonText, { color: colors.tint }]}>Done</Text>
              </TouchableOpacity>
              <Text style={[styles.mapHeaderTitle, { color: colors.text }]}>{location.name}</Text>
              <View style={styles.spacer} />
            </View>

            <View style={styles.mapView}>
              <NativeMapView
                latitude={location.latitude}
                longitude={location.longitude}
                onLocationChange={() => {}}
              />
            </View>

            <View style={[styles.mapInfo, { backgroundColor: colors.cardBackground }]}>
              <MapPin color={colors.tint} size={16} />
              <View style={styles.mapInfoText}>
                <Text style={[styles.mapInfoLabel, { color: colors.secondary }]}>Bin Drop Location</Text>
                <Text style={[styles.mapInfoCoords, { color: colors.text }]}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
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
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    gap: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  locationName: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  inputGroup: {
    gap: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  submissionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  submissionName: {
    fontSize: 16,
    fontWeight: '700' as const,
    flex: 1,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  submissionTime: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  submissionCoords: {
    fontSize: 12,
    fontWeight: '500' as const,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  submissionComment: {
    fontSize: 14,
    fontWeight: '500' as const,
    fontStyle: 'italic' as const,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  inputLabel: {
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
  editButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  viewMapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  viewMapButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  mapContainer: {
    flex: 1,
  },
  mapHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  closeMapButton: {
    paddingVertical: 8,
    minWidth: 60,
  },
  closeMapButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    minWidth: 60,
  },
  mapView: {
    flex: 1,
  },
  mapInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  mapInfoText: {
    flex: 1,
    gap: 4,
  },
  mapInfoLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  mapInfoCoords: {
    fontSize: 14,
    fontWeight: '500' as const,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
