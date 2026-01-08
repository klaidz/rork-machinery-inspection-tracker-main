import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { Save, ArrowLeft, User, Phone } from 'lucide-react-native';

export default function AddFarmerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addFarmer } = useFleet();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Missing Name', 'Please enter the Farm/Company Name.');
      return;
    }

    await addFarmer({
      id: Date.now().toString(),
      name,
      contactName: contact,
      phone
    });

    Alert.alert('Success', `Farmer "${name}" added!`, [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>New Farmer / Client</Text>
        <TouchableOpacity onPress={handleSave}><Save size={24} color={colors.tint} /></TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, {color:colors.secondary}]}>FARM NAME</Text>
        <TextInput 
            style={[styles.input, {color:colors.text, borderColor:colors.border}]}
            placeholder="e.g. Woodroof Farms"
            placeholderTextColor={colors.secondary}
            value={name} onChangeText={setName}
        />

        <Text style={[styles.label, {color:colors.secondary, marginTop:20}]}>CONTACT NAME</Text>
        <TextInput 
            style={[styles.input, {color:colors.text, borderColor:colors.border}]}
            placeholder="e.g. John"
            placeholderTextColor={colors.secondary}
            value={contact} onChangeText={setContact}
        />

        <Text style={[styles.label, {color:colors.secondary, marginTop:20}]}>PHONE</Text>
        <TextInput 
            style={[styles.input, {color:colors.text, borderColor:colors.border}]}
            placeholder="07700..."
            placeholderTextColor={colors.secondary}
            value={phone} onChangeText={setPhone}
            keyboardType="phone-pad"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, paddingTop: 50, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 }
});