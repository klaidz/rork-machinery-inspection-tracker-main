import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronDown, Save, X, Camera, Plus, Edit2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/ThemeContext';
import SearchableSelectModal from '@/components/SearchableSelectModal';
import SignatureModal from '@/components/SignatureModal';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import { FieldMeasurement, MeasurementValue } from '@/types';

export default function FieldMeasurementScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { locations, addFieldMeasurement } = useFleet();
  const { currentUser } = useAuth();

  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [manualFieldName, setManualFieldName] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);
  
  const [measurementValues, setMeasurementValues] = useState<MeasurementValue[]>([
    { label: 'Measurement 1', value: '' },
    { label: 'Measurement 2', value: '' },
    { label: 'Measurement 3', value: '' },
    { label: 'Measurement 4', value: '' },
    { label: 'Measurement 5', value: '' },
    { label: 'Measurement 6', value: '' },
  ]);
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditLabel = (index: number) => {
    Alert.prompt(
      'Edit Label',
      'Enter a label for this measurement',
      (text) => {
        if (text) {
          const newValues = [...measurementValues];
          newValues[index] = { ...newValues[index], label: text };
          setMeasurementValues(newValues);
        }
      },
      'plain-text',
      measurementValues[index].label
    );
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newPhotos = result.assets.map((asset) => asset.uri);
        setPhotos([...photos, ...newPhotos]);
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to pick photo');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const fieldName = useManualEntry ? manualFieldName : locations.find(l => l.id === selectedLocationId)?.name;

    if (!fieldName) {
      Alert.alert('Error', 'Please select a field or enter field name');
      return;
    }

    const filledValues = measurementValues.filter((v) => v.value.trim() !== '');
    if (filledValues.length === 0) {
      Alert.alert('Error', 'Please enter at least one measurement value');
      return;
    }

    if (!signature) {
      Alert.alert('Error', 'Please provide your signature');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const measurement: FieldMeasurement = {
        id: `field-measurement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        fieldName,
        locationId: useManualEntry ? undefined : selectedLocationId,
        measurements: measurementValues.filter(v => v.value.trim() !== ''),
        photos,
        signature,
        submittedBy: currentUser.name,
        submittedAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
      };

      await addFieldMeasurement(measurement);

      console.log('[FieldMeasurement] Saved:', measurement);

      Alert.alert('Success', 'Field measurement saved successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving field measurement:', error);
      Alert.alert('Error', 'Failed to save field measurement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasData = selectedLocationId || manualFieldName || measurementValues.some((v) => v.value.trim() !== '') || photos.length > 0 || signature;
    
    if (hasData) {
      Alert.alert('Discard Changes?', 'Are you sure you want to discard this entry?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]);
    } else {
      router.back();
    }
  };

  const selectedLocation = locations.find(l => l.id === selectedLocationId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Field Measurement',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Field Selection</Text>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !useManualEntry && { backgroundColor: colors.tint },
                  useManualEntry && { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => setUseManualEntry(false)}
              >
                <Text style={[styles.toggleText, { color: !useManualEntry ? '#fff' : colors.text }]}>
                  Select Field
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  useManualEntry && { backgroundColor: colors.tint },
                  !useManualEntry && { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => setUseManualEntry(true)}
              >
                <Text style={[styles.toggleText, { color: useManualEntry ? '#fff' : colors.text }]}>
                  Manual Entry
                </Text>
              </TouchableOpacity>
            </View>

            {useManualEntry ? (
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.border },
                ]}
                placeholder="Enter field name"
                placeholderTextColor={colors.secondary}
                value={manualFieldName}
                onChangeText={setManualFieldName}
              />
            ) : (
              <TouchableOpacity
                style={[
                  styles.selector,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                ]}
                onPress={() => setShowLocationModal(true)}
              >
                <Text
                  style={[
                    styles.selectorText,
                    { color: selectedLocation ? colors.text : colors.secondary },
                  ]}
                >
                  {selectedLocation ? selectedLocation.name : 'Select Field'}
                </Text>
                <ChevronDown size={20} color={colors.secondary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Measurements</Text>
            <Text style={[styles.sectionDescription, { color: colors.secondary }]}>
              Enter measurement values. Tap the label to customize it.
            </Text>

            {measurementValues.map((measurement, index) => (
              <View key={index} style={styles.measurementBox}>
                <TouchableOpacity
                  style={styles.labelRow}
                  onPress={() => handleEditLabel(index)}
                >
                  <Text style={[styles.measurementLabel, { color: colors.secondary }]}>
                    {measurement.label}
                  </Text>
                  <Edit2 size={16} color={colors.secondary} />
                </TouchableOpacity>

                <TextInput
                  style={[
                    styles.input,
                    { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.border },
                  ]}
                  placeholder="Enter value"
                  placeholderTextColor={colors.secondary}
                  value={measurement.value}
                  onChangeText={(text) => {
                    const newValues = [...measurementValues];
                    newValues[index] = { ...newValues[index], value: text };
                    setMeasurementValues(newValues);
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos</Text>
            <View style={styles.photoButtonsRow}>
              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={handleTakePhoto}
              >
                <Camera size={20} color={colors.tint} />
                <Text style={[styles.photoButtonText, { color: colors.text }]}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
                onPress={handlePickPhoto}
              >
                <Plus size={20} color={colors.tint} />
                <Text style={[styles.photoButtonText, { color: colors.text }]}>Add Photos</Text>
              </TouchableOpacity>
            </View>

            {photos.length > 0 && (
              <View style={styles.photosGrid}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photoPreview} />
                    <TouchableOpacity
                      style={[styles.removePhotoButton, { backgroundColor: colors.background }]}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <X size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes (Optional)</Text>
            <TextInput
              style={[
                styles.notesInput,
                { color: colors.text, backgroundColor: colors.cardBackground, borderColor: colors.border },
              ]}
              placeholder="Add any additional notes"
              placeholderTextColor={colors.secondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Signature</Text>
            <TouchableOpacity
              style={[
                styles.signatureButton,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
                signature && styles.signatureButtonFilled,
              ]}
              onPress={() => setShowSignatureModal(true)}
            >
              {signature ? (
                <Image source={{ uri: signature }} style={styles.signaturePreview} />
              ) : (
                <Text style={[styles.signatureButtonText, { color: colors.secondary }]}>
                  Tap to Sign
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
        </TouchableWithoutFeedback>

        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>{isSubmitting ? 'Saving...' : 'Save Measurement'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <SearchableSelectModal
        visible={showLocationModal}
        items={locations.map((l) => ({ id: l.id, label: l.name }))}
        selectedIds={selectedLocationId ? [selectedLocationId] : []}
        onSelect={(locationId) => {
          setSelectedLocationId(locationId);
          setShowLocationModal(false);
        }}
        onClose={() => setShowLocationModal(false)}
        title="Select Field"
      />

      <SignatureModal
        visible={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={(signatureData) => {
          setSignature(signatureData);
          setShowSignatureModal(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  measurementBox: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  measurementLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative' as const,
    width: 100,
    height: 100,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesInput: {
    minHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  signatureButton: {
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureButtonFilled: {
    borderStyle: 'solid' as const,
  },
  signatureButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  signaturePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
