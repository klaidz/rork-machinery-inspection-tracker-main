import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Machinery, MachineryType, MachineryDepartment } from '@/types';
import { Plus, Camera, Truck, Wrench, Car, Box } from 'lucide-react-native';

export default function AddScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addMachinery } = useFleet();
  const { currentUser } = useAuth();
  
  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  
  // Form Fields
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [vin, setVin] = useState('');
  
  const handleSave = async () => {
    if (!name || !registrationNumber) {
        Alert.alert('Error', 'Name and Registration are required.');
        return;
    }

    const newMachine: Machinery = {
        id: Date.now().toString(),
        name,
        registrationNumber,
        type: selectedType,
        status: 'active',
        model,
        hours: hours ? parseInt(hours) : 0,
        description,
        vin,
    };

    await addMachinery(newMachine);
    Alert.alert('Success', 'Machine Added');
    setShowForm(false);
    // Reset fields
    setName(''); setModel(''); setRegistrationNumber('');
  };

  if (!isManagerOrAdmin) {
    return (
        <SafeAreaView style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Text>Access Denied</Text>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Machinery</Text>
        {showForm && (
            <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={{color: colors.tint}}>Cancel</Text>
            </TouchableOpacity>
        )}
      </View>

      {!showForm ? (
          <ScrollView contentContainerStyle={{padding: 20}}>
              <Text style={{color: colors.text, marginBottom: 10}}>Select Type:</Text>
              <TouchableOpacity style={styles.card} onPress={() => { setSelectedType('Tractor'); setShowForm(true); }}>
                  <Text>Tractor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.card} onPress={() => { setSelectedType('Vehicle'); setShowForm(true); }}>
                  <Text>Vehicle / Car</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.card} onPress={() => { setSelectedType('HGV'); setShowForm(true); }}>
                  <Text>HGV</Text>
              </TouchableOpacity>
          </ScrollView>
      ) : (
          <ScrollView contentContainerStyle={{padding: 20}}>
              <Text style={styles.label}>Name / Fleet ID</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. TRAC-01" />

              <Text style={styles.label}>Model</Text>
              <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="e.g. John Deere 6155" />

              <Text style={styles.label}>Registration</Text>
              <TextInput style={styles.input} value={registrationNumber} onChangeText={setRegistrationNumber} placeholder="KX19 FGH" />

              <Text style={styles.label}>Current Hours</Text>
              <TextInput style={styles.input} value={hours} onChangeText={setHours} keyboardType="numeric" placeholder="4500" />
              
              <Text style={styles.label}>VIN / Serial</Text>
              <TextInput style={styles.input} value={vin} onChangeText={setVin} />

              <Text style={styles.label}>Description</Text>
              <TextInput style={styles.input} value={description} onChangeText={setDescription} />

              <TouchableOpacity style={[styles.btn, {backgroundColor: colors.tint}]} onPress={handleSave}>
                  <Text style={{color: 'white', fontWeight: 'bold'}}>SAVE MACHINE</Text>
              </TouchableOpacity>
          </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#eee'},
  headerTitle: { fontSize: 20, fontWeight: 'bold'},
  card: { padding: 20, backgroundColor: 'white', marginBottom: 10, borderRadius: 10 },
  label: { marginTop: 10, marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  btn: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 }
});