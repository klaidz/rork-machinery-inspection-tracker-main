import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { ArrowLeft, Truck, Package, MapPin, Trash2 } from 'lucide-react-native';

export default function StackDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { baleStacks, fields, updateStackQuantity } = useFleet();

  // Find the specific stack
  const stack = baleStacks.find(s => s.id === id);
  const field = fields.find(f => f.id === stack?.fieldId);

  const [loadAmount, setLoadAmount] = useState('');

  if (!stack) return <Text>Stack not found</Text>;

  const handleLoadOut = async () => {
    if (!loadAmount) return;
    const amountToRemove = parseInt(loadAmount);
    
    if (isNaN(amountToRemove) || amountToRemove <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    if (amountToRemove > stack.quantity) {
      Alert.alert('Error', 'You cannot remove more bales than are in the stack!');
      return;
    }

    const newTotal = stack.quantity - amountToRemove;

    // CONFIRMATION
    Alert.alert(
      'Confirm Load Out',
      `Loading ${amountToRemove} bales.\nRemaining: ${newTotal}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            await updateStackQuantity(stack.id, newTotal);
            setLoadAmount('');
            if (newTotal === 0) {
                Alert.alert('Stack Cleared', 'This stack is now empty.', [{text:'OK', onPress:()=>router.back()}]);
            } else {
                Alert.alert('Success', 'Stack quantity updated.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Stack Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* INFO CARD */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
                    <Package size={32} color="#0284c7" />
                </View>
                <View>
                    <Text style={[styles.qty, { color: colors.text }]}>{stack.quantity}</Text>
                    <Text style={{ color: colors.secondary }}>Bales Remaining</Text>
                </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.metaRow}>
                <View style={{flexDirection:'row', gap: 6}}>
                    <MapPin size={16} color={colors.secondary} />
                    <Text style={{color: colors.text, fontWeight:'bold'}}>{field?.name || 'Yard'}</Text>
                </View>
                <Text style={{color: colors.secondary, textTransform:'capitalize'}}>{stack.baleType}</Text>
            </View>
        </View>

        {/* ACTION: LOAD OUT */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Load Out (Deduct)</Text>
        <View style={[styles.actionCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={{ color: colors.secondary, marginBottom: 8 }}>Enter quantity loading onto lorry:</Text>
            
            <View style={{flexDirection:'row', gap: 10}}>
                <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                    placeholder="0"
                    placeholderTextColor={colors.secondary}
                    keyboardType="numeric"
                    value={loadAmount}
                    onChangeText={setLoadAmount}
                />
                <TouchableOpacity 
                    style={[styles.loadBtn, { backgroundColor: '#ef4444' }]}
                    onPress={handleLoadOut}
                >
                    <Truck color="white" size={20} />
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>REMOVE</Text>
                </TouchableOpacity>
            </View>
        </View>

        <Text style={{ color: colors.secondary, fontSize: 12, marginTop: 20, textAlign:'center' }}>
            Notes: {stack.notes || 'None'}
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  card: { padding: 20, borderRadius: 16, marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  qty: { fontSize: 32, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  actionCard: { padding: 16, borderRadius: 12 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  loadBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderRadius: 8, gap: 8 }
});