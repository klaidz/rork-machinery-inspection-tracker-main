import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';
import { MapPin, CheckCircle2, Circle, Truck, Package, Clock, FileText, Navigation } from 'lucide-react-native';
import SignatureModal from '@/components/SignatureModal';
import NativeMapView from '@/components/NativeMapView';

export default function JobCardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { jobCards, updateJobCard, locations } = useFleet();
  const { currentUser, isOperator } = useAuth();

  const jobCard = useMemo(() => {
    return jobCards.find((jc) => jc.id === id);
  }, [jobCards, id]);

  const loadingLocation = useMemo(() => {
    if (!jobCard) return null;
    return locations.find((loc) => loc.name === jobCard.loadingLocation);
  }, [locations, jobCard]);

  const unloadingLocation = useMemo(() => {
    if (!jobCard) return null;
    return locations.find((loc) => loc.name === jobCard.unloadingLocation);
  }, [locations, jobCard]);

  const [loadStatus, setLoadStatus] = useState<'loaded' | 'empty'>('empty');
  const [weight, setWeight] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [completionLocationType, setCompletionLocationType] = useState<'provided' | 'other'>('provided');
  const [completionLocationText, setCompletionLocationText] = useState('');
  const [showSignature, setShowSignature] = useState(false);
  const [showMapForLocation, setShowMapForLocation] = useState<'loading' | 'unloading' | null>(null);

  if (!jobCard) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Job Card' }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Job Card Not Found</Text>
        </View>
      </View>
    );
  }

  const canStartJob = isOperator && jobCard.status === 'pending';
  const canCompleteJob = isOperator && jobCard.status === 'outgoing';

  const handleStartJob = async () => {
    if (!weight.trim()) {
      Alert.alert('Error', 'Please enter weight');
      return;
    }

    if (!currentUser) return;

    await updateJobCard(jobCard.id, {
      status: 'outgoing',
      loadStatus,
      weight: weight.trim(),
      ticketNumber: ticketNumber.trim() || undefined,
      outgoingDate: new Date().toISOString(),
    });

    Alert.alert('Success', 'Job started successfully');
    router.back();
  };

  const handleCompleteJobSubmit = () => {
    if (completionLocationType === 'other' && !completionLocationText.trim()) {
      Alert.alert('Error', 'Please specify the location');
      return;
    }

    setShowSignature(true);
  };

  const handleSignatureComplete = async (signature: string) => {
    if (!currentUser) return;

    const completionLocation = completionLocationType === 'provided' 
      ? jobCard.unloadingLocation 
      : completionLocationText.trim();

    await updateJobCard(jobCard.id, {
      status: 'completed',
      completionLocation,
      completionLocationOther: completionLocationType === 'other' ? completionLocationText.trim() : undefined,
      completionSignature: signature,
      completedDate: new Date().toISOString(),
    });

    setShowSignature(false);
    Alert.alert('Success', 'Job completed successfully', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const openMapInNativeApp = (type: 'loading' | 'unloading') => {
    const location = type === 'loading' ? loadingLocation : unloadingLocation;
    if (!location) return;

    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${location.latitude},${location.longitude}&q=${encodeURIComponent(location.name)}`,
      android: `geo:${location.latitude},${location.longitude}?q=${location.latitude},${location.longitude}(${encodeURIComponent(location.name)})`,
      web: `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`,
    });
    if (url) {
      Linking.openURL(url);
    }
  };

  const getStatusColor = (status: typeof jobCard.status) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'outgoing':
        return '#3b82f6';
      case 'completed':
        return colors.success;
    }
  };

  const getStatusLabel = (status: typeof jobCard.status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'outgoing':
        return 'Outgoing';
      case 'completed':
        return 'Completed';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: `Job #${jobCard.id.slice(-8)}`,
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.statusCard, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(jobCard.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(jobCard.status) }]}>
              {getStatusLabel(jobCard.status)}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: colors.secondary }]}>
            Created: {new Date(jobCard.date).toLocaleDateString()}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Truck color={colors.tint} size={20} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Machinery</Text>
          </View>
          {jobCard.machinery.map((item, index) => (
            <View key={index} style={styles.machineryItem}>
              <Text style={[styles.machineryReg, { color: colors.text }]}>
                {item.registrationNumber}
              </Text>
              <Text style={[styles.machineryType, { color: colors.secondary }]}>
                {item.type}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <MapPin color={colors.tint} size={20} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Locations</Text>
          </View>
          <View style={styles.locationItemContainer}>
            <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationLabel, { color: colors.secondary }]}>Loading</Text>
              <Text style={[styles.locationName, { color: colors.text }]}>
                {jobCard.loadingLocation}
              </Text>
            </View>
            <View style={styles.locationButtons}>
              {loadingLocation && (
                <TouchableOpacity 
                  style={[styles.iconButton, { backgroundColor: colors.tint + '20' }]}
                  onPress={() => setShowMapForLocation('loading')}
                >
                  <MapPin color={colors.tint} size={18} />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: colors.background }]}
                onPress={() => openMapInNativeApp('loading')}
              >
                <Navigation color={colors.tint} size={18} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.locationItemContainer}>
            <View style={[styles.locationDot, { backgroundColor: colors.danger }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationLabel, { color: colors.secondary }]}>Unloading</Text>
              <Text style={[styles.locationName, { color: colors.text }]}>
                {jobCard.unloadingLocation}
              </Text>
            </View>
            <View style={styles.locationButtons}>
              {unloadingLocation && (
                <TouchableOpacity 
                  style={[styles.iconButton, { backgroundColor: colors.tint + '20' }]}
                  onPress={() => setShowMapForLocation('unloading')}
                >
                  <MapPin color={colors.tint} size={18} />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: colors.background }]}
                onPress={() => openMapInNativeApp('unloading')}
              >
                <Navigation color={colors.tint} size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Package color={colors.tint} size={20} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Materials</Text>
          </View>
          <Text style={[styles.materialsText, { color: colors.text }]}>
            {jobCard.materials}
          </Text>
        </View>

        {jobCard.status === 'outgoing' && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <FileText color={colors.tint} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Job Details</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.secondary }]}>Load Status:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {jobCard.loadStatus === 'loaded' ? 'Loaded' : 'Empty'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.secondary }]}>Weight:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {jobCard.weight}
              </Text>
            </View>
            {jobCard.ticketNumber && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>Ticket #:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {jobCard.ticketNumber}
                </Text>
              </View>
            )}
          </View>
        )}

        {jobCard.status === 'completed' && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <CheckCircle2 color={colors.success} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Completion Details</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.secondary }]}>Completed:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {jobCard.completedDate ? new Date(jobCard.completedDate).toLocaleString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.secondary }]}>Final Location:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {jobCard.completionLocation || jobCard.unloadingLocation}
              </Text>
            </View>
            {jobCard.completionLocationOther && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.secondary }]}>Notes:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {jobCard.completionLocationOther}
                </Text>
              </View>
            )}
          </View>
        )}

        {canStartJob && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Clock color={colors.tint} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Start Job</Text>
            </View>
            
            <Text style={[styles.label, { color: colors.secondary }]}>Load Status *</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  loadStatus === 'loaded' && { borderColor: colors.tint, borderWidth: 2 },
                ]}
                onPress={() => setLoadStatus('loaded')}
              >
                {loadStatus === 'loaded' ? (
                  <CheckCircle2 color={colors.tint} size={20} />
                ) : (
                  <Circle color={colors.secondary} size={20} />
                )}
                <Text style={[styles.radioLabel, { color: colors.text }]}>Loaded</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  loadStatus === 'empty' && { borderColor: colors.tint, borderWidth: 2 },
                ]}
                onPress={() => setLoadStatus('empty')}
              >
                {loadStatus === 'empty' ? (
                  <CheckCircle2 color={colors.tint} size={20} />
                ) : (
                  <Circle color={colors.secondary} size={20} />
                )}
                <Text style={[styles.radioLabel, { color: colors.text }]}>Empty</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.secondary }]}>Weight *</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Enter weight (e.g., 10 tons)"
              placeholderTextColor={colors.secondary}
              value={weight}
              onChangeText={setWeight}
            />

            <Text style={[styles.label, { color: colors.secondary }]}>Ticket Number (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Enter ticket number"
              placeholderTextColor={colors.secondary}
              value={ticketNumber}
              onChangeText={setTicketNumber}
            />

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              onPress={handleStartJob}
            >
              <Text style={styles.submitButtonText}>Start Job</Text>
            </TouchableOpacity>
          </View>
        )}

        {canCompleteJob && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <CheckCircle2 color={colors.success} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Complete Job</Text>
            </View>
            
            <Text style={[styles.label, { color: colors.secondary }]}>Completion Location *</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  completionLocationType === 'provided' && { borderColor: colors.tint, borderWidth: 2 },
                ]}
                onPress={() => setCompletionLocationType('provided')}
              >
                {completionLocationType === 'provided' ? (
                  <CheckCircle2 color={colors.tint} size={20} />
                ) : (
                  <Circle color={colors.secondary} size={20} />
                )}
                <Text style={[styles.radioLabel, { color: colors.text }]}>
                  {jobCard.unloadingLocation}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  completionLocationType === 'other' && { borderColor: colors.tint, borderWidth: 2 },
                ]}
                onPress={() => setCompletionLocationType('other')}
              >
                {completionLocationType === 'other' ? (
                  <CheckCircle2 color={colors.tint} size={20} />
                ) : (
                  <Circle color={colors.secondary} size={20} />
                )}
                <Text style={[styles.radioLabel, { color: colors.text }]}>Other</Text>
              </TouchableOpacity>
            </View>

            {completionLocationType === 'other' && (
              <>
                <Text style={[styles.label, { color: colors.secondary }]}>Specify Location</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder="Describe where exactly..."
                  placeholderTextColor={colors.secondary}
                  value={completionLocationText}
                  onChangeText={setCompletionLocationText}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.success }]}
              onPress={handleCompleteJobSubmit}
            >
              <Text style={styles.submitButtonText}>Complete & Sign</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <SignatureModal
        visible={showSignature}
        onClose={() => setShowSignature(false)}
        onSave={handleSignatureComplete}
      />

      {showMapForLocation && (
        <View style={StyleSheet.absoluteFill}>
          <View style={[styles.mapContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.mapHeaderBar, { backgroundColor: colors.cardBackground }]}>
              <TouchableOpacity onPress={() => setShowMapForLocation(null)} style={styles.closeMapButton}>
                <Text style={[styles.closeMapButtonText, { color: colors.tint }]}>Done</Text>
              </TouchableOpacity>
              <Text style={[styles.mapHeaderTitle, { color: colors.text }]}>
                {showMapForLocation === 'loading' ? jobCard.loadingLocation : jobCard.unloadingLocation}
              </Text>
              <View style={styles.spacer} />
            </View>

            <View style={styles.mapView}>
              <NativeMapView
                latitude={showMapForLocation === 'loading' ? loadingLocation!.latitude : unloadingLocation!.latitude}
                longitude={showMapForLocation === 'loading' ? loadingLocation!.longitude : unloadingLocation!.longitude}
                onLocationChange={() => {}}
              />
            </View>

            <View style={[styles.mapInfo, { backgroundColor: colors.cardBackground }]}>
              <MapPin color={colors.tint} size={16} />
              <View style={styles.mapInfoText}>
                <Text style={[styles.mapInfoLabel, { color: colors.secondary }]}>
                  {showMapForLocation === 'loading' ? 'Loading Location' : 'Unloading Location'}
                </Text>
                <Text style={[styles.mapInfoCoords, { color: colors.text }]}>
                  {showMapForLocation === 'loading' 
                    ? `${loadingLocation!.latitude.toFixed(6)}, ${loadingLocation!.longitude.toFixed(6)}`
                    : `${unloadingLocation!.latitude.toFixed(6)}, ${unloadingLocation!.longitude.toFixed(6)}`
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  machineryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  machineryReg: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  machineryType: {
    fontSize: 14,
  },
  locationItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  locationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 10,
    borderRadius: 8,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  materialsText: {
    fontSize: 15,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right' as const,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  radioGroup: {
    gap: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 80,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
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
    textAlign: 'center' as const,
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
