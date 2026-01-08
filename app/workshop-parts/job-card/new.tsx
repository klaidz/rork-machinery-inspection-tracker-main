import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useWorkshopParts } from '@/context/WorkshopPartsContext';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Stack, router } from 'expo-router';
import { PartCategory, WorkshopJobCard, WorkshopPartUsed } from '@/types';
import SignatureModal from '@/components/SignatureModal';
import SignatureDisplay from '@/components/SignatureDisplay';
import SearchableSelectModal, { SelectableItem } from '@/components/SearchableSelectModal';
import { X, Trash2, Package, Edit3 } from 'lucide-react-native';
import { KeyboardAwareInput } from '@/components/KeyboardAwareInput';

const PART_CATEGORIES: PartCategory[] = ['filters', 'oils', 'fluids', 'belts', 'bearings', 'electrical', 'brake_parts', 'engine_parts', 'other'];

export default function NewWorkshopJobCardScreen() {
  const { colors } = useTheme();
  const { addJobCard } = useWorkshopParts();
  const { machinery } = useFleet();
  const { currentUser } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showMachineryModal, setShowMachineryModal] = useState(false);
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [showSelectStockModal, setShowSelectStockModal] = useState(false);
  const [partEntryMode, setPartEntryMode] = useState<'select' | 'manual'>('select');

  const [formData, setFormData] = useState({
    machineryId: '',
    registrationNumber: '',
    workDescription: '',
    partsUsed: [] as WorkshopPartUsed[],
    laborHours: '',
    signature: '',
    notes: '',
  });

  const [partFormData, setPartFormData] = useState({
    partNumber: '',
    partName: '',
    quantity: '',
    category: 'filters' as PartCategory,
  });

  const { stockItems } = useWorkshopParts();

  const handleSelectMachinery = (machineryId: string) => {
    const machine = machinery.find((m) => m.id === machineryId);
    if (machine) {
      setFormData({
        ...formData,
        machineryId: machine.id,
        registrationNumber: machine.registrationNumber,
      });
    }
    setShowMachineryModal(false);
  };

  const handleSelectStockItem = (stockItemId: string) => {
    const stockItem = stockItems.find((item) => item.id === stockItemId);
    if (!stockItem) return;

    setPartFormData({
      partNumber: stockItem.partNumber,
      partName: stockItem.partName,
      category: stockItem.category,
      quantity: '1',
    });

    setShowSelectStockModal(false);
    setShowAddPartModal(true);
    setPartEntryMode('select');
  };

  const resetPartForm = () => {
    setPartFormData({
      partNumber: '',
      partName: '',
      quantity: '',
      category: 'filters',
    });
  };

  const handleAddPart = () => {
    if (!partFormData.partNumber.trim()) {
      Alert.alert('Error', 'Please enter part number');
      return;
    }
    if (!partFormData.partName.trim()) {
      Alert.alert('Error', 'Please enter part name');
      return;
    }
    if (!partFormData.quantity.trim() || isNaN(Number(partFormData.quantity))) {
      Alert.alert('Error', 'Please enter valid quantity');
      return;
    }

    const quantity = parseInt(partFormData.quantity);
    if (quantity <= 0) {
      Alert.alert('Error', 'Quantity must be greater than 0');
      return;
    }

    if (partEntryMode === 'select') {
      const stockItem = stockItems.find(
        (item) => item.partNumber === partFormData.partNumber.trim()
      );
      
      if (stockItem && stockItem.quantity < quantity) {
        Alert.alert('Error', `Insufficient stock. Only ${stockItem.quantity} available.`);
        return;
      }
    }

    const stockItem = stockItems.find(
      (item) => item.partNumber === partFormData.partNumber.trim()
    );

    const newPart: WorkshopPartUsed = {
      stockItemId: partEntryMode === 'select' && stockItem ? stockItem.id : undefined,
      partNumber: partFormData.partNumber.trim(),
      partName: partFormData.partName.trim(),
      quantity,
      category: partFormData.category,
    };

    setFormData({
      ...formData,
      partsUsed: [...formData.partsUsed, newPart],
    });

    setShowAddPartModal(false);
    resetPartForm();
  };

  const handleRemovePart = (index: number) => {
    Alert.alert(
      'Remove Part',
      'Remove this part from the job card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = formData.partsUsed.filter((_, i) => i !== index);
            setFormData({ ...formData, partsUsed: updated });
          },
        },
      ]
    );
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
    if (!formData.workDescription.trim()) {
      Alert.alert('Error', 'Please describe the work done');
      return;
    }
    if (!formData.laborHours.trim() || isNaN(Number(formData.laborHours))) {
      Alert.alert('Error', 'Please enter valid labor hours');
      return;
    }
    const laborHours = parseFloat(formData.laborHours);
    if (laborHours <= 0) {
      Alert.alert('Error', 'Labor hours must be greater than 0');
      return;
    }
    if (!formData.signature) {
      Alert.alert('Error', 'Please add your signature');
      return;
    }

    try {
      const jobCard: WorkshopJobCard = {
        id: `workshop-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        machineryId: formData.machineryId,
        registrationNumber: formData.registrationNumber,
        workDescription: formData.workDescription.trim(),
        partsUsed: formData.partsUsed,
        laborHours,
        completedBy: currentUser?.name || 'Unknown',
        signature: formData.signature,
        completedAt: new Date().toISOString(),
        notes: formData.notes.trim() || undefined,
      };

      await addJobCard(jobCard);
      console.log('[WorkshopJobCard] Created job card:', jobCard.id);
      
      Alert.alert('Success', 'Workshop job card created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('[WorkshopJobCard] Error creating job card:', error);
      Alert.alert('Error', 'Failed to create job card. Please try again.');
    }
  };

  const machineryOptions: SelectableItem[] = machinery.map((m) => ({
    id: m.id,
    label: `${m.registrationNumber} - ${m.name}`,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Workshop Job Card' }} />
      
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

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Work Description *</Text>
              <KeyboardAwareInput
                style={[styles.textArea, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="Describe the repair/maintenance work..."
                placeholderTextColor={colors.secondary}
                value={formData.workDescription}
                onChangeText={(workDescription) => setFormData({ ...formData, workDescription })}
                multiline
                numberOfLines={6}
                scrollViewRef={scrollViewRef}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Parts Used (Optional)</Text>
              <View style={styles.addPartButtonsRow}>
                <TouchableOpacity
                  style={[styles.addPartButton, { backgroundColor: colors.tint, flex: 1 }]}
                  onPress={() => setShowSelectStockModal(true)}
                >
                  <Package color="#FFFFFF" size={18} />
                  <Text style={styles.addPartButtonText}>Select from Stock</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addPartButton, { backgroundColor: colors.cardBackground, flex: 1, borderWidth: 2, borderColor: colors.tint }]}
                  onPress={() => {
                    resetPartForm();
                    setPartEntryMode('manual');
                    setShowAddPartModal(true);
                  }}
                >
                  <Edit3 color={colors.tint} size={18} />
                  <Text style={[styles.addPartButtonText, { color: colors.tint }]}>Custom Part</Text>
                </TouchableOpacity>
              </View>

              {formData.partsUsed.length > 0 && (
                <View style={styles.partsListContainer}>
                  {formData.partsUsed.map((part, index) => (
                    <View key={index} style={[styles.partCard, { backgroundColor: colors.cardBackground }]}>
                      <View style={styles.partCardHeader}>
                        <View style={styles.partCardLeft}>
                          <Text style={[styles.partName, { color: colors.text }]}>
                            {part.partName}
                          </Text>
                          <Text style={[styles.partNumber, { color: colors.secondary }]}>
                            PN: {part.partNumber}
                          </Text>
                          <View style={styles.partMeta}>
                            <View style={[styles.categoryBadge, { backgroundColor: colors.tint + '20' }]}>
                              <Text style={[styles.categoryBadgeText, { color: colors.tint }]}>
                                {part.category.replace(/_/g, ' ')}
                              </Text>
                            </View>
                            {part.stockItemId && (
                              <View style={[styles.stockBadge, { backgroundColor: colors.success + '20' }]}>
                                <Text style={[styles.stockBadgeText, { color: colors.success }]}>
                                  From Stock
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                        <View style={styles.partCardRight}>
                          <Text style={[styles.partQuantity, { color: colors.text }]}>
                            ×{part.quantity}
                          </Text>
                          <TouchableOpacity
                            style={[styles.removePartButton, { backgroundColor: colors.danger + '20' }]}
                            onPress={() => handleRemovePart(index)}
                          >
                            <Trash2 color={colors.danger} size={14} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Labor Hours *</Text>
              <KeyboardAwareInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="e.g., 2.5"
                placeholderTextColor={colors.secondary}
                value={formData.laborHours}
                onChangeText={(laborHours) => setFormData({ ...formData, laborHours })}
                keyboardType="decimal-pad"
                scrollViewRef={scrollViewRef}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Notes (Optional)</Text>
              <KeyboardAwareInput
                style={[styles.textArea, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="Additional notes..."
                placeholderTextColor={colors.secondary}
                value={formData.notes}
                onChangeText={(notes) => setFormData({ ...formData, notes })}
                multiline
                numberOfLines={4}
                scrollViewRef={scrollViewRef}
              />
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
        visible={showSelectStockModal}
        onClose={() => setShowSelectStockModal(false)}
        onSelect={handleSelectStockItem}
        items={stockItems
          .filter((item) => item.quantity > 0)
          .map((item) => ({
            id: item.id,
            label: `${item.partName} - ${item.partNumber} (${item.quantity} available)`,
          }))}
        selectedIds={[]}
        title="Select Part from Stock"
        placeholder="Search parts..."
      />

      <Modal
        visible={showAddPartModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddPartModal(false);
          resetPartForm();
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.tint }]}>
            <Text style={[styles.modalTitle, { color: '#FFFFFF' }]}>
              {partEntryMode === 'select' ? 'Add Part from Stock' : 'Add Custom Part'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddPartModal(false);
                resetPartForm();
              }}
            >
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {partEntryMode === 'select' && (
              <View style={[styles.infoCard, { backgroundColor: colors.tint + '10', borderColor: colors.tint }]}>
                <Text style={[styles.infoText, { color: colors.tint }]}>
                  Part details are pre-filled from stock. You can adjust the quantity.
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Part Number *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="e.g., OF-12345"
                placeholderTextColor={colors.secondary}
                value={partFormData.partNumber}
                onChangeText={(partNumber) => setPartFormData({ ...partFormData, partNumber })}
                editable={partEntryMode === 'manual'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Part Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="e.g., Oil Filter"
                placeholderTextColor={colors.secondary}
                value={partFormData.partName}
                onChangeText={(partName) => setPartFormData({ ...partFormData, partName })}
                editable={partEntryMode === 'manual'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {PART_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: colors.cardBackground },
                      partFormData.category === cat && { backgroundColor: colors.tint },
                    ]}
                    onPress={() => partEntryMode === 'manual' && setPartFormData({ ...partFormData, category: cat })}
                    disabled={partEntryMode === 'select'}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: colors.text },
                        partFormData.category === cat && { color: '#FFFFFF' },
                      ]}
                    >
                      {cat.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Quantity *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="Enter quantity"
                placeholderTextColor={colors.secondary}
                value={partFormData.quantity}
                onChangeText={(quantity) => setPartFormData({ ...partFormData, quantity })}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => {
                  setShowAddPartModal(false);
                  resetPartForm();
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.tint }]}
                onPress={handleAddPart}
              >
                <Text style={styles.saveButtonText}>Add Part</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

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
    paddingBottom: 40,
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
  addPartButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  addPartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  infoCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  addPartButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  partsListContainer: {
    gap: 10,
  },
  partCard: {
    padding: 14,
    borderRadius: 12,
  },
  partCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  partCardLeft: {
    flex: 1,
    gap: 6,
  },
  partName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  partNumber: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  partMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  partCardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  partQuantity: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  removePartButton: {
    padding: 6,
    borderRadius: 6,
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {},
  saveButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
