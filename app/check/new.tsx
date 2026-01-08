import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Search, X } from 'lucide-react-native'; // Import icons

// Contexts
import { useFleet } from '@/context/FleetContext';
import { useAuth } from '@/context/AuthContext';

// Constants
import Colors from '@/constants/colors';

// Types
import { DailyCheck, CheckItem, Machinery, DefectLevel } from '../../types';

export default function NewCheckScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const { machinery, addDailyCheck } = useFleet();
  const { user } = useAuth(); 
  
  // State
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState(''); // 🔍 Search State
  const [selectedMachine, setSelectedMachine] = useState<Machinery | null>(null);
  const [odometer, setOdometer] = useState('');
  const [checkItems, setCheckItems] = useState<CheckItem[]>([]);

  // 🔍 FILTER LOGIC: Updates instantly as you type
  const filteredMachinery = useMemo(() => {
    if (!searchQuery) return machinery;
    const lowerText = searchQuery.toLowerCase();
    return machinery.filter(m => 
      m.name.toLowerCase().includes(lowerText) || 
      (m.registration && m.registration.toLowerCase().includes(lowerText))
    );
  }, [machinery, searchQuery]);

  // 🛠️ HELPER: Generate Checklist
  const generateChecklist = (type: string): CheckItem[] => {
    const baseItems = ['Engine Oil', 'Coolant', 'Tyres/Tracks', 'Lights', 'Mirrors', 'Brakes', 'Hydraulics'];
    if (type === 'Trailer') baseItems.push('Hitch/Coupling', 'Brake Lines');
    if (type === 'Combine') baseItems.push('Header', 'Belts', 'Knife');
    
    return baseItems.map((label, index) => ({
      id: `check-${index}-${Date.now()}`,
      label,
      status: 'pass',
    }));
  };

  const handleSelectMachine = (machine: Machinery) => {
    setSelectedMachine(machine);
    const items = generateChecklist(machine.type);
    setCheckItems(items);
    setStep(2);
    setSearchQuery(''); // Clear search for next time
  };

  const handleToggleItem = (id: string, newStatus: 'pass' | 'fail' | 'na') => {
    setCheckItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
  };

  const handleSubmit = () => {
    if (!selectedMachine) return;
    
    const driverId = user?.id || 'unknown-driver'; 
    const driverName = user?.name || 'Unknown Driver';
    const hasFailures = checkItems.some(i => i.status === 'fail');
    const level: DefectLevel = hasFailures ? 'danger' : 'safe';

    const newCheck: DailyCheck = {
      id: Math.random().toString(36).substr(2, 9),
      machineryId: selectedMachine.id,
      machineryName: selectedMachine.name,
      driverId: driverId,
      driverName: driverName,
      date: new Date(),
      odometer: parseInt(odometer) || 0,
      items: checkItems,
      defectsFound: hasFailures,
      defectLevel: level,
    };

    addDailyCheck(newCheck);
    Alert.alert("Success", "Daily check submitted!");
    router.back();
  };

  // --- RENDER STEPS ---

  // Step 1: Search & Select Machine
  if (step === 1) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ title: 'Select Machine' }} />
        
        {/* 🔍 SEARCH BOX AREA */}
        <View style={{ padding: 15, backgroundColor: colors.tint, paddingBottom: 20 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            What are you driving today?
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: 'white', 
            borderRadius: 10, 
            padding: 10, 
            alignItems: 'center' 
          }}>
            <Search color="#666" size={20} />
            <TextInput 
              placeholder="Type Reg (e.g. AE74) or Name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              style={{ flex: 1, marginLeft: 10, fontSize: 16, height: 25 }} // Height fixes touch target
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X color="#666" size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 📋 FILTERED LIST */}
        <ScrollView style={{ flex: 1, padding: 15 }}>
          {filteredMachinery.map(m => (
            <TouchableOpacity 
              key={m.id} 
              onPress={() => handleSelectMachine(m)}
              style={{ 
                padding: 20, 
                backgroundColor: 'white', 
                marginBottom: 10, 
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#eee',
                shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2
              }}>
              <Text style={{ color: '#333', fontWeight: 'bold', fontSize: 18 }}>
                {m.registration || 'No Reg'}
              </Text>
              <Text style={{ color: '#666' }}>
                {m.name} • <Text style={{fontWeight:'600', color: Colors.light.tint}}>{m.type}</Text>
              </Text>
            </TouchableOpacity>
          ))}

          {filteredMachinery.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 30 }}>
              <Text style={{ color: '#999', fontSize: 16 }}>No vehicle found matching "{searchQuery}"</Text>
            </View>
          )}
          
          {/* Bottom spacer so keyboard doesn't hide last item */}
          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    );
  }

  // Step 2: Checklist (Unchanged)
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack.Screen options={{ title: `${selectedMachine?.registration} Check` }} />
        
        <View style={{ padding: 20 }}>
          <Text style={{ color: colors.text, fontSize: 16, marginBottom: 10 }}>Current Odometer / Hours</Text>
          <TextInput 
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="numeric"
            placeholder="e.g. 4500"
            style={{ 
              backgroundColor: 'white', 
              padding: 15, 
              borderRadius: 8, 
              fontSize: 18,
              marginBottom: 20,
              borderWidth: 1, borderColor: '#ccc'
            }}
          />

          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
            Checks
          </Text>

          {checkItems.map(item => (
            <View key={item.id} style={{ marginBottom: 20, backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: '500', marginBottom: 10 }}>{item.label}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {['pass', 'fail', 'na'].map((statusOption) => (
                  <TouchableOpacity
                    key={statusOption}
                    onPress={() => handleToggleItem(item.id, statusOption as any)}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      alignItems: 'center',
                      backgroundColor: item.status === statusOption 
                        ? (statusOption === 'pass' ? '#4CAF50' : statusOption === 'fail' ? '#F44336' : '#9E9E9E')
                        : '#e0e0e0'
                    }}>
                    <Text style={{ color: item.status === statusOption ? 'white' : 'black', textTransform: 'uppercase', fontSize: 12 }}>
                      {statusOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity 
            onPress={handleSubmit}
            style={{ 
              backgroundColor: Colors.light.tint, 
              padding: 20, 
              borderRadius: 10, 
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 40
            }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Submit Check</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}