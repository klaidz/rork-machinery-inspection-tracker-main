import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useTyreStock } from '@/context/TyreStockContext';
import { Ionicons } from '@expo/vector-icons';
import { TyreSize, TyreCondition } from '@/types';

export default function UsedTyreStockScreen() {
  const { colors } = useTheme();
  const { stock, addStock } = useTyreStock();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('');

  // ✅ FILTER: Only show "part_worn" or "used" items
  const usedStock = stock.filter(item => 
    (item.condition === 'part_worn' || item.condition === 'used') &&
    (item.size.includes(filter) || item.brand.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleAddUsedStock = async (size: string, brand: string, quantity: string, notes: string) => {
    if (!size || !brand || !quantity) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    
    await addStock({
      id: Date.now().toString(),
      size: size as TyreSize,
      brand,
      quantity: parseInt(quantity),
      condition: 'part_worn', // Default to part_worn for this screen
      location: 'Yard Storage',
      addedDate: new Date().toISOString(),
      addedBy: 'Tyre Fitter',
      notes: notes
    });
    
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: 'Part-Worn Inventory',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowAddModal(true)}>
              <Ionicons name="add-circle" size={28} color={colors.tint} />
            </TouchableOpacity>
          )
        }} 
      />

      <View style={[styles.searchBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
         <Ionicons name="search" size={20} color={colors.secondary} />
         <TextInput 
           style={[styles.input, { color: colors.text }]} 
           placeholder="Search size or brand..." 
           placeholderTextColor={colors.secondary}
           value={filter}
           onChangeText={setFilter}
         />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {usedStock.length === 0 ? (
          <View style={styles.empty}>
             <Ionicons name="trash-bin-outline" size={48} color={colors.secondary} />
             <Text style={{ color: colors.secondary, marginTop: 12 }}>No used/part-worn stock recorded.</Text>
          </View>
        ) : (
          usedStock.map(item => (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
               <View style={styles.cardLeft}>
                 <Text style={[styles.size, { color: colors.text }]}>{item.size}</Text>
                 <Text style={[styles.brand, { color: colors.secondary }]}>{item.brand}</Text>
                 {item.notes && <Text style={[styles.notes, { color: colors.secondary }]}>"{item.notes}"</Text>}
               </View>
               <View style={{ alignItems: 'flex-end', gap: 4 }}>
                 <View style={[styles.badge, { backgroundColor: '#F59E0B' }]}>
                   <Text style={styles.qty}>{item.quantity}</Text>
                 </View>
                 <Text style={{ fontSize: 10, color: colors.secondary, textTransform: 'uppercase' }}>
                   {item.condition.replace('_', ' ')}
                 </Text>
               </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ADD MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Used Tyre</Text>
            <AddUsedStockForm onSubmit={handleAddUsedStock} onCancel={() => setShowAddModal(false)} colors={colors} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function AddUsedStockForm({ onSubmit, onCancel, colors }: any) {
  const [size, setSize] = useState('315/80R22.5');
  const [brand, setBrand] = useState('');
  const [qty, setQty] = useState('1');
  const [notes, setNotes] = useState('');

  return (
    <View style={{ gap: 12 }}>
       <Text style={{ color: colors.text }}>Size</Text>
       <TextInput style={[styles.formInput, { color: colors.text, borderColor: colors.border }]} value={size} onChangeText={setSize} />
       
       <Text style={{ color: colors.text }}>Brand</Text>
       <TextInput style={[styles.formInput, { color: colors.text, borderColor: colors.border }]} value={brand} onChangeText={setBrand} placeholder="Brand..." placeholderTextColor={colors.secondary} />
       
       <Text style={{ color: colors.text }}>Quantity</Text>
       <TextInput style={[styles.formInput, { color: colors.text, borderColor: colors.border }]} value={qty} onChangeText={setQty} keyboardType="numeric" />

       <Text style={{ color: colors.text }}>Condition / Tread Notes</Text>
       <TextInput style={[styles.formInput, { color: colors.text, borderColor: colors.border }]} value={notes} onChangeText={setNotes} placeholder="e.g. 5mm tread left" placeholderTextColor={colors.secondary} />

       <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
         <TouchableOpacity onPress={onCancel} style={[styles.btn, { backgroundColor: colors.border }]}>
           <Text style={{ color: colors.text }}>Cancel</Text>
         </TouchableOpacity>
         <TouchableOpacity onPress={() => onSubmit(size, brand, qty, notes)} style={[styles.btn, { backgroundColor: '#F59E0B' }]}>
           <Text style={{ color: 'white', fontWeight: 'bold' }}>Save Tyre</Text>
         </TouchableOpacity>
       </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 12, borderRadius: 10, borderWidth: 1 },
  input: { flex: 1, marginLeft: 8, fontSize: 16 },
  scroll: { padding: 16, paddingTop: 0 },
  empty: { alignItems: 'center', marginTop: 50 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  cardLeft: { flex: 1 },
  size: { fontSize: 18, fontWeight: '700' },
  brand: { fontSize: 14 },
  notes: { fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  badge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  qty: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { padding: 24, borderRadius: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  formInput: { borderWidth: 1, borderRadius: 8, padding: 12 },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' }
});