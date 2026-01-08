import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { useTyreStock } from '@/context/TyreStockContext';
import { Ionicons } from '@expo/vector-icons';

export default function CompleteTyreJobScreen() {
  const { id } = useLocalSearchParams(); // Get the Job ID from the URL
  const { colors } = useTheme();
  const { updateDamageReport } = useFleet();
  const { stock, useStock } = useTyreStock();
  
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState('');

  // Filter stock to show only available items
  const availableStock = stock.filter(item => 
    item.quantity > 0 && 
    (item.size.includes(filter) || item.brand.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleFinish = async () => {
    if (!selectedStockId) {
      Alert.alert("Select Tyre", "Please select which tyre you used from stock (or choose 'No Stock Used').");
      return;
    }

    try {
      // 1. Deduct Stock (if not "No Stock Used")
      if (selectedStockId !== 'none') {
        await useStock(selectedStockId, 1);
      }

      // 2. Close the Job
      await updateDamageReport(id as string, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        notes: `Job Completed. Used Stock ID: ${selectedStockId}. Notes: ${notes}`
      });

      // 3. Go back
      Alert.alert("Success", "Job closed and stock updated!", [
        { text: "OK", onPress: () => router.push('/tyres/' as any) }
      ]);
      
    } catch (error) {
      Alert.alert("Error", "Could not complete job.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Complete Job</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: colors.secondary }]}>
          Select the tyre you used from inventory:
        </Text>

        {/* SEARCH BAR */}
        <View style={[styles.search, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.secondary} />
          <TextInput 
            style={[styles.input, { color: colors.text }]}
            placeholder="Search size..."
            placeholderTextColor={colors.secondary}
            value={filter}
            onChangeText={setFilter}
          />
        </View>

        <ScrollView style={styles.list}>
          {/* OPTION: NO STOCK USED */}
          <TouchableOpacity 
            style={[
              styles.card, 
              { backgroundColor: colors.cardBackground, borderColor: selectedStockId === 'none' ? colors.tint : colors.border }
            ]}
            onPress={() => setSelectedStockId('none')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="build-outline" size={24} color={colors.text} />
              <View>
                <Text style={[styles.itemName, { color: colors.text }]}>No Stock Used</Text>
                <Text style={{ color: colors.secondary, fontSize: 12 }}>Repair / Puncture only</Text>
              </View>
            </View>
            {selectedStockId === 'none' && <Ionicons name="checkmark-circle" size={24} color={colors.tint} />}
          </TouchableOpacity>

          {/* STOCK LIST */}
          {availableStock.map(item => (
            <TouchableOpacity 
              key={item.id}
              style={[
                styles.card, 
                { backgroundColor: colors.cardBackground, borderColor: selectedStockId === item.id ? colors.tint : colors.border }
              ]}
              onPress={() => setSelectedStockId(item.id)}
            >
              <View>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.size}</Text>
                <Text style={{ color: colors.secondary, fontSize: 12 }}>
                  {item.brand} • {item.condition.toUpperCase()}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                 <View style={[styles.badge, { backgroundColor: colors.success }]}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{item.quantity}</Text>
                 </View>
                 {selectedStockId === item.id && <Text style={{ color: colors.tint, fontSize: 10, fontWeight: '700' }}>SELECTED</Text>}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* NOTES */}
        <View style={{ marginTop: 16 }}>
           <Text style={{ color: colors.text, marginBottom: 8, fontWeight: '600' }}>Final Notes</Text>
           <TextInput 
             style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.cardBackground }]}
             placeholder="e.g. Fitted new valve..."
             placeholderTextColor={colors.secondary}
             multiline
             numberOfLines={3}
             value={notes}
             onChangeText={setNotes}
           />
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.tint, opacity: selectedStockId ? 1 : 0.5 }]}
          onPress={handleFinish}
          disabled={!selectedStockId}
        >
          <Text style={styles.btnText}>CONFIRM & DEDUCT STOCK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800' },
  content: { flex: 1, padding: 20, paddingTop: 0 },
  subtitle: { marginBottom: 16 },
  search: { flexDirection: 'row', padding: 12, borderWidth: 1, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  input: { flex: 1, marginLeft: 8, fontSize: 16 },
  list: { flex: 1 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderWidth: 2, borderRadius: 12, marginBottom: 8 },
  itemName: { fontSize: 16, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 4 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 12, height: 80, textAlignVertical: 'top' },
  btn: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  btnText: { color: 'white', fontWeight: '800', fontSize: 16 }
});