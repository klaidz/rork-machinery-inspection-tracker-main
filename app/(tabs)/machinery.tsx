import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import { Tractor, AlertTriangle, CheckCircle2, Plus, X } from 'lucide-react-native';

export default function MachineryScreen() {
  const { colors } = useTheme();
  const { machinery, updateMachineryStatus, addMachinery } = useFleet();
  const { currentUser: user } = useAuth();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Tractor');

  // Check if user is Admin/Manager
  const canAdd = user && ['admin', 'manager'].includes(user.role);

  const handleAdd = () => {
    if (!newName) return Alert.alert("Error", "Enter a machine name");
    
    // Check if addMachine exists in your context
    if (addMachinery) {
  addMachinery({
    id: Date.now().toString(),
    name: newName,
    type: newType,
    status: 'active',
    registrationNumber: 'TBD', // <--- ADD THIS (Required by your types)
    hours: 0,
    // lastService: new Date().toISOString() // <--- Comment this out unless you added it to types.ts
  });
  
        setIsAdding(false);
        setNewName('');
    } else {
        Alert.alert("Error", "addMachine function missing in Context");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Fleet</Text>
        {canAdd && (
          <TouchableOpacity onPress={() => setIsAdding(!isAdding)} style={[styles.addButton, { backgroundColor: colors.tint }]}>
            {isAdding ? <X color="white" size={24} /> : <Plus color="white" size={24} />}
          </TouchableOpacity>
        )}
      </View>

      {/* ADMIN ADD FORM */}
      {isAdding && (
        <View style={[styles.form, { backgroundColor: colors.cardBackground }]}>
          <Text style={{color: colors.text, fontWeight: 'bold', marginBottom: 8}}>Add New Machine</Text>
          <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Machine Name (e.g. JD 6155)"
            placeholderTextColor={colors.secondary}
            value={newName}
            onChangeText={setNewName}
          />
          <TouchableOpacity onPress={handleAdd} style={[styles.saveBtn, { backgroundColor: colors.tint }]}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>Save Machine</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FLEET LIST */}
      <FlatList
        data={machinery}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.iconContainer}>
              <Tractor color={colors.text} size={32} />
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={{ color: colors.secondary }}>{item.hours} hrs • {item.type}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? 'green' : 'orange' }]}>
               <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold' },
  addButton: { padding: 10, borderRadius: 50 },
  form: { margin: 20, padding: 16, borderRadius: 12, marginTop: 0 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 12 },
  saveBtn: { padding: 12, borderRadius: 8, alignItems: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12 },
  iconContainer: { marginRight: 16 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }
});