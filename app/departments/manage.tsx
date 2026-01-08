import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDepartments } from '@/context/DepartmentContext';
import { useAuth } from '@/context/AuthContext';
import { Department, DepartmentType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function DepartmentManagementScreen() {
  const { colors } = useTheme();
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const { currentUser } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  
  // Safe check for permissions
  const hasAccess = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const filteredDepartments = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const query = searchQuery.toLowerCase();
    return departments.filter(dept => 
      dept.name.toLowerCase().includes(query) ||
      dept.type.toLowerCase().includes(query) ||
      dept.description?.toLowerCase().includes(query)
    );
  }, [departments, searchQuery]);

  const handleDeleteDepartment = (department: Department) => {
    Alert.alert(
      'Delete Department',
      `Are you sure you want to delete "${department.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDepartment(department.id);
            Alert.alert('Success', 'Department deleted');
          },
        },
      ]
    );
  };

  const handleAddSubmit = async (data: { name: string; description: string; type: DepartmentType }) => {
     await addDepartment({
        name: data.name,
        type: data.type,
        description: data.description,
        managerUserIds: [],
        active: true,
        createdBy: currentUser?.id || 'admin',
        // ✅ FIX: Removed 'createdAt' because the system adds it automatically
      });
      setShowAddModal(false);
  };

  if (!hasAccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Departments' }} />
        <View style={styles.centered}>
          <Text style={{ color: colors.secondary }}>Access Denied</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Manage Departments',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowAddModal(true)} style={{ padding: 8 }}>
              <Ionicons name="add-circle" size={28} color={colors.tint} />
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.secondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search departments..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.secondary}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredDepartments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.secondary }]}>No departments found</Text>
          </View>
        ) : (
          filteredDepartments.map(department => (
            <View key={department.id} style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Ionicons name="business" size={20} color={colors.tint} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{department.name}</Text>
                  {!department.active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>Inactive</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => { setEditingDepartment(department); setShowEditModal(true); }}>
                    <Ionicons name="create-outline" size={20} color={colors.tint} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteDepartment(department)}>
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.cardType, { color: colors.secondary }]}>{department.type.toUpperCase().replace(/_/g, ' ')}</Text>
              {department.description && (
                <Text style={[styles.cardDescription, { color: colors.secondary }]}>{department.description}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* ADD MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Department</Text>
            
            <DepartmentForm 
              onCancel={() => setShowAddModal(false)}
              onSubmit={handleAddSubmit}
              colors={colors}
            />
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Department</Text>
            
            <DepartmentForm 
              initialData={editingDepartment}
              onCancel={() => { setShowEditModal(false); setEditingDepartment(null); }}
              // ✅ FIX: Added type definition for data
              onSubmit={async (data: { name: string; description: string; type: DepartmentType }) => {
                 if(editingDepartment) {
                    await updateDepartment(editingDepartment.id, data);
                    setShowEditModal(false); 
                    setEditingDepartment(null);
                 }
              }}
              colors={colors}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ✅ FIX: Added interface for props
interface DepartmentFormProps {
  initialData?: Department | null;
  onCancel: () => void;
  onSubmit: (data: { name: string; description: string; type: DepartmentType }) => void;
  colors: any;
}

function DepartmentForm({ initialData, onCancel, onSubmit, colors }: DepartmentFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<DepartmentType>(initialData?.type || 'arable');

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: colors.text, fontWeight: '600' }}>Name</Text>
      <TextInput 
        style={[styles.input, { color: colors.text, borderColor: colors.border }]} 
        value={name} 
        onChangeText={setName} 
        placeholder="Department Name"
        placeholderTextColor={colors.secondary}
      />
      
      <Text style={{ color: colors.text, fontWeight: '600' }}>Description</Text>
      <TextInput 
        style={[styles.input, { color: colors.text, borderColor: colors.border }]} 
        value={description} 
        onChangeText={setDescription} 
        placeholder="Optional description"
        placeholderTextColor={colors.secondary}
      />

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.border }]} onPress={onCancel}>
          <Text style={{ color: colors.text }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.tint }]} onPress={() => onSubmit({ name, description, type })}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', margin: 16, padding: 12, borderRadius: 10, borderWidth: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 16 },
  card: { borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 16 },
  cardType: { fontSize: 12, marginBottom: 4, fontWeight: '600' },
  cardDescription: { fontSize: 14 },
  inactiveBadge: { backgroundColor: '#FF3B30', paddingHorizontal: 6, borderRadius: 4 },
  inactiveBadgeText: { color: 'white', fontSize: 10 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 24, borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' }
});