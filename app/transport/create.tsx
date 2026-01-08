import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useFleet } from '@/context/FleetContext';
import { Save, ArrowLeft, Truck } from 'lucide-react-native';

export default function CreateTransportJobScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { machinery, fields, addTransportJob } = useFleet();

  const [description, setDescription] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [ticket, setTicket] = useState('');
  const [loadId, setLoadId] = useState('');
  const [unloadId, setUnloadId] = useState('');

  const handleSave = async () => {
    if (!selectedMachineId || !loadId || !unloadId || !description) {
      Alert.alert('Incomplete', 'Please select a vehicle, description, and both locations.');
      return;
    }

    const machine = machinery.find(m => m.id === selectedMachineId);

    await addTransportJob({
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        machineryId: selectedMachineId,
        machineryReg: machine?.registrationNumber || 'Unknown',
        department: machine?.department || 'General',
        description,
        ticketNumber: ticket,
        loadingLocationId: loadId,
        unloadingLocationId: unloadId,
        status: 'pending'
    });

    Alert.alert('Job Created', 'Driver can now see this job.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>New Haulage Job</Text>
        <TouchableOpacity onPress={handleSave}><Save size={24} color={colors.tint} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 1. VEHICLE SELECTOR */}
        <Text style={[styles.label, {color: colors.secondary}]}>Select Vehicle</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {machinery.map(m => {
                const isSelected = selectedMachineId === m.id;
                return (
                    <TouchableOpacity 
                        key={m.id} 
                        style={[styles.optionCard, { 
                            backgroundColor: isSelected ? colors.tint : colors.cardBackground,
                            borderColor: isSelected ? colors.tint : colors.border
                        }]}
                        onPress={() => setSelectedMachineId(m.id)}
                    >
                        <Truck size={20} color={isSelected ? 'white' : colors.text} />
                        <Text style={{ 
                            color: isSelected ? 'white' : colors.text, 
                            marginTop: 4, fontWeight: 'bold' 
                        }}>
                            {m.registrationNumber}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>

        {/* 2. DESCRIPTION INPUT */}
        <Text style={[styles.label, {color: colors.secondary}]}>Job Description</Text>
        <TextInput 
            style={[styles.input, { color: colors.text, borderColor: colors.border }]} 
            placeholder="Wheat to Mill" 
            placeholderTextColor={colors.secondary} 
            value={description} 
            onChangeText={setDescription} 
        />

        {/* 3. LOADING LOCATION (Fields) */}
        <Text style={[styles.label, {color: colors.secondary, marginTop: 20}]}>Loading Location</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {fields.map(f => {
                const isSelected = loadId === f.id;
                return (
                    <TouchableOpacity 
                        key={f.id} 
                        onPress={() => setLoadId(f.id)} 
                        style={[styles.locCard, { 
                            backgroundColor: isSelected ? '#dcfce7' : colors.cardBackground, 
                            borderColor: colors.border
                        }]}
                    >
                        <Text style={{
                            fontWeight: 'bold', 
                            color: isSelected ? 'black' : colors.text 
                        }}>
                            {f.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>

        {/* 4. UNLOADING LOCATION */}
        <Text style={[styles.label, {color: colors.secondary}]}>Unloading At</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {fields.map(f => {
                const isSelected = unloadId === f.id;
                return (
                    <TouchableOpacity 
                        key={f.id} 
                        onPress={() => setUnloadId(f.id)} 
                        style={[styles.locCard, { 
                            backgroundColor: isSelected ? '#fee2e2' : colors.cardBackground, 
                            borderColor: colors.border 
                        }]}
                    >
                        <Text style={{
                            fontWeight: 'bold', 
                            color: isSelected ? 'black' : colors.text 
                        }}>
                            {f.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderColor: '#eee' 
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  label: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    marginBottom: 8, 
    textTransform: 'uppercase' 
  },
  input: { 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16 
  },
  optionCard: { 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    marginRight: 10, 
    minWidth: 100, 
    alignItems: 'center' 
  },
  locCard: { 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    marginRight: 10, 
    minWidth: 80, 
    alignItems: 'center' 
  }
});