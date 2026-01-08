import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useFleet } from '@/context/FleetContext';
import Colors from '@/constants/colors';
import { NearMissNature, NearMissUrgency, MachineryDepartment } from '@/types';
import SignatureModal from '@/components/SignatureModal';
import SignatureDisplay from '@/components/SignatureDisplay';
import { AlertTriangle, CheckSquare, Square, Camera, X, Navigation, MapPin } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoLocation from 'expo-location';
import { Image } from 'expo-image';

const DEPARTMENTS: { value: MachineryDepartment; label: string }[] = [
  { value: 'arable', label: 'Arable' },
  { value: 'arable_land', label: 'Arable Land' },
  { value: 'arable_yard', label: 'Arable Yard' },
  { value: 'genesis', label: 'Genesis' },
  { value: 'co2', label: 'CO2' },
  { value: 'mepal_yard', label: 'Mepal Yard' },
  { value: 'pc', label: 'PC' },
  { value: 'straw_e1', label: 'Straw E1' },
  { value: 'straw_e2', label: 'Straw E2' },
  { value: 'engineers', label: 'Engineers' },
  { value: 'electricians', label: 'Electricians' },
];

const NEAR_MISS_NATURES: { value: NearMissNature; label: string }[] = [
  { value: 'process_procedure_deviation', label: 'Process/Procedure Deviation' },
  { value: 'equipment_mechanical_failure', label: 'Equipment/Mechanical Failure' },
  { value: 'vehicle_workplace_transport', label: 'Vehicle/Workplace Transport' },
  { value: 'unsafe_condition', label: 'Unsafe Condition' },
  { value: 'unsafe_acting', label: 'Unsafe Acting' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'other', label: 'Other' },
];

const URGENCY_LEVELS: { value: NearMissUrgency; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'critical', label: 'Critical', color: '#ef4444' },
];

type SignatureType = 'reporting' | 'issued' | 'responsible';

export default function NewNearMissReportScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { currentUser } = useAuth();
  const { addNearMissReport } = useFleet();

  const [department, setDepartment] = useState<MachineryDepartment>('arable');
  const [site, setSite] = useState<string>('');
  const [siteCoords, setSiteCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingSiteLocation, setIsGettingSiteLocation] = useState<boolean>(false);
  const [natureOfNearMiss, setNatureOfNearMiss] = useState<NearMissNature[]>([]);
  const [urgencyLevel, setUrgencyLevel] = useState<NearMissUrgency>('medium');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [immediateActionTaken, setImmediateActionTaken] = useState<string>('');
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState<string>('');
  const [longTermActions, setLongTermActions] = useState<string>('');
  
  const [reportingPersonName, setReportingPersonName] = useState<string>(currentUser?.name || '');
  const [reportingPersonSignature, setReportingPersonSignature] = useState<string>('');
  const [issuedToName, setIssuedToName] = useState<string>('');
  const [issuedToSignature, setIssuedToSignature] = useState<string>('');
  const [responsiblePersonName, setResponsiblePersonName] = useState<string>('');
  const [responsiblePersonSignature, setResponsiblePersonSignature] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSignatureType, setCurrentSignatureType] = useState<SignatureType>('reporting');

  const toggleNature = (nature: NearMissNature) => {
    setNatureOfNearMiss((prev) =>
      prev.includes(nature) ? prev.filter((n) => n !== nature) : [...prev, nature]
    );
  };

  const handleSignature = (type: SignatureType) => {
    setCurrentSignatureType(type);
    setShowSignatureModal(true);
  };

  const handleSaveSignature = (signatureData: string) => {
    if (currentSignatureType === 'reporting') {
      setReportingPersonSignature(signatureData);
    } else if (currentSignatureType === 'issued') {
      setIssuedToSignature(signatureData);
    } else if (currentSignatureType === 'responsible') {
      setResponsiblePersonSignature(signatureData);
    }
    setShowSignatureModal(false);
  };

  const handleAddCurrentSiteLocation = useCallback(async () => {
    try {
      setIsGettingSiteLocation(true);
      console.log('NearMiss: Add current location pressed. Platform:', Platform.OS);

      if (Platform.OS === 'web') {
        if (!('geolocation' in navigator)) {
          Alert.alert('Location not available', 'Geolocation is not supported by this browser.');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            console.log('NearMiss: Web geolocation success:', { lat, lng });

            setSiteCoords({ latitude: lat, longitude: lng });
            setSite(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            setIsGettingSiteLocation(false);
          },
          (error) => {
            console.log('NearMiss: Web geolocation error:', error);
            setIsGettingSiteLocation(false);
            const message =
              error.code === 1
                ? 'Location permission denied in the browser.'
                : error.code === 3
                  ? 'Location request timed out.'
                  : 'Unable to get your current location.';
            Alert.alert('Location Error', message);
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );

        return;
      }

      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      console.log('NearMiss: Existing location permission status:', status);

      let finalStatus = status;
      if (finalStatus !== 'granted') {
        const requested = await ExpoLocation.requestForegroundPermissionsAsync();
        finalStatus = requested.status;
        console.log('NearMiss: Requested location permission status:', finalStatus);
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is required to add current location.');
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 0,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      console.log('NearMiss: Mobile location success:', { lat, lng });

      setSiteCoords({ latitude: lat, longitude: lng });

      try {
        const geocode = await ExpoLocation.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (geocode[0]) {
          const addr = [
            geocode[0].street,
            geocode[0].city,
            geocode[0].region,
            geocode[0].postalCode,
          ]
            .filter(Boolean)
            .join(', ');
          setSite(addr || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        } else {
          setSite(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      } catch (geocodeError) {
        console.log('NearMiss: reverseGeocode failed, falling back to coordinates:', geocodeError);
        setSite(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('NearMiss: Error getting current site location:', error);
      Alert.alert('Error', 'Could not get your current location. Please enter site manually.');
    } finally {
      setIsGettingSiteLocation(false);
    }
  }, []);

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleSelectPhoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Media library permission is required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!site.trim()) {
      Alert.alert('Error', 'Please enter the site location.');
      return;
    }

    if (natureOfNearMiss.length === 0) {
      Alert.alert('Error', 'Please select at least one nature of near-miss.');
      return;
    }

    if (!problemDescription.trim()) {
      Alert.alert('Error', 'Please provide a description of the problem.');
      return;
    }

    if (!immediateActionTaken.trim()) {
      Alert.alert('Error', 'Please describe the immediate action taken.');
      return;
    }

    if (!rootCauseAnalysis.trim()) {
      Alert.alert('Error', 'Please provide root cause analysis.');
      return;
    }

    if (!longTermActions.trim()) {
      Alert.alert('Error', 'Please describe long-term actions.');
      return;
    }

    if (!reportingPersonName.trim() || !reportingPersonSignature) {
      Alert.alert('Error', 'Reporting person name and signature are required.');
      return;
    }

    if (!issuedToName.trim() || !issuedToSignature) {
      Alert.alert('Error', 'Issued to person name and signature are required.');
      return;
    }

    if (!responsiblePersonName.trim() || !responsiblePersonSignature) {
      Alert.alert('Error', 'Responsible person name and signature are required.');
      return;
    }

    try {
      const now = new Date();
      const report = {
        id: `near-miss-${Date.now()}`,
        department,
        site,
        datePrepared: now.toISOString().split('T')[0],
        timePrepared: now.toTimeString().split(' ')[0].substring(0, 5),
        natureOfNearMiss,
        urgencyLevel,
        problemDescription,
        immediateActionTaken,
        rootCauseAnalysis,
        longTermActions,
        reportingPersonName,
        reportingPersonSignature,
        issuedToName,
        issuedToSignature,
        responsiblePersonName,
        responsiblePersonSignature,
        photos,
        createdBy: currentUser?.name || 'Unknown',
        createdAt: now.toISOString(),
      };

      await addNearMissReport(report);
      Alert.alert('Success', 'Near-miss report submitted successfully.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error submitting near-miss report:', error);
      Alert.alert('Error', 'Failed to submit near-miss report. Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Near-Miss Report',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.headerCard, { backgroundColor: colors.danger + '15' }]}>
            <AlertTriangle color={colors.danger} size={32} />
            <Text style={[styles.headerTitle, { color: colors.danger }]}>Near-Miss Form</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text }]}>
              Report an unplanned event that did not result in injury, damage, or loss but had the potential to do so.
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Department *</Text>
              <View style={styles.radioGroup}>
                {DEPARTMENTS.map((dept) => (
                  <TouchableOpacity
                    key={dept.value}
                    style={[
                      styles.radioButton,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      department === dept.value && { borderColor: colors.tint, backgroundColor: colors.tint + '20' },
                    ]}
                    onPress={() => setDepartment(dept.value)}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        { color: colors.text },
                        department === dept.value && { color: colors.tint, fontWeight: '600' },
                      ]}
                    >
                      {dept.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.text }]}>Site *</Text>
                <TouchableOpacity
                  style={[
                    styles.currentLocationButton,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    isGettingSiteLocation && { opacity: 0.7 },
                  ]}
                  onPress={handleAddCurrentSiteLocation}
                  disabled={isGettingSiteLocation}
                  testID="nearMiss_addCurrentLocation"
                >
                  {isGettingSiteLocation ? (
                    <ActivityIndicator size="small" color={colors.tint} />
                  ) : (
                    <Navigation color={colors.tint} size={16} />
                  )}
                  <Text style={[styles.currentLocationButtonText, { color: colors.tint }]}>Add current location</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={site}
                onChangeText={(text) => {
                  setSite(text);
                  if (!text.trim()) setSiteCoords(null);
                }}
                placeholder="Enter site location"
                placeholderTextColor={colors.secondary}
                testID="nearMiss_siteInput"
              />

              {siteCoords ? (
                <View style={[styles.siteCoordsPill, { backgroundColor: colors.tint + '12', borderColor: colors.tint + '25' }]}>
                  <MapPin color={colors.tint} size={14} />
                  <Text style={[styles.siteCoordsText, { color: colors.text }]}>
                    {siteCoords.latitude.toFixed(6)}, {siteCoords.longitude.toFixed(6)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nature of Near-Miss *</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}>
              Select all that apply
            </Text>

            {NEAR_MISS_NATURES.map((nature) => (
              <TouchableOpacity
                key={nature.value}
                style={[styles.checkboxRow, { borderColor: colors.border }]}
                onPress={() => toggleNature(nature.value)}
              >
                {natureOfNearMiss.includes(nature.value) ? (
                  <CheckSquare color={colors.tint} size={24} />
                ) : (
                  <Square color={colors.secondary} size={24} />
                )}
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>{nature.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Urgency Level *</Text>
            <View style={styles.urgencyContainer}>
              {URGENCY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.urgencyButton,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    urgencyLevel === level.value && {
                      backgroundColor: level.color + '20',
                      borderColor: level.color,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setUrgencyLevel(level.value)}
                >
                  <Text
                    style={[
                      styles.urgencyText,
                      { color: colors.text },
                      urgencyLevel === level.value && { color: level.color, fontWeight: '700' },
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Description of the Problem *</Text>
              <Text style={[styles.hint, { color: colors.secondary }]}>
                Provide a clear and concise description of what occurred or may occur
              </Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={problemDescription}
                onChangeText={setProblemDescription}
                placeholder="Describe what happened..."
                placeholderTextColor={colors.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Immediate Action Taken *</Text>
              <Text style={[styles.hint, { color: colors.secondary }]}>
                Describe actions taken immediately to remove or minimize the hazard
              </Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={immediateActionTaken}
                onChangeText={setImmediateActionTaken}
                placeholder="What was done immediately?"
                placeholderTextColor={colors.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Root Cause Analysis *</Text>
              <Text style={[styles.hint, { color: colors.secondary }]}>
                To be completed by Department Director - Identify why the issue occurred
              </Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={rootCauseAnalysis}
                onChangeText={setRootCauseAnalysis}
                placeholder="Why did this happen?"
                placeholderTextColor={colors.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Long-Term Actions *</Text>
              <Text style={[styles.hint, { color: colors.secondary }]}>
                Detail the actions needed to prevent reoccurrence
              </Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={longTermActions}
                onChangeText={setLongTermActions}
                placeholder="What actions will prevent this?"
                placeholderTextColor={colors.secondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}>Add photos documenting the near-miss incident</Text>
            
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={[styles.photoActionButton, { backgroundColor: colors.tint }]}
                onPress={handleTakePhoto}
              >
                <Camera color="#FFFFFF" size={20} />
                <Text style={styles.photoActionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoActionButton, { backgroundColor: colors.tint }]}
                onPress={handleSelectPhoto}
              >
                <Text style={styles.photoActionText}>Select Photos</Text>
              </TouchableOpacity>
            </View>

            {photos.length > 0 && (
              <View style={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photoThumbnail} contentFit="cover" />
                    <TouchableOpacity
                      style={[styles.removePhotoButton, { backgroundColor: colors.danger }]}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <X color="#FFFFFF" size={16} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {photos.length > 0 && (
              <Text style={[styles.photoCount, { color: colors.secondary }]}>
                {photos.length} photo{photos.length !== 1 ? 's' : ''} added
              </Text>
            )}
          </View>

          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Signatures</Text>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Reporting Person *</Text>
              <Text style={[styles.hint, { color: colors.secondary }]}>
                The individual who identified and reported the issue
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={reportingPersonName}
                onChangeText={setReportingPersonName}
                placeholder="Full name"
                placeholderTextColor={colors.secondary}
              />
              {reportingPersonSignature ? (
                <View style={styles.signatureContainer}>
                  <SignatureDisplay signatureData={reportingPersonSignature} width={280} height={120} />
                  <TouchableOpacity
                    style={[styles.changeSignatureButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => handleSignature('reporting')}
                  >
                    <Text style={[styles.changeSignatureText, { color: colors.text }]}>Change Signature</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.signatureButton, { backgroundColor: colors.tint }]}
                  onPress={() => handleSignature('reporting')}
                >
                  <Text style={styles.signatureButtonText}>Add Signature</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Issued To *</Text>
              <Text style={[styles.hint, { color: colors.secondary }]}>
                The manager responsible for reviewing and verifying immediate actions
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={issuedToName}
                onChangeText={setIssuedToName}
                placeholder="Manager name"
                placeholderTextColor={colors.secondary}
              />
              {issuedToSignature ? (
                <View style={styles.signatureContainer}>
                  <SignatureDisplay signatureData={issuedToSignature} width={280} height={120} />
                  <TouchableOpacity
                    style={[styles.changeSignatureButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => handleSignature('issued')}
                  >
                    <Text style={[styles.changeSignatureText, { color: colors.text }]}>Change Signature</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.signatureButton, { backgroundColor: colors.tint }]}
                  onPress={() => handleSignature('issued')}
                >
                  <Text style={styles.signatureButtonText}>Add Signature</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Responsible Person *</Text>
              <Text style={[styles.hint, { color: colors.secondary }]}>
                The Department Director accountable for root cause analysis and long-term actions
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={responsiblePersonName}
                onChangeText={setResponsiblePersonName}
                placeholder="Director name"
                placeholderTextColor={colors.secondary}
              />
              {responsiblePersonSignature ? (
                <View style={styles.signatureContainer}>
                  <SignatureDisplay signatureData={responsiblePersonSignature} width={280} height={120} />
                  <TouchableOpacity
                    style={[styles.changeSignatureButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => handleSignature('responsible')}
                  >
                    <Text style={[styles.changeSignatureText, { color: colors.text }]}>Change Signature</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.signatureButton, { backgroundColor: colors.tint }]}
                  onPress={() => handleSignature('responsible')}
                >
                  <Text style={styles.signatureButtonText}>Add Signature</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Near-Miss Report</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <SignatureModal
        visible={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={handleSaveSignature}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  headerCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: -8,
  },
  fieldContainer: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    gap: 12,
  },
  currentLocationButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  currentLocationButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  siteCoordsPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    alignSelf: 'flex-start' as const,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  siteCoordsText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  hint: {
    fontSize: 13,
    marginTop: -4,
    lineHeight: 18,
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
    minHeight: 100,
  },
  radioGroup: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  radioText: {
    fontSize: 14,
  },
  checkboxRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  checkboxLabel: {
    fontSize: 15,
    flex: 1,
  },
  urgencyContainer: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center' as const,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  signatureButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  signatureButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  signatureContainer: {
    marginTop: 8,
    gap: 8,
  },
  changeSignatureButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center' as const,
  },
  changeSignatureText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  submitButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  photoActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  photoActionButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  photoActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  photoGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  photoContainer: {
    position: 'relative' as const,
    width: 100,
    height: 100,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  photoCount: {
    fontSize: 14,
    textAlign: 'center' as const,
  },
});
