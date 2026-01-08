import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useWorkshopParts } from '@/context/WorkshopPartsContext';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Package, Plus, Edit2, Trash2, Search, X } from 'lucide-react-native';
import { Stack } from 'expo-router';
import { PartCategory, PartCondition, WorkshopPartStockItem } from '@/types';

const PART_CATEGORIES: PartCategory[] = ['filters', 'oils', 'fluids', 'belts', 'bearings', 'electrical', 'brake_parts', 'engine_parts', 'other'];
const PART_CONDITIONS: PartCondition[] = ['new', 'refurbished', 'used'];

export default function WorkshopStockScreen() {
  const { colors } = useTheme();
  const { stockItems, addStockItem, updateStockItem, deleteStockItem, isLoading } = useWorkshopParts();
  const { currentUser, hasRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkshopPartStockItem | null>(null);

  const [formData, setFormData] = useState({
    partNumber: '',
    partName: '',
    category: 'filters' as PartCategory,
    manufacturer: '',
    quantity: '',
    condition: 'new' as PartCondition,
    location: '',
    unitCost: '',
    reorderLevel: '',
    notes: '',
  });

  const canManage = hasRole(['admin', 'manager', 'mechanic']);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return stockItems;
    const query = searchQuery.toLowerCase();
    return stockItems.filter((item) => 
      item.partNumber.toLowerCase().includes(query) ||
      item.partName.toLowerCase().includes(query) ||
      item.manufacturer.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [stockItems, searchQuery]);

  const groupedItems = useMemo(() => {
    const groups: Record<PartCategory, WorkshopPartStockItem[]> = {
      filters: [],
      oils: [],
      fluids: [],
      belts: [],
      bearings: [],
      electrical: [],
      brake_parts: [],
      engine_parts: [],
      other: [],
    };
    filteredItems.forEach((item) => {
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const resetForm = () => {
    setFormData({
      partNumber: '',
      partName: '',
      category: 'filters',
      manufacturer: '',
      quantity: '',
      condition: 'new',
      location: '',
      unitCost: '',
      reorderLevel: '',
      notes: '',
    });
    setEditingItem(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: WorkshopPartStockItem) => {
    setFormData({
      partNumber: item.partNumber,
      partName: item.partName,
      category: item.category,
      manufacturer: item.manufacturer,
      quantity: item.quantity.toString(),
      condition: item.condition,
      location: item.location,
      unitCost: item.unitCost?.toString() || '',
      reorderLevel: item.reorderLevel?.toString() || '',
      notes: item.notes || '',
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.partNumber.trim()) {
      Alert.alert('Error', 'Please enter part number');
      return;
    }
    if (!formData.partName.trim()) {
      Alert.alert('Error', 'Please enter part name');
      return;
    }
    if (!formData.manufacturer.trim()) {
      Alert.alert('Error', 'Please enter manufacturer');
      return;
    }
    if (!formData.quantity.trim() || isNaN(Number(formData.quantity))) {
      Alert.alert('Error', 'Please enter valid quantity');
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter location');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity < 0) {
      Alert.alert('Error', 'Quantity cannot be negative');
      return;
    }

    try {
      if (editingItem) {
        await updateStockItem(editingItem.id, {
          partNumber: formData.partNumber.trim(),
          partName: formData.partName.trim(),
          category: formData.category,
          manufacturer: formData.manufacturer.trim(),
          quantity,
          condition: formData.condition,
          location: formData.location.trim(),
          unitCost: formData.unitCost.trim() ? parseFloat(formData.unitCost) : undefined,
          reorderLevel: formData.reorderLevel.trim() ? parseInt(formData.reorderLevel) : undefined,
          notes: formData.notes.trim(),
        });
        console.log('[WorkshopStock] Updated stock item');
      } else {
        const newItem: WorkshopPartStockItem = {
          id: `part-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          partNumber: formData.partNumber.trim(),
          partName: formData.partName.trim(),
          category: formData.category,
          manufacturer: formData.manufacturer.trim(),
          quantity,
          condition: formData.condition,
          location: formData.location.trim(),
          unitCost: formData.unitCost.trim() ? parseFloat(formData.unitCost) : undefined,
          reorderLevel: formData.reorderLevel.trim() ? parseInt(formData.reorderLevel) : undefined,
          addedDate: new Date().toISOString(),
          addedBy: currentUser?.name || 'Unknown',
          notes: formData.notes.trim(),
        };
        await addStockItem(newItem);
        console.log('[WorkshopStock] Added new stock item');
      }
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('[WorkshopStock] Error saving item:', error);
      Alert.alert('Error', 'Failed to save stock item');
    }
  };

  const handleDelete = (item: WorkshopPartStockItem) => {
    Alert.alert(
      'Delete Stock Item',
      `Are you sure you want to delete ${item.partName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStockItem(item.id);
              console.log('[WorkshopStock] Deleted stock item');
            } catch (error) {
              console.error('[WorkshopStock] Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete stock item');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Workshop Parts Stock' }} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Workshop Parts Stock' }} />
      
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}>
          <Search color={colors.secondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by part number, name, or manufacturer..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color={colors.secondary} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {stockItems.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
            <Package color={colors.secondary} size={64} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No Parts in Stock</Text>
            <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
              Add your first part to get started
            </Text>
            {canManage && (
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.tint }]}
                onPress={handleOpenAdd}
              >
                <Text style={styles.emptyButtonText}>Add Part</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          Object.entries(groupedItems).map(([category, items]) => {
            if (items.length === 0) return null;
            
            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

            return (
              <View key={category} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.categoryHeaderLeft}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                    <View style={[styles.quantityBadge, { backgroundColor: colors.tint + '20' }]}>
                      <Text style={[styles.quantityBadgeText, { color: colors.tint }]}>
                        {totalQuantity} total
                      </Text>
                    </View>
                  </View>
                </View>

                {items.map((item) => {
                  const isLowStock = item.reorderLevel && item.quantity <= item.reorderLevel;
                  
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.partCard,
                        { backgroundColor: colors.cardBackground },
                      ]}
                    >
                      <View style={styles.partCardHeader}>
                        <View style={styles.partCardLeft}>
                          <Text style={[styles.partName, { color: colors.text }]}>
                            {item.partName}
                          </Text>
                          <Text style={[styles.partNumber, { color: colors.secondary }]}>
                            PN: {item.partNumber}
                          </Text>
                          <View style={styles.partMeta}>
                            <View style={[styles.conditionBadge, { backgroundColor: colors.secondary + '20' }]}>
                              <Text style={[styles.conditionText, { color: colors.secondary }]}>
                                {item.condition}
                              </Text>
                            </View>
                            <Text style={[styles.partManufacturer, { color: colors.secondary }]}>
                              {item.manufacturer}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.partCardRight}>
                          <Text style={[styles.partQuantity, { color: isLowStock ? colors.danger : colors.text }]}>
                            {item.quantity}
                          </Text>
                          <Text style={[styles.partQuantityLabel, { color: colors.secondary }]}>
                            in stock
                          </Text>
                          {isLowStock && (
                            <Text style={[styles.lowStockLabel, { color: colors.danger }]}>
                              Low Stock
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.partDetails}>
                        <Text style={[styles.partLocation, { color: colors.secondary }]}>
                          📍 {item.location}
                        </Text>
                        {item.unitCost && (
                          <Text style={[styles.partCost, { color: colors.secondary }]}>
                            £{item.unitCost.toFixed(2)} per unit
                          </Text>
                        )}
                      </View>

                      {item.notes && (
                        <Text style={[styles.partNotes, { color: colors.secondary }]} numberOfLines={2}>
                          {item.notes}
                        </Text>
                      )}

                      {canManage && (
                        <View style={styles.partActions}>
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.tint + '20' }]}
                            onPress={() => handleOpenEdit(item)}
                          >
                            <Edit2 color={colors.tint} size={16} />
                            <Text style={[styles.actionButtonText, { color: colors.tint }]}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.danger + '20' }]}
                            onPress={() => handleDelete(item)}
                          >
                            <Trash2 color={colors.danger} size={16} />
                            <Text style={[styles.actionButtonText, { color: colors.danger }]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>

      {canManage && stockItems.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.tint }]}
          onPress={handleOpenAdd}
        >
          <Plus color="#FFFFFF" size={28} />
        </TouchableOpacity>
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingItem ? 'Edit Part' : 'Add Part'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <X color={colors.text} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Part Number *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="e.g., OF-12345"
                placeholderTextColor={colors.secondary}
                value={formData.partNumber}
                onChangeText={(partNumber) => setFormData({ ...formData, partNumber })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Part Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="e.g., Oil Filter"
                placeholderTextColor={colors.secondary}
                value={formData.partName}
                onChangeText={(partName) => setFormData({ ...formData, partName })}
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
                      formData.category === cat && { backgroundColor: colors.tint },
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: colors.text },
                        formData.category === cat && { color: '#FFFFFF' },
                      ]}
                    >
                      {cat.replace(/_/g, ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Manufacturer *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="e.g., Bosch, Mann Filter"
                placeholderTextColor={colors.secondary}
                value={formData.manufacturer}
                onChangeText={(manufacturer) => setFormData({ ...formData, manufacturer })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Quantity *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="Enter quantity"
                placeholderTextColor={colors.secondary}
                value={formData.quantity}
                onChangeText={(quantity) => setFormData({ ...formData, quantity })}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Condition *</Text>
              <View style={styles.conditionGrid}>
                {PART_CONDITIONS.map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[
                      styles.conditionButton,
                      { backgroundColor: colors.cardBackground },
                      formData.condition === condition && { backgroundColor: colors.tint },
                    ]}
                    onPress={() => setFormData({ ...formData, condition })}
                  >
                    <Text
                      style={[
                        styles.conditionButtonText,
                        { color: colors.text },
                        formData.condition === condition && { color: '#FFFFFF' },
                      ]}
                    >
                      {condition}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Location *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="e.g., Shelf A3, Bay 2"
                placeholderTextColor={colors.secondary}
                value={formData.location}
                onChangeText={(location) => setFormData({ ...formData, location })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Unit Cost (£)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="e.g., 25.50"
                placeholderTextColor={colors.secondary}
                value={formData.unitCost}
                onChangeText={(unitCost) => setFormData({ ...formData, unitCost })}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Reorder Level</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="Min quantity before reorder"
                placeholderTextColor={colors.secondary}
                value={formData.reorderLevel}
                onChangeText={(reorderLevel) => setFormData({ ...formData, reorderLevel })}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Notes</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="Additional notes (optional)"
                placeholderTextColor={colors.secondary}
                value={formData.notes}
                onChangeText={(notes) => setFormData({ ...formData, notes })}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.cardBackground }]}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.tint }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>{editingItem ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  quantityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantityBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  partCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  partCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  partCardLeft: {
    flex: 1,
    gap: 6,
  },
  partName: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  partNumber: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  partMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  partManufacturer: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  partCardRight: {
    alignItems: 'flex-end',
  },
  partQuantity: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  partQuantityLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  lowStockLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    marginTop: 2,
  },
  partDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  partLocation: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  partCost: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  partNotes: {
    fontSize: 13,
    marginBottom: 12,
  },
  partActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  emptyCard: {
    margin: 20,
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    minHeight: 100,
    textAlignVertical: 'top',
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
  conditionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  conditionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  conditionButtonText: {
    fontSize: 14,
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
