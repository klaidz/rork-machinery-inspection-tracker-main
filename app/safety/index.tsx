import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { Plus, Minus, BriefcaseMedical, Flame, ArrowLeft } from 'lucide-react-native';

export default function SafetyStockScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { safetyStock, updateSafetyStockLevel, addSafetyStock } = useFleet();
  const [isAdding, setIsAdding] = useState(false);
  const [newItemType, setNewItemType] = useState('First Aid Kit');
  const [newQty, setNewQty] = useState('1');

  const handleQuickAdd = async () => {
    await addSafetyStock({ id: Date.now().toString(), itemType: newItemType as any, quantity: parseInt(newQty) || 1, location: 'Workshop', minLevel: 2 });
    setIsAdding(false);
  };

  const getIcon = (type: string) => type.includes('Fire') ? <Flame size={24} color="#ef4444" /> : <BriefcaseMedical size={24} color="#22c55e" />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Safety Inventory</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)}><Plus size={24} color={colors.tint} /></TouchableOpacity>
      </View>

      {isAdding && (
        <View style={[styles.addForm, { backgroundColor: colors.cardBackground }]}>
            <View style={{flexDirection:'row', gap:10, marginBottom:10}}>
                <TouchableOpacity onPress={() => setNewItemType('First Aid Kit')} style={{padding:8, backgroundColor: newItemType==='First Aid Kit' ? colors.tint : '#eee', borderRadius:8}}><Text>First Aid</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setNewItemType('Fire Extinguisher')} style={{padding:8, backgroundColor: newItemType==='Fire Extinguisher' ? '#ef4444' : '#eee', borderRadius:8}}><Text>Fire Ext</Text></TouchableOpacity>
            </View>
            <TextInput value={newQty} onChangeText={setNewQty} keyboardType="numeric" style={{borderWidth:1, padding:8, borderRadius:8, marginBottom:10}} placeholder="Qty" />
            <TouchableOpacity onPress={handleQuickAdd} style={{backgroundColor:colors.tint, padding:10, borderRadius:8, alignItems:'center'}}><Text style={{color:'white'}}>Save</Text></TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {safetyStock.map(item => (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: item.quantity <= item.minLevel ? '#ef4444' : 'transparent', borderWidth: item.quantity <= item.minLevel ? 1 : 0 }]}>
                <View style={{flexDirection:'row', gap:12, alignItems:'center'}}>
                    {getIcon(item.itemType)}
                    <View style={{flex:1}}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{item.itemType}</Text>
                        <Text style={{ color: colors.secondary }}>{item.location} • Min: {item.minLevel}</Text>
                        {item.quantity <= item.minLevel && <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 10 }}>LOW STOCK</Text>}
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center', gap: 10, backgroundColor:'#f3f4f6', padding:6, borderRadius:8}}>
                        <TouchableOpacity onPress={() => updateSafetyStockLevel(item.id, -1)}><Minus size={16} color="black" /></TouchableOpacity>
                        <Text style={{fontWeight:'bold'}}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateSafetyStockLevel(item.id, 1)}><Plus size={16} color="black" /></TouchableOpacity>
                    </View>
                </View>
            </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  card: { padding: 16, borderRadius: 12, marginBottom: 12 },
  addForm: { margin: 20, padding: 16, borderRadius: 12 }
});