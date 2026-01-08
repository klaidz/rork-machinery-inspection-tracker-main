import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, Platform 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/colors';
import { Truck, Search, Plus, AlertTriangle, Car, X, Save, Calendar, User } from 'lucide-react-native';

export default function FleetListScreen() {
  const router = useRouter();
  const { machinery, addMachinery } = useFleet();
  const { user } = useAuth();

  // --- 1. SEARCH & FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');

  // --- 2. ADD MACHINE FORM STATE ---
  const [isModalVisible, setModalVisible] = useState(false);
  
  // Form Fields
  const [dateAdded] = useState(new Date().toLocaleDateString());
  const [whoAdded] = useState(user?.name || 'Manager');
  const [registration, setRegistration] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Tractor');
  const [department, setDepartment] = useState('Arable');

  // --- 3. SAVE LOGIC ---
  const handleSave = async () => {
    if (!make || !model) {
      Platform.OS === 'web' ? window.alert('Enter Make & Model') : Alert.alert('Missing Info', 'Enter Make & Model');
      return;
    }

    const newMachine = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${make} ${model}`,
      make, model, registration: registration || 'TBA',
      type, department, dateAdded, addedBy: whoAdded,
      status: 'active', hours: 0
    };

    await addMachinery(newMachine as any);
    
    // Reset and Close
    setModalVisible(false);
    setMake(''); setModel(''); setRegistration('');
    Platform.OS === 'web' ? window.alert('Added!') : Alert.alert('Success', 'Machine Added');
  };

  // --- 4. FILTERING LOGIC ---
  const filteredFleet = machinery.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (m.registration && m.registration.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'All' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  const activeCount = machinery.filter(m => m.status === 'active').length;
  const brokenCount = machinery.filter(m => m.status === 'broken').length;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Fleet Management' }} />

      {/* --- MAIN LIST CONTENT --- */}
      <ScrollView style={{ flex: 1 }}>
        {/* STATS */}
        <View style={styles.headerRow}>
          <View style={styles.statBox}><Text style={styles.statLabel}>Total</Text><Text style={styles.statNumber}>{machinery.length}</Text></View>
          <View style={styles.statBox}><Text style={[styles.statLabel, {color:'green'}]}>Active</Text><Text style={styles.statNumber}>{activeCount}</Text></View>
          <View style={styles.statBox}><Text style={[styles.statLabel, {color:'red'}]}>Issues</Text><Text style={styles.statNumber}>{brokenCount}</Text></View>
        </View>

        {/* TOOLBAR */}
        <View style={styles.toolbar}>
          <View style={styles.searchBar}>
            <Search size={20} color="#666" />
            <TextInput placeholder="Search..." value={searchQuery} onChangeText={setSearchQuery} style={styles.searchInput} />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Plus size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 5 }}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* TYPE FILTERS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {['All', 'Car', 'Tractor', 'Truck', 'Trailer', 'Forklift'].map(t => (
            <TouchableOpacity key={t} onPress={() => setFilterType(t)}
              style={[styles.filterChip, filterType === t ? { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint } : {}]}>
              <Text style={{ color: filterType === t ? 'white' : '#666' }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* LIST ITEMS */}
        <View style={styles.listContainer}>
          {filteredFleet.map(machine => (
            <TouchableOpacity key={machine.id} style={styles.card} onPress={() => router.push(`/machinery/${machine.id}` as any)}>
              <View style={styles.cardLeft}>
                <View style={[styles.iconBox, { backgroundColor: machine.status === 'broken' ? '#FFEBEE' : '#E8F5E9' }]}>
                  {machine.type === 'Car' ? <Car color="#1565C0" size={24} /> : machine.status === 'broken' ? <AlertTriangle color="#C62828" size={24} /> : <Truck color="#2E7D32" size={24} />}
                </View>
                <View>
                  <Text style={styles.machineName}>{machine.name}</Text>
                  <Text style={styles.machineDetail}>{machine.type} • {machine.registration || 'No Reg'}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: machine.status === 'active' ? '#E8F5E9' : '#FFEBEE' }]}>
                <Text style={{ color: machine.status === 'active' ? '#2E7D32' : '#C62828', fontWeight: 'bold', fontSize: 10 }}>{machine.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{height: 100}} /> 
        </View>
      </ScrollView>

      {/* --- 5. THE ADD MODAL (POPUP) --- */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Machine</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* READ ONLY INFO */}
              <View style={styles.readOnlyRow}>
                <View style={styles.infoPill}><Calendar size={14} color="#666" /><Text style={styles.infoText}>{dateAdded}</Text></View>
                <View style={styles.infoPill}><User size={14} color="#666" /><Text style={styles.infoText}>{whoAdded}</Text></View>
              </View>

              {/* INPUTS */}
              <Text style={styles.label}>Registration</Text>
              <TextInput style={styles.input} placeholder="AE74..." value={registration} onChangeText={setRegistration} autoCapitalize="characters" />

              <View style={{flexDirection:'row', gap: 10}}>
                <View style={{flex:1}}>
                    <Text style={styles.label}>Make</Text>
                    <TextInput style={styles.input} placeholder="John Deere" value={make} onChangeText={setMake} />
                </View>
                <View style={{flex:1}}>
                    <Text style={styles.label}>Model</Text>
                    <TextInput style={styles.input} placeholder="6155R" value={model} onChangeText={setModel} />
                </View>
              </View>

              <Text style={styles.label}>Type</Text>
              <View style={styles.chipContainer}>
                {['Tractor', 'Car', 'Truck', 'Trailer', 'Forklift'].map(t => (
                  <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.chip, type === t ? {backgroundColor:'#333', borderColor:'#333'} : {}]}>
                    <Text style={{color: type === t ? 'white' : '#333'}}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Department</Text>
              <View style={styles.chipContainer}>
                {['Arable', 'Genesis', 'CO2', 'PC', 'Workshop'].map(d => (
                  <TouchableOpacity key={d} onPress={() => setDepartment(d)} style={[styles.chip, department === d ? {backgroundColor: Colors.light.tint, borderColor: Colors.light.tint} : {}]}>
                    <Text style={{color: department === d ? 'white' : '#333'}}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Save size={20} color="white" />
                <Text style={styles.saveText}>Save Machine</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  headerRow: { flexDirection: 'row', backgroundColor: 'white', padding: 20, marginBottom: 15 },
  statBox: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderLeftColor: '#f0f0f0' },
  statLabel: { fontSize: 12, color: '#666', textTransform: 'uppercase', marginBottom: 5 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  
  toolbar: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 15 },
  searchBar: { flex: 1, flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 10, alignItems: 'center' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  addButton: { backgroundColor: Colors.light.tint, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderRadius: 10 },
  
  filterRow: { paddingHorizontal: 20, marginBottom: 15 },
  filterChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: 'white', marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  
  listContainer: { paddingHorizontal: 20 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBox: { padding: 10, borderRadius: 10 },
  machineName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  machineDetail: { color: '#666', fontSize: 13, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 25, height: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  readOnlyRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  infoPill: { flexDirection: 'row', gap: 6, backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, alignItems: 'center' },
  infoText: { color: '#666', fontSize: 12, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#444', marginBottom: 6, marginTop: 5 },
  input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', fontSize: 16, marginBottom: 15 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: 'white' },
  saveButton: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 10 },
  saveText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});