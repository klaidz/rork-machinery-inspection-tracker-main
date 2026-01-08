import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { Save, ArrowLeft, User, Phone } from 'lucide-react-native';

export default function NewFarmerScreen() {
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
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Add New Farmer</Text>
        <TouchableOpacity onPress={handleSave}>
            <Save size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* FARM NAME */}
        <Text style={[styles.label, {color:colors.secondary}]}>FARM / CLIENT NAME</Text>
        <TextInput 
            style={[styles.input, {color:colors.text, borderColor:colors.border}]}
            // CHANGED: Removed "Woodroof"
            placeholder="Enter Farm Name"
            placeholderTextColor={colors.secondary}
            value={name}
            onChangeText={setName}
            autoFocus
        />

        {/* CONTACT PERSON */}
        <Text style={[styles.label, {color:colors.secondary, marginTop:20}]}>CONTACT PERSON (Optional)</Text>
        <View style={[styles.inputRow, {borderColor:colors.border}]}>
            <User size={20} color={colors.secondary} />
            <TextInput 
                style={[styles.inputFlex, {color:colors.text}]}
                // CHANGED: Removed "John Smith"
                placeholder="Contact Name"
                placeholderTextColor={colors.secondary}
                value={contact}
                onChangeText={setContact}
            />
        </View>

        {/* PHONE NUMBER */}
        <Text style={[styles.label, {color:colors.secondary, marginTop:20}]}>PHONE NUMBER (Optional)</Text>
        <View style={[styles.inputRow, {borderColor:colors.border}]}>
            <Phone size={20} color={colors.secondary} />
            <TextInput 
                style={[styles.inputFlex, {color:colors.text}]}
                placeholder="07700..."
                placeholderTextColor={colors.secondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />
        </View>
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
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  inputRow: { flexDirection:'row', alignItems:'center', gap:10, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
  inputFlex: { flex:1, paddingVertical: 12, fontSize: 16 }
});