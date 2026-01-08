import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useTyreStock } from '@/context/TyreStockContext';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { TyreSize, TyreCondition, TyrePosition, TyreFitterJobCard, OldTyreCondition } from '@/types';
import SignatureModal from '@/components/SignatureModal';
import SignatureDisplay from '@/components/SignatureDisplay';
import SearchableSelectModal, { SelectableItem } from '@/components/SearchableSelectModal';
import { KeyboardAwareInput } from '@/components/KeyboardAwareInput';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { MapPin, Camera, Image as ImageIcon } from 'lucide-react-native';

const TYRE_SIZES: TyreSize[] = ['315/80R22.5', '315/70R22.5', '385/65R22.5', '560/60R22.5', '295/80R22.5', '265/70R19.5', 'other'];
const TYRE_CONDITIONS: TyreCondition[] = ['new', 'part_worn', 'used'];
const OLD_TYRE_CONDITIONS: OldTyreCondition[] = ['damaged', 'worn_out', 'blown_tyre', 'good_to_use'];

const TYRE_POSITIONS_8WHEELER: TyrePosition[] = [
  'passenger_1st_steering',
  'driver_1st_steering',
  'passenger_2nd_steering',
  'driver_2nd_steering',
  'passenger_1st_rear',
  'driver_1st_rear',
  'passenger_2nd_rear',
  'driver_2nd_rear',
];

const TYRE_POSITIONS_HGV_DIESEL: TyrePosition[] = [
  'passenger_steering',
  'driver_steering',
  'passenger_lifting',
  'driver_lifting',
  'passenger_drive_inner',
  'passenger_drive_outer',
  'driver_drive_inner',
  'driver_drive_outer',
];

const TYRE_POSITIONS_HGV_LNG: TyrePosition[] = [
  'passenger_steering',
  'driver_steering',
  'driver_drive_inner',
  'driver_drive_outer',
  'passenger_drive_inner',
  'passenger_drive_outer',
  'passenger_lifting',
  'driver_lifting',
];

export default function NewTyreFitterJobCardScreen() {
  const { colors } = useTheme();
  const { stockItems, addJobCard } = useTyreStock();
  const { machinery, updateDamageReport } = useFleet();
  const { currentUser } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{
    fromDamageReport?: string;
    damageReportId?: string;
    machineryId?: string;
    tyrePosition?: string;
    location?: string;
    latitude?: string;
    longitude?: string;
  }>();
  
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showMachineryModal, setShowMachineryModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const initialMachine = useMemo(() => {
    if (params.machineryId) {
      return machinery.find(m => m.id === params.machineryId);
    }
    return undefined;
  }, [params.machineryId, machinery]);

  const [formData, setFormData] = useState({
    machineryId: params.machineryId || '',
    registrationNumber: initialMachine?.registrationNumber || '',
    tyrePosition: (params.tyrePosition as TyrePosition) || '' as TyrePosition | '',
    tyreSize: '315/80R22.5' as TyreSize,
    tyreBrand: '',
    tyreCondition: 'new' as TyreCondition,
    workDone: '',
    stockItemId: '',
    signature: '',
    customSizeDescription: '',
    oldTyreCondition: '' as OldTyreCondition | '',
    oldTyreSize: '315/80R22.5' as TyreSize,
    oldTyreBrand: '',
    location: params.location || '',
    coordinates: (params.latitude && params.longitude) ? {
      latitude: parseFloat(params.latitude),
      longitude: parseFloat(params.longitude)
    } : undefined,
    photos: [] as string[],
  });

  const selectedMachine = useMemo(() => {
    return machinery.find((m) => m.id === formData.machineryId);
  }, [formData.machineryId, machinery]);

  const tyrePositions = useMemo(() => {
    if (!selectedMachine) return TYRE_POSITIONS_HGV_DIESEL;
    
    if (selectedMachine.type === '8_wheeler') {
      return TYRE_POSITIONS_8WHEELER;
    } else if (selectedMachine.type === 'hgv') {
      const isLNG = selectedMachine.fuelType === 'lng';
      return isLNG ? TYRE_POSITIONS_HGV_LNG : TYRE_POSITIONS_HGV_DIESEL;
    }
    return TYRE_POSITIONS_HGV_DIESEL;
  }, [selectedMachine]);

  const availableStockItems = useMemo(() => {
    return stockItems.filter(
      (item) =>
        item.size === formData.tyreSize &&
        item.condition === formData.tyreCondition &&
        item.quantity > 0
    );
  }, [stockItems, formData.tyreSize, formData.tyreCondition]);

  const handleSelectMachinery = (machineryId: string) => {
    const machine = machinery.find((m) => m.id === machineryId);
    if (machine) {
      setFormData((prev) => ({
        ...prev,
        machineryId: machine.id,
        registrationNumber: machine.registrationNumber,
        tyrePosition: '' as any,
      }));
    }
    setShowMachineryModal(false);
  };

  const handleSelectStock = (stockId: string) => {
    const stock = stockItems.find((s) => s.id === stockId);
    if (stock) {
      setFormData({
        ...formData,
        stockItemId: stock.id,
        tyreBrand: stock.brand,
        customSizeDescription: stock.customSizeDescription || '',
      });
    }
    setShowStockModal(false);
  };

  const handleSaveSignature = (signatureData: string) => {
    setFormData({ ...formData, signature: signatureData });
    setShowSignatureModal(false);
  };

  const handleSubmit = async () => {
    if (!formData.machineryId) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }
    if (!formData.tyrePosition) {
      Alert.alert('Error', 'Please select tyre position');
      return;
    }
    if (!formData.tyreBrand.trim()) {
      Alert.alert('Error', 'Please enter tyre brand');
      return;
    }
    if (!formData.workDone.trim()) {
      Alert.alert('Error', 'Please describe the work done');
      return;
    }
    if (!formData.oldTyreCondition) {
      Alert.alert('Error', 'Please select old tyre condition');
      return;
    }
    if (!formData.signature) {
      Alert.alert('Error', 'Please add your signature');
      return;
    }
    if (formData.photos.length === 0) {
      Alert.alert('Error', 'Please add at least one photo of the completed work');
      return;
    }

    try {
      const jobCard: TyreFitterJobCard = {
        id: `tyre-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        machineryId: formData.machineryId,
        registrationNumber: formData.registrationNumber,
        tyrePosition: formData.tyrePosition,
        tyreSize: formData.tyreSize,
        tyreBrand: formData.tyreBrand.trim(),
        tyreCondition: formData.tyreCondition,
        workDone: formData.workDone.trim(),
        stockItemId: formData.stockItemId || undefined,
        createdBy: currentUser?.name || 'Unknown',
        signature: formData.signature,
        completedAt: new Date().toISOString(),
        customSizeDescription: formData.customSizeDescription.trim() || undefined,
        oldTyreCondition: formData.oldTyreCondition,
        oldTyreSize: formData.oldTyreSize,
        oldTyreBrand: formData.oldTyreBrand.trim() || undefined,
        photos: formData.photos,
        location: formData.location || undefined,
        coordinates: formData.coordinates,
      };

      await addJobCard(jobCard);
      console.log('[TyreFitterJobCard] Created job card:', jobCard.id);
      
      if (params.fromDamageReport === 'true' && params.damageReportId) {
        try {
          await updateDamageReport(params.damageReportId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
          });
          console.log('[TyreFitterJobCard] Marked damage report as completed');
        } catch (error) {
          console.error('[TyreFitterJobCard] Failed to update damage report:', error);
        }
      }
      
      Alert.alert('Success', 'Tyre fitter job card created successfully', [
        {
          text: 'OK',
          onPress: () => {
            if (params.fromDamageReport === 'true') {
              router.push('/damage/dashboard' as any);
            } else {
              router.back();
            }
          },
        },
      ]);
    } catch (error) {
      console.error('[TyreFitterJobCard] Error creating job card:', error);
      Alert.alert('Error', 'Failed to create job card. Please try again.');
    }
  };

  const machineryOptions: SelectableItem[] = machinery
    .filter((m) => m.type === '8_wheeler' || m.type === 'hgv')
    .map((m) => ({
      id: m.id,
      label: `${m.registrationNumber} - ${m.name}`,
    }));

  const stockOptions: SelectableItem[] = availableStockItems.map((item) => ({
    id: item.id,
    label: `${item.brand} (${item.quantity} available) - ${item.location}`,
  }));

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      const address = geocode[0];
      const locationString = address 
        ? `${address.street || ''} ${address.city || ''} ${address.postalCode || ''}`.trim()
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setFormData({
        ...formData,
        location: locationString,
        coordinates: { latitude, longitude },
      });
      
      Alert.alert('Success', 'Location added successfully');
    } catch (error) {
      console.error('[TyreJobCard] Error getting location:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({
          ...formData,
          photos: [...formData.photos, result.assets[0].uri],
        });
      }
    } catch (error) {
      console.error('[TyreJobCard] Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Photo library permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({
          ...formData,
          photos: [...formData.photos, result.assets[0].uri],
        });
      }
    } catch (error) {
      console.error('[TyreJobCard] Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = formData.photos.filter((_, i) => i !== index);
            setFormData({ ...formData, photos: updated });
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Tyre Fitter Job Card' }} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Vehicle *</Text>
            <TouchableOpacity
              style={[styles.selectButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => setShowMachineryModal(true)}
            >
              <Text style={[styles.selectButtonText, { color: formData.registrationNumber ? colors.text : colors.secondary }]}>
                {formData.registrationNumber || 'Select Vehicle'}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedMachine && (
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Tyre Position *</Text>
              <View style={styles.positionGrid}>
                {tyrePositions.map((position) => (
                  <TouchableOpacity
                    key={position}
                    style={[
                      styles.positionButton,
                      { backgroundColor: colors.cardBackground },
                      formData.tyrePosition === position && { backgroundColor: colors.tint, borderColor: colors.tint },
                    ]}
                    onPress={() => setFormData({ ...formData, tyrePosition: position })}
                  >
                    <Text
                      style={[
                        styles.positionButtonText,
                        { color: colors.text },
                        formData.tyrePosition === position && { color: '#FFFFFF' },
                      ]}
                    >
                      {position.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Tyre Size *</Text>
            <View style={styles.sizeGrid}>
              {TYRE_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    { backgroundColor: colors.cardBackground },
                    formData.tyreSize === size && { backgroundColor: colors.tint, borderColor: colors.tint },
                  ]}
                  onPress={() => setFormData({ ...formData, tyreSize: size, stockItemId: '' })}
                >
                  <Text
                    style={[
                      styles.sizeButtonText,
                      { color: colors.text },
                      formData.tyreSize === size && { color: '#FFFFFF' },
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Condition *</Text>
            <View style={styles.conditionGrid}>
              {TYRE_CONDITIONS.map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.conditionButton,
                    { backgroundColor: colors.cardBackground },
                    formData.tyreCondition === condition && { backgroundColor: colors.tint, borderColor: colors.tint },
                  ]}
                  onPress={() => setFormData({ ...formData, tyreCondition: condition, stockItemId: '' })}
                >
                  <Text
                    style={[
                      styles.conditionButtonText,
                      { color: colors.text },
                      formData.tyreCondition === condition && { color: '#FFFFFF' },
                    ]}
                  >
                    {condition.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {availableStockItems.length > 0 && (
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Use from Stock (Optional)</Text>
              <TouchableOpacity
                style={[styles.selectButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => setShowStockModal(true)}
              >
                <Text style={[styles.selectButtonText, { color: formData.stockItemId ? colors.text : colors.secondary }]}>
                  {formData.stockItemId
                    ? stockItems.find((s) => s.id === formData.stockItemId)?.brand
                    : 'Select from Stock'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {(formData.tyreSize === '315/70R22.5' || formData.tyreSize === '385/65R22.5' || formData.tyreSize === '560/60R22.5') && (
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Custom Tyre Size Description</Text>
              <KeyboardAwareInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="e.g., HGV Drive tyre, Trailer tyre"
                placeholderTextColor={colors.secondary}
                value={formData.customSizeDescription}
                onChangeText={(customSizeDescription) => setFormData({ ...formData, customSizeDescription })}
                scrollViewRef={scrollViewRef}
              />
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Brand *</Text>
            <KeyboardAwareInput
              style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
              placeholder="e.g., Michelin, Continental"
              placeholderTextColor={colors.secondary}
              value={formData.tyreBrand}
              onChangeText={(tyreBrand) => setFormData({ ...formData, tyreBrand })}
              scrollViewRef={scrollViewRef}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Work Done *</Text>
            <KeyboardAwareInput
              style={[styles.textArea, { backgroundColor: colors.cardBackground, color: colors.text }]}
              placeholder="Describe the work performed..."
              placeholderTextColor={colors.secondary}
              value={formData.workDone}
              onChangeText={(workDone) => setFormData({ ...formData, workDone })}
              multiline
              numberOfLines={6}
              scrollViewRef={scrollViewRef}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Old Tyre Condition *</Text>
            <View style={styles.oldTyreConditionGrid}>
              {OLD_TYRE_CONDITIONS.map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.oldConditionButton,
                    { backgroundColor: colors.cardBackground },
                    formData.oldTyreCondition === condition && { backgroundColor: colors.tint, borderColor: colors.tint },
                  ]}
                  onPress={() => setFormData({ ...formData, oldTyreCondition: condition })}
                >
                  <Text
                    style={[
                      styles.oldConditionButtonText,
                      { color: colors.text },
                      formData.oldTyreCondition === condition && { color: '#FFFFFF' },
                    ]}
                  >
                    {condition === 'worn_out' ? 'Worn Out' : condition === 'blown_tyre' ? 'Blown Tyre' : condition === 'good_to_use' ? 'Good to Use' : 'Damaged'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {formData.oldTyreCondition && (
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Old Tyre Details</Text>
              <View style={styles.oldTyreDetailsRow}>
                <View style={styles.oldTyreDetailHalf}>
                  <Text style={[styles.oldTyreDetailLabel, { color: colors.secondary }]}>Size</Text>
                  <TouchableOpacity
                    style={[styles.oldTyreDetailButton, { backgroundColor: colors.cardBackground }]}
                    onPress={() => {
                      const currentIndex = TYRE_SIZES.indexOf(formData.oldTyreSize);
                      const nextIndex = (currentIndex + 1) % TYRE_SIZES.length;
                      setFormData({ ...formData, oldTyreSize: TYRE_SIZES[nextIndex] });
                    }}
                  >
                    <Text style={[styles.oldTyreDetailText, { color: colors.text }]}>{formData.oldTyreSize}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.oldTyreDetailHalf}>
                  <Text style={[styles.oldTyreDetailLabel, { color: colors.secondary }]}>Brand (Optional)</Text>
                  <KeyboardAwareInput
                    style={[styles.oldTyreDetailInput, { backgroundColor: colors.cardBackground, color: colors.text }]}
                    placeholder="Brand"
                    placeholderTextColor={colors.secondary}
                    value={formData.oldTyreBrand}
                    onChangeText={(oldTyreBrand) => setFormData({ ...formData, oldTyreBrand })}
                    scrollViewRef={scrollViewRef}
                  />
                </View>
              </View>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Location</Text>
            <TouchableOpacity
              style={[styles.locationButton, { backgroundColor: colors.tint }]}
              onPress={handleGetLocation}
              disabled={isLoadingLocation}
            >
              <MapPin color="#FFFFFF" size={20} />
              <Text style={styles.locationButtonText}>
                {isLoadingLocation ? 'Getting Location...' : 'Use My Location'}
              </Text>
            </TouchableOpacity>
            {formData.location && (
              <View style={[styles.locationDisplay, { backgroundColor: colors.cardBackground }]}>
                <MapPin color={colors.tint} size={16} />
                <Text style={[styles.locationText, { color: colors.text }]}>{formData.location}</Text>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Photos *</Text>
            <View style={styles.photoButtons}>
              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: colors.tint }]}
                onPress={handleTakePhoto}
              >
                <Camera color="#FFFFFF" size={20} />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: colors.tint }]}
                onPress={handlePickImage}
              >
                <ImageIcon color="#FFFFFF" size={20} />
                <Text style={styles.photoButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
            {formData.photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                {formData.photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <TouchableOpacity
                      style={[styles.removePhotoButton, { backgroundColor: colors.danger }]}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Text style={styles.removePhotoText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Signature *</Text>
            {formData.signature ? (
              <View>
                <SignatureDisplay signatureData={formData.signature} />
                <TouchableOpacity
                  style={[styles.changeSignatureButton, { backgroundColor: colors.cardBackground }]}
                  onPress={() => setShowSignatureModal(true)}
                >
                  <Text style={[styles.changeSignatureText, { color: colors.tint }]}>Change Signature</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.signatureButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => setShowSignatureModal(true)}
              >
                <Text style={[styles.signatureButtonText, { color: colors.text }]}>Add Signature</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Job Card</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SearchableSelectModal
        visible={showMachineryModal}
        onClose={() => setShowMachineryModal(false)}
        onSelect={handleSelectMachinery}
        items={machineryOptions}
        selectedIds={formData.machineryId ? [formData.machineryId] : []}
        title="Select Vehicle"
        placeholder="Search by registration..."
      />

      <SearchableSelectModal
        visible={showStockModal}
        onClose={() => setShowStockModal(false)}
        onSelect={handleSelectStock}
        items={stockOptions}
        selectedIds={formData.stockItemId ? [formData.stockItemId] : []}
        title="Select from Stock"
        placeholder="Search stock..."
      />

      <SignatureModal
        visible={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={handleSaveSignature}
      />
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
  content: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  textArea: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  selectButton: {
    padding: 16,
    borderRadius: 12,
  },
  selectButtonText: {
    fontSize: 16,
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  conditionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  positionGrid: {
    gap: 8,
  },
  positionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  positionButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  oldTyreConditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  oldConditionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '48%',
    alignItems: 'center',
  },
  oldConditionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  oldTyreDetailsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  oldTyreDetailHalf: {
    flex: 1,
  },
  oldTyreDetailLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 6,
  },
  oldTyreDetailButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  oldTyreDetailText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  oldTyreDetailInput: {
    padding: 14,
    borderRadius: 10,
    fontSize: 14,
  },
  signatureButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(128, 128, 128, 0.2)',
    borderStyle: 'dashed',
  },
  signatureButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  changeSignatureButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeSignatureText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  submitButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  photoButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  photosScroll: {
    marginTop: 12,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
});
