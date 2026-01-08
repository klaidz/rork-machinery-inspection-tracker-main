import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';
import { JobCard, JobCardMachinery, MachineryType, MaterialType, TrailerType } from '@/types';
import { CheckCircle2, Circle, MapPin, Package, FileText, X } from 'lucide-react-native';
import SignatureModal from '@/components/SignatureModal';

type SelectionStep = 'type' | 'machinery' | 'details';
type LocationSelectionType = 'loading' | 'unloading' | null;

const MACHINERY_TYPES: { type: MachineryType; label: string }[] = [
  { type: 'tractor', label: 'Tractor' },
  { type: 'jcb', label: 'JCB' },
  { type: '8_wheeler', label: '8 Wheeler' },
  { type: 'hgv', label: 'HGV' },
  { type: 'implement', label: 'Implement' },
  { type: 'company_car', label: 'Company Car' },
  { type: 'other_machinery', label: 'Other Machinery' },
];

export default function NewJobCardScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { machinery, addJobCard, locations } = useFleet();
  const { currentUser } = useAuth();

  const [step, setStep] = useState<SelectionStep>('type');
  const [selectedTypes, setSelectedTypes] = useState<MachineryType[]>([]);
  const [selectedMachinery, setSelectedMachinery] = useState<JobCardMachinery[]>([]);
  const [loadingLocationId, setLoadingLocationId] = useState<string>('');
  const [unloadingLocationId, setUnloadingLocationId] = useState<string>('');
  const [materials, setMaterials] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType | undefined>(undefined);
  const [weight, setWeight] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [trailerSelections, setTrailerSelections] = useState<Record<string, TrailerType | undefined>>({});
  const [showSignature, setShowSignature] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSelectionType, setLocationSelectionType] = useState<LocationSelectionType>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  const availableMachineryForSelectedTypes = useMemo(() => {
    const filtered = machinery.filter((m) => selectedTypes.includes(m.type));
    console.log('🔍 Available machinery for selected types:', {
      selectedTypes,
      totalMachinery: machinery.length,
      filteredCount: filtered.length,
      hgvCount: machinery.filter(m => m.type === 'hgv').length,
      filtered: filtered.map(m => ({ id: m.id, type: m.type, reg: m.registrationNumber }))
    });
    return filtered;
  }, [machinery, selectedTypes]);

  const [searchQuery, setSearchQuery] = useState('');
  const filteredMachinery = useMemo(() => {
    if (!searchQuery.trim()) return availableMachineryForSelectedTypes;
    const query = searchQuery.toLowerCase();
    return availableMachineryForSelectedTypes.filter((m) =>
      m.registrationNumber.toLowerCase().includes(query)
    );
  }, [availableMachineryForSelectedTypes, searchQuery]);

  const filteredLocations = useMemo(() => {
    if (!locationSearchQuery.trim()) return locations;
    const query = locationSearchQuery.toLowerCase();
    return locations.filter((loc) =>
      loc.name.toLowerCase().includes(query) ||
      (loc.address && loc.address.toLowerCase().includes(query))
    );
  }, [locations, locationSearchQuery]);

  useEffect(() => {
    if (selectedMachinery.length > 0) {
      const firstMachine = machinery.find((m) => m.id === selectedMachinery[0].machineryId);
      if (firstMachine?.currentLocationId && !loadingLocationId) {
        setLoadingLocationId(firstMachine.currentLocationId);
      }
    }
  }, [selectedMachinery, machinery, loadingLocationId]);



  const toggleTypeSelection = (type: MachineryType) => {
    console.log(`🎯 Toggling type: ${type}, currently selected:`, selectedTypes);
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
      setSelectedMachinery(selectedMachinery.filter((m) => m.type !== type));
    } else {
      const newTypes = [...selectedTypes, type];
      console.log(`✅ Adding type ${type}, new selected types:`, newTypes);
      setSelectedTypes(newTypes);
    }
  };

  const toggleMachinerySelection = (machineryId: string) => {
    const machine = machinery.find((m) => m.id === machineryId);
    if (!machine) return;

    const isSelected = selectedMachinery.some((m) => m.machineryId === machineryId);
    if (isSelected) {
      setSelectedMachinery(selectedMachinery.filter((m) => m.machineryId !== machineryId));
      const newTrailerSelections = { ...trailerSelections };
      delete newTrailerSelections[machineryId];
      setTrailerSelections(newTrailerSelections);
    } else {
      setSelectedMachinery([
        ...selectedMachinery,
        {
          type: machine.type,
          registrationNumber: machine.registrationNumber,
          machineryId: machine.id,
        },
      ]);
    }
  };

  const handleNextFromTypeSelection = () => {
    if (selectedTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one machinery type');
      return;
    }
    setStep('machinery');
  };

  const handleNextFromMachinerySelection = () => {
    if (selectedMachinery.length === 0) {
      Alert.alert('Error', 'Please select at least one machinery');
      return;
    }

    const hgvMachines = selectedMachinery.filter(m => m.type === 'hgv');
    const missingTrailers = hgvMachines.filter(m => !trailerSelections[m.machineryId]);
    
    if (missingTrailers.length > 0) {
      Alert.alert('Error', 'Please select a trailer type for all HGV vehicles');
      return;
    }

    setStep('details');
  };

  const handleSubmitDetails = () => {
    if (!loadingLocationId || !unloadingLocationId) {
      Alert.alert('Error', 'Please select both loading and unloading locations');
      return;
    }
    if (!materials.trim()) {
      Alert.alert('Error', 'Please enter materials information');
      return;
    }
    setShowSignature(true);
  };

  const MATERIAL_TYPES: { value: MaterialType; label: string; category: string }[] = [
    { value: 'maze', label: 'Maze', category: 'Arable' },
    { value: 'gras', label: 'Gras', category: 'Arable' },
    { value: 'triticale', label: 'Triticale', category: 'Arable' },
    { value: 'sugarbeet', label: 'Sugar Beet', category: 'Arable' },
    { value: 'beet_pulp', label: 'Beet Pulp', category: 'Arable' },
    { value: 'beet_fines', label: 'Beet Fines', category: 'Arable' },
    { value: 'solid_digestic', label: 'Solid Digestic', category: 'Arable' },
    { value: 'liquid_digestic', label: 'Liquid Digestic', category: 'Arable' },
    { value: 'waste_rice', label: 'Waste Rice', category: 'Arable' },
    { value: 'arable_custom', label: 'Arable Custom', category: 'Arable' },
    { value: 'genesis_straw_bale', label: 'Genesis Straw (Bale)', category: 'Genesis' },
    { value: 'a_grade', label: 'A Grade', category: 'Genesis' },
    { value: 'b_grade', label: 'B Grade', category: 'Genesis' },
    { value: 'c_grade', label: 'C Grade', category: 'Genesis' },
    { value: 'genesis_loose_straw', label: 'Genesis Loose Straw', category: 'Genesis' },
    { value: 'lng_gas', label: 'LNG Gas', category: 'CO2' },
    { value: 'grain', label: 'Grain', category: 'Other' },
    { value: 'ticale', label: 'Ticale', category: 'Other' },
    { value: 'low_loader', label: 'Low Loader', category: 'Other' },
    { value: 'straw', label: 'Straw', category: 'Other' },
    { value: 'other', label: 'Other', category: 'Other' },
  ];

  const TRAILER_TYPES: { value: TrailerType; label: string }[] = [
    { value: 'walking_floor', label: 'Walking Floor' },
    { value: 'tipper', label: 'Tipper' },
    { value: 'curtain', label: 'Curtain' },
    { value: 'flat_bed', label: 'Flat Bed' },
    { value: 'tanker', label: 'Tanker' },
    { value: 'low_loader', label: 'Low Loader' },
  ];

  const openLocationPicker = (type: 'loading' | 'unloading') => {
    setLocationSelectionType(type);
    setShowLocationPicker(true);
    setLocationSearchQuery('');
  };

  const selectLocation = (locationId: string) => {
    if (locationSelectionType === 'loading') {
      setLoadingLocationId(locationId);
    } else if (locationSelectionType === 'unloading') {
      setUnloadingLocationId(locationId);
    }
    setShowLocationPicker(false);
    setLocationSelectionType(null);
  };

  const handleAddNewLocation = () => {
    setShowLocationPicker(false);
    router.push('/location/new' as any);
  };

  const handleSignatureComplete = async (signature: string) => {
    if (!currentUser) return;

    const loadingLoc = locations.find(l => l.id === loadingLocationId);
    const unloadingLoc = locations.find(l => l.id === unloadingLocationId);

    const machineryWithTrailers = selectedMachinery.map(m => ({
      ...m,
      trailerType: trailerSelections[m.machineryId],
    }));

    const newJobCard: JobCard = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      machinery: machineryWithTrailers,
      loadingLocation: loadingLoc?.name || '',
      unloadingLocation: unloadingLoc?.name || '',
      materials: materials.trim(),
      material: materialType,
      status: 'pending',
      signature,
      approvedBy: currentUser.name,
    };

    await addJobCard(newJobCard);
    setShowSignature(false);
    Alert.alert('Success', 'Job Card completed successfully', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (step === 'type') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'New Job Card - Select Type' }} />
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Select Machinery Types</Text>
          <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
            Choose one or more types
          </Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {MACHINERY_TYPES.map((item) => {
            const isSelected = selectedTypes.includes(item.type);
            return (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.typeCard,
                  { backgroundColor: colors.cardBackground },
                  isSelected && { borderColor: colors.tint, borderWidth: 2 },
                ]}
                onPress={() => toggleTypeSelection(item.type)}
              >
                <View style={styles.typeCardContent}>
                  <Text style={[styles.typeLabel, { color: colors.text }]}>{item.label}</Text>
                  {isSelected ? (
                    <CheckCircle2 color={colors.tint} size={24} />
                  ) : (
                    <Circle color={colors.secondary} size={24} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.tint }]}
            onPress={handleNextFromTypeSelection}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'machinery') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'New Job Card - Select Machinery' }} />
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Select Machinery
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
            {selectedMachinery.length} selected
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border },
            ]}
            placeholder="Search by registration number..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
          />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {filteredMachinery.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                {searchQuery ? 'No matching machinery found' : 'No machinery available'}
              </Text>
            </View>
          ) : (
            filteredMachinery.map((machine) => {
              const isSelected = selectedMachinery.some((m) => m.machineryId === machine.id);
              const isHGV = machine.type === 'hgv';
              const currentTrailer = trailerSelections[machine.id];
              return (
                <View key={machine.id}>
                  <TouchableOpacity
                    style={[
                      styles.machineryCard,
                      { backgroundColor: colors.cardBackground },
                      isSelected && { borderColor: colors.tint, borderWidth: 2 },
                    ]}
                    onPress={() => toggleMachinerySelection(machine.id)}
                  >
                    <View style={styles.machineryCardContent}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.machineryName, { color: colors.text }]}>
                          {machine.name}
                        </Text>
                        <Text style={[styles.machineryDetails, { color: colors.secondary }]}>
                          {machine.registrationNumber} • {machine.model}
                        </Text>
                      </View>
                      {isSelected ? (
                        <CheckCircle2 color={colors.tint} size={24} />
                      ) : (
                        <Circle color={colors.secondary} size={24} />
                      )}
                    </View>
                  </TouchableOpacity>
                  {isSelected && isHGV && (
                    <View style={[styles.trailerSection, { backgroundColor: colors.background }]}>
                      <Text style={[styles.trailerLabel, { color: colors.secondary }]}>Select Trailer Type *</Text>
                      <View style={styles.trailerChipsContainer}>
                        {TRAILER_TYPES.map((trailer) => (
                          <TouchableOpacity
                            key={trailer.value}
                            style={[
                              styles.trailerChip,
                              { backgroundColor: colors.cardBackground, borderColor: colors.border },
                              currentTrailer === trailer.value && { borderColor: colors.tint, backgroundColor: colors.tint + '20', borderWidth: 2 },
                            ]}
                            onPress={() => setTrailerSelections(prev => ({ ...prev, [machine.id]: trailer.value }))}
                          >
                            <Text style={[styles.trailerChipText, { color: currentTrailer === trailer.value ? colors.tint : colors.text }]}>
                              {trailer.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => setStep('type')}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.tint, flex: 1 }]}
            onPress={handleNextFromMachinerySelection}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen options={{ title: 'New Job Card - Details' }} />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.detailsContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        keyboardDismissMode="on-drag"
      >
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <FileText color={colors.tint} size={20} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Selected Machinery ({selectedMachinery.length})
            </Text>
          </View>
          {selectedMachinery.map((item, index) => (
            <View key={index} style={styles.selectedItem}>
              <Text style={[styles.selectedItemText, { color: colors.text }]}>
                {item.registrationNumber}
              </Text>
              <Text style={[styles.selectedItemType, { color: colors.secondary }]}>
                {MACHINERY_TYPES.find((t) => t.type === item.type)?.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <MapPin color={colors.tint} size={20} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Locations *</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>Loading Location</Text>
            <TouchableOpacity
              style={[
                styles.locationButton,
                { backgroundColor: colors.background, borderColor: colors.border },
                loadingLocationId && { borderColor: colors.tint },
              ]}
              onPress={() => openLocationPicker('loading')}
            >
              <Text style={[styles.locationButtonText, { color: loadingLocationId ? colors.text : colors.secondary }]}>
                {loadingLocationId ? locations.find(l => l.id === loadingLocationId)?.name : 'Select loading location'}
              </Text>
              <MapPin color={colors.tint} size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>Unloading Location</Text>
            <TouchableOpacity
              style={[
                styles.locationButton,
                { backgroundColor: colors.background, borderColor: colors.border },
                unloadingLocationId && { borderColor: colors.tint },
              ]}
              onPress={() => openLocationPicker('unloading')}
            >
              <Text style={[styles.locationButtonText, { color: unloadingLocationId ? colors.text : colors.secondary }]}>
                {unloadingLocationId ? locations.find(l => l.id === unloadingLocationId)?.name : 'Select unloading location'}
              </Text>
              <MapPin color={colors.tint} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Package color={colors.tint} size={20} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Materials *</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>Material Type (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.materialTypeScroll}>
              <View style={styles.materialTypeContainer}>
                {MATERIAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.materialTypeChip,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      materialType === type.value && { borderColor: colors.tint, backgroundColor: colors.tint + '20', borderWidth: 2 },
                    ]}
                    onPress={() => setMaterialType(materialType === type.value ? undefined : type.value)}
                  >
                    <Text style={[styles.materialTypeText, { color: materialType === type.value ? colors.tint : colors.text }]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={[styles.helperText, { color: colors.secondary }]}>
              Setting material type helps with categorization and reporting
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.secondary }]}>Description</Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Describe the materials being transported..."
              placeholderTextColor={colors.secondary}
              value={materials}
              onChangeText={setMaterials}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.tint }]}
          onPress={handleSubmitDetails}
        >
          <Text style={styles.submitButtonText}>Complete Job Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.backButtonFull, { backgroundColor: colors.cardBackground }]}
          onPress={() => setStep('machinery')}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>
      </ScrollView>

      <SignatureModal
        visible={showSignature}
        onClose={() => setShowSignature(false)}
        onSave={handleSignatureComplete}
      />

      <Modal
        visible={showLocationPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select {locationSelectionType === 'loading' ? 'Loading' : 'Unloading'} Location
              </Text>
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.searchInput,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Search locations..."
              placeholderTextColor={colors.secondary}
              value={locationSearchQuery}
              onChangeText={setLocationSearchQuery}
            />

            <TouchableOpacity
              style={[styles.addLocationButton, { backgroundColor: colors.tint }]}
              onPress={handleAddNewLocation}
            >
              <Text style={styles.addLocationButtonText}>+ Add Location</Text>
            </TouchableOpacity>

            <ScrollView style={styles.locationList}>
              {filteredLocations.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: colors.background }]}>
                  <MapPin color={colors.secondary} size={48} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    {locationSearchQuery ? 'No matching locations' : 'No locations saved'}
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
                    Add locations from the Locations tab
                  </Text>
                </View>
              ) : (
                filteredLocations.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={[
                      styles.locationItem,
                      { backgroundColor: colors.background },
                      (locationSelectionType === 'loading' && loadingLocationId === location.id) ||
                      (locationSelectionType === 'unloading' && unloadingLocationId === location.id)
                        ? { borderColor: colors.tint, borderWidth: 2 }
                        : {},
                    ]}
                    onPress={() => selectLocation(location.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.locationItemName, { color: colors.text }]}>
                        {location.name}
                      </Text>
                      {location.address && (
                        <Text style={[styles.locationItemAddress, { color: colors.secondary }]}>
                          {location.address}
                        </Text>
                      )}
                    </View>
                    {((locationSelectionType === 'loading' && loadingLocationId === location.id) ||
                      (locationSelectionType === 'unloading' && unloadingLocationId === location.id)) && (
                      <CheckCircle2 color={colors.tint} size={24} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>


    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
    gap: 12,
  },
  detailsContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  typeCard: {
    padding: 16,
    borderRadius: 12,
  },
  typeCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  machineryCard: {
    padding: 16,
    borderRadius: 12,
  },
  machineryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  machineryName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  machineryDetails: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectedItemText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  selectedItemType: {
    fontSize: 14,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
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
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  backButtonFull: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  errorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  locationButtonText: {
    fontSize: 15,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  locationList: {
    paddingHorizontal: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  locationItemName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  locationItemAddress: {
    fontSize: 14,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center' as const,
    marginTop: 4,
  },
  materialTypeScroll: {
    marginVertical: 8,
  },
  materialTypeContainer: {
    flexDirection: 'row' as const,
    gap: 8,
    paddingRight: 20,
  },
  materialTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  materialTypeText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  trailerSection: {
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  trailerLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  trailerChipsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  trailerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  trailerChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  addLocationButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  addLocationModalContent: {
    marginTop: 'auto',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  addLocationForm: {
    padding: 20,
    gap: 16,
  },
});
